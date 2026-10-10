import React, { useState, useEffect } from 'react'
import { FileText, Plus, Download, Clock, X, Calendar, Zap, Pencil, Trash2 } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const LIGNES  = ['PN', 'Granulateur', 'Lavage', 'Sechage', 'Enrobage', 'PRODUIT FINI']
const TYPES   = ['Corrective', 'Preventive', 'Urgence']
const CAUSES  = ['Usure mecanique', 'Defaillance electrique', 'Obstruction', 'Erreur humaine', 'Defaut capteur', 'Probleme logiciel', 'Autre']
const RISQUES = ['Faible', 'Moyen', 'Eleve']

function getC(dark) {
  return {
    bg:     dark ? '#0d1b2e' : '#f0f4f8',
    card:   dark ? '#0f2233' : '#ffffff',
    cardAlt:dark ? '#0a1929' : '#fafbfc',
    border: dark ? 'rgba(255,255,255,0.07)' : '#e2e8f0',
    blue:   '#006DB7',
    green:  '#00A651',
    orange: '#f59e0b',
    red:    '#ef4444',
    text:   dark ? '#f1f5f9' : '#0f172a',
    muted:  dark ? '#94a3b8' : '#64748b',
    light:  dark ? '#081524' : '#f8fafc',
    inputBg:dark ? '#0a1929' : '#fff',
    rowHov: dark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
  }
}

const BADGE_MAP = {
  'Corrective': { bg:'#fff7ed', color:'#f59e0b', border:'#fed7aa' },
  'Preventive': { bg:'#f0fdf4', color:'#16a34a', border:'#bbf7d0' },
  'Urgence':    { bg:'#fff1f2', color:'#ef4444', border:'#fecaca' },
  'Brouillon':  { bg:'#f1f5f9', color:'#64748b', border:'#cbd5e1' },
  'Soumis':     { bg:'#eff6ff', color:'#2563eb', border:'#bfdbfe' },
  'Valide':     { bg:'#f0fdf4', color:'#16a34a', border:'#bbf7d0' },
  'Faible':     { bg:'#f0fdf4', color:'#16a34a', border:'#bbf7d0' },
  'Moyen':      { bg:'#fff7ed', color:'#f59e0b', border:'#fed7aa' },
  'Eleve':      { bg:'#fff1f2', color:'#ef4444', border:'#fecaca' },
}

function Badge({ type }) {
  const s = BADGE_MAP[type] || BADGE_MAP['Brouillon']
  return <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:s.bg, color:s.color, border:`1px solid ${s.border}`, whiteSpace:'nowrap' }}>{type}</span>
}

function Label({ children, required, C }) {
  return <div style={{ fontSize:11, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:C.muted, marginBottom:6 }}>{children}{required && <span style={{ color:C.red, marginLeft:2 }}>*</span>}</div>
}

function StatCard({ icon: Icon, label, value, color, C }) {
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:'20px 22px', position:'relative', overflow:'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', transition:'background 0.3s' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:color, borderRadius:'14px 14px 0 0' }} />
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
        <div style={{ width:36, height:36, borderRadius:10, background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Icon size={16} color={color} />
        </div>
        <span style={{ fontSize:11, fontWeight:700, letterSpacing:1.2, textTransform:'uppercase', color:C.muted }}>{label}</span>
      </div>
      <div style={{ fontSize:34, fontWeight:800, color, lineHeight:1 }}>{value}</div>
    </div>
  )
}

function SectionTitle({ color, children }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:18 }}>
      <div style={{ width:3, height:18, background:color, borderRadius:2 }} />
      <span style={{ fontSize:11, fontWeight:800, letterSpacing:1.8, textTransform:'uppercase', color }}>{children}</span>
    </div>
  )
}

