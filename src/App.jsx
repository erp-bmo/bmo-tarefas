import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from './supabase.js'

// ─── Constants ───────────────────────────────────────────────
const TEAM_COLORS = {
  'Squad Palermo': '#5B3FA0', 'Gerentes de Contas': '#8A4500',
  'Evidence': '#1A4D8F', 'Instituto Essencia': '#4A3FA0',
  'Injecta MedInfuse': '#1A6B4A', 'Calvet': '#8A5A00',
  'Leandro Barreto': '#8A2060', 'Endoderma': '#1A6B4A',
  'Instituto K.D.': '#4A3FA0', 'Prevnner Clínica': '#0B57D0',
  'Palermo': '#1A4D8F', 'Suzuki': '#4A3FA0', 'Douuna': '#8A5A00',
  'Saúde': '#1A6B4A', 'Alimento do Ser': '#8A2060', 'Interno BMO': '#5A584F',
}
const TEAM_EMOJIS = {
  'Squad Palermo': '🏟️', 'Gerentes de Contas': '👥', 'Evidence': '🏥',
  'Instituto Essencia': '🌿', 'Injecta MedInfuse': '💉', 'Calvet': '🩺',
  'Leandro Barreto': '👨‍⚕️', 'Endoderma': '✨', 'Instituto K.D.': '🏥',
  'Prevnner Clínica': '🏥', 'Palermo': '🏟️', 'Suzuki': '🏥',
  'Douuna': '🏥', 'Saúde': '❤️', 'Alimento do Ser': '🌱', 'Interno BMO': '🏢',
}
const STATUS_LABEL = { pendente: 'Pendente', andamento: 'Em andamento', concluido: 'Concluída', bloqueado: 'Bloqueada' }
const STATUS_EMOJI = { pendente: '🔲', andamento: '🔄', concluido: '✅', bloqueado: '🚫' }

const ALL_CLIENTS = [
  { key: 'Squad Palermo', color: '#5B3FA0' },
  { key: 'Gerentes de Contas', color: '#8A4500' },
  { key: 'Interno BMO', color: '#5A584F' },
  { key: 'Evidence', color: '#1A4D8F' },
  { key: 'Instituto Essencia', color: '#4A3FA0' },
  { key: 'Injecta MedInfuse', color: '#1A6B4A' },
  { key: 'Calvet', color: '#8A5A00' },
  { key: 'Leandro Barreto', color: '#8A2060' },
  { key: 'Endoderma', color: '#1A6B4A' },
  { key: 'Instituto K.D.', color: '#4A3FA0' },
  { key: 'Prevnner Clínica', color: '#0B57D0' },
  { key: 'Palermo', color: '#1A4D8F' },
  { key: 'Suzuki', color: '#4A3FA0' },
  { key: 'Douuna', color: '#8A5A00' },
  { key: 'Saúde', color: '#1A6B4A' },
  { key: 'Alimento do Ser', color: '#8A2060' },
]

// ─── Debounce hook ────────────────────────────────────────────
function useDebounce(fn, delay) {
  const timer = useRef(null)
  return useCallback((...args) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => fn(...args), delay)
  }, [fn, delay])
}

// ─── Toast ────────────────────────────────────────────────────
function Toast({ message, onHide }) {
  useEffect(() => {
    const t = setTimeout(onHide, 2200)
    return () => clearTimeout(t)
  }, [message])
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24,
      background: '#1A1917', color: '#fff',
      padding: '10px 18px', borderRadius: 8,
      fontSize: 13, fontWeight: 500, zIndex: 999,
      animation: 'fadeIn .15s ease'
    }}>{message}</div>
  )
}

