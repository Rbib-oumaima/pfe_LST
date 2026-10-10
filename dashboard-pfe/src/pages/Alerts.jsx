import React, { useCallback } from 'react'
import { useRealtime } from '../hooks/useRealtime.js'
import { alertService } from '../services/api.js'
import { AlertTriangle, AlertCircle, RefreshCw, CheckCircle } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

function SectionHeader({ title, right, colors }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:3, height:20, background:'linear-gradient(180deg,#006DB7,#7dba3a)', borderRadius:2 }} />
        <span style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:'uppercase', color:colors.muted }}>{title}</span>
      </div>
      {right}
    </div>
  )
}

export default function Alerts() {
  const { theme: mode } = useTheme()
  const dark = mode === 'dark'

  const colors = {
    bg:        dark ? '#0d1b2e' : '#f0f4f8',
    card:      dark ? '#0f2233' : '#ffffff',
    cardAlt:   dark ? '#0a1929' : '#fafbfc',
    border:    dark ? 'rgba(255,255,255,0.07)' : '#e2e8f0',
    borderHov: dark ? 'rgba(255,255,255,0.12)' : '#f0f9ff',
    text:      dark ? '#f1f5f9' : '#0d1b2e',
    muted:     dark ? '#94a3b8' : '#64748b',
    thead:     dark ? '#081524' : '#f8fafc',
    rowHov:    dark ? 'rgba(255,255,255,0.04)' : '#f0f9ff',
    timeBg:    dark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
    timeColor: dark ? '#94a3b8' : '#64748b',
    ligneBg:   dark ? 'rgba(0,109,183,0.15)' : 'rgba(0,109,183,0.07)',
    ligneBord: dark ? 'rgba(0,109,183,0.3)'  : 'rgba(0,109,183,0.15)',
    divider:   dark ? 'rgba(255,255,255,0.06)' : '#e2e8f0',
  }

  const fetchAlerts = useCallback(() => alertService.getActive(), [])
  const { data, loading, refresh } = useRealtime(fetchAlerts, 5000, 'alerts-active')

  const alerts         = Array.isArray(data) ? data : []
  const critiques      = alerts.filter(a => a.severity === 'CRITIQUE')
  const avertissements = alerts.filter(a => a.severity === 'AVERTISSEMENT')

  const kpiCards = [
    { label:'Critiques', count:critiques.length, color:'#dc2626', border: dark ? 'rgba(220,38,38,0.3)' : '#fecaca', iconBg: dark ? 'rgba(220,38,38,0.12)' : 'rgba(220,38,38,0.08)', icon:<AlertCircle size={22} color="#dc2626" /> },
    { label:'Avertissements', count:avertissements.length, color:'#d97706', border: dark ? 'rgba(217,119,6,0.3)' : '#fde68a', iconBg: dark ? 'rgba(217,119,6,0.12)' : 'rgba(217,119,6,0.08)', icon:<AlertTriangle size={22} color="#d97706" /> },
    { label:'Total alertes', count:alerts.length, color:'#006DB7', border: dark ? 'rgba(0,109,183,0.3)' : '#bfdbfe', iconBg: dark ? 'rgba(0,109,183,0.15)' : 'rgba(0,109,183,0.08)', icon:<AlertTriangle size={22} color="#006DB7" /> },
  ]

  return (
    <div style={{ padding:28, minHeight:'100vh', background:colors.bg, transition:'background 0.3s' }}>

      <div style={{ marginBottom:32, paddingBottom:24, borderBottom:`1px solid ${colors.divider}` }}>
        <div style={{ background:'linear-gradient(135deg, #0d1b2e 0%, #0f2a1a 60%, #1a3a0a 100%)', borderRadius:16, padding:'20px 28px', display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'0 4px 24px rgba(125,186,58,0.12)', border:'1px solid rgba(125,186,58,0.18)', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-40, right:-40, width:160, height:160, borderRadius:'50%', background:'radial-gradient(circle, rgba(125,186,58,0.12) 0%, transparent 70%)', pointerEvents:'none' }} />
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ width:46, height:46, borderRadius:13, background:'rgba(125,186,58,0.15)', border:'1.5px solid rgba(125,186,58,0.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <img src="/logo_ocp.png" alt="OCP" style={{ height:30, objectFit:'contain' }} />
            </div>
            <div>
              <h1 style={{ margin:0, fontSize:20, fontWeight:800, color:'#fff', lineHeight:1.2 }}>Alertes de Production</h1>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)', marginTop:4 }}>OCP Group · Surveillance temps réel · Jorf Lasfar</div>
            </div>
          </div>
          <button onClick={refresh} style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 18px', background:'rgba(125,186,58,0.12)', border:'1px solid rgba(125,186,58,0.3)', borderRadius:10, color:'#7dba3a', fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(125,186,58,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background='rgba(125,186,58,0.12)'}
          >
            <span style={{ display:'inline-flex' }}><RefreshCw size={14} /></span>
            Rafraîchir
          </button>
        </div>
      </div>

      <div style={{ marginBottom:32 }}>
        <SectionHeader title="Résumé" colors={colors} />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
          {kpiCards.map(({ label, count, color, border, iconBg, icon }) => (
            <div key={label} style={{ background:colors.card, border:`1.5px solid ${border}`, borderRadius:14, padding:'20px 24px', display:'flex', alignItems:'center', gap:16, boxShadow: dark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.05)', position:'relative', overflow:'hidden', transition:'background 0.3s' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:color, borderRadius:'14px 14px 0 0' }} />
              <div style={{ width:48, height:48, borderRadius:12, background:iconBg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span style={{ display:'inline-flex' }}>{icon}</span>
              </div>
              <div>
                <div style={{ fontSize:11, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', color:colors.muted, marginBottom:6 }}>{label}</div>
                <div style={{ fontSize:36, fontWeight:800, color, lineHeight:1 }}>{count}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionHeader title={`Alertes actives · ${alerts.length}`} colors={colors} />
        {loading ? (
          <div style={{ textAlign:'center', padding:60, color:colors.muted, background:colors.card, borderRadius:12, border:`1px solid ${colors.border}` }}>Chargement...</div>
        ) : alerts.length === 0 ? (
          <div style={{ textAlign:'center', padding:60, background: dark ? 'rgba(125,186,58,0.06)' : 'rgba(125,186,58,0.04)', borderRadius:12, border:'1px solid rgba(125,186,58,0.2)' }}>
            <span style={{ display:'inline-flex', marginBottom:12 }}><CheckCircle size={36} color="#7dba3a" /></span>
            <div style={{ color:'#7dba3a', fontWeight:700, fontSize:15 }}>Aucune alerte active — Production normale</div>
          </div>
        ) : (
          <div style={{ background:colors.card, border:`1px solid ${colors.border}`, borderRadius:14, overflow:'hidden', boxShadow: dark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.05)', transition:'background 0.3s' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:colors.thead }}>
                  {['Sévérité','Capteur','Ligne','Valeur','Description','Heure'].map(h => (
                    <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:10, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', color:colors.muted, borderBottom:`1px solid ${colors.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {alerts.map((a, i) => {
                  const isCrit = a.severity === 'CRITIQUE'
                  const rowBg  = i % 2 === 0 ? colors.card : colors.cardAlt
                  return (
                    <tr key={a.id ?? i}
                      style={{ borderBottom:`1px solid ${colors.border}`, background:rowBg, transition:'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background=colors.rowHov}
                      onMouseLeave={e => e.currentTarget.style.background=rowBg}
                    >
                      <td style={{ padding:'14px 16px' }}>
                        <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 12px', borderRadius:20, background: isCrit ? 'rgba(220,38,38,0.10)' : 'rgba(217,119,6,0.10)', border:`1px solid ${isCrit ? 'rgba(220,38,38,0.3)' : 'rgba(217,119,6,0.3)'}`, color: isCrit ? '#ef4444' : '#f59e0b', fontSize:11, fontWeight:700 }}>
                          {isCrit ? <span style={{ display:'inline-flex' }}><AlertCircle size={10}/></span> : <span style={{ display:'inline-flex' }}><AlertTriangle size={10}/></span>}
                          {a.severity}
                        </div>
                      </td>
                      <td style={{ padding:'14px 16px' }}>
                        <div style={{ fontWeight:700, fontSize:13, color:colors.text }}>{a.sensor_id}</div>
                        <div style={{ fontSize:11, color:colors.muted, marginTop:2 }}>{a.sensor_name}</div>
                      </td>
                      <td style={{ padding:'14px 16px' }}>
                        <span style={{ fontSize:11, fontWeight:600, color:'#006DB7', background:colors.ligneBg, padding:'3px 10px', borderRadius:20, border:`1px solid ${colors.ligneBord}` }}>{a.ligne}</span>
                      </td>
                      <td style={{ padding:'14px 16px' }}>
                        <span style={{ fontFamily:'monospace', fontWeight:700, fontSize:14, color: isCrit ? '#ef4444' : '#f59e0b' }}>{a.value}</span>
                        <span style={{ fontSize:10, color:colors.muted, marginLeft:4 }}>{a.unit}</span>
                      </td>
                      <td style={{ padding:'14px 16px', color: dark ? '#94a3b8' : '#475569', fontSize:12, maxWidth:240 }}>{a.description}</td>
                      <td style={{ padding:'14px 16px' }}>
                        <span style={{ fontFamily:'monospace', fontSize:12, color:colors.timeColor, background:colors.timeBg, padding:'3px 8px', borderRadius:6 }}>{new Date(a.timestamp).toLocaleTimeString('fr-FR')}</span>
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
  )
}