import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase.js'

// ─── Constants ───────────────────────────────────────────────
const SOP_STATUS = {
  nao_iniciada:  { label: 'Não iniciada',  bg: '#EEECE6', color: '#5A584F' },
  em_andamento:  { label: 'Em andamento',  bg: '#EAF1FA', color: '#1A4D8F' },
  bloqueada:     { label: 'Bloqueada',     bg: '#FDEAEA', color: '#8A2020' },
  concluida:     { label: 'Concluída',     bg: '#E6F4EE', color: '#1A6B4A' },
  nao_se_aplica: { label: 'Não se aplica', bg: '#F7F6F2', color: '#9B9890' },
}
const SITUACAO = {
  concluida:    { label: 'Concluída',    bg: '#E6F4EE', color: '#1A6B4A' },
  pendente:     { label: 'Pendente',     bg: '#FEF3D8', color: '#8A5A00' },
  bloqueada:    { label: 'Bloqueada',    bg: '#FDEAEA', color: '#8A2020' },
  em_andamento: { label: 'Em andamento', bg: '#EAF1FA', color: '#1A4D8F' },
  nao_iniciada: { label: 'Não iniciada', bg: 'var(--bg)', color: 'var(--text-light)' },
}
const SEGMENTOS = ['Em Implementação', 'Implementado', 'Churn']
const COR_ETAPA = {1:'#185FA5',2:'#1A6EC0',3:'#0F6E56',4:'#0C6478',5:'#0C6478',6:'#0C6478',7:'#0D2C54',8:'#4B1A7C',9:'#BA7517',10:'#3B6D11',11:'#185FA5',12:'#3B6D11',13:'#A32D2D',14:'#5A5A56'}
const COR_PRIO = { P1: '#A32D2D', P2: '#BA7517', P3: '#27500A' }
const FEITO = ['concluida', 'nao_se_aplica']
const INICIADO = ['em_andamento', 'concluida', 'bloqueada']

const sopTaskId = (clienteId, tid) => `sop-${clienteId}-${tid}`
const sopMeetingId = (clienteId, num) => `sop-${clienteId}-E${String(num).padStart(2, '0')}`
const addDays = (iso, days) => { const d = new Date(`${iso}T00:00:00`); d.setDate(d.getDate() + Math.round(days)); return d }
const fmtDate = d => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
const fmtIso = iso => iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('pt-BR') : '—'
const weeksBetween = (fromIso, toIso) => (new Date(`${toIso}T00:00:00`) - new Date(`${fromIso}T00:00:00`)) / (7 * 864e5)
const hojeIso = () => new Date().toISOString().slice(0, 10)

// ─── Regras do roadmap ───────────────────────────────────────
// Frente = tarefa mais adiantada (sequência) já iniciada, concluída ou bloqueada.
// Pendente anterior = tarefa antes da frente que não está Concluída nem Não se aplica.
function situacaoCliente(catalogo, statusOf) {
  const frente = catalogo.filter(t => INICIADO.includes(statusOf(t.id))).reduce((m, t) => Math.max(m, t.sequencia), 0)
  const pendente = t => t.sequencia < frente && !FEITO.includes(statusOf(t.id))
  const etapas = {}
  catalogo.forEach(t => {
    const e = etapas[t.etapa_num] ||= { num: t.etapa_num, nome: t.etapa_nome, workflow: t.workflow, semIni: t.sem_ini, semFim: t.sem_fim, tarefas: [] }
    e.tarefas.push(t)
  })
  Object.values(etapas).forEach(e => {
    const st = e.tarefas.map(t => statusOf(t.id))
    e.feitas = st.filter(s => FEITO.includes(s)).length
    e.concluidas = st.filter(s => s === 'concluida').length
    e.ativas = st.filter(s => s !== 'nao_se_aplica').length
    e.pendentes = e.tarefas.filter(pendente).length
    e.situacao = e.feitas === e.tarefas.length ? 'concluida'
      : e.pendentes ? 'pendente'
      : st.includes('bloqueada') ? 'bloqueada'
      : st.some(s => INICIADO.includes(s)) ? 'em_andamento' : 'nao_iniciada'
  })
  const frenteTarefa = catalogo.find(t => t.sequencia === frente)
  return { frente, frenteTarefa, pendente, etapas: Object.values(etapas).sort((a, b) => a.num - b.num) }
}