// ─── Status Select ────────────────────────────────────────────
const STATUS_STYLES = {
  pendente:  { background: '#EEECE6', color: '#5A584F' },
  andamento: { background: '#EAF1FA', color: '#1A4D8F' },
  concluido: { background: '#E6F4EE', color: '#1A6B4A' },
  bloqueado: { background: '#FDEAEA', color: '#8A2020' },
}
function StatusSelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        ...STATUS_STYLES[value],
        border: '1px solid transparent',
        borderRadius: 20,
        padding: '3px 8px',
        fontSize: 11,
        fontWeight: 500,
        cursor: 'pointer',
        appearance: 'none',
        minWidth: 96,
        textAlign: 'center',
      }}
    >
      {Object.entries(STATUS_LABEL).map(([k, v]) => (
        <option key={k} value={k}>{v}</option>
      ))}
    </select>
  )
}

// ─── Editable cell ────────────────────────────────────────────
function EditableCell({ value, onChange, placeholder = '' }) {
  const [local, setLocal] = useState(value)
  useEffect(() => setLocal(value), [value])
  return (
    <input
      value={local}
      placeholder={placeholder}
      onChange={e => setLocal(e.target.value)}
      onBlur={() => { if (local !== value) onChange(local) }}
      style={{
        fontSize: 12, border: '1px solid transparent',
        borderRadius: 5, padding: '3px 6px',
        background: 'transparent', width: '100%',
        color: 'var(--text)',
      }}
      onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.background = '#fff' }}
    />
  )
}

// ─── Copy helpers ─────────────────────────────────────────────
function copyText(text) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).catch(() => fallback(text))
  } else { fallback(text) }
}
function fallback(text) {
  const ta = document.createElement('textarea')
  ta.value = text
  ta.style.cssText = 'position:fixed;top:-9999px;opacity:0'
  document.body.appendChild(ta); ta.select()
  try { document.execCommand('copy') } catch(e) {}
  document.body.removeChild(ta)
}

