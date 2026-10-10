import React, { useState, useCallback, useEffect, useRef } from 'react'
import { incidentService } from '../services/api.js'
import { useTheme } from '../context/ThemeContext'
import {
  CheckCircle, Clock, RefreshCw, AlertTriangle,
  Activity, FileText, Search, Bell,
  Send, Wrench, User
} from 'lucide-react'

const API_BASE = 'http://localhost:8000'
const LINES = ['PN','Granulateur','Lavage','Sechage','Enrobage','PRODUIT FINI']

function getCurrentRole() {
  return (localStorage.getItem('role') || '').toLowerCase().trim()
}
function getAuthHeader() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
}
const fmtDate = (d) => d
  ? new Date(d).toLocaleString('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })
  : '—'

function getColors(dark) {
  return {
    ocpGreen:   '#1a7a4a',
    ocpGreenLt: dark ? 'rgba(26,122,74,0.15)'  : '#e8f5ee',
    ocpBlue:    '#006DB7',
    ocpBlueLt:  dark ? 'rgba(0,109,183,0.15)'  : '#e8f3fc',
    bg:         dark ? '#0d1b2e' : '#f5f7fa',
    card:       dark ? '#0f2233' : '#ffffff',
    cardAlt:    dark ? '#0a1929' : '#fafbfd',
    border:     dark ? 'rgba(255,255,255,0.07)' : '#e4e9f0',
    text:       dark ? '#f1f5f9' : '#1a2332',
    textMid:    dark ? '#94a3b8' : '#4a5568',
    textSoft:   dark ? '#64748b' : '#8a9bb0',
    orange:     '#f59e0b',
    orangeLt:   dark ? 'rgba(245,158,11,0.12)' : '#fffbeb',
    red:        '#e53e3e',
    redLt:      dark ? 'rgba(229,62,62,0.12)'  : '#fff5f5',
    purple:     '#7c3aed',
    purpleLt:   dark ? 'rgba(124,58,237,0.15)' : '#f5f3ff',
    amber:      '#d97706',
    amberLt:    dark ? 'rgba(217,119,6,0.12)'  : '#fef3c7',
    rowResolu:  dark ? 'rgba(26,122,74,0.08)'  : '#f6fdf9',
    rowHov:     dark ? 'rgba(255,255,255,0.04)': '#f0f7ff',
    thead:      dark ? '#081524' : '#f8fafc',
    inputBg:    dark ? '#0a1929' : '#fafbfd',
    timeBg:     dark ? 'rgba(255,255,255,0.07)': '#f1f5f9',
  }
}

function StatusPill({ status, C }) {
  if (status === 'RESOLU')  return <span style={pill(C.ocpGreen, C.ocpGreenLt, C.ocpGreen+'55')}>✓ Résolu</span>
  if (status === 'NOTIFIE') return <span style={pill(C.purple,   C.purpleLt,   '#c4b5fd')}>🔔 Notifié</span>
  return                           <span style={pill(C.orange,   C.orangeLt,   '#fcd48a')}>● Ouvert</span>
}
function pill(color, bg, border) {
  return { display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:bg, color, border:`1px solid ${border}`, whiteSpace:'nowrap' }
}

function SevBadge({ sev, C }) {
  const crit = sev === 'CRITIQUE'
  return (
    <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:20, fontSize:10, fontWeight:800, letterSpacing:0.8, textTransform:'uppercase', background: crit ? C.redLt : C.orangeLt, color: crit ? C.red : C.amber, border:`1px solid ${crit ? '#fca5a5' : '#fcd48a'}` }}>{sev}</span>
  )
}
function LigneBadge({ ligne, C }) {
  return (
    <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:20, fontSize:10, fontWeight:700, background:C.ocpBlueLt, color:C.ocpBlue, border:'1px solid #bfdbf7' }}>{ligne}</span>
  )
}

function KpiCard({ label, value, icon, color, bg, border, C }) {
  return (
    <div style={{ background:C.card, borderRadius:16, border:`1.5px solid ${border}`, padding:'22px 24px', boxShadow:`0 2px 12px ${border}55`, position:'relative', overflow:'hidden', transition:'background 0.3s' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:color, borderRadius:'16px 16px 0 0' }} />
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
        <div>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:1.2, textTransform:'uppercase', color:C.textSoft, marginBottom:10 }}>{label}</div>
          <div style={{ fontSize:44, fontWeight:800, color, lineHeight:1 }}>{value}</div>
        </div>
        <div style={{ width:42, height:42, borderRadius:12, background:bg, display:'flex', alignItems:'center', justifyContent:'center', color }}>{icon}</div>
      </div>
    </div>
  )
}

