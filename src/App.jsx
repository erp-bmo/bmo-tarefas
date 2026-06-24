import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from './supabase.js'

// ─── Constants ───────────────────────────────────────────────
const TEAM_COLORS = {
  'Squad Palermo': '#5B3FA0', 'Gerentes de Contas': '#8A4500', 'Interno BMO': '#5A584F',
  'Clínica Rached': '#C0392B', 'Clínica Suzuki': '#4A3FA0', 'EndoDerma': '#1A6B4A',
  'Instituto Leonardo Junqueira': '#0B57D0', 'Loureiro Clinic': '#6D4C41', 'Luiz Felipe': '#00796B',
  'Clínica Calvet': '#8A5A00', 'Injecta MedInfuse': '#1A4D8F', 'Natalia Dyna': '#7B1FA2',
  'Evidence': '#1565C0', 'Duo Una': '#2E7D32', 'Leandro Barreto': '#8A2060',
  'Instituto K.D.': '#3949AB', 'Marina Alves': '#D84315', 'Mais Saúde': '#00838F',
  'Instituto Essencia': '#558B2F', 'Prevnner Clínica Médica': '#1A4D8F',
  'Gustavo Kobayashi': '#6D4C41',
}
const TEAM_EMOJIS = {
  'Squad Palermo': '🏟️', 'Gerentes de Contas': '👥', 'Interno BMO': '🏢',
  'Clínica Rached': '🏥', 'Clínica Suzuki': '🏥', 'EndoDerma': '✨',
  'Instituto Leonardo Junqueira': '🔬', 'Loureiro Clinic': '🩺', 'Luiz Felipe': '👨‍⚕️',
  'Clínica Calvet': '🩺', 'Injecta MedInfuse': '💉', 'Natalia Dyna': '🌸',
  'Evidence': '🏥', 'Duo Una': '🏥', 'Leandro Barreto': '👨‍⚕️',
  'Instituto K.D.': '🏥', 'Marina Alves': '👩‍⚕️', 'Mais Saúde': '❤️',
  'Instituto Essencia': '🌿', 'Prevnner Clínica Médica': '🏥', 'Gustavo Kobayashi': '🦷',
}
const STATUS_LABEL = { pendente: 'Pendente', andamento: 'Em andamento', concluido: 'Concluída', bloqueado: 'Bloqueada' }
const STATUS_EMOJI = { pendente: '🔲', andamento: '🔄', concluido: '✅', bloqueado: '🚫' }

const ALL_CLIENTS = [
  { key: 'Clínica Rached', color: '#C0392B' }, { key: 'Clínica Suzuki', color: '#4A3FA0' },
  { key: 'EndoDerma', color: '#1A6B4A' }, { key: 'Instituto Leonardo Junqueira', color: '#0B57D0' },
  { key: 'Loureiro Clinic', color: '#6D4C41' }, { key: 'Luiz Felipe', color: '#00796B' },
  { key: 'Clínica Calvet', color: '#8A5A00' }, { key: 'Injecta MedInfuse', color: '#1A4D8F' },
  { key: 'Natalia Dyna', color: '#7B1FA2' }, { key: 'Evidence', color: '#1565C0' },
  { key: 'Duo Una', color: '#2E7D32' }, { key: 'Leandro Barreto', color: '#8A2060' },
  { key: 'Instituto K.D.', color: '#3949AB' }, { key: 'Marina Alves', color: '#D84315' },
  { key: 'Mais Saúde', color: '#00838F' }, { key: 'Instituto Essencia', color: '#558B2F' },
  { key: 'Prevnner Clínica Médica', color: '#1A4D8F' }, { key: 'Gustavo Kobayashi', color: '#6D4C41' },
]

// ─── Utils ────────────────────────────────────────────────────
function getWeekRange() {
  const now = new Date()
  const day = now.getDay()
  const mon = new Date(now); mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6)
  const fmt = d => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  return { start: fmt(mon), end: fmt(sun), label: `${fmt(mon)} a ${fmt(sun)}` }
}

function copyText(text) {
  if (navigator.clipboard?.writeText) { navigator.clipboard.writeText(text).catch(() => fallback(text)) }
  else fallback(text)
}
function fallback(text) {
  const ta = document.createElement('textarea'); ta.value = text
  ta.style.cssText = 'position:fixed;top:-9999px;opacity:0'
  document.body.appendChild(ta); ta.select()
  try { document.execCommand('copy') } catch(e) {}
  document.body.removeChild(ta)
}

// ─── Toast ────────────────────────────────────────────────────
function Toast({ message, onHide }) {
  useEffect(() => { const t = setTimeout(onHide, 2200); return () => clearTimeout(t) }, [message])
  return <div style={{ position:'fixed', bottom:24, right:24, background:'#1A1917', color:'#fff', padding:'10px 18px', borderRadius:8, fontSize:13, fontWeight:500, zIndex:999, animation:'fadeIn .15s ease' }}>{message}</div>
}