function exportPDF(rapport, username) {
  const duree = rapport.heureDebut && rapport.heureFin
    ? (() => { const d = new Date(`2000-01-01T${rapport.heureFin}`) - new Date(`2000-01-01T${rapport.heureDebut}`); const h = Math.floor(d/3600000), m = Math.floor((d%3600000)/60000); return `${h}h ${m}min` })()
    : 'Non renseignee'
  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#0d1b2e;padding:40px}.header{display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #00A651;padding-bottom:20px;margin-bottom:28px}.logo{font-size:26px;font-weight:900;color:#00A651;letter-spacing:2px}.title{font-size:20px;font-weight:800;color:#0d1b2e}.meta{font-size:12px;color:#64748b;margin-top:4px}.ref{font-size:12px;color:#006DB7;font-weight:700}.section{margin-bottom:22px}.section-title{font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#00A651;border-left:3px solid #00A651;padding-left:10px;margin-bottom:12px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.field{background:#f8fafc;border-radius:8px;padding:11px 14px;border:1px solid #e2e8f0}.field-label{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#64748b;margin-bottom:3px}.field-value{font-size:13px;color:#0d1b2e;font-weight:600}.text-block{background:#f8fafc;border-radius:8px;padding:12px 14px;font-size:13px;color:#334155;line-height:1.7;border:1px solid #e2e8f0}.footer{margin-top:36px;padding-top:18px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;font-size:11px;color:#64748b}.sign-name{font-size:13px;font-weight:700;color:#0d1b2e}</style></head><body>
<div class="header"><div><div class="logo">OCP</div><div style="font-size:10px;color:#64748b;letter-spacing:1px;text-transform:uppercase;margin-top:2px">Groupe OCP - Jorf Lasfar</div></div><div style="text-align:right"><div class="title">Rapport d'Intervention</div><div class="meta">Genere le ${new Date().toLocaleDateString('fr-FR')} a ${new Date().toLocaleTimeString('fr-FR')}</div><div class="ref">Ref : RPT-${Date.now().toString().slice(-6)}</div></div></div>
<div class="section"><div class="section-title">Informations Generales</div><div class="grid"><div class="field"><div class="field-label">Technicien</div><div class="field-value">${username}</div></div><div class="field"><div class="field-label">Date</div><div class="field-value">${rapport.date}</div></div><div class="field"><div class="field-label">Ligne</div><div class="field-value">${rapport.ligne}</div></div><div class="field"><div class="field-label">Capteur</div><div class="field-value">${rapport.capteur||'-'}</div></div><div class="field"><div class="field-label">Type</div><div class="field-value">${rapport.type}</div></div><div class="field"><div class="field-label">Duree</div><div class="field-value">${duree}</div></div></div></div>
<div class="section"><div class="section-title">Diagnostic</div><div class="grid" style="margin-bottom:10px"><div class="field"><div class="field-label">Cause</div><div class="field-value">${rapport.cause}</div></div><div class="field"><div class="field-label">Risque residuel</div><div class="field-value">${rapport.risque}</div></div></div><div class="field-label" style="margin-bottom:5px;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#64748b">Probleme constate</div><div class="text-block">${rapport.probleme||'-'}</div></div>
<div class="section"><div class="section-title">Intervention</div><div class="field-label" style="margin-bottom:5px;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#64748b">Actions effectuees</div><div class="text-block" style="margin-bottom:10px">${rapport.actions||'-'}</div><div class="field-label" style="margin-bottom:5px;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#64748b">Pieces remplacees</div><div class="text-block">${rapport.pieces||'Aucune piece remplacee'}</div></div>
<div class="section"><div class="section-title">Recommandations</div><div class="text-block">${rapport.recommandations||'-'}</div></div>
<div class="footer"><div>Document genere automatiquement - OCP Monitoring System</div><div style="text-align:right"><div style="margin-bottom:3px">Technicien responsable</div><div class="sign-name">${username}</div></div></div>
</body></html>`
  const w = window.open('', '_blank'); w.document.write(html); w.document.close(); setTimeout(() => w.print(), 500)
}

const EMPTY_FORM = {
  date: new Date().toISOString().slice(0,10),
  ligne:'', capteur:'', type:'Corrective',
  heureDebut:'', heureFin:'', cause:'',
  probleme:'', actions:'', pieces:'',
  risque:'Moyen', recommandations:'', statut:'Brouillon',
}

export default function RapportIntervention() {
  const { theme: mode } = useTheme()
  const dark = mode === 'dark'
  const C = getC(dark)

  const inputStyle = { width:'100%', padding:'10px 13px', borderRadius:8, border:`1.5px solid ${C.border}`, background:C.inputBg, color:C.text, fontSize:13, outline:'none', boxSizing:'border-box', transition:'border-color 0.2s', fontFamily:'inherit' }
  const selectStyle = { ...inputStyle, cursor:'pointer' }

  const [view, setView]           = useState('list')
  const [rapports, setRapports]   = useState([])
  const [form, setForm]           = useState(EMPTY_FORM)
  const [selected, setSelected]   = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving]       = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [incidents, setIncidents] = useState([])
  const username = localStorage.getItem('username') || 'Technicien'

 useEffect(() => {
  const token = localStorage.getItem('token')

  fetch(`${API}/incidents?status=OUVERT`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(r => r.json())
    .then(d => setIncidents(Array.isArray(d) ? d : []))
    .catch(() => {})

  fetch(`${API}/reports/`)
    .then(r => r.json())
    .then(data => {
      const mapped = data.map(r => ({
        id: r.id,
        incident_id: r.incident_id,
        technicien_id: r.technicien_id,
        date: r.date_intervention?.slice(0, 10),
        ligne: r.ligne,
        capteur: r.capteur || '',
        type: r.type_intervention,
        heureDebut: r.heure_debut || '',
        heureFin: r.heure_fin || '',
        cause: r.cause || '',
        probleme: r.description || '',
        actions: r.action_effectuee || '',
        pieces: r.pieces || '',
        risque: r.risque || 'Moyen',
        recommandations: r.recommandations || '',
        statut: r.statut || 'Soumis',
        createdAt: r.created_at
      }))

      setRapports(mapped)
    })
    .catch(err => console.error("Erreur chargement rapports:", err))
}, [])

  const reloadReports = () => {
  fetch(`${API}/reports/`)
    .then(r => r.json())
    .then(data => {
      const mapped = data.map(r => ({
        id: r.id,
        incident_id: r.incident_id,
        technicien_id: r.technicien_id,
        date: r.date_intervention?.slice(0, 10),
        ligne: r.ligne,
        capteur: r.capteur || '',
        type: r.type_intervention,
        heureDebut: r.heure_debut || '',
        heureFin: r.heure_fin || '',
        cause: r.cause || '',
        probleme: r.description || '',
        actions: r.action_effectuee || '',
        pieces: r.pieces || '',
        risque: r.risque || 'Moyen',
        recommandations: r.recommandations || '',
        statut: r.statut || 'Soumis',
        createdAt: r.created_at
      }))

      setRapports(mapped)
    })
}

  const handleSubmit = async (statut) => {
  setSaving(true)

  const token = localStorage.getItem('token')

  const payload = {
    incident_id: incidents[0]?.id || 1,
    ligne: form.ligne,
    capteur: form.capteur,
    date_intervention: form.date,
    type_intervention: form.type,
    cause: form.cause,
    heure_debut: form.heureDebut,
    heure_fin: form.heureFin,
    description: form.probleme,
    action_effectuee: form.actions,
    pieces: form.pieces,
    recommandations: form.recommandations,
    duree: dureeCalc(form.heureDebut, form.heureFin),
    risque: form.risque,
    statut: statut
  }

  try {
    await fetch(`${API}/reports/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    })

    await reloadReports()

    setSaving(false)
    setView('list')
    setForm(EMPTY_FORM)
    setEditingId(null)

  } catch (err) {
    console.error("Erreur ajout rapport:", err)
    setSaving(false)
  }
}

  const handleEdit = (rapport) => {
    setForm({ date:rapport.date, ligne:rapport.ligne, capteur:rapport.capteur||'', type:rapport.type, heureDebut:rapport.heureDebut||'', heureFin:rapport.heureFin||'', cause:rapport.cause||'', probleme:rapport.probleme||'', actions:rapport.actions||'', pieces:rapport.pieces||'', risque:rapport.risque, recommandations:rapport.recommandations||'', statut:rapport.statut })
    setEditingId(rapport.id); setView('form')
  }

  const handleDelete = async (id) => {
  const token = localStorage.getItem('token')

  await fetch(`${API}/reports/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  await reloadReports()
  setDeleteConfirm(null)

  if (view === 'detail') setView('list')
}
  const dureeCalc = (debut, fin) => {
    if (!debut || !fin) return null
    const d = new Date(`2000-01-01T${fin}`) - new Date(`2000-01-01T${debut}`)
    if (d < 0) return null
    const h = Math.floor(d/3600000), m = Math.floor((d%3600000)/60000)
    return h > 0 ? `${h}h ${m}min` : `${m}min`
  }

  const total    = rapports.length
  const ceMonth  = rapports.filter(r => r.createdAt?.slice(0,7) === new Date().toISOString().slice(0,7)).length
  const urgences = rapports.filter(r => r.type === 'Urgence').length
  const avgDuree = (() => {
    const av = rapports.filter(r => r.heureDebut && r.heureFin)
    if (!av.length) return '-'
    const sum = av.reduce((acc,r) => acc + (new Date(`2000-01-01T${r.heureFin}`) - new Date(`2000-01-01T${r.heureDebut}`)), 0)
    const avg = sum / av.length
    const h = Math.floor(avg/3600000), m = Math.floor((avg%3600000)/60000)
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  })()

  const capteursSuggeres = [...new Set(incidents.filter(i => !form.ligne || i.ligne === form.ligne).map(i => i.sensor_id))]
  const canSubmit = form.ligne && form.probleme && form.actions && form.cause

  return (
    <div style={{ padding:'28px 32px', minHeight:'100vh', background:C.bg, fontFamily:"'Segoe UI', sans-serif", transition:'background 0.3s' }}>

      {/* Modal suppression */}
      {deleteConfirm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:C.card, borderRadius:16, padding:32, width:400, boxShadow:'0 20px 60px rgba(0,0,0,0.3)', textAlign:'center', border:`1px solid ${C.border}` }}>
            <div style={{ width:52, height:52, borderRadius:50, background:'#fff1f2', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}><Trash2 size={22} color={C.red} /></div>
            <div style={{ fontSize:16, fontWeight:800, color:C.text, marginBottom:8 }}>Supprimer ce rapport ?</div>
            <div style={{ fontSize:13, color:C.muted, marginBottom:24 }}>Cette action est irreversible.</div>
            <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ padding:'9px 20px', borderRadius:9, border:`1.5px solid ${C.border}`, background:C.inputBg, color:C.muted, cursor:'pointer', fontSize:13, fontWeight:600 }}>Annuler</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ padding:'9px 20px', borderRadius:9, border:'none', background:C.red, color:'#fff', cursor:'pointer', fontSize:13, fontWeight:700 }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:`linear-gradient(135deg,${C.blue},${C.green})`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 12px rgba(0,109,183,0.25)' }}>
            <FileText size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ margin:0, fontSize:20, fontWeight:800, color:C.text }}>Rapports d'Intervention</h1>
            <div style={{ fontSize:12, color:C.muted, marginTop:2 }}>OCP Jorf Lasfar · {username}</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          {view !== 'list' && (
            <button onClick={() => { setView('list'); setForm(EMPTY_FORM); setEditingId(null) }} style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 16px', borderRadius:9, border:`1.5px solid ${C.border}`, background:C.inputBg, color:C.muted, cursor:'pointer', fontSize:13, fontWeight:600 }}>
              <X size={14} /> Annuler
            </button>
          )}
          {view === 'list' && (
            <button onClick={() => { setForm(EMPTY_FORM); setEditingId(null); setView('form') }} style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 20px', borderRadius:9, border:'none', background:`linear-gradient(135deg,${C.blue},${C.green})`, color:'#fff', cursor:'pointer', fontSize:13, fontWeight:700, boxShadow:'0 3px 10px rgba(0,109,183,0.3)' }}>
              <Plus size={15} /> Nouveau rapport
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 }}>
        <StatCard icon={FileText} label="Rapports totaux" value={total}    color={C.blue}   C={C} />
        <StatCard icon={Calendar} label="Ce mois"         value={ceMonth}  color={C.green}  C={C} />
        <StatCard icon={Zap}      label="Urgences"        value={urgences} color={C.red}    C={C} />
        <StatCard icon={Clock}    label="Duree moyenne"   value={avgDuree} color={C.orange} C={C} />
      </div>

      {/* Formulaire */}
      {view === 'form' && (
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,0.08)', transition:'background 0.3s' }}>
          <div style={{ padding:'18px 28px', borderBottom:`1px solid ${C.border}`, background:C.light, display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:3, height:20, background:`linear-gradient(180deg,${C.blue},${C.green})`, borderRadius:2 }} />
            <span style={{ fontSize:14, fontWeight:700, color:C.text }}>{editingId ? 'Modifier le rapport' : "Nouveau rapport d'intervention"}</span>
            {editingId && <span style={{ padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:'#fff7ed', color:'#f59e0b', border:'1px solid #fed7aa' }}>Mode edition</span>}
          </div>
          <div style={{ padding:28 }}>
            <div style={{ marginBottom:28, padding:20, background:C.light, borderRadius:12, border:`1px solid ${C.border}` }}>
              <SectionTitle color={C.green}>Informations Generales</SectionTitle>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 }}>
                <div><Label required C={C}>Date</Label><input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date:e.target.value }))} style={inputStyle} /></div>
                <div><Label required C={C}>Type d'intervention</Label><select value={form.type} onChange={e => setForm(f => ({ ...f, type:e.target.value }))} style={selectStyle}>{TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
                <div><Label required C={C}>Risque residuel</Label><select value={form.risque} onChange={e => setForm(f => ({ ...f, risque:e.target.value }))} style={selectStyle}>{RISQUES.map(r => <option key={r}>{r}</option>)}</select></div>
                <div><Label required C={C}>Ligne</Label><select value={form.ligne} onChange={e => setForm(f => ({ ...f, ligne:e.target.value, capteur:'' }))} style={selectStyle}><option value="">-- Selectionner --</option>{LIGNES.map(l => <option key={l}>{l}</option>)}</select></div>
                <div>
                  <Label C={C}>Capteur concerne</Label>
                  <input list="capteurs-list" value={form.capteur} onChange={e => setForm(f => ({ ...f, capteur:e.target.value }))} placeholder="Ex: TI-027" style={inputStyle} />
                  <datalist id="capteurs-list">{capteursSuggeres.map(c => <option key={c} value={c} />)}</datalist>
                </div>
                <div><Label required C={C}>Cause identifiee</Label><select value={form.cause} onChange={e => setForm(f => ({ ...f, cause:e.target.value }))} style={selectStyle}><option value="">-- Selectionner --</option>{CAUSES.map(c => <option key={c}>{c}</option>)}</select></div>
                <div><Label C={C}>Heure debut</Label><input type="time" value={form.heureDebut} onChange={e => setForm(f => ({ ...f, heureDebut:e.target.value }))} style={inputStyle} /></div>
                <div><Label C={C}>Heure fin</Label><input type="time" value={form.heureFin} onChange={e => setForm(f => ({ ...f, heureFin:e.target.value }))} style={inputStyle} /></div>
                <div style={{ display:'flex', alignItems:'flex-end' }}>
                  {dureeCalc(form.heureDebut, form.heureFin) && (
                    <div style={{ width:'100%', padding:'10px 14px', borderRadius:8, background: dark ? 'rgba(0,166,81,0.15)' : '#f0fdf4', border:'1.5px solid #bbf7d0', color:C.green, fontSize:15, fontWeight:800 }}>
                      {dureeCalc(form.heureDebut, form.heureFin)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ marginBottom:28, padding:20, background:C.light, borderRadius:12, border:`1px solid ${C.border}` }}>
              <SectionTitle color={C.orange}>Diagnostic</SectionTitle>
              <Label required C={C}>Probleme constate</Label>
              <textarea value={form.probleme} onChange={e => setForm(f => ({ ...f, probleme:e.target.value }))} placeholder="Decrivez le probleme observe..." rows={3} style={{ ...inputStyle, resize:'vertical', lineHeight:1.6 }} />
            </div>

            <div style={{ marginBottom:28, padding:20, background:C.light, borderRadius:12, border:`1px solid ${C.border}` }}>
              <SectionTitle color={C.blue}>Intervention</SectionTitle>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <div><Label required C={C}>Actions effectuees</Label><textarea value={form.actions} onChange={e => setForm(f => ({ ...f, actions:e.target.value }))} placeholder="Decrivez les actions realisees..." rows={4} style={{ ...inputStyle, resize:'vertical', lineHeight:1.6 }} /></div>
                <div><Label C={C}>Pieces remplacees</Label><textarea value={form.pieces} onChange={e => setForm(f => ({ ...f, pieces:e.target.value }))} placeholder="Ex: Joint torique x2..." rows={4} style={{ ...inputStyle, resize:'vertical', lineHeight:1.6 }} /></div>
              </div>
            </div>

            <div style={{ marginBottom:24, padding:20, background:C.light, borderRadius:12, border:`1px solid ${C.border}` }}>
              <SectionTitle color={C.green}>Recommandations</SectionTitle>
              <textarea value={form.recommandations} onChange={e => setForm(f => ({ ...f, recommandations:e.target.value }))} placeholder="Actions preventives recommandees..." rows={3} style={{ ...inputStyle, resize:'vertical', lineHeight:1.6 }} />
            </div>

            <div style={{ display:'flex', gap:12, justifyContent:'flex-end', paddingTop:20, borderTop:`1px solid ${C.border}` }}>
              <button onClick={() => handleSubmit('Brouillon')} disabled={saving} style={{ padding:'10px 22px', borderRadius:9, border:`1.5px solid ${C.border}`, background:C.inputBg, color:C.muted, cursor:'pointer', fontSize:13, fontWeight:600 }}>Sauvegarder brouillon</button>
              <button onClick={() => handleSubmit('Soumis')} disabled={saving || !canSubmit} style={{ padding:'10px 26px', borderRadius:9, border:'none', background:canSubmit && !saving ? `linear-gradient(135deg,${C.blue},${C.green})` : '#cbd5e1', color:'#fff', cursor:canSubmit ? 'pointer' : 'not-allowed', fontSize:13, fontWeight:700 }}>
                {saving ? 'Enregistrement...' : editingId ? 'Enregistrer les modifications' : 'Soumettre le rapport'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail */}
      {view === 'detail' && selected && (
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,0.08)', transition:'background 0.3s' }}>
          <div style={{ padding:'18px 28px', borderBottom:`1px solid ${C.border}`, background:C.light, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:3, height:20, background:`linear-gradient(180deg,${C.blue},${C.green})`, borderRadius:2 }} />
              <span style={{ fontSize:14, fontWeight:700, color:C.text }}>Detail du rapport</span>
              <Badge type={selected.type} /><Badge type={selected.statut} />
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => handleEdit(selected)} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 16px', borderRadius:9, border:`1.5px solid ${C.border}`, background:C.inputBg, color:C.blue, cursor:'pointer', fontSize:13, fontWeight:700 }}><Pencil size={14} /> Modifier</button>
              <button onClick={() => setDeleteConfirm(selected.id)} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 16px', borderRadius:9, border:'none', background:'#fff1f2', color:C.red, cursor:'pointer', fontSize:13, fontWeight:700 }}><Trash2 size={14} /> Supprimer</button>
              <button onClick={() => exportPDF(selected, username)} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 16px', borderRadius:9, border:'none', background:`linear-gradient(135deg,${C.blue},${C.green})`, color:'#fff', cursor:'pointer', fontSize:13, fontWeight:700 }}><Download size={14} /> Exporter PDF</button>
            </div>
          </div>
          <div style={{ padding:28 }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:24 }}>
              {[['Date',selected.date],['Ligne',selected.ligne],['Capteur',selected.capteur||'-'],['Type',selected.type],['Cause',selected.cause],['Risque',selected.risque],['Heure debut',selected.heureDebut||'-'],['Heure fin',selected.heureFin||'-'],['Duree',dureeCalc(selected.heureDebut,selected.heureFin)||'-']].map(([l,v]) => (
                <div key={l} style={{ background:C.light, borderRadius:10, padding:'12px 16px', border:`1px solid ${C.border}` }}>
                  <div style={{ fontSize:10, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:C.muted, marginBottom:4 }}>{l}</div>
                  <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{v}</div>
                </div>
              ))}
            </div>
            {[['Probleme constate',selected.probleme],['Actions effectuees',selected.actions],['Pieces remplacees',selected.pieces||'Aucune'],['Recommandations',selected.recommandations||'-']].map(([l,v]) => (
              <div key={l} style={{ marginBottom:14 }}>
                <div style={{ fontSize:11, fontWeight:700, letterSpacing:1, textTransform:'uppercase', color:C.muted, marginBottom:6 }}>{l}</div>
                <div style={{ background:C.light, borderRadius:10, padding:'13px 16px', border:`1px solid ${C.border}`, fontSize:13, color:C.text, lineHeight:1.7 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Liste */}
      {view === 'list' && (
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
            <div style={{ width:3, height:18, background:`linear-gradient(180deg,${C.blue},${C.green})`, borderRadius:2 }} />
            <span style={{ fontSize:11, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', color:C.muted }}>Mes rapports · {rapports.length}</span>
          </div>
          {rapports.length === 0 ? (
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:60, textAlign:'center' }}>
              <div style={{ width:56, height:56, borderRadius:16, background:C.light, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}><FileText size={24} color={C.muted} /></div>
              <div style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:6 }}>Aucun rapport cree</div>
              <div style={{ fontSize:13, color:C.muted }}>Cliquez sur "Nouveau rapport" pour commencer</div>
            </div>
          ) : (
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, overflow:'hidden', transition:'background 0.3s' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:C.light }}>
                    {['Date','Ligne','Capteur','Type','Duree','Risque','Statut','Actions'].map(h => (
                      <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:10, fontWeight:700, letterSpacing:1.2, textTransform:'uppercase', color:C.muted, borderBottom:`1px solid ${C.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rapports.map((r,i) => (
                    <tr key={r.id}
                      style={{ borderBottom:`1px solid ${C.border}`, background: i%2===0 ? C.card : C.cardAlt, transition:'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background=C.rowHov}
                      onMouseLeave={e => e.currentTarget.style.background= i%2===0 ? C.card : C.cardAlt}
                    >
                      <td style={{ padding:'13px 16px', fontSize:12, fontFamily:'monospace', color:C.muted }}>{r.date}</td>
                      <td style={{ padding:'13px 16px' }}><span style={{ padding:'3px 10px', borderRadius:12, fontSize:11, fontWeight:600, background: dark ? 'rgba(0,109,183,0.15)' : '#eff6ff', color:C.blue, border:'1px solid #bfdbfe' }}>{r.ligne}</span></td>
                      <td style={{ padding:'13px 16px', fontSize:12, color:C.text, fontWeight:600 }}>{r.capteur||'-'}</td>
                      <td style={{ padding:'13px 16px' }}><Badge type={r.type} /></td>
                      <td style={{ padding:'13px 16px', fontSize:12, color:C.muted }}>{dureeCalc(r.heureDebut,r.heureFin)||'-'}</td>
                      <td style={{ padding:'13px 16px' }}><Badge type={r.risque} /></td>
                      <td style={{ padding:'13px 16px' }}><Badge type={r.statut} /></td>
                      <td style={{ padding:'13px 16px' }}>
                        <div style={{ display:'flex', gap:6 }}>
                          <button onClick={() => { setSelected(r); setView('detail') }} style={{ padding:'5px 12px', fontSize:11, fontWeight:600, borderRadius:7, background: dark ? 'rgba(0,109,183,0.15)' : '#eff6ff', color:C.blue, border:'1px solid #bfdbfe', cursor:'pointer' }}>Voir</button>
                          <button onClick={() => handleEdit(r)} style={{ padding:'5px 8px', borderRadius:7, background:'#fff7ed', color:'#f59e0b', border:'1px solid #fed7aa', cursor:'pointer', display:'flex', alignItems:'center' }}><Pencil size={12} /></button>
                          <button onClick={() => exportPDF(r, username)} style={{ padding:'5px 8px', borderRadius:7, background:'#f0fdf4', color:C.green, border:'1px solid #bbf7d0', cursor:'pointer', display:'flex', alignItems:'center' }}><Download size={12} /></button>
                          <button onClick={() => setDeleteConfirm(r.id)} style={{ padding:'5px 8px', borderRadius:7, background:'#fff1f2', color:C.red, border:'1px solid #fecaca', cursor:'pointer', display:'flex', alignItems:'center' }}><Trash2 size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}