// ─── Gantt: planejado (semanas-padrão do SOP) × real (início e conclusão) ──
function Gantt({ etapas, kickoff, andamentoDe }) {
  const real = etapas.map(e => {
    const ini = e.tarefas.map(t => andamentoDe(t.id)?.iniciado_em).filter(Boolean).sort()[0]
    const fim = e.situacao === 'concluida' ? e.tarefas.map(t => andamentoDe(t.id)?.concluido_em).filter(Boolean).sort().pop() : null
    return { ini, fim }
  })
  const hojeSem = kickoff ? weeksBetween(kickoff, hojeIso()) : null
  const total = Math.max(12, ...etapas.map(e => e.semFim), ...(kickoff ? real.map(r => r.ini ? weeksBetween(kickoff, r.fim || hojeIso()) : 0) : []), hojeSem || 0) + 0.5
  const pct = w => `${Math.max(0, Math.min(100, (w / total) * 100))}%`
  return (
    <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px', marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 11, color: 'var(--text-muted)' }}>
        <strong style={{ fontSize: 12, color: 'var(--text)' }}>Gantt — planejado × real</strong>
        <span>
          <span style={{ display: 'inline-block', width: 14, height: 6, background: '#C8C4B8', borderRadius: 3, marginRight: 4 }} />planejado
          <span style={{ display: 'inline-block', width: 14, height: 6, background: '#1A4D8F', borderRadius: 3, margin: '0 4px 0 12px' }} />real
          {!kickoff && <em style={{ marginLeft: 12 }}>informe o Kick-off para ver o real</em>}
        </span>
      </div>
      {etapas.map((e, i) => {
        const r = real[i]
        const ini = kickoff && r.ini ? weeksBetween(kickoff, r.ini) : null
        const fim = kickoff && r.ini ? weeksBetween(kickoff, r.fim || hojeIso()) : null
        const sit = SITUACAO[e.situacao]
        return (
          <div key={e.num} style={{ display: 'flex', alignItems: 'center', gap: 10, height: 22 }}>
            <div style={{ width: 170, fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={e.nome}>
              <strong style={{ color: COR_ETAPA[e.num] }}>E{e.num}</strong> {e.nome}
            </div>
            <div style={{ flex: 1, position: 'relative', height: 14, background: 'var(--bg)', borderRadius: 3 }}>
              <div style={{ position: 'absolute', left: pct(e.semIni), width: `calc(${pct(e.semFim)} - ${pct(e.semIni)})`, minWidth: 3, top: 1, height: 5, background: '#C8C4B8', borderRadius: 3 }} />
              {ini !== null && <div style={{ position: 'absolute', left: pct(ini), width: `calc(${pct(Math.max(fim, ini + 0.15))} - ${pct(ini)})`, top: 7, height: 6, background: e.situacao === 'pendente' ? '#BA7517' : '#1A4D8F', borderRadius: 3 }} />}
              {hojeSem !== null && <div style={{ position: 'absolute', left: pct(hojeSem), top: -2, bottom: -2, width: 1, background: '#C0392B' }} />}
            </div>
            <div style={{ width: 92, fontSize: 10, textAlign: 'center', borderRadius: 10, padding: '1px 0', background: sit.bg, color: sit.color, fontWeight: 500 }}>
              {sit.label}{e.pendentes ? ` (${e.pendentes})` : ''}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── SopView ─────────────────────────────────────────────────
export default function SopView({ clients, catalogo, meetings, tasks, onClientsChange, onReload, onToast }) {
  const [andamento, setAndamento] = useState({})   // `${cliente}::${tarefa}` → linha
  const [checks, setChecks] = useState({})         // `${cliente}::${check}` → linha
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(false)
  const [clienteId, setClienteId] = useState(null)
  const [open, setOpen] = useState({})
  const [openTask, setOpenTask] = useState(null)
  const [launching, setLaunching] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const [a, c] = await Promise.all([
      supabase.from('bmo_sop_andamento').select('*'),
      supabase.from('bmo_sop_checks').select('*'),
    ])
    if (a.error || c.error) { setErro(true); setLoading(false); return }
    setAndamento(Object.fromEntries(a.data.map(r => [`${r.cliente_id}::${r.sop_tarefa_id}`, r])))
    setChecks(Object.fromEntries(c.data.map(r => [`${r.cliente_id}::${r.check_id}`, r])))
    setErro(false); setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const channel = supabase.channel('bmo_sop_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bmo_sop_andamento' }, ({ new: r }) => {
        if (r?.cliente_id) setAndamento(p => ({ ...p, [`${r.cliente_id}::${r.sop_tarefa_id}`]: r }))
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bmo_sop_checks' }, ({ new: r }) => {
        if (r?.cliente_id) setChecks(p => ({ ...p, [`${r.cliente_id}::${r.check_id}`]: r }))
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const andamentoDe = (c, tid) => andamento[`${c}::${tid}`]
  const statusOf = (c, tid) => andamentoDe(c, tid)?.status || 'nao_iniciada'

  const setStatus = async (c, tid, status) => {
    const key = `${c}::${tid}`, prev = andamento[key]
    setAndamento(p => ({ ...p, [key]: { ...prev, cliente_id: c, sop_tarefa_id: tid, status } }))
    // O trigger registra início e conclusão; a resposta traz as datas.
    const { data, error } = await supabase.from('bmo_sop_andamento')
      .upsert({ cliente_id: c, sop_tarefa_id: tid, status, origem: 'manual' }).select().single()
    if (error) { onToast('Erro ao salvar o andamento'); setAndamento(p => ({ ...p, [key]: prev })); return }
    setAndamento(p => ({ ...p, [key]: data }))
  }

  const toggleCheck = async (c, checkId, nivel) => {
    const key = `${c}::${checkId}`, prev = checks[key]
    const row = { cliente_id: c, check_id: checkId, l1: !!prev?.l1, l2: !!prev?.l2, [nivel]: !prev?.[nivel], updated_at: new Date().toISOString() }
    setChecks(p => ({ ...p, [key]: row }))
    const { error } = await supabase.from('bmo_sop_checks').upsert(row)
    if (error) { onToast('Erro ao salvar o checklist'); setChecks(p => ({ ...p, [key]: prev })) }
  }

  const updateCliente = async (c, patch) => {
    const { error } = await supabase.from('bmo_clientes').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', c)
    if (error) { onToast('Erro ao salvar o cliente'); return }
    onToast('Cliente atualizado ✓'); onClientsChange()
  }

  // Subtarefas = tarefas das atas validadas e ligadas à tarefa do SOP. Indicador apenas.
  const subtarefas = (c, tid) => {
    const sub = tasks.filter(t => t.cliente_id === c && t.sop_tarefa_id === tid && t.vinculo_status === 'validado')
    return { total: sub.length, feitas: sub.filter(t => t.status === 'concluido').length }
  }

  // Lança a etapa na aba Tarefas: cada tarefa do SOP vira uma subtarefa validada, ligada a ela.
  const launchEtapa = async (cliente, etapa) => {
    setLaunching(etapa.num)
    const meetingId = sopMeetingId(cliente.id, etapa.num)
    const { error: mErr } = await supabase.from('bmo_meetings').upsert({
      id: meetingId, title: `SOP · Etapa ${etapa.num} — ${etapa.nome}`,
      date_label: `${new Date().toLocaleDateString('pt-BR')} — SOP ${etapa.workflow}`,
      team: cliente.nome, has_cliente: false, source: 'sop',
    }, { onConflict: 'id', ignoreDuplicates: true })
    if (mErr) { onToast('Erro ao criar o bloco da etapa'); setLaunching(null); return }
    const novas = etapa.tarefas
      .filter(t => !FEITO.includes(statusOf(cliente.id, t.id)) && !tasks.some(x => x.id === sopTaskId(cliente.id, t.id)))
      .map(t => ({
        id: sopTaskId(cliente.id, t.id), meeting_id: meetingId,
        description: `[${t.id}] ${t.tarefa}`, resp: t.papel_responsavel || '', cliente: '', cliente_tag: 'tag-nd',
        prazo: '', prazo_fixed: t.prazo_padrao || '', status: 'pendente', sort_order: t.ordem,
        cliente_id: cliente.id, sop_tarefa_id: t.id, vinculo_status: 'validado',
      }))
    if (novas.length) {
      const { error } = await supabase.from('bmo_tasks').upsert(novas, { onConflict: 'id', ignoreDuplicates: true })
      if (error) { onToast('Erro ao lançar as tarefas'); setLaunching(null); return }
    }
    await onReload()
    setLaunching(null)
    onToast(novas.length ? `${novas.length} tarefa(s) lançada(s) na lista ✓` : 'Nada a lançar: tarefas já na lista ou concluídas')
  }

  const th = { padding: '7px 10px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', whiteSpace: 'nowrap', background: 'var(--bg)', borderBottom: '1px solid var(--border)' }
  const td = { padding: '8px 10px', verticalAlign: 'top', borderBottom: '1px solid var(--border)', fontSize: 12 }
  const btn = { padding: '6px 12px', borderRadius: 5, border: '1px solid var(--border-strong)', background: '#fff', fontSize: 12, cursor: 'pointer', color: 'var(--text)', fontWeight: 500 }
  const field = { fontSize: 12, padding: '5px 8px', border: '1px solid var(--border)', borderRadius: 5, color: 'var(--text)', background: '#fff', display: 'block', marginTop: 4 }

  if (erro || (!loading && !catalogo.length)) return (
    <div style={{ background: 'var(--amber-soft)', border: '1px solid #E8D29A', borderRadius: 8, padding: 18, fontSize: 13, color: 'var(--amber)' }}>
      Não foi possível ler a base do SOP no Supabase (bmo_sop_catalogo / bmo_sop_andamento). Clique em Atualizar ou confira as migrações em <code>supabase/migrations</code>.
    </div>
  )
  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)', fontSize: 14 }}>Carregando SOP...</div>

  const versao = catalogo[0]?.versao

  // ── Visão da carteira ──
  const cliente = clients.find(c => c.id === clienteId)
  if (!cliente) {
    const ordem = s => ({ 'Em Implementação': 0, 'Implementado': 1 }[s] ?? 2)
    const lista = [...clients].sort((a, b) => ordem(a.segmento) - ordem(b.segmento) || a.nome.localeCompare(b.nome))
    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Processo SOP + BPM — carteira</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {catalogo.length} tarefas do SOP · versão {versao} · {clients.length} clientes ativos. Clique num cliente para ver Gantt, andamento, checklists e POPs.
          </p>
        </div>
        <div style={{ borderRadius: 8, border: '1px solid var(--border)', overflow: 'auto', background: '#fff' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <th style={th}>Cliente</th><th style={th}>Segmento</th><th style={th}>Frente</th><th style={{ ...th, textAlign: 'center' }}>Pend.</th>
              {[...new Set(catalogo.map(t => t.etapa_num))].map(n => <th key={n} title={catalogo.find(t => t.etapa_num === n).etapa_nome} style={{ ...th, textAlign: 'center', padding: '7px 3px', color: COR_ETAPA[n] }}>E{n}</th>)}
            </tr></thead>
            <tbody>
              {lista.map(c => {
                const s = situacaoCliente(catalogo, tid => statusOf(c.id, tid))
                const pend = s.etapas.reduce((n, e) => n + e.pendentes, 0)
                return (
                  <tr key={c.id} onClick={() => setClienteId(c.id)} style={{ cursor: 'pointer', background: '#fff' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-soft)'}
                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                    <td style={{ ...td, fontWeight: 500, whiteSpace: 'nowrap' }}>
                      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: c.color, marginRight: 8 }} />{c.nome}
                    </td>
                    <td style={{ ...td, whiteSpace: 'nowrap', color: c.segmento ? 'var(--text)' : 'var(--text-light)' }}>{c.segmento || 'a definir'}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>{s.frenteTarefa ? `${s.frenteTarefa.id} · E${s.frenteTarefa.etapa_num}` : <span style={{ color: 'var(--text-light)' }}>sem andamento</span>}</td>
                    <td style={{ ...td, textAlign: 'center', fontWeight: 600, color: pend ? '#8A5A00' : 'var(--text-light)' }}>{pend || '—'}</td>
                    {s.etapas.map(e => {
                      const sit = SITUACAO[e.situacao]
                      return <td key={e.num} title={`E${e.num} ${e.nome}: ${sit.label} · ${e.feitas}/${e.tarefas.length}`} style={{ ...td, padding: '8px 3px', textAlign: 'center' }}>
                        <div style={{ background: sit.bg, color: sit.color, borderRadius: 4, fontSize: 10, fontWeight: 600, padding: '3px 0', minWidth: 30 }}>{e.feitas}/{e.tarefas.length}</div>
                      </td>
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // ── Detalhe do cliente ──
  const c = cliente.id
  const s = situacaoCliente(catalogo, tid => statusOf(c, tid))
  const totalAtivas = catalogo.filter(t => statusOf(c, t.id) !== 'nao_se_aplica').length
  const totalDone = catalogo.filter(t => statusOf(c, t.id) === 'concluida').length
  const totalPend = s.etapas.reduce((n, e) => n + e.pendentes, 0)
  const start = cliente.inicio_kickoff

  const renderChecklist = t => (
    <div style={{ marginTop: 8, border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><th style={th}>Item do checklist</th><th style={th}>Obrig.</th><th style={th}>Resp.</th><th style={{ ...th, textAlign: 'center' }}>{t.checklist[0].l1}</th><th style={{ ...th, textAlign: 'center' }}>{t.checklist[0].l2}</th></tr></thead>
        <tbody>
          {t.checklist.map(ch => (
            <tr key={ch.id}>
              <td style={td}>
                <div>{ch.item}</div>
                {ch.periodo && ch.periodo !== '—' && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ch.periodo}</div>}
              </td>
              <td style={{ ...td, whiteSpace: 'nowrap', color: ch.obrig === 'Obrigatório' ? '#A32D2D' : 'var(--text-muted)' }}>{ch.obrig}</td>
              <td style={{ ...td, whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>{ch.resp}</td>
              {['l1', 'l2'].map(l => (
                <td key={l} style={{ ...td, textAlign: 'center' }}>
                  <input type="checkbox" checked={!!checks[`${c}::${ch.id}`]?.[l]} onChange={() => toggleCheck(c, ch.id, l)} style={{ accentColor: 'var(--green)', width: 15, height: 15, cursor: 'pointer' }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div>
      <button onClick={() => setClienteId(null)} style={{ ...btn, marginBottom: 16 }}>← Carteira</button>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap', marginBottom: 14, background: '#fff', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 18px' }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: cliente.color }}>{cliente.nome}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            Frente: <strong>{s.frenteTarefa ? `${s.frenteTarefa.id} · ${s.frenteTarefa.tarefa}` : 'sem andamento registrado'}</strong>
            {' · '}{totalDone}/{totalAtivas} concluídas
            {totalPend > 0 && <span style={{ color: '#8A5A00', fontWeight: 500 }}> · {totalPend} pendente(s) anterior(es)</span>}
          </div>
          <div style={{ height: 6, background: 'var(--bg)', borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
            <div style={{ width: `${totalAtivas ? (totalDone / totalAtivas) * 100 : 0}%`, height: '100%', background: 'var(--green)' }} />
          </div>
        </div>
        <label style={{ fontSize: 11, color: 'var(--text-muted)' }}>Segmento
          <select value={cliente.segmento || ''} onChange={e => updateCliente(c, { segmento: e.target.value || null })} style={field}>
            <option value="">a definir</option>
            {SEGMENTOS.map(sg => <option key={sg} value={sg}>{sg}</option>)}
          </select>
        </label>
        <label style={{ fontSize: 11, color: 'var(--text-muted)' }}>Gerente de Contas
          <input defaultValue={cliente.gerente_contas || ''} onBlur={e => e.target.value !== (cliente.gerente_contas || '') && updateCliente(c, { gerente_contas: e.target.value || null })} placeholder="—" style={{ ...field, width: 140 }} />
        </label>
        <label style={{ fontSize: 11, color: 'var(--text-muted)' }}>Kick-off (Dia 0)
          <input type="date" value={start || ''} onChange={e => updateCliente(c, { inicio_kickoff: e.target.value || null })} style={field} />
        </label>
      </div>

      <Gantt etapas={s.etapas} kickoff={start} andamentoDe={tid => andamentoDe(c, tid)} />

      {['Implementação', 'Gestão Contínua'].map(wf => (
        <div key={wf} style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>
            {wf === 'Implementação' ? 'Implementação — sequência-padrão (sem bloqueio entre etapas)' : 'Gestão Contínua — ritos recorrentes'}
          </div>
          {s.etapas.filter(e => e.workflow === wf).map(e => {
            const isOpen = open[e.num] ?? (s.frenteTarefa?.etapa_num === e.num || e.pendentes > 0)
            const cor = COR_ETAPA[e.num]
            const sit = SITUACAO[e.situacao]
            const launched = meetings.some(m => m.id === sopMeetingId(c, e.num))
            const janela = start ? `${fmtDate(addDays(start, e.semIni * 7))} → ${fmtDate(addDays(start, e.semFim * 7))}` : `sem. ${e.semIni}–${e.semFim}`
            return (
              <div key={e.num} style={{ background: '#fff', border: `1px solid ${e.situacao === 'pendente' ? '#E8D29A' : 'var(--border)'}`, borderRadius: 8, marginBottom: 8, overflow: 'hidden' }}>
                <div onClick={() => setOpen(o => ({ ...o, [e.num]: !isOpen }))} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', cursor: 'pointer' }}>
                  <div style={{ width: 30, height: 30, borderRadius: 6, background: cor, color: '#fff', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>E{e.num}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{e.nome}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Planejado: {janela}</div>
                  </div>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: sit.bg, color: sit.color, fontWeight: 500 }}>{sit.label}{e.pendentes ? ` · ${e.pendentes}` : ''}</span>
                  <div style={{ width: 110, flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }}>{e.feitas}/{e.tarefas.length}</div>
                    <div style={{ height: 5, background: 'var(--bg)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${(e.feitas / e.tarefas.length) * 100}%`, height: '100%', background: e.situacao === 'concluida' ? 'var(--green)' : cor }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--text-light)' }}>{isOpen ? '▾' : '▸'}</span>
                </div>
                {isOpen && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                      <button onClick={() => launchEtapa(cliente, e)} disabled={launching === e.num}
                        style={{ ...btn, background: 'var(--accent)', color: '#fff', border: 'none', opacity: launching === e.num ? .7 : 1 }}>
                        {launching === e.num ? 'Lançando...' : launched ? '↻ Completar na lista de tarefas' : '＋ Lançar etapa na lista de tarefas'}
                      </button>
                    </div>
                    <div style={{ border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <colgroup><col style={{ width: 70 }} /><col /><col style={{ width: 140 }} /><col style={{ width: 120 }} /><col style={{ width: 40 }} /><col style={{ width: 132 }} /></colgroup>
                        <thead><tr><th style={th}>ID</th><th style={th}>Tarefa</th><th style={th}>Responsável</th><th style={th}>Prazo / Datas</th><th style={th}>Prio</th><th style={th}>Status</th></tr></thead>
                        <tbody>
                          {e.tarefas.map(t => {
                            const st = statusOf(c, t.id)
                            const a = andamentoDe(c, t.id)
                            const sub = subtarefas(c, t.id)
                            const expanded = openTask === `${c}:${t.id}`
                            const pend = s.pendente(t)
                            return (
                              <tr key={t.id} style={{ opacity: st === 'nao_se_aplica' ? .5 : 1, background: pend ? '#FFFBF0' : '#fff' }}>
                                <td style={{ ...td, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{t.id}</td>
                                <td style={td}>
                                  <span onClick={() => setOpenTask(expanded ? null : `${c}:${t.id}`)} style={{ cursor: 'pointer', textDecoration: st === 'concluida' ? 'line-through' : 'none', fontWeight: 500 }}>{t.tarefa}</span>
                                  {pend && <span style={{ marginLeft: 6, fontSize: 10, padding: '1px 6px', borderRadius: 10, background: 'var(--amber-soft)', color: 'var(--amber)', fontWeight: 600 }}>pendente anterior</span>}
                                  {t.tipo === 'Recorrente' && <span style={{ marginLeft: 6, fontSize: 10, padding: '1px 6px', borderRadius: 10, background: 'var(--purple-soft)', color: 'var(--purple)' }}>recorrente</span>}
                                  {sub.total > 0 && <span title="Subtarefas das atas validadas" style={{ marginLeft: 6, fontSize: 10, padding: '1px 6px', borderRadius: 10, background: 'var(--accent-soft)', color: 'var(--accent)' }}>subtarefas {sub.feitas}/{sub.total}</span>}
                                  {sub.total > 0 && sub.feitas === sub.total && !FEITO.includes(st) && <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--green)', fontWeight: 600 }}>✓ todas fechadas — confirmar conclusão?</span>}
                                  {t.checklist && <span style={{ marginLeft: 6, fontSize: 10, padding: '1px 6px', borderRadius: 10, background: 'var(--green-soft)', color: 'var(--green)' }}>
                                    checklist {t.checklist.filter(ch => checks[`${c}::${ch.id}`]?.l1 || checks[`${c}::${ch.id}`]?.l2).length}/{t.checklist.length}
                                  </span>}
                                  {expanded && <div style={{ marginTop: 6, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                    <div>{t.descricao}</div>
                                    {t.pop?.passos && <ol style={{ margin: '6px 0 0 18px' }}>{t.pop.passos.map((p, i) => <li key={i}>{p}</li>)}</ol>}
                                    {t.pop?.ferr?.length > 0 && <div style={{ marginTop: 4 }}><strong>Ferramentas:</strong> {t.pop.ferr.join(' · ')}</div>}
                                    {t.pop?.cuid?.length > 0 && <div style={{ marginTop: 4 }}><strong>Cuidados:</strong> {t.pop.cuid.join(' ')}</div>}
                                    <div style={{ marginTop: 4 }}><strong>Gate:</strong> {t.gate}</div>
                                    {t.skill_vinculada && <div style={{ marginTop: 4 }}><strong>Skill/prompt:</strong> {t.skill_vinculada}</div>}
                                    {t.pop?.pend?.length > 0 && <div style={{ marginTop: 4, color: 'var(--amber)' }}><strong>Pendência do POP:</strong> {t.pop.pend.join(' ')}</div>}
                                    {t.checklist && renderChecklist(t)}
                                  </div>}
                                  {!expanded && t.checklist && <div><button onClick={() => setOpenTask(`${c}:${t.id}`)} style={{ fontSize: 11, color: 'var(--accent)', background: 'none', border: 'none', padding: 0, marginTop: 2 }}>abrir checklist</button></div>}
                                </td>
                                <td style={{ ...td, color: 'var(--text-muted)' }}>{t.papel_responsavel}</td>
                                <td style={{ ...td, color: 'var(--text-muted)' }}>
                                  {t.prazo_padrao}
                                  {(a?.iniciado_em || a?.concluido_em) && <div style={{ fontSize: 10, marginTop: 2 }}>{a.iniciado_em && `▶ ${fmtIso(a.iniciado_em)}`}{a.concluido_em && ` · ✓ ${fmtIso(a.concluido_em)}`}</div>}
                                </td>
                                <td style={{ ...td, fontWeight: 600, color: COR_PRIO[t.prioridade] }}>{t.prioridade}</td>
                                <td style={td}>
                                  <select value={st} onChange={ev => { setOpen(o => ({ ...o, [e.num]: true })); setStatus(c, t.id, ev.target.value) }}
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