function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t) }, [])
  return (
    <div style={{ position:'fixed', bottom:28, right:28, zIndex:1000, background:'#1a2332', color:'#fff', padding:'14px 20px', borderRadius:12, display:'flex', alignItems:'center', gap:10, boxShadow:'0 8px 32px rgba(0,0,0,0.18)', fontSize:13, fontWeight:600 }}>
      <CheckCircle size={16} color="#7dba3a" /> {msg}
    </div>
  )
}

function NotifyModal({ incident, onClose, onSend, C }) {
  const [msg, setMsg]         = useState(`Incident sur ${incident.ligne} — Capteur ${incident.sensor_id}.\nValeur anormale détectée. Intervention requise.`)
  const [urgence, setUrgence] = useState('NORMALE')
  const [loading, setLoading] = useState(false)
  const urgenceColor = (u) => {
    if (u === 'CRITIQUE') return { color:C.red,     bg:C.redLt,     border:'#fca5a5' }
    if (u === 'URGENTE')  return { color:C.amber,   bg:C.amberLt,   border:'#fcd48a' }
    return                       { color:C.ocpBlue, bg:C.ocpBlueLt, border:'#bfdbf7' }
  }
  const handleSend = async () => { setLoading(true); await onSend(msg, urgence); setLoading(false) }
  return (
    <div style={{ position:'fixed', inset:0, zIndex:500, background:'rgba(10,20,40,0.55)', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(3px)' }} onClick={onClose}>
      <div style={{ background:C.card, borderRadius:20, width:480, padding:28, boxShadow:'0 20px 60px rgba(0,0,0,0.3)', border:`1px solid ${C.border}` }} onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:22 }}>
          <div style={{ width:42, height:42, borderRadius:12, background:C.purpleLt, display:'flex', alignItems:'center', justifyContent:'center' }}><Send size={18} color={C.purple} /></div>
          <div>
            <div style={{ fontSize:16, fontWeight:800, color:C.text }}>Notifier le technicien</div>
            <div style={{ fontSize:11, color:C.textSoft, marginTop:2 }}>{incident.sensor_id} · {incident.ligne}</div>
          </div>
        </div>
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:11, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:C.textSoft, display:'block', marginBottom:6 }}>Niveau d'urgence</label>
          <div style={{ display:'flex', gap:8 }}>
            {['NORMALE','URGENTE','CRITIQUE'].map(u => {
              const uc = urgenceColor(u); const active = urgence === u
              return <button key={u} onClick={() => setUrgence(u)} style={{ flex:1, padding:'8px 0', borderRadius:10, cursor:'pointer', fontSize:11, fontWeight:700, border:`1.5px solid ${active ? uc.color : C.border}`, background: active ? uc.bg : C.inputBg, color: active ? uc.color : C.textSoft }}>{u}</button>
            })}
          </div>
        </div>
        <div style={{ marginBottom:22 }}>
          <label style={{ fontSize:11, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:C.textSoft, display:'block', marginBottom:6 }}>Message</label>
          <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={4} style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:`1.5px solid ${C.border}`, fontSize:12, color:C.text, fontFamily:'inherit', resize:'vertical', outline:'none', boxSizing:'border-box', background:C.inputBg, lineHeight:1.6 }} />
        </div>
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button onClick={onClose} style={{ padding:'9px 18px', borderRadius:10, border:`1px solid ${C.border}`, background:C.inputBg, color:C.textMid, fontSize:12, fontWeight:600, cursor:'pointer' }}>Annuler</button>
          <button onClick={handleSend} disabled={loading} style={{ padding:'9px 20px', borderRadius:10, border:'none', cursor:'pointer', background:`linear-gradient(135deg,${C.purple},#9333ea)`, color:'#fff', fontSize:12, fontWeight:700, display:'flex', alignItems:'center', gap:7, opacity:loading?0.7:1 }}>
            <Send size={13} /> {loading ? 'Envoi...' : 'Envoyer la notification'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ResolveModal({ incident, notifData, onClose, onResolve, C }) {
  const [note, setNote]       = useState('')
  const [loading, setLoading] = useState(false)
  const handleResolve = async () => { setLoading(true); await onResolve(note); setLoading(false) }
  return (
    <div style={{ position:'fixed', inset:0, zIndex:500, background:'rgba(10,20,40,0.55)', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(3px)' }} onClick={onClose}>
      <div style={{ background:C.card, borderRadius:20, width:460, padding:28, boxShadow:'0 20px 60px rgba(0,0,0,0.3)', border:`1px solid ${C.border}` }} onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:22 }}>
          <div style={{ width:42, height:42, borderRadius:12, background:C.ocpGreenLt, display:'flex', alignItems:'center', justifyContent:'center' }}><Wrench size={18} color={C.ocpGreen} /></div>
          <div>
            <div style={{ fontSize:16, fontWeight:800, color:C.text }}>Marquer comme résolu</div>
            <div style={{ fontSize:11, color:C.textSoft, marginTop:2 }}>{incident.sensor_id} · {incident.ligne}</div>
          </div>
        </div>
        {notifData && (
          <div style={{ background:C.purpleLt, border:`1px solid #c4b5fd`, borderRadius:10, padding:'10px 14px', marginBottom:18, display:'flex', alignItems:'flex-start', gap:10 }}>
            <span style={{ color:C.purple, fontSize:14, flexShrink:0, marginTop:2 }}>🔔</span>
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:C.purple, marginBottom:3 }}>Notification de l'opérateur · Urgence : <strong>{notifData.urgence}</strong></div>
              <div style={{ fontSize:11, color:C.textMid, lineHeight:1.5 }}>{notifData.message}</div>
            </div>
          </div>
        )}
        <div style={{ marginBottom:22 }}>
          <label style={{ fontSize:11, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:C.textSoft, display:'block', marginBottom:6 }}>Note de résolution</label>
          <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Décrire l'intervention effectuée..." rows={3} style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:`1.5px solid ${C.border}`, fontSize:12, color:C.text, fontFamily:'inherit', resize:'vertical', outline:'none', boxSizing:'border-box', background:C.inputBg, lineHeight:1.6 }} />
        </div>
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button onClick={onClose} style={{ padding:'9px 18px', borderRadius:10, border:`1px solid ${C.border}`, background:C.inputBg, color:C.textMid, fontSize:12, fontWeight:600, cursor:'pointer' }}>Annuler</button>
          <button onClick={handleResolve} disabled={loading} style={{ padding:'9px 20px', borderRadius:10, border:'none', cursor:'pointer', background:`linear-gradient(135deg,${C.ocpBlue},${C.ocpGreen})`, color:'#fff', fontSize:12, fontWeight:700, display:'flex', alignItems:'center', gap:7, opacity:loading?0.7:1 }}>
            ✔ {loading ? 'En cours...' : 'Confirmer résolution'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Journal() {
  const { theme: mode } = useTheme()
  const dark = mode === 'dark'
  const C = getColors(dark)

  const selectStyle = {
    background:C.card, border:`1px solid ${C.border}`, borderRadius:10,
    color:C.text, padding:'8px 32px 8px 12px', fontSize:12, fontWeight:500,
    outline:'none', cursor:'pointer', appearance:'none',
    backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238a9bb0' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
    backgroundRepeat:'no-repeat', backgroundPosition:'right 10px center',
    boxShadow:'0 1px 3px rgba(0,0,0,0.06)',
  }

  const [role, setRole]                   = useState(getCurrentRole)
  const [filterStatus, setFilterStatus]   = useState('')
  const [filterLigne, setFilterLigne]     = useState('')
  const [search, setSearch]               = useState('')
  const [incidents, setIncidents]         = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState(null)
  const [lastUpdate, setLastUpdate]       = useState(null)
  const [notifyTarget, setNotifyTarget]   = useState(null)
  const [resolveTarget, setResolveTarget] = useState(null)
  const [toast, setToast]                 = useState(null)
  const timerRef = useRef(null)

  const isAdmin = role === 'admin'
  const isTech  = role === 'admin' || role === 'technicien'

  useEffect(() => {
    const sync = () => setRole(getCurrentRole())
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  const fetchIncidents = useCallback(async (status, ligne, silent = false) => {
    try {
      if (!silent) setLoading(true)
      const data = await incidentService.list(status || undefined, ligne || undefined)
      setIncidents(Array.isArray(data) ? data : [])
      setLastUpdate(new Date())
      setError(null)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [])

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/notifications/`, { headers: getAuthHeader() })
      if (res.ok) { const data = await res.json(); setNotifications(Array.isArray(data) ? data : []) }
    } catch {}
  }, [])

  useEffect(() => {
    fetchIncidents(filterStatus, filterLigne, true)
    fetchNotifications()
    timerRef.current = setInterval(() => {
      fetchIncidents(filterStatus, filterLigne, true)
      fetchNotifications()
    }, 10000)
    return () => clearInterval(timerRef.current)
  }, [filterStatus, filterLigne])

  const handleNotify = async (msg, urgence) => {
    try {
      const res = await fetch(`${API_BASE}/notifications/`, {
        method:'POST', headers:getAuthHeader(),
        body:JSON.stringify({ incident_id:notifyTarget.id, message:msg, urgence, sender_role:'operateur', receiver_role:'technicien' }),
      })
      setToast(res.ok ? '✓ Notification envoyée au technicien — Urgence : ' + urgence : '❌ Erreur lors de l\'envoi')
      if (res.ok) { fetchIncidents(filterStatus, filterLigne, true); fetchNotifications() }
    } catch { setToast('❌ Erreur réseau') }
    setNotifyTarget(null)
  }

  const handleResolve = async (note) => {
    try {
      const res = await fetch(`${API_BASE}/incidents/${resolveTarget.id}`, {
        method:'PATCH', headers:getAuthHeader(),
        body:JSON.stringify({ status:'RESOLU', action_taken: note || 'Résolu par technicien' }),
      })
      setToast(res.ok ? '✓ Incident résolu — L\'opérateur verra la mise à jour.' : '❌ Erreur lors de la résolution')
      if (res.ok) { fetchIncidents(filterStatus, filterLigne, true); fetchNotifications() }
    } catch { setToast('❌ Erreur réseau') }
    setResolveTarget(null)
  }

  const getNotifForIncident = (id) => notifications.find(n => n.incident_id === id) || null

  const displayed = incidents.filter(i =>
    !search ||
    (i.sensor_id||'').toLowerCase().includes(search.toLowerCase()) ||
    (i.description||'').toLowerCase().includes(search.toLowerCase()) ||
    (i.ligne||'').toLowerCase().includes(search.toLowerCase())
  )

  const ouverts  = incidents.filter(i => i.status === 'OUVERT').length
  const resolus  = incidents.filter(i => i.status === 'RESOLU').length
  const notifies = incidents.filter(i => i.status === 'NOTIFIE').length
  const unread   = notifications.filter(n => n.is_read === 'false' && n.receiver_role === (isTech ? 'technicien' : 'operateur')).length

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:"'DM Sans','Segoe UI',sans-serif", transition:'background 0.3s' }}>

      {/* HEADER */}
      <div style={{ background:C.card, borderBottom:`1px solid ${C.border}`, padding:'16px 32px', display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'0 1px 6px rgba(0,0,0,0.08)', position:'sticky', top:0, zIndex:10, transition:'background 0.3s' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:40, height:40, borderRadius:12, background:`linear-gradient(135deg,${C.ocpBlue},${C.ocpGreen})`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <FileText size={18} color="#fff" />
          </div>
          <div>
            <h1 style={{ margin:0, fontSize:18, fontWeight:800, color:C.text, letterSpacing:'-0.3px' }}>Journal des Incidents</h1>
            <div style={{ fontSize:11, color:C.textSoft, marginTop:1, display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:C.ocpGreen, display:'inline-block' }} />
              OCP Group · Jorf Lasfar
              {lastUpdate && <span>· {lastUpdate.toLocaleTimeString('fr-FR')}</span>}
            </div>
          </div>
        </div>

        <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
          {isTech && unread > 0 && (
            <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:20, background:C.purpleLt, border:`1px solid #c4b5fd`, fontSize:12, fontWeight:700, color:C.purple }}>
              <Bell size={13} /> {unread} nouvelle{unread > 1 ? 's' : ''} notification{unread > 1 ? 's' : ''}
            </div>
          )}
          <div style={{ position:'relative' }}>
            <Search size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:C.textSoft }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
              style={{ ...selectStyle, paddingLeft:30, backgroundImage:'none', width:160 }} />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selectStyle}>
            <option value="">Tous statuts</option>
            <option value="OUVERT">Ouvert</option>
            <option value="NOTIFIE">Notifié</option>
            <option value="RESOLU">Résolu</option>
          </select>
          <select value={filterLigne} onChange={e => setFilterLigne(e.target.value)} style={selectStyle}>
            <option value="">Toutes lignes</option>
            {LINES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <button onClick={() => { fetchIncidents(filterStatus, filterLigne); fetchNotifications() }} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:10, border:`1.5px solid ${C.ocpGreen}`, background:C.ocpGreenLt, color:C.ocpGreen, cursor:'pointer', fontSize:12, fontWeight:700 }}>
            <RefreshCw size={13} /> Rafraîchir
          </button>
        </div>
      </div>

      <div style={{ padding:'28px 32px', maxWidth:1400, margin:'0 auto' }}>

        {/* KPI */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 }}>
          <KpiCard label="Incidents ouverts" value={ouverts}          color={C.orange}   bg={C.orangeLt}   border="#fcd48a" icon={<AlertTriangle size={20}/>} C={C} />
          <KpiCard label="Incidents résolus" value={resolus}          color={C.ocpGreen} bg={C.ocpGreenLt} border="#b3dfc7" icon={<CheckCircle size={20}/>}   C={C} />
          <KpiCard label="Notifiés"          value={notifies}         color={C.purple}   bg={C.purpleLt}   border="#c4b5fd" icon={<Bell size={20}/>}           C={C} />
          <KpiCard label="Total"             value={incidents.length} color={C.ocpBlue}  bg={C.ocpBlueLt}  border="#bfdbf7" icon={<Activity size={20}/>}       C={C} />
        </div>

        {/* Bandeau rôle */}
        <div style={{ display:'flex', alignItems:'center', gap:10, background: isTech ? C.ocpGreenLt : C.ocpBlueLt, border:`1px solid ${isTech ? '#b3dfc7' : '#bfdbf7'}`, borderRadius:12, padding:'10px 18px', marginBottom:20, fontSize:12, fontWeight:600, color: isTech ? C.ocpGreen : C.ocpBlue }}>
          {isTech ? <Wrench size={14} /> : <User size={14} />}
          {isTech ? 'Mode Technicien / Admin — Vous pouvez résoudre les incidents notifiés.' : 'Mode Opérateur — Cliquez sur "Notifier" pour alerter le technicien.'}
        </div>

        {/* Table */}
        <div style={{ background:C.card, borderRadius:16, border:`1px solid ${C.border}`, boxShadow: dark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.05)', overflow:'hidden', transition:'background 0.3s' }}>
          <div style={{ padding:'16px 24px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:3, height:18, borderRadius:2, background:`linear-gradient(180deg,${C.ocpBlue},${C.ocpGreen})` }} />
            <span style={{ fontSize:13, fontWeight:700, color:C.text }}>Historique</span>
            <span style={{ padding:'2px 10px', borderRadius:20, background:C.bg, border:`1px solid ${C.border}`, fontSize:11, fontWeight:700, color:C.textMid }}>
              {displayed.length} incident{displayed.length !== 1 ? 's' : ''}
            </span>
          </div>

          {loading ? (
            <div style={{ textAlign:'center', padding:60, color:C.textSoft }}><div style={{ fontSize:13 }}>Chargement...</div></div>
          ) : error ? (
            <div style={{ textAlign:'center', padding:60 }}><div style={{ fontSize:13, color:C.red }}>Erreur : {error}</div></div>
          ) : displayed.length === 0 ? (
            <div style={{ textAlign:'center', padding:60, color:C.textSoft }}><div style={{ fontSize:13 }}>Aucun incident trouvé</div></div>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:C.thead }}>
                    {['Date','Ligne','Capteur','Sévérité','Description','Statut','Action'].map(h => (
                      <th key={h} style={{ padding:'11px 18px', textAlign:'left', fontSize:10, fontWeight:800, letterSpacing:1.2, textTransform:'uppercase', color:C.textSoft, borderBottom:`1.5px solid ${C.border}`, whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((inc, idx) => {
                    const isResolu   = inc.status === 'RESOLU'
                    const isNotified = inc.status === 'NOTIFIE'
                    const notifData  = getNotifForIncident(inc.id)
                    const rowBg      = isResolu ? C.rowResolu : idx % 2 === 0 ? C.card : C.cardAlt
                    return (
                      <tr key={inc.id}
                        style={{ borderBottom:`1px solid ${C.border}`, background:rowBg, transition:'background 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = C.rowHov }}
                        onMouseLeave={e => { e.currentTarget.style.background = rowBg }}
                      >
                        <td style={{ padding:'12px 18px', fontSize:11, fontFamily:'monospace', color:C.textSoft, whiteSpace:'nowrap' }}>{fmtDate(inc.created_at)}</td>
                        <td style={{ padding:'12px 18px' }}><LigneBadge ligne={inc.ligne} C={C} /></td>
                        <td style={{ padding:'12px 18px' }}>
                          <div style={{ fontWeight:700, fontSize:12, color:C.text }}>{inc.sensor_id}</div>
                          <div style={{ fontSize:10, color:C.textSoft, marginTop:2 }}>{inc.sensor_name}</div>
                        </td>
                        <td style={{ padding:'12px 18px' }}><SevBadge sev={inc.severity} C={C} /></td>
                        <td style={{ padding:'12px 18px', fontSize:11, color:C.textMid, maxWidth:220, lineHeight:1.5 }}>
                          <div>{inc.description}</div>
                          {isNotified && notifData && (
                            <div style={{ marginTop:6, padding:'4px 8px', borderRadius:8, background:C.purpleLt, border:`1px solid #c4b5fd`, fontSize:10, color:C.purple, fontWeight:600 }}>Urgence : {notifData.urgence}</div>
                          )}
                          {isResolu && inc.action_taken && (
                            <div style={{ marginTop:6, padding:'5px 10px', borderRadius:8, background:C.ocpGreenLt, border:`1px solid #b3dfc7`, fontSize:10, color:C.ocpGreen, fontWeight:600 }}>✓ {inc.action_taken}</div>
                          )}
                        </td>
                        <td style={{ padding:'12px 18px' }}><StatusPill status={inc.status} C={C} /></td>
                        <td style={{ padding:'12px 18px' }}>
                          {!isTech && inc.status === 'OUVERT' && (
                            <button onClick={() => setNotifyTarget(inc)} style={{ padding:'6px 14px', fontSize:11, fontWeight:700, borderRadius:8, cursor:'pointer', border:'none', background:`linear-gradient(135deg,${C.purple},#9333ea)`, color:'#fff', display:'flex', alignItems:'center', gap:6, boxShadow:'0 2px 8px rgba(124,58,237,0.25)' }}>✉ Notifier</button>
                          )}
                          {!isTech && inc.status === 'NOTIFIE' && (
                            <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:11, fontWeight:600, color:C.purple, padding:'5px 10px', borderRadius:8, background:C.purpleLt, border:`1px solid #c4b5fd` }}>🔔 Notifié</span>
                          )}
                          {isTech && !isResolu && (
                            <button onClick={() => setResolveTarget(inc)} style={{ padding:'6px 14px', fontSize:11, fontWeight:700, borderRadius:8, cursor:'pointer', border:'none', background:`linear-gradient(135deg,${C.ocpBlue},${C.ocpGreen})`, color:'#fff', display:'flex', alignItems:'center', gap:6, boxShadow:'0 2px 8px rgba(26,122,74,0.25)' }}>✔ Résoudre</button>
                          )}
                          {isResolu && (
                            <span style={{ fontSize:11, color:C.ocpGreen, fontWeight:600 }}>✓ Traité</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {notifyTarget  && <NotifyModal  incident={notifyTarget}  onClose={() => setNotifyTarget(null)}  onSend={handleNotify}  C={C} />}
      {resolveTarget && <ResolveModal incident={resolveTarget} notifData={getNotifForIncident(resolveTarget.id)} onClose={() => setResolveTarget(null)} onResolve={handleResolve} C={C} />}
      {toast         && <Toast msg={toast} onClose={() => setToast(null)} />}
      <style>{`* { box-sizing: border-box; }`}</style>
    </div>
  )
}