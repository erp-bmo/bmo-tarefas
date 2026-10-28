import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase.js'
import { SOP_VERSAO, SOP_ETAPAS, SOP_TAREFAS } from './sop.js'

// ─── Constants ───────────────────────────────────────────────
const SOP_STATUS = {
  nao_iniciado: { label: 'Não iniciado', bg: '#EEECE6', color: '#5A584F' },
  andamento:    { label: 'Em andamento', bg: '#EAF1FA', color: '#1A4D8F' },
  concluido:    { label: 'Concluído',    bg: '#E6F4EE', color: '#1A6B4A' },
  bloqueado:    { label: 'Bloqueado',    bg: '#FDEAEA', color: '#8A2020' },
  na:           { label: 'Não se aplica', bg: '#F7F6F2', color: '#9B9890' },
}
// bmo_tasks.status → status do SOP
const TASK_TO_SOP = { pendente: 'nao_iniciado', andamento: 'andamento', concluido: 'concluido', bloqueado: 'bloqueado' }
const SOP_TO_TASK = { nao_iniciado: 'pendente', andamento: 'andamento', concluido: 'concluido', bloqueado: 'bloqueado' }
const COR_ETAPA = {1:'#185FA5',2:'#1A6EC0',3:'#0F6E56',4:'#0C6478',5:'#0C6478',6:'#0C6478',7:'#0D2C54',8:'#4B1A7C',9:'#BA7517',10:'#3B6D11',11:'#185FA5',12:'#3B6D11',13:'#A32D2D',14:'#5A5A56'}
const COR_PRIO = { P1: '#A32D2D', P2: '#BA7517', P3: '#27500A' }

const tarefasDaEtapa = num => SOP_TAREFAS.filter(t => t.etapaNum === num)
const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
const sopTaskId = (client, tid) => `sop-${slug(client)}-${tid}`
const sopMeetingId = (client, num) => `sop-${slug(client)}-E${String(num).padStart(2, '0')}`
const rowId = (client, itemId) => `${client}::${itemId}`

function addDays(iso, days) {
  const d = new Date(`${iso}T00:00:00`); d.setDate(d.getDate() + Math.round(days))
  return d
}
const fmtDate = d => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })

// ─── SopView ─────────────────────────────────────────────────
export default function SopView({ clients, meetings, tasks, onUpdateTask, onReload, onToast }) {
  const [rows, setRows] = useState({})
  const [loading, setLoading] = useState(true)
  const [tableMissing, setTableMissing] = useState(false)
  const [client, setClient] = useState(null)
  const [open, setOpen] = useState({})
  const [openTask, setOpenTask] = useState(null)
  const [launching, setLaunching] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.from('bmo_sop_progress').select('*')
    if (error) { setTableMissing(true); setLoading(false); return }
    const map = {}; (data || []).forEach(r => { map[r.id] = r })
    setRows(map); setTableMissing(false); setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const channel = supabase.channel('bmo_sop_progress_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bmo_sop_progress' }, payload => {
        if (payload.new?.id) setRows(prev => ({ ...prev, [payload.new.id]: payload.new }))
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const save = async (c, itemId, kind, patch) => {
    const id = rowId(c, itemId)
    const prev = rows[id]
    const row = { id, client: c, item_id: itemId, kind, status: '', value: '', ...prev, ...patch, updated_at: new Date().toISOString() }
    setRows(p => ({ ...p, [id]: row }))
    const { error } = await supabase.from('bmo_sop_progress').upsert(row)
    if (error) { onToast('Erro ao salvar no SOP'); setRows(p => ({ ...p, [id]: prev })) }
  }

  // Status da tarefa do SOP para o cliente: "não se aplica" vale sempre; se a tarefa foi
  // lançada na lista de tarefas, o status de lá é a referência; senão, o salvo no SOP.
  const statusOf = (c, tid) => {
    const r = rows[rowId(c, tid)]
    if (r?.status === 'na') return 'na'
    const launched = tasks.find(t => t.id === sopTaskId(c, tid))
    if (launched) return TASK_TO_SOP[launched.status] || 'nao_iniciado'
    return r?.status || 'nao_iniciado'
  }

  const setStatus = async (c, tid, status) => {
    await save(c, tid, 'tarefa', { status })
    const launched = tasks.find(t => t.id === sopTaskId(c, tid))
    if (launched && SOP_TO_TASK[status] && launched.status !== SOP_TO_TASK[status]) {
      onUpdateTask(launched.id, { status: SOP_TO_TASK[status] })
      const { error } = await supabase.from('bmo_tasks').update({ status: SOP_TO_TASK[status] }).eq('id', launched.id)
      if (error) onToast('Erro ao atualizar a tarefa lançada')
    }
  }

  const etapaProgress = (c, num) => {
    const ts = tarefasDaEtapa(num).filter(t => statusOf(c, t.id) !== 'na')
    const done = ts.filter(t => statusOf(c, t.id) === 'concluido').length
    const started = ts.some(t => statusOf(c, t.id) !== 'nao_iniciado')
    const blocked = ts.some(t => statusOf(c, t.id) === 'bloqueado')
    return { done, total: ts.length, pct: ts.length ? done / ts.length : 1, started, blocked }
  }

  // Etapa atual = primeira etapa de Implementação ainda não concluída; todas concluídas → Gestão Contínua.
  const etapaAtual = c => {
    const pend = SOP_ETAPAS.filter(e => e.workflow === 'Implementação').find(e => etapaProgress(c, e.num).pct < 1)
    return pend || null
  }
  const inicio = c => rows[rowId(c, 'inicio')]?.value || ''
  const inSop = c => !!inicio(c) || Object.values(rows).some(r => r.client === c && r.status)

  const launchEtapa = async (c, etapa) => {
    setLaunching(etapa.num)
    const meetingId = sopMeetingId(c, etapa.num)
    const meeting = {
      id: meetingId,
      title: `SOP · Etapa ${etapa.num} — ${etapa.nome}`,
      date_label: `${new Date().toLocaleDateString('pt-BR')} — SOP ${etapa.workflow}`,
      team: c, has_cliente: false, source: 'sop',
    }
    const { error: mErr } = await supabase.from('bmo_meetings').upsert(meeting, { onConflict: 'id', ignoreDuplicates: true })
    if (mErr) { onToast('Erro ao criar o bloco da etapa'); setLaunching(null); return }
    const novas = tarefasDaEtapa(etapa.num)
      .filter(t => statusOf(c, t.id) !== 'na' && !tasks.some(x => x.id === sopTaskId(c, t.id)))
      .map((t, i) => ({
        id: sopTaskId(c, t.id), meeting_id: meetingId,
        description: `[${t.id}] ${t.tarefa}`, resp: t.responsavel,
        cliente: '', cliente_tag: 'tag-nd', prazo: '', prazo_fixed: t.prazo,
        status: SOP_TO_TASK[statusOf(c, t.id)] || 'pendente', sort_order: i + 1,
      }))
    if (novas.length) {
      const { error } = await supabase.from('bmo_tasks').upsert(novas, { onConflict: 'id', ignoreDuplicates: true })
      if (error) { onToast('Erro ao lançar as tarefas'); setLaunching(null); return }
    }
    await onReload()
    setLaunching(null)
    onToast(novas.length ? `${novas.length} tarefa(s) lançada(s) na lista ✓` : 'Tarefas da etapa já estavam na lista')
  }

  const th = { padding: '7px 10px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', whiteSpace: 'nowrap', background: 'var(--bg)', borderBottom: '1px solid var(--border)' }
  const td = { padding: '8px 10px', verticalAlign: 'top', borderBottom: '1px solid var(--border)', fontSize: 12 }
  const btn = { padding: '6px 12px', borderRadius: 5, border: '1px solid var(--border-strong)', background: '#fff', fontSize: 12, cursor: 'pointer', color: 'var(--text)', fontWeight: 500 }

  if (tableMissing) return (
    <div style={{ background: 'var(--amber-soft)', border: '1px solid #E8D29A', borderRadius: 8, padding: 18, fontSize: 13, color: 'var(--amber)' }}>
      A tabela <code>bmo_sop_progress</code> ainda não existe no Supabase. Aplique a migração
      <code> supabase/migrations/20261028000000_bmo_sop_progress.sql</code> e clique em Atualizar.
    </div>
  )
  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)', fontSize: 14 }}>Carregando SOP...</div>

  // ── Visão da carteira ──
  if (!client) {
    const ativos = clients.filter(c => inSop(c.key))
    const outros = clients.filter(c => !inSop(c.key))
    const ClientRow = ({ c }) => {
      const atual = etapaAtual(c.key)
      return (
        <tr onClick={() => setClient(c.key)} style={{ cursor: 'pointer', background: '#fff' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-soft)'}
          onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
          <td style={{ ...td, fontWeight: 500, whiteSpace: 'nowrap' }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: c.color, marginRight: 8 }} />{c.key}
          </td>
          <td style={{ ...td, whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
            {inicio(c.key) ? new Date(`${inicio(c.key)}T00:00:00`).toLocaleDateString('pt-BR') : '—'}
          </td>
          <td style={{ ...td, whiteSpace: 'nowrap' }}>
            {atual ? <span>E{atual.num} · {atual.nome}</span> : <span style={{ color: '#3B6D11', fontWeight: 500 }}>Gestão Contínua</span>}
          </td>
          {SOP_ETAPAS.map(e => {
            const p = etapaProgress(c.key, e.num)
            const bg = p.blocked ? '#FDEAEA' : p.pct === 1 && p.started ? '#E6F4EE' : p.started ? '#EAF1FA' : 'var(--bg)'
            const fg = p.blocked ? '#8A2020' : p.pct === 1 && p.started ? '#1A6B4A' : p.started ? '#1A4D8F' : 'var(--text-light)'
            return <td key={e.num} title={`E${e.num} ${e.nome}: ${p.done}/${p.total}`} style={{ ...td, padding: '8px 3px', textAlign: 'center' }}>
              <div style={{ background: bg, color: fg, borderRadius: 4, fontSize: 10, fontWeight: 600, padding: '3px 0', minWidth: 30 }}>{p.done}/{p.total}</div>
            </td>
          })}
        </tr>
      )
    }
    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Processo SOP + BPM — carteira</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {SOP_ETAPAS.length} etapas · {SOP_TAREFAS.length} tarefas · versão {SOP_VERSAO}. Clique num cliente para acompanhar etapas, tarefas e checklists.
          </p>
        </div>
        <div style={{ borderRadius: 8, border: '1px solid var(--border)', overflow: 'auto', background: '#fff' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <th style={th}>Cliente</th><th style={th}>Kick-off</th><th style={th}>Etapa atual</th>
              {SOP_ETAPAS.map(e => <th key={e.num} title={e.nome} style={{ ...th, textAlign: 'center', padding: '7px 3px', color: COR_ETAPA[e.num] }}>E{e.num}</th>)}
            </tr></thead>
            <tbody>
              {ativos.map(c => <ClientRow key={c.key} c={c} />)}
              {ativos.length > 0 && outros.length > 0 && (
                <tr><td colSpan={3 + SOP_ETAPAS.length} style={{ ...td, background: 'var(--bg)', fontSize: 10, fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Sem acompanhamento no SOP</td></tr>
              )}
              {outros.map(c => <ClientRow key={c.key} c={c} />)}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // ── Detalhe do cliente ──
  const c = client
  const start = inicio(c)
  const atual = etapaAtual(c)
  const totalAtivas = SOP_TAREFAS.filter(t => statusOf(c, t.id) !== 'na').length
  const totalDone = SOP_TAREFAS.filter(t => statusOf(c, t.id) === 'concluido').length
  const color = clients.find(x => x.key === c)?.color || 'var(--accent)'

  const renderChecklist = t => (
    <div style={{ marginTop: 8, border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><th style={th}>Item do checklist</th><th style={th}>Obrig.</th><th style={th}>Resp.</th><th style={{ ...th, textAlign: 'center' }}>{t.checklist[0].l1}</th><th style={{ ...th, textAlign: 'center' }}>{t.checklist[0].l2}</th></tr></thead>
        <tbody>
          {t.checklist.map(ch => (
            <tr key={ch.id}>
              <td style={td}>
                <div>{ch.item}</div>
                {(ch.periodo && ch.periodo !== '—') && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ch.periodo}</div>}
              </td>
              <td style={{ ...td, whiteSpace: 'nowrap', color: ch.obrig === 'Obrigatório' ? '#A32D2D' : 'var(--text-muted)' }}>{ch.obrig}</td>
              <td style={{ ...td, whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>{ch.resp}</td>
              {['l1', 'l2'].map(l => {
                const k = `${ch.id}#${l}`
                const ok = rows[rowId(c, k)]?.status === 'ok'
                return <td key={l} style={{ ...td, textAlign: 'center' }}>
                  <input type="checkbox" checked={ok} onChange={() => save(c, k, 'check', { status: ok ? '' : 'ok' })} style={{ accentColor: 'var(--green)', width: 15, height: 15, cursor: 'pointer' }} />
                </td>
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div>
      <button onClick={() => setClient(null)} style={{ ...btn, marginBottom: 16 }}>← Carteira</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 18, background: '#fff', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 18px' }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color }}>{c}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            {atual ? <>Etapa atual: <strong>E{atual.num} · {atual.nome}</strong></> : <strong style={{ color: '#3B6D11' }}>Implementação concluída — Gestão Contínua</strong>}
            {' · '}{totalDone}/{totalAtivas} tarefas concluídas
          </div>
          <div style={{ height: 6, background: 'var(--bg)', borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
            <div style={{ width: `${totalAtivas ? (totalDone / totalAtivas) * 100 : 0}%`, height: '100%', background: 'var(--green)' }} />
          </div>
        </div>
        <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Data do Kick-off (Dia 0)
          <input type="date" value={start} onChange={e => save(c, 'inicio', 'meta', { value: e.target.value })}
            style={{ display: 'block', marginTop: 4, fontSize: 13, padding: '5px 8px', border: '1px solid var(--border)', borderRadius: 5, color: 'var(--text)' }} />
        </label>
      </div>

      {['Implementação', 'Gestão Contínua'].map(wf => (
        <div key={wf} style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>
            {wf === 'Implementação' ? 'Implementação — etapas sequenciais' : 'Gestão Contínua — ritos recorrentes'}
          </div>
          {SOP_ETAPAS.filter(e => e.workflow === wf).map(e => {
            const p = etapaProgress(c, e.num)
            const isOpen = open[e.num] ?? (atual?.num === e.num)
            const cor = COR_ETAPA[e.num]
            const launched = meetings.some(m => m.id === sopMeetingId(c, e.num))
            const janela = start ? `${fmtDate(addDays(start, e.semIni * 7))} → ${fmtDate(addDays(start, e.semFim * 7))}` : `sem. ${e.semIni}–${e.semFim}`
            return (
              <div key={e.num} style={{ background: '#fff', border: `1px solid ${atual?.num === e.num ? cor : 'var(--border)'}`, borderRadius: 8, marginBottom: 8, overflow: 'hidden' }}>
                <div onClick={() => setOpen(o => ({ ...o, [e.num]: !isOpen }))} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', cursor: 'pointer' }}>
                  <div style={{ width: 30, height: 30, borderRadius: 6, background: cor, color: '#fff', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>E{e.num}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{e.nome}{p.blocked && <span style={{ marginLeft: 8, fontSize: 11, color: '#8A2020' }}>🚫 bloqueio</span>}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{e.mp} · {janela}</div>
                  </div>
                  <div style={{ width: 120, flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }}>{p.done}/{p.total}</div>
                    <div style={{ height: 5, background: 'var(--bg)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${p.pct * 100}%`, height: '100%', background: p.pct === 1 ? 'var(--green)' : cor }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-light)' }}>{isOpen ? '▾' : '▸'}</span>
                </div>
                {isOpen && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '12px 14px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10, marginBottom: 12, fontSize: 12 }}>
                      <div><div style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: 10, textTransform: 'uppercase' }}>Objetivo</div>{e.objetivo}</div>
                      <div><div style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: 10, textTransform: 'uppercase' }}>Gatilho</div>{e.trigger}</div>
                      <div><div style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: 10, textTransform: 'uppercase' }}>Gate de saída</div>{e.gate}</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                      <button onClick={() => launchEtapa(c, e)} disabled={launching === e.num}
                        style={{ ...btn, background: 'var(--accent)', color: '#fff', border: 'none', opacity: launching === e.num ? .7 : 1 }}>
                        {launching === e.num ? 'Lançando...' : launched ? '↻ Completar na lista de tarefas' : '＋ Lançar etapa na lista de tarefas'}
                      </button>
                    </div>
                    <div style={{ border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <colgroup><col style={{ width: 70 }} /><col /><col style={{ width: 150 }} /><col style={{ width: 130 }} /><col style={{ width: 44 }} /><col style={{ width: 128 }} /></colgroup>
                        <thead><tr><th style={th}>ID</th><th style={th}>Tarefa</th><th style={th}>Responsável</th><th style={th}>Prazo / SLA</th><th style={th}>Prio</th><th style={th}>Status</th></tr></thead>
                        <tbody>
                          {tarefasDaEtapa(e.num).map(t => {
                            const st = statusOf(c, t.id)
                            const isLaunched = tasks.some(x => x.id === sopTaskId(c, t.id))
                            const expanded = openTask === `${c}:${t.id}`
                            return (
                              <tr key={t.id} style={{ opacity: st === 'na' ? .5 : 1 }}>
                                <td style={{ ...td, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{t.id}</td>
                                <td style={td}>
                                  <span onClick={() => setOpenTask(expanded ? null : `${c}:${t.id}`)} style={{ cursor: 'pointer', textDecoration: st === 'concluido' ? 'line-through' : 'none', fontWeight: 500 }}>
                                    {t.tarefa}
                                  </span>
                                  {t.tipo === 'Recorrente' && <span style={{ marginLeft: 6, fontSize: 10, padding: '1px 6px', borderRadius: 10, background: 'var(--purple-soft)', color: 'var(--purple)' }}>recorrente</span>}
                                  {isLaunched && <span title="Lançada na lista de tarefas" style={{ marginLeft: 6, fontSize: 10, padding: '1px 6px', borderRadius: 10, background: 'var(--accent-soft)', color: 'var(--accent)' }}>na lista</span>}
                                  {t.checklist && <span style={{ marginLeft: 6, fontSize: 10, padding: '1px 6px', borderRadius: 10, background: 'var(--green-soft)', color: 'var(--green)' }}>
                                    checklist {t.checklist.filter(ch => rows[rowId(c, `${ch.id}#l1`)]?.status === 'ok').length}/{t.checklist.length}
                                  </span>}
                                  {expanded && <div style={{ marginTop: 6, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                    <div>{t.descricao}</div>
                                    <div style={{ marginTop: 4 }}><strong>Gate:</strong> {t.gate}</div>
                                    {t.checklist && renderChecklist(t)}
                                  </div>}
                                  {!expanded && t.checklist && <div><button onClick={() => setOpenTask(`${c}:${t.id}`)} style={{ fontSize: 11, color: 'var(--accent)', background: 'none', border: 'none', padding: 0, marginTop: 2 }}>abrir checklist</button></div>}
                                </td>
                                <td style={{ ...td, color: 'var(--text-muted)' }}>{t.responsavel}</td>
                                <td style={{ ...td, color: 'var(--text-muted)' }}>{t.prazo}</td>
                                <td style={{ ...td, fontWeight: 600, color: COR_PRIO[t.prioridade] }}>{t.prioridade}</td>
                                <td style={td}>
                                  <select value={st} onChange={ev => setStatus(c, t.id, ev.target.value)}
                                    style={{ background: SOP_STATUS[st].bg, color: SOP_STATUS[st].color, border: '1px solid transparent', borderRadius: 20, padding: '3px 8px', fontSize: 11, fontWeight: 500, cursor: 'pointer', width: '100%' }}>
                                    {Object.entries(SOP_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                                  </select>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