// ─── StatusSelect ─────────────────────────────────────────────
const STATUS_STYLES = { pendente:{background:'#EEECE6',color:'#5A584F'}, andamento:{background:'#EAF1FA',color:'#1A4D8F'}, concluido:{background:'#E6F4EE',color:'#1A6B4A'}, bloqueado:{background:'#FDEAEA',color:'#8A2020'} }
function StatusSelect({ value, onChange }) {
  return <select value={value} onChange={e => onChange(e.target.value)} style={{ ...STATUS_STYLES[value], border:'1px solid transparent', borderRadius:20, padding:'3px 8px', fontSize:11, fontWeight:500, cursor:'pointer', appearance:'none', minWidth:96, textAlign:'center' }}>
    {Object.entries(STATUS_LABEL).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
  </select>
}

// ─── EditableCell ─────────────────────────────────────────────
function EditableCell({ value, onChange }) {
  const [local, setLocal] = useState(value)
  useEffect(() => setLocal(value), [value])
  return <input value={local} onChange={e => setLocal(e.target.value)} onBlur={() => { if (local !== value) onChange(local) }}
    style={{ fontSize:12, border:'1px solid transparent', borderRadius:5, padding:'3px 6px', background:'transparent', width:'100%', color:'var(--text)' }}
    onFocus={e => { e.target.style.borderColor='var(--accent)'; e.target.style.background='#fff' }}
    onBlur2={e => { e.target.style.borderColor='transparent'; e.target.style.background='transparent' }} />
}

// ─── CopyModal ────────────────────────────────────────────────
function CopyModal({ meetings, tasks, clientFilter, statusFilter, onClose, onToast }) {
  const [fmt, setFmt] = useState('whatsapp')
  const getFiltered = () => meetings.filter(m => clientFilter==='all'||m.team===clientFilter||(m.has_cliente&&tasks.some(t=>t.meeting_id===m.id&&t.cliente===clientFilter)))
    .map(m=>({...m,tasks:tasks.filter(t=>t.meeting_id===m.id&&t.status!=='bloqueado'&&(statusFilter==='all'||t.status===statusFilter)&&(clientFilter==='all'||m.team===clientFilter||(m.has_cliente&&t.cliente===clientFilter)))}))
    .filter(m=>m.tasks.length>0)
  const buildWhatsApp=()=>{const label=clientFilter!=='all'?` · ${clientFilter}`:'';let lines=[`*📋 Tarefas BMO Gestão${label}*\n_${new Date().toLocaleDateString('pt-BR')}_\n`];getFiltered().forEach(m=>{lines.push(`*${m.title}*`);m.tasks.forEach(t=>{lines.push(`${STATUS_EMOJI[t.status]||'🔲'} ${t.description}`);lines.push(`   👤 ${t.resp}${t.prazo_fixed?` _(${t.prazo_fixed})_`:t.prazo?` _(${t.prazo})_`:''}`)});lines.push('')});return lines.join('\n').trim()}
  const buildChecklist=()=>{const mark={pendente:'[ ]',andamento:'[~]',concluido:'[x]',bloqueado:'[!]'};let lines=['TAREFAS — BMO Gestão','─'.repeat(48),''];getFiltered().forEach(m=>{lines.push(`## ${m.title} · ${m.date_label}`);m.tasks.forEach(t=>{lines.push(`${mark[t.status]||'[ ]'} ${t.description}`);lines.push(`    Resp: ${t.resp} | Prazo: ${t.prazo_fixed||t.prazo||'—'}`)});lines.push('')});return lines.join('\n').trim()}
  const buildMarkdown=()=>{let lines=['# Tarefas — BMO Gestão',''];getFiltered().forEach(m=>{lines.push(`### ${m.title} · ${m.date_label}`);lines.push('| Tarefa | Responsável | Prazo | Status |');lines.push('|--------|-------------|-------|--------|');m.tasks.forEach(t=>{lines.push(`| ${t.description} | ${t.resp} | ${t.prazo_fixed||t.prazo||'—'} | ${STATUS_LABEL[t.status]} |`)});lines.push('')});return lines.join('\n').trim()}
  const build=()=>fmt==='whatsapp'?buildWhatsApp():fmt==='checklist'?buildChecklist():buildMarkdown()
  const preview=build().slice(0,400)
  const handleCopy=()=>{copyText(build());onClose();onToast({whatsapp:'Copiado em formato WhatsApp ✓',checklist:'Copiado em formato lista ✓',table:'Copiado em formato Markdown ✓'}[fmt])}
  return <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.35)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:300}}>
    <div style={{background:'#fff',borderRadius:8,border:'1px solid var(--border)',width:420,maxWidth:'92vw',padding:24,boxShadow:'0 8px 32px rgba(0,0,0,.12)'}}>
      <h3 style={{fontSize:15,fontWeight:600,marginBottom:4}}>Copiar tarefas</h3>
      <p style={{fontSize:13,color:'var(--text-muted)',marginBottom:18}}>Escolha o formato de saída.</p>
      {[{id:'whatsapp',label:'📋 WhatsApp / mensagem',desc:'Emojis de status, agrupado por reunião.'},{id:'checklist',label:'✅ Lista de tarefas (Notion / e-mail)',desc:'Caixas [ ] sem formatação especial.'},{id:'table',label:'📊 Tabela Markdown',desc:'Compatível com Notion, GitHub, Confluence.'}].map(opt=>(
        <label key={opt.id} onClick={()=>setFmt(opt.id)} style={{display:'flex',gap:12,border:`1px solid ${fmt===opt.id?'var(--accent)':'var(--border)'}`,borderRadius:8,padding:'10px 14px',cursor:'pointer',background:fmt===opt.id?'var(--accent-soft)':'transparent',marginBottom:8}}>
          <input type="radio" readOnly checked={fmt===opt.id} style={{marginTop:2,accentColor:'var(--accent)'}}/>
          <div><div style={{fontSize:13,fontWeight:500}}>{opt.label}</div><div style={{fontSize:12,color:'var(--text-muted)'}}>{opt.desc}</div></div>
        </label>
      ))}
      <div style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:5,padding:'10px 14px',fontSize:12,fontFamily:'monospace',color:'var(--text-muted)',whiteSpace:'pre-wrap',maxHeight:120,overflow:'auto',marginBottom:18,lineHeight:1.6}}>{preview}{build().length>400?'\n...':''}</div>
      <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
        <button onClick={onClose} style={{padding:'7px 14px',borderRadius:5,border:'1px solid var(--border-strong)',background:'#fff',fontSize:13,cursor:'pointer'}}>Cancelar</button>
        <button onClick={handleCopy} style={{padding:'7px 14px',borderRadius:5,border:'none',background:'var(--accent)',color:'#fff',fontSize:13,fontWeight:500,cursor:'pointer'}}>Copiar</button>
      </div>
    </div>
  </div>
}