// ─── Copy Modal ───────────────────────────────────────────────
function CopyModal({ meetings, tasks, clientFilter, statusFilter, onClose, onToast }) {
  const [fmt, setFmt] = useState('whatsapp')

  const getFiltered = () => {
    return meetings.filter(m => {
      const clientMatch = clientFilter === 'all' || m.team === clientFilter ||
        (m.has_cliente && tasks.filter(t => t.meeting_id === m.id && t.cliente === clientFilter).length > 0)
      return clientMatch
    }).map(m => ({
      ...m,
      tasks: tasks.filter(t => t.meeting_id === m.id &&
        (statusFilter === 'all' || t.status === statusFilter) &&
        (clientFilter === 'all' || m.team === clientFilter ||
          (m.has_cliente && t.cliente === clientFilter))
      )
    })).filter(m => m.tasks.length > 0)
  }

  const buildWhatsApp = () => {
    const label = clientFilter !== 'all' ? ` · ${clientFilter}` : ''
    let lines = [`*📋 Tarefas BMO Gestão${label}*\n_${new Date().toLocaleDateString('pt-BR')}_\n`]
    getFiltered().forEach(m => {
      lines.push(`*${m.title}*`)
      m.tasks.forEach(t => {
        lines.push(`${STATUS_EMOJI[t.status] || '🔲'} ${t.description}`)
        lines.push(`   👤 ${t.resp}${t.prazo_fixed ? ` _(${t.prazo_fixed})_` : t.prazo ? ` _(${t.prazo})_` : ''}`)
      })
      lines.push('')
    })
    return lines.join('\n').trim()
  }

  const buildChecklist = () => {
    const mark = { pendente: '[ ]', andamento: '[~]', concluido: '[x]', bloqueado: '[!]' }
    let lines = ['TAREFAS — BMO Gestão', '─'.repeat(48), '']
    getFiltered().forEach(m => {
      lines.push(`## ${m.title} · ${m.date_label}`)
      m.tasks.forEach(t => {
        lines.push(`${mark[t.status] || '[ ]'} ${t.description}`)
        lines.push(`    Resp: ${t.resp} | Prazo: ${t.prazo_fixed || t.prazo || '—'}`)
      })
      lines.push('')
    })
    return lines.join('\n').trim()
  }

  const buildMarkdown = () => {
    let lines = ['# Tarefas — BMO Gestão', '']
    getFiltered().forEach(m => {
      lines.push(`### ${m.title} · ${m.date_label}`)
      lines.push('| Tarefa | Responsável | Data | Prazo | Status |')
      lines.push('|--------|-------------|------|-------|--------|')
      m.tasks.forEach(t => {
        lines.push(`| ${t.description} | ${t.resp} | ${m.date_label.split('—')[0].trim()} | ${t.prazo_fixed || t.prazo || '—'} | ${STATUS_LABEL[t.status]} |`)
      })
      lines.push('')
    })
    return lines.join('\n').trim()
  }

  const build = () => fmt === 'whatsapp' ? buildWhatsApp() : fmt === 'checklist' ? buildChecklist() : buildMarkdown()
  const preview = build().slice(0, 400)

  const handleCopy = () => {
    copyText(build())
    onClose()
    onToast({ whatsapp: 'Copiado em formato WhatsApp ✓', checklist: 'Copiado em formato lista ✓', table: 'Copiado em formato Markdown ✓' }[fmt])
  }

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300
    }}>
      <div style={{ background: '#fff', borderRadius: 8, border: '1px solid var(--border)', width: 420, maxWidth: '92vw', padding: 24, boxShadow: '0 8px 32px rgba(0,0,0,.12)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Copiar tarefas</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 18 }}>Escolha o formato de saída.</p>
        {[
          { id: 'whatsapp', label: '📋 WhatsApp / mensagem', desc: 'Emojis de status, agrupado por reunião.' },
          { id: 'checklist', label: '✅ Lista de tarefas (Notion / e-mail)', desc: 'Caixas [ ] sem formatação especial.' },
          { id: 'table', label: '📊 Tabela Markdown', desc: 'Compatível com Notion, GitHub, Confluence.' },
        ].map(opt => (
          <label key={opt.id} onClick={() => setFmt(opt.id)} style={{
            display: 'flex', gap: 12, border: `1px solid ${fmt === opt.id ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 8, padding: '10px 14px', cursor: 'pointer',
            background: fmt === opt.id ? 'var(--accent-soft)' : 'transparent', marginBottom: 8
          }}>
            <input type="radio" readOnly checked={fmt === opt.id} style={{ marginTop: 2, accentColor: 'var(--accent)' }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{opt.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{opt.desc}</div>
            </div>
          </label>
        ))}
        <div style={{
          background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 5,
          padding: '10px 14px', fontSize: 12, fontFamily: 'monospace',
          color: 'var(--text-muted)', whiteSpace: 'pre-wrap', maxHeight: 120,
          overflow: 'auto', marginBottom: 18, lineHeight: 1.6
        }}>{preview}{build().length > 400 ? '\n...' : ''}</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={{ padding: '7px 14px', borderRadius: 5, border: '1px solid var(--border-strong)', background: '#fff', fontSize: 13 }}>Cancelar</button>
          <button onClick={handleCopy} style={{ padding: '7px 14px', borderRadius: 5, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 500 }}>Copiar</button>
        </div>
      </div>
    </div>
  )
}

// ─── Task Row ─────────────────────────────────────────────────
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
    const newStatus = task.status === 'concluido' ? 'pendente' : 'concluido'
    await handleStatus(newStatus)
    onToast(newStatus === 'concluido' ? 'Concluída ✓' : 'Reaberta')
  }

  const handleCopy = () => {
    copyText(`[${meeting.title}]\nTarefa: ${task.description}\nResponsável: ${task.resp}${task.cliente ? '\nCliente: ' + task.cliente : ''}\nData: ${meeting.date_label.split('—')[0].trim()}\nPrazo: ${task.prazo_fixed || task.prazo || '—'}\nStatus: ${STATUS_LABEL[task.status]}`)
    onToast('Tarefa copiada ✓')
  }

  const tdStyle = { padding: '9px 12px', verticalAlign: 'top', borderBottom: '1px solid var(--border)' }
  const dateStr = meeting.date_label.split('—')[0].trim()

  return (
    <tr style={{ background: task.status === 'concluido' ? '#FAFAF8' : '#fff', opacity: task.status === 'concluido' ? .55 : 1 }}>
      <td style={tdStyle}>
        <span style={{ fontSize: 13, lineHeight: 1.5, textDecoration: task.status === 'concluido' ? 'line-through' : 'none', color: 'var(--text)' }}>
          {task.description}
        </span>
        {task.cliente && meeting.has_cliente && (
          <span style={{ display: 'inline-block', fontSize: 11, padding: '1px 7px', borderRadius: 20, background: '#EAF1FA', color: '#1A4D8F', marginLeft: 8 }}>
            {task.cliente}
          </span>
        )}
      </td>
      <td style={{ ...tdStyle, minWidth: 100 }}>
        <EditableCell value={task.resp} onChange={v => handleField('resp', v)} />
      </td>
      <td style={{ ...tdStyle, minWidth: 80 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{dateStr}</span>
      </td>
      <td style={{ ...tdStyle, minWidth: 110 }}>
        {task.prazo_fixed
          ? <span style={{ fontSize: 12, color: 'var(--amber)', fontWeight: 500 }}>{task.prazo_fixed}</span>
          : <input type="date" value={task.prazo || ''} onChange={e => handleField('prazo', e.target.value)}
              style={{ fontSize: 11, border: '1px solid transparent', borderRadius: 5, padding: '3px 6px', background: 'transparent', color: 'var(--text)', cursor: 'pointer' }}
              onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.background = '#fff' }}
              onBlur={e => { e.target.style.borderColor = 'transparent'; e.target.style.background = 'transparent' }}
            />
        }
      </td>
      <td style={{ ...tdStyle, minWidth: 105 }}>
        <StatusSelect value={task.status} onChange={handleStatus} />
      </td>
      <td style={{ ...tdStyle, width: 72 }}>
        <div style={{ display: 'flex', gap: 3, justifyContent: 'flex-end' }}>
          <button onClick={handleDone} title="Concluir" style={{ width: 26, height: 26, borderRadius: 5, border: '1px solid transparent', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#E6F4EE'; e.currentTarget.style.color = '#1A6B4A'; e.currentTarget.style.borderColor = '#1A6B4A' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-light)'; e.currentTarget.style.borderColor = 'transparent' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </button>
          <button onClick={handleCopy} title="Copiar" style={{ width: 26, height: 26, borderRadius: 5, border: '1px solid transparent', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.borderColor = 'var(--border)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'transparent' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── Meeting Block ────────────────────────────────────────────
function MeetingBlock({ meeting, tasks, clientFilter, statusFilter, onUpdate, onToast }) {
  const color = TEAM_COLORS[meeting.team] || '#9B9890'
  const emoji = TEAM_EMOJIS[meeting.team] || '📋'

  const visibleTasks = tasks.filter(t => {
    const statusOk = statusFilter === 'all' || t.status === statusFilter
    const clientOk = clientFilter === 'all' || meeting.team === clientFilter ||
      (meeting.has_cliente && t.cliente === clientFilter)
    return statusOk && clientOk
  })

  if (visibleTasks.length === 0) return null

  const handleCopyMeeting = () => {
    const lines = [`${meeting.title} — ${meeting.date_label}\n`]
    visibleTasks.forEach(t => lines.push(`• ${t.description} | ${t.resp} | ${t.prazo_fixed || t.prazo || '—'} | ${STATUS_LABEL[t.status]}`))
    copyText(lines.join('\n'))
    onToast('Reunião copiada ✓')
  }

  const thStyle = { padding: '7px 12px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', whiteSpace: 'nowrap', background: 'var(--bg)', borderBottom: '1px solid var(--border)' }

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{emoji}</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{meeting.title}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {meeting.date_label}
            <span style={{ marginLeft: 6, fontSize: 10, background: meeting.source === 'gemini' ? '#E8F0FE' : '#E6F4EE', color: meeting.source === 'gemini' ? '#1A4D8F' : '#1A6B4A', padding: '1px 6px', borderRadius: 10, fontWeight: 500 }}>
              {meeting.source === 'gemini' ? '✦ Gemini' : '● tl;dv'}
            </span>
          </div>
        </div>
        <button onClick={handleCopyMeeting} style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--accent)', background: 'none', border: 'none', padding: '4px 8px', borderRadius: 5, fontWeight: 500, cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-soft)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}>
          Copiar reunião
        </button>
      </div>
      <div style={{ borderRadius: 8, border: '1px solid var(--border)', overflow: 'hidden', background: '#fff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <colgroup>
            <col /><col style={{ width: 110 }} /><col style={{ width: 82 }} />
            <col style={{ width: 115 }} /><col style={{ width: 105 }} /><col style={{ width: 72 }} />
          </colgroup>
          <thead>
            <tr>
              <th style={thStyle}>Tarefa</th>
              <th style={thStyle}>Responsável</th>
              <th style={thStyle}>Data</th>
              <th style={thStyle}>Prazo</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {visibleTasks.map(task => (
              <TaskRow key={task.id} task={task} meeting={meeting} onUpdate={onUpdate} onToast={onToast} />
            ))}
          </tbody>
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

  const showToast = (msg) => setToast(msg)

  // ── Load data ─────────────────────────────────────────────
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

  // ── Realtime subscription ─────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('bmo_tasks_changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bmo_tasks' }, payload => {
        setTasks(prev => prev.map(t => t.id === payload.new.id ? { ...t, ...payload.new } : t))
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bmo_meetings' }, () => loadData())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bmo_tasks' }, () => loadData())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [loadData])

  // ── Optimistic update ─────────────────────────────────────
  const updateTask = useCallback((id, patch) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t))
  }, [])

  // ── Export CSV ────────────────────────────────────────────
  const exportCSV = () => {
    const filtered = meetings.filter(m =>
      clientFilter === 'all' || m.team === clientFilter ||
      (m.has_cliente && tasks.some(t => t.meeting_id === m.id && t.cliente === clientFilter))
    )
    const rows = [['Reunião', 'Data Reunião', 'Equipe', 'Tarefa', 'Responsável', 'Cliente', 'Prazo', 'Status']]
    filtered.forEach(m => {
      tasks.filter(t => t.meeting_id === m.id && (statusFilter === 'all' || t.status === statusFilter)).forEach(t => {
        rows.push([`"${m.title}"`, `"${m.date_label.split('—')[0].trim()}"`, `"${m.team}"`, `"${t.description}"`, `"${t.resp}"`, `"${t.cliente || ''}"`, `"${t.prazo_fixed || t.prazo || ''}"`, `"${STATUS_LABEL[t.status]}"`])
      })
    })
    const csv = '\uFEFF' + rows.map(r => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    a.download = `tarefas_bmo_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    showToast('CSV exportado ✓')
  }

  // ── Stats ─────────────────────────────────────────────────
  const filteredTasks = tasks.filter(t => {
    const m = meetings.find(x => x.id === t.meeting_id)
    if (!m) return false
    const clientOk = clientFilter === 'all' || m.team === clientFilter || (m.has_cliente && t.cliente === clientFilter)
    const statusOk = statusFilter === 'all' || t.status === statusFilter
    return clientOk && statusOk
  })
  const done = filteredTasks.filter(t => t.status === 'concluido').length
  const pending = filteredTasks.filter(t => t.status === 'pendente').length

  // ── Client counts ─────────────────────────────────────────
  const clientCounts = {}
  tasks.forEach(t => {
    const m = meetings.find(x => x.id === t.meeting_id)
    if (!m) return
    clientCounts[m.team] = (clientCounts[m.team] || 0) + 1
    if (m.has_cliente && t.cliente && t.cliente !== 'Não identificado') {
      clientCounts[t.cliente] = (clientCounts[t.cliente] || 0) + 1
    }
  })

  // ── Sync (manual refresh) ─────────────────────────────────
  const handleSync = async () => {
    setSyncing(true)
    await loadData()
    setSyncing(false)
    showToast('Base atualizada ✓')
  }

  // ── Styles ────────────────────────────────────────────────
  const btnBase = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 5, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: '1px solid var(--border-strong)', background: '#fff', color: 'var(--text)', whiteSpace: 'nowrap' }
  const btnPrimary = { ...btnBase, background: 'var(--accent)', color: '#fff', border: 'none' }
  const btnGreen = { ...btnBase, background: '#1A6B4A', color: '#fff', border: 'none' }

  const sidebarClientBtn = (key, color) => ({
    display: 'flex', alignItems: 'center', gap: 8,
    width: '100%', padding: '7px 10px', borderRadius: 5,
    border: 'none', background: clientFilter === key ? 'var(--accent-soft)' : 'transparent',
    cursor: 'pointer', textAlign: 'left', fontSize: 13,
    color: clientFilter === key ? 'var(--accent)' : 'var(--text-muted)',
    fontWeight: clientFilter === key ? 500 : 400,
  })

  const statusPillStyle = (s) => ({
    display: 'flex', alignItems: 'center', gap: 7,
    width: '100%', padding: '6px 10px', borderRadius: 5,
    border: 'none', background: statusFilter === s ? 'var(--bg)' : 'transparent',
    cursor: 'pointer', fontSize: 12,
    color: statusFilter === s ? 'var(--text)' : 'var(--text-muted)',
    fontWeight: statusFilter === s ? 500 : 400,
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* HEADER */}
      <header style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 200 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 28, height: 28, background: 'var(--accent)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Gerenciador de Tarefas — BMO Gestão</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {filteredTasks.length} tarefas · {done} concluídas
              {lastSync && ` · Sync: ${lastSync.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button style={btnGreen} onClick={handleSync} disabled={syncing}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={syncing ? { animation: 'spin 1s linear infinite' } : {}}>
              <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            {syncing ? 'Atualizando...' : 'Atualizar'}
          </button>
          <button style={btnBase} onClick={() => setShowCopy(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copiar
          </button>
          <button style={btnPrimary} onClick={exportCSV}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Exportar CSV
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* SIDEBAR */}
        <aside style={{ width: 'var(--sidebar)', background: '#fff', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', position: 'sticky', top: 57, height: 'calc(100vh - 57px)', overflowY: 'auto', flexShrink: 0 }}>
          {/* Clientes */}
          <div style={{ padding: '16px 12px 8px' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8, padding: '0 4px' }}>Clientes</div>
            <button style={sidebarClientBtn('all', '#9B9890')} onClick={() => setClientFilter('all')}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#9B9890', flexShrink: 0 }} />
              Todos
              <span style={{ marginLeft: 'auto', fontSize: 11, background: 'var(--bg)', border: '1px solid var(--border)', padding: '1px 6px', borderRadius: 10, color: 'var(--text-muted)' }}>{tasks.length}</span>
            </button>
          </div>
          <div style={{ height: 1, background: 'var(--border)', margin: '4px 12px' }} />

          {/* Equipes */}
          <div style={{ padding: '8px 12px' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8, padding: '0 4px' }}>Equipes</div>
            {[{ key: 'Squad Palermo', color: '#5B3FA0' }, { key: 'Gerentes de Contas', color: '#8A4500' }, { key: 'Interno BMO', color: '#5A584F' }].map(({ key, color }) => (
              <button key={key} style={sidebarClientBtn(key, color)} onClick={() => setClientFilter(key)}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                {key}
                <span style={{ marginLeft: 'auto', fontSize: 11, background: clientFilter === key ? 'var(--accent)' : 'var(--bg)', border: `1px solid ${clientFilter === key ? 'var(--accent)' : 'var(--border)'}`, padding: '1px 6px', borderRadius: 10, color: clientFilter === key ? '#fff' : 'var(--text-muted)' }}>{clientCounts[key] || 0}</span>
              </button>
            ))}
          </div>
          <div style={{ height: 1, background: 'var(--border)', margin: '4px 12px' }} />

          {/* Clínicas */}
          <div style={{ padding: '8px 12px' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8, padding: '0 4px' }}>Clínicas</div>
            {ALL_CLIENTS.filter(c => !['Squad Palermo','Gerentes de Contas','Interno BMO'].includes(c.key)).map(({ key, color }) => (
              <button key={key} style={sidebarClientBtn(key, color)} onClick={() => setClientFilter(key)}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                {key}
                <span style={{ marginLeft: 'auto', fontSize: 11, background: clientFilter === key ? 'var(--accent)' : 'var(--bg)', border: `1px solid ${clientFilter === key ? 'var(--accent)' : 'var(--border)'}`, padding: '1px 6px', borderRadius: 10, color: clientFilter === key ? '#fff' : 'var(--text-muted)' }}>{clientCounts[key] || 0}</span>
              </button>
            ))}
          </div>
          <div style={{ height: 1, background: 'var(--border)', margin: '4px 12px' }} />

          {/* Status */}
          <div style={{ padding: '8px 12px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8, padding: '0 4px' }}>Status</div>
            {[['all','📋','Todas'], ['pendente','🔲','Pendente'], ['andamento','🔄','Em andamento'], ['concluido','✅','Concluída'], ['bloqueado','🚫','Bloqueada']].map(([s, icon, label]) => (
              <button key={s} style={statusPillStyle(s)} onClick={() => setStatusFilter(s)}>
                <span style={{ fontSize: 13, width: 16, textAlign: 'center' }}>{icon}</span> {label}
              </button>
            ))}
          </div>
        </aside>

        {/* MAIN */}
        <main style={{ flex: 1, padding: '24px 28px', overflowY: 'auto', minWidth: 0 }}>
          {/* Stats */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 22, flexWrap: 'wrap' }}>
            {[
              { num: filteredTasks.length, lbl: 'tarefas', color: 'var(--text)' },
              { num: done, lbl: 'concluídas', color: '#1A6B4A' },
              { num: pending, lbl: 'pendentes', color: '#8A5A00' },
              { num: meetings.length, lbl: 'reuniões', color: '#5B3FA0' },
            ].map(({ num, lbl, color }) => (
              <div key={lbl} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 8, padding: '14px 18px', minWidth: 100 }}>
                <div style={{ fontSize: 22, fontWeight: 600, color }}>{loading ? '—' : num}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{lbl}</div>
              </div>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)', fontSize: 14 }}>
              <div style={{ fontSize: 32, marginBottom: 12, animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</div>
              <div>Carregando dados do Supabase...</div>
            </div>
          ) : (
            meetings.map(m => (
              <MeetingBlock
                key={m.id}
                meeting={m}
                tasks={tasks.filter(t => t.meeting_id === m.id)}
                clientFilter={clientFilter}
                statusFilter={statusFilter}
                onUpdate={updateTask}
                onToast={showToast}
              />
            ))
          )}
        </main>
      </div>

      {showCopy && (
        <CopyModal
          meetings={meetings} tasks={tasks}
          clientFilter={clientFilter} statusFilter={statusFilter}
          onClose={() => setShowCopy(false)}
          onToast={showToast}
        />
      )}
      {toast && <Toast message={toast} onHide={() => setToast(null)} />}
    </div>
  )
}