// ─── Report View ──────────────────────────────────────────────
function ReportView({ meetings, tasks, onToast }) {
  const [selectedClient, setSelectedClient] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [reportText, setReportText] = useState('')
  const [reportClient, setReportClient] = useState(null)
  const week = getWeekRange()

  // Clientes que têm tarefas
  const clientsWithTasks = ALL_CLIENTS.filter(c => {
    return meetings.some(m => {
      const clientMatch = m.team === c.key || (m.has_cliente && tasks.some(t => t.meeting_id === m.id && t.cliente === c.key))
      return clientMatch && tasks.some(t => t.meeting_id === m.id && t.status !== 'bloqueado')
    })
  })

  const getClientTasks = (clientKey) => {
    const result = { concluidas: [], andamento: [], pendentes: [] }
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    meetings.forEach(m => {
      const isClient = m.team === clientKey || (m.has_cliente && tasks.some(t => t.meeting_id === m.id && t.cliente === clientKey))
      if (!isClient) return
      tasks.filter(t => t.meeting_id === m.id && t.status !== 'bloqueado').forEach(t => {
        if (m.has_cliente && t.cliente !== clientKey && m.team !== clientKey) return
        if (t.status === 'concluido') {
          // Só inclui concluídas dos últimos 7 dias
          const updatedAt = t.updated_at ? new Date(t.updated_at) : null
          if (updatedAt && updatedAt >= sevenDaysAgo) {
            result.concluidas.push(t)
          }
        } else if (t.status === 'andamento') {
          result.andamento.push(t)
        } else if (t.status === 'pendente') {
          result.pendentes.push(t)
        }
      })
    })
    return result
  }

  const generateReport = (clientKey) => {
    setGenerating(true)
    setSelectedClient(clientKey)
    setReportText('')
    setReportClient(clientKey)

    const ct = getClientTasks(clientKey)
    const w = getWeekRange()

    // ── Seção 1: Atividades realizadas ──
    let secRealizadas = ''
    if (ct.concluidas.length > 0) {
      secRealizadas = ct.concluidas.map(t => `• ${t.description};`).join('\n')
    } else if (ct.andamento.length > 0) {
      secRealizadas = `• Nenhuma atividade concluída na semana passada. As seguintes atividades estão em andamento:\n`
        + ct.andamento.map(t => `  - ${t.description} _(${t.resp})_`).join('\n')
    } else {
      secRealizadas = '• Nenhuma atividade concluída na semana passada.'
    }

    // ── Seção 2: Atividades previstas ──
    const previstas = [...ct.andamento, ...ct.pendentes]
    let secPrevistas = ''
    if (previstas.length > 0) {
      secPrevistas = previstas.map(t => {
        const prazo = t.prazo_fixed ? ` _(${t.prazo_fixed})_` : ''
        const status = t.status === 'andamento' ? ' 🔄' : ''
        return `• ${t.description}${prazo}${status};`
      }).join('\n')
    } else {
      secPrevistas = '• Nenhuma atividade prevista no momento.'
    }

    // ── Seção 3: Alinhamentos ──
    const comPrazo = [...ct.andamento, ...ct.pendentes].filter(t => t.prazo_fixed || t.prazo)
    let secAlinhamentos = ''
    if (comPrazo.length > 0) {
      secAlinhamentos = comPrazo.map(t => {
        const prazo = t.prazo_fixed || t.prazo || ''
        return `- ${t.description} _(${prazo})_`
      }).join('\n')
    } else {
      secAlinhamentos = `- Seguimos à disposição para quaisquer dúvidas ou alinhamentos necessários.`
    }

    const report = `Bom dia, pessoal! Tudo bem?
Segue o nosso *report semanal* referente à semana de ${w.label}, com o resumo das atividades realizadas e os próximos passos do projeto:

*✅ Atividades realizadas – semana passada*
${secRealizadas}

*🚀 Atividades previstas – esta semana*
${secPrevistas}

*🗓️ Alinhamentos Importantes*
${secAlinhamentos}

Caso tenham qualquer dúvida, estaremos à disposição!`

    // Simula pequeno delay para UX
    setTimeout(() => {
      setReportText(report)
      setGenerating(false)
    }, 400)
  }

  const handleCopyReport = () => {
    copyText(reportText)
    onToast('Report copiado ✓')
  }

  return (
    <div style={{ display: 'flex', gap: 24, height: '100%' }}>
      {/* Client list */}
      <div style={{ width: 260, flexShrink: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12 }}>
          Clientes — {clientsWithTasks.length} com tarefas
        </div>
        {clientsWithTasks.map(({ key, color }) => {
          const ct = getClientTasks(key)
          const total = ct.concluidas.length + ct.andamento.length + ct.pendentes.length
          const isSelected = selectedClient === key
          return (
            <div key={key} onClick={() => generateReport(key)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', borderRadius: 8, cursor: 'pointer', marginBottom: 6,
              border: `1px solid ${isSelected ? color : 'var(--border)'}`,
              background: isSelected ? color + '11' : '#fff',
              transition: 'all .15s'
            }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                {TEAM_EMOJIS[key] || '🏥'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{key}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                  {ct.concluidas.length > 0 && <span style={{ color: '#1A6B4A', marginRight: 6 }}>✅ {ct.concluidas.length}</span>}
                  {ct.andamento.length > 0 && <span style={{ color: '#1A4D8F', marginRight: 6 }}>🔄 {ct.andamento.length}</span>}
                  {ct.pendentes.length > 0 && <span style={{ color: '#6B6860' }}>🔲 {ct.pendentes.length}</span>}
                </div>
              </div>
              <div style={{ flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
                  <path d="M5 3l14 9-14 9V3z"/>
                </svg>
              </div>
            </div>
          )
        })}
      </div>

      {/* Report panel */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {!selectedClient && !generating && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400, color: 'var(--text-muted)', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
            <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', marginBottom: 8 }}>Selecione um cliente para gerar o report</div>
            <div style={{ fontSize: 13 }}>O report semanal será gerado automaticamente com base nas tarefas cadastradas.</div>
          </div>
        )}

        {generating && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400, color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 32, animation: 'spin 1s linear infinite', display: 'inline-block', marginBottom: 16 }}>⟳</div>
            <div style={{ fontSize: 14, color: 'var(--text)' }}>Gerando report para {selectedClient}...</div>
            <div style={{ fontSize: 12, marginTop: 6 }}>A IA está analisando as tarefas e formatando o report</div>
          </div>
        )}

        {reportText && !generating && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
                  {TEAM_EMOJIS[reportClient] || '🏥'} Report — {reportClient}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  Semana de referência: {week.label} · Gerado por IA · Revise antes de enviar
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => generateReport(reportClient)} style={{ padding: '7px 14px', borderRadius: 5, border: '1px solid var(--border-strong)', background: '#fff', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                  Regenerar
                </button>
                <button onClick={handleCopyReport} style={{ padding: '7px 14px', borderRadius: 5, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  Copiar para WhatsApp
                </button>
              </div>
            </div>

            {/* Report preview */}
            <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 8, padding: 20 }}>
              {/* WhatsApp-style preview */}
              <div style={{ background: '#ECE5DD', borderRadius: 8, padding: 16, fontFamily: 'system-ui, sans-serif' }}>
                <div style={{ background: '#fff', borderRadius: 8, padding: '12px 16px', maxWidth: 480, boxShadow: '0 1px 3px rgba(0,0,0,.1)', fontSize: 13, lineHeight: 1.6, color: '#111', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {reportText.split('\n').map((line, i) => {
                    // Bold: *text*
                    const parts = line.split(/(\*[^*]+\*)/g)
                    return <div key={i}>{parts.map((p, j) =>
                      p.startsWith('*') && p.endsWith('*')
                        ? <strong key={j}>{p.slice(1, -1)}</strong>
                        : p
                    )}{'\n'}</div>
                  })}
                </div>
                <div style={{ fontSize: 11, color: '#667781', textAlign: 'right', marginTop: 4 }}>
                  {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            {/* Editable text area */}
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>✏️ Editar report antes de copiar:</div>
              <textarea
                value={reportText}
                onChange={e => setReportText(e.target.value)}
                style={{ width: '100%', minHeight: 200, padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13, lineHeight: 1.6, fontFamily: 'var(--font)', color: 'var(--text)', resize: 'vertical' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── TaskRow ──────────────────────────────────────────────────
function TaskRow({ task, meeting, onUpdate, onToast }) {
  const handleStatus = async (val) => {
    onUpdate(task.id, { status: val })
    const { error } = await supabase.from('bmo_tasks').update({ status: val }).eq('id', task.id)
    if (error) { onToast('Erro ao salvar status'); onUpdate(task.id, { status: task.status }) }
  }
  const handleField = async (field, val) => {
    onUpdate(task.id, { [field]: val })
    const { error } = await supabase.from('bmo_tasks').update({ [field]: val }).eq('id', task.id)
    if (error) onToast('Erro ao salvar')
  }
  const handleDone = async () => {
    const s = task.status === 'concluido' ? 'pendente' : 'concluido'
    await handleStatus(s); onToast(s === 'concluido' ? 'Concluída ✓' : 'Reaberta')
  }
  const handleCopy = () => {
    copyText(`[${meeting.title}]\nTarefa: ${task.description}\nResponsável: ${task.resp}${task.cliente?'\nCliente: '+task.cliente:''}\nData: ${meeting.date_label.split('—')[0].trim()}\nPrazo: ${task.prazo_fixed||task.prazo||'—'}\nStatus: ${STATUS_LABEL[task.status]}`)
    onToast('Tarefa copiada ✓')
  }
  const td = { padding:'9px 12px', verticalAlign:'top', borderBottom:'1px solid var(--border)' }
  return (
    <tr style={{ background: task.status==='concluido'?'#FAFAF8':'#fff', opacity: task.status==='concluido'?.55:1 }}>
      <td style={td}>
        <span style={{ fontSize:13, lineHeight:1.5, textDecoration:task.status==='concluido'?'line-through':'none', color:'var(--text)' }}>{task.description}</span>
        {task.cliente && meeting.has_cliente && <span style={{ display:'inline-block', fontSize:11, padding:'1px 7px', borderRadius:20, background:'#EAF1FA', color:'#1A4D8F', marginLeft:8 }}>{task.cliente}</span>}
      </td>
      <td style={{...td, minWidth:100}}><EditableCell value={task.resp} onChange={v=>handleField('resp',v)}/></td>
      <td style={{...td, minWidth:80}}><span style={{fontSize:11,color:'var(--text-muted)',whiteSpace:'nowrap'}}>{meeting.date_label.split('—')[0].trim()}</span></td>
      <td style={{...td, minWidth:110}}>
        {task.prazo_fixed ? <span style={{fontSize:12,color:'var(--amber)',fontWeight:500}}>{task.prazo_fixed}</span>
          : <input type="date" value={task.prazo||''} onChange={e=>handleField('prazo',e.target.value)}
              style={{fontSize:11,border:'1px solid transparent',borderRadius:5,padding:'3px 6px',background:'transparent',color:'var(--text)',cursor:'pointer'}}
              onFocus={e=>{e.target.style.borderColor='var(--accent)';e.target.style.background='#fff'}}
              onBlur={e=>{e.target.style.borderColor='transparent';e.target.style.background='transparent'}} />}
      </td>
      <td style={{...td, minWidth:105}}><StatusSelect value={task.status} onChange={handleStatus}/></td>
      <td style={{...td, width:72}}>
        <div style={{display:'flex',gap:3,justifyContent:'flex-end'}}>
          <button onClick={handleDone} title="Concluir" style={{width:26,height:26,borderRadius:5,border:'1px solid transparent',background:'none',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-light)',cursor:'pointer'}}
            onMouseEnter={e=>{e.currentTarget.style.background='#E6F4EE';e.currentTarget.style.color='#1A6B4A';e.currentTarget.style.borderColor='#1A6B4A'}}
            onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.color='var(--text-light)';e.currentTarget.style.borderColor='transparent'}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
          <button onClick={handleCopy} title="Copiar" style={{width:26,height:26,borderRadius:5,border:'1px solid transparent',background:'none',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-light)',cursor:'pointer'}}
            onMouseEnter={e=>{e.currentTarget.style.background='var(--bg)';e.currentTarget.style.borderColor='var(--border)'}}
            onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.borderColor='transparent'}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── MeetingBlock ─────────────────────────────────────────────
function MeetingBlock({ meeting, tasks, clientFilter, statusFilter, onUpdate, onToast }) {
  const color = TEAM_COLORS[meeting.team] || '#9B9890'
  const emoji = TEAM_EMOJIS[meeting.team] || '📋'
  const visibleTasks = tasks.filter(t => {
    if (t.status === 'bloqueado') return false
    const statusOk = statusFilter === 'all' || t.status === statusFilter
    const clientOk = clientFilter === 'all' || meeting.team === clientFilter || (meeting.has_cliente && t.cliente === clientFilter)
    return statusOk && clientOk
  })
  if (visibleTasks.length === 0) return null
  const handleCopyMeeting = () => {
    const lines = [`${meeting.title} — ${meeting.date_label}\n`]
    visibleTasks.forEach(t => lines.push(`• ${t.description} | ${t.resp} | ${t.prazo_fixed||t.prazo||'—'} | ${STATUS_LABEL[t.status]}`))
    copyText(lines.join('\n')); onToast('Reunião copiada ✓')
  }
  const th = { padding:'7px 12px', textAlign:'left', fontSize:10, fontWeight:600, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.05em', whiteSpace:'nowrap', background:'var(--bg)', borderBottom:'1px solid var(--border)' }
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
        <div style={{ width:28, height:28, borderRadius:6, background:color+'22', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>{emoji}</div>
        <div>
          <div style={{ fontSize:13, fontWeight:600 }}>{meeting.title}</div>
          <div style={{ fontSize:11, color:'var(--text-muted)' }}>
            {meeting.date_label}
            <span style={{ marginLeft:6, fontSize:10, background:meeting.source==='gemini'?'#E8F0FE':'#E6F4EE', color:meeting.source==='gemini'?'#1A4D8F':'#1A6B4A', padding:'1px 6px', borderRadius:10, fontWeight:500 }}>
              {meeting.source==='gemini'?'✦ Gemini':'● tl;dv'}
            </span>
          </div>
        </div>
        <button onClick={handleCopyMeeting} style={{ marginLeft:'auto', fontSize:11, color:'var(--accent)', background:'none', border:'none', padding:'4px 8px', borderRadius:5, fontWeight:500, cursor:'pointer' }}
          onMouseEnter={e=>e.currentTarget.style.background='var(--accent-soft)'}
          onMouseLeave={e=>e.currentTarget.style.background='none'}>Copiar reunião</button>
      </div>
      <div style={{ borderRadius:8, border:'1px solid var(--border)', overflow:'hidden', background:'#fff' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <colgroup><col/><col style={{width:110}}/><col style={{width:82}}/><col style={{width:115}}/><col style={{width:105}}/><col style={{width:72}}/></colgroup>
          <thead><tr><th style={th}>Tarefa</th><th style={th}>Responsável</th><th style={th}>Data</th><th style={th}>Prazo</th><th style={th}>Status</th><th style={th}></th></tr></thead>
          <tbody>{visibleTasks.map(t => <TaskRow key={t.id} task={t} meeting={meeting} onUpdate={onUpdate} onToast={onToast}/>)}</tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────
export default function App() {
  const [meetings, setMeetings] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [clientFilter, setClientFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [toast, setToast] = useState(null)
  const [showCopy, setShowCopy] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState(null)
  const [activeTab, setActiveTab] = useState('tarefas') // 'tarefas' | 'reports'

  const showToast = (msg) => setToast(msg)

  const loadData = useCallback(async () => {
    setLoading(true)
    const [{ data: mData }, { data: tData }] = await Promise.all([
      supabase.from('bmo_meetings').select('*').order('created_at'),
      supabase.from('bmo_tasks').select('*').order('sort_order'),
    ])
    if (mData) setMeetings(mData)
    if (tData) setTasks(tData)
    setLoading(false)
    setLastSync(new Date())
  }, [])

  useEffect(() => { loadData() }, [loadData])

  useEffect(() => {
    const channel = supabase.channel('bmo_tasks_changes')
      .on('postgres_changes', { event:'UPDATE', schema:'public', table:'bmo_tasks' }, payload => {
        setTasks(prev => prev.map(t => t.id===payload.new.id ? {...t,...payload.new} : t))
      })
      .on('postgres_changes', { event:'INSERT', schema:'public', table:'bmo_meetings' }, () => loadData())
      .on('postgres_changes', { event:'INSERT', schema:'public', table:'bmo_tasks' }, () => loadData())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [loadData])

  const updateTask = useCallback((id, patch) => {
    setTasks(prev => prev.map(t => t.id===id ? {...t,...patch} : t))
  }, [])

  const exportCSV = () => {
    const filtered = meetings.filter(m => clientFilter==='all'||m.team===clientFilter||(m.has_cliente&&tasks.some(t=>t.meeting_id===m.id&&t.cliente===clientFilter)))
    const rows = [['Reunião','Data Reunião','Equipe','Tarefa','Responsável','Cliente','Prazo','Status']]
    filtered.forEach(m => {
      tasks.filter(t=>t.meeting_id===m.id&&t.status!=='bloqueado'&&(statusFilter==='all'||t.status===statusFilter)).forEach(t=>{
        rows.push([`"${m.title}"`,`"${m.date_label.split('—')[0].trim()}"`,`"${m.team}"`,`"${t.description}"`,`"${t.resp}"`,`"${t.cliente||''}"`,`"${t.prazo_fixed||t.prazo||''}"`,`"${STATUS_LABEL[t.status]}"`])
      })
    })
    const csv = '\uFEFF'+rows.map(r=>r.join(',')).join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}))
    a.download = `tarefas_bmo_${new Date().toISOString().slice(0,10)}.csv`; a.click()
    showToast('CSV exportado ✓')
  }

  const handleSync = async () => { setSyncing(true); await loadData(); setSyncing(false); showToast('Base atualizada ✓') }

  const filteredTasks = tasks.filter(t => {
    if (t.status === 'bloqueado') return false
    const m = meetings.find(x=>x.id===t.meeting_id); if (!m) return false
    const clientOk = clientFilter==='all'||m.team===clientFilter||(m.has_cliente&&t.cliente===clientFilter)
    const statusOk = statusFilter==='all'||t.status===statusFilter
    return clientOk && statusOk
  })
  const done = filteredTasks.filter(t=>t.status==='concluido').length
  const pending = filteredTasks.filter(t=>t.status==='pendente').length

  const clientCounts = {}
  tasks.filter(t=>t.status!=='bloqueado').forEach(t => {
    const m = meetings.find(x=>x.id===t.meeting_id); if (!m) return
    clientCounts[m.team] = (clientCounts[m.team]||0)+1
    if (m.has_cliente&&t.cliente&&t.cliente!=='Não identificado') clientCounts[t.cliente]=(clientCounts[t.cliente]||0)+1
  })

  const btnBase = { display:'inline-flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:5, fontSize:13, fontWeight:500, cursor:'pointer', border:'1px solid var(--border-strong)', background:'#fff', color:'var(--text)', whiteSpace:'nowrap' }
  const btnPrimary = { ...btnBase, background:'var(--accent)', color:'#fff', border:'none' }
  const btnGreen = { ...btnBase, background:'#1A6B4A', color:'#fff', border:'none' }

  const sidebarBtn = (key, color) => ({ display:'flex', alignItems:'center', gap:8, width:'100%', padding:'7px 10px', borderRadius:5, border:'none', background:clientFilter===key?'var(--accent-soft)':'transparent', cursor:'pointer', textAlign:'left', fontSize:13, color:clientFilter===key?'var(--accent)':'var(--text-muted)', fontWeight:clientFilter===key?500:400 })
  const statusPill = (s) => ({ display:'flex', alignItems:'center', gap:7, width:'100%', padding:'6px 10px', borderRadius:5, border:'none', background:statusFilter===s?'var(--bg)':'transparent', cursor:'pointer', fontSize:12, color:statusFilter===s?'var(--text)':'var(--text-muted)', fontWeight:statusFilter===s?500:400 })
  const tabStyle = (t) => ({ padding:'8px 18px', borderRadius:6, border:'none', cursor:'pointer', fontSize:13, fontWeight:500, background:activeTab===t?'var(--accent)':'transparent', color:activeTab===t?'#fff':'var(--text-muted)', transition:'all .15s' })

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100vh' }}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* HEADER */}
      <header style={{ background:'#fff', borderBottom:'1px solid var(--border)', padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:200 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:28, height:28, background:'var(--accent)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
          </div>
          <div>
            <div style={{ fontSize:15, fontWeight:600 }}>Gerenciador de Tarefas — BMO Gestão</div>
            <div style={{ fontSize:11, color:'var(--text-muted)' }}>
              {filteredTasks.length} tarefas · {done} concluídas
              {lastSync && ` · Sync: ${lastSync.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}`}
            </div>
          </div>
          {/* Tabs */}
          <div style={{ display:'flex', gap:4, marginLeft:24, background:'var(--bg)', borderRadius:8, padding:4 }}>
            <button style={tabStyle('tarefas')} onClick={()=>setActiveTab('tarefas')}>📋 Tarefas</button>
            <button style={tabStyle('reports')} onClick={()=>setActiveTab('reports')}>📊 Reports</button>
          </div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <button style={btnGreen} onClick={handleSync} disabled={syncing}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={syncing?{animation:'spin 1s linear infinite'}:{}}>
              <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            {syncing ? 'Atualizando...' : 'Atualizar'}
          </button>
          {activeTab === 'tarefas' && <>
            <button style={btnBase} onClick={()=>setShowCopy(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              Copiar
            </button>
            <button style={btnPrimary} onClick={exportCSV}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Exportar CSV
            </button>
          </>}
        </div>
      </header>

      <div style={{ display:'flex', flex:1 }}>
        {/* SIDEBAR — only on tarefas tab */}
        {activeTab === 'tarefas' && (
          <aside style={{ width:'var(--sidebar)', background:'#fff', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', position:'sticky', top:57, height:'calc(100vh - 57px)', overflowY:'auto', flexShrink:0 }}>
            <div style={{ padding:'16px 12px 8px' }}>
              <div style={{ fontSize:10, fontWeight:600, color:'var(--text-light)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8, padding:'0 4px' }}>Clientes</div>
              <button style={sidebarBtn('all','#9B9890')} onClick={()=>setClientFilter('all')}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:'#9B9890', flexShrink:0 }}/>
                Todos
                <span style={{ marginLeft:'auto', fontSize:11, background:'var(--bg)', border:'1px solid var(--border)', padding:'1px 6px', borderRadius:10, color:'var(--text-muted)' }}>{tasks.filter(t=>t.status!=='bloqueado').length}</span>
              </button>
            </div>
            <div style={{ height:1, background:'var(--border)', margin:'4px 12px' }}/>
            <div style={{ padding:'8px 12px' }}>
              <div style={{ fontSize:10, fontWeight:600, color:'var(--text-light)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8, padding:'0 4px' }}>Equipes</div>
              {[{key:'Squad Palermo',color:'#5B3FA0'},{key:'Gerentes de Contas',color:'#8A4500'},{key:'Interno BMO',color:'#5A584F'}].map(({key,color})=>(
                <button key={key} style={sidebarBtn(key,color)} onClick={()=>setClientFilter(key)}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:color, flexShrink:0 }}/>{key}
                  <span style={{ marginLeft:'auto', fontSize:11, background:clientFilter===key?'var(--accent)':'var(--bg)', border:`1px solid ${clientFilter===key?'var(--accent)':'var(--border)'}`, padding:'1px 6px', borderRadius:10, color:clientFilter===key?'#fff':'var(--text-muted)' }}>{clientCounts[key]||0}</span>
                </button>
              ))}
            </div>
            <div style={{ height:1, background:'var(--border)', margin:'4px 12px' }}/>
            <div style={{ padding:'8px 12px' }}>
              <div style={{ fontSize:10, fontWeight:600, color:'var(--text-light)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8, padding:'0 4px' }}>Clínicas</div>
              {ALL_CLIENTS.map(({key,color})=>(
                <button key={key} style={sidebarBtn(key,color)} onClick={()=>setClientFilter(key)}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:color, flexShrink:0 }}/>{key}
                  <span style={{ marginLeft:'auto', fontSize:11, background:clientFilter===key?'var(--accent)':'var(--bg)', border:`1px solid ${clientFilter===key?'var(--accent)':'var(--border)'}`, padding:'1px 6px', borderRadius:10, color:clientFilter===key?'#fff':'var(--text-muted)' }}>{clientCounts[key]||0}</span>
                </button>
              ))}
            </div>
            <div style={{ height:1, background:'var(--border)', margin:'4px 12px' }}/>
            <div style={{ padding:'8px 12px 16px' }}>
              <div style={{ fontSize:10, fontWeight:600, color:'var(--text-light)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8, padding:'0 4px' }}>Status</div>
              {[['all','📋','Todas'],['pendente','🔲','Pendente'],['andamento','🔄','Em andamento'],['concluido','✅','Concluída'],['bloqueado','🚫','Bloqueada']].map(([s,icon,label])=>(
                <button key={s} style={statusPill(s)} onClick={()=>setStatusFilter(s)}>
                  <span style={{ fontSize:13, width:16, textAlign:'center' }}>{icon}</span> {label}
                </button>
              ))}
            </div>
          </aside>
        )}

        {/* MAIN */}
        <main style={{ flex:1, padding:'24px 28px', overflowY:'auto', minWidth:0 }}>
          {activeTab === 'tarefas' && <>
            {/* Stats */}
            <div style={{ display:'flex', gap:12, marginBottom:22, flexWrap:'wrap' }}>
              {[{num:filteredTasks.length,lbl:'tarefas',color:'var(--text)'},{num:done,lbl:'concluídas',color:'#1A6B4A'},{num:pending,lbl:'pendentes',color:'#8A5A00'},{num:meetings.length,lbl:'reuniões',color:'#5B3FA0'}].map(({num,lbl,color})=>(
                <div key={lbl} style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:8, padding:'14px 18px', minWidth:100 }}>
                  <div style={{ fontSize:22, fontWeight:600, color }}>{loading?'—':num}</div>
                  <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>{lbl}</div>
                </div>
              ))}
            </div>
            {loading ? (
              <div style={{ textAlign:'center', padding:60, color:'var(--text-muted)', fontSize:14 }}>
                <div style={{ fontSize:32, marginBottom:12, animation:'spin 1s linear infinite', display:'inline-block' }}>⟳</div>
                <div>Carregando dados do Supabase...</div>
              </div>
            ) : (
              meetings.map(m => <MeetingBlock key={m.id} meeting={m} tasks={tasks.filter(t=>t.meeting_id===m.id)} clientFilter={clientFilter} statusFilter={statusFilter} onUpdate={updateTask} onToast={showToast}/>)
            )}
          </>}

          {activeTab === 'reports' && (
            <div>
              <div style={{ marginBottom:20 }}>
                <h2 style={{ fontSize:16, fontWeight:600, color:'var(--text)', marginBottom:4 }}>Reports Semanais</h2>
                <p style={{ fontSize:13, color:'var(--text-muted)' }}>
                  Selecione um cliente para gerar o report automaticamente com base nas tarefas cadastradas.
                  Semana atual: <strong>{getWeekRange().label}</strong> · Tarefas bloqueadas são excluídas automaticamente.
                </p>
              </div>
              <ReportView meetings={meetings} tasks={tasks} onToast={showToast}/>
            </div>
          )}
        </main>
      </div>

      {showCopy && <CopyModal meetings={meetings} tasks={tasks} clientFilter={clientFilter} statusFilter={statusFilter} onClose={()=>setShowCopy(false)} onToast={showToast}/>}
      {toast && <Toast message={toast} onHide={()=>setToast(null)}/>}
    </div>
  )
}
