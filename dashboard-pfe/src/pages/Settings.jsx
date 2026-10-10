import React, { useState, useEffect } from 'react'
import { thresholdService } from '../services/api.js'
import { Save, Plus, ChevronDown, Settings2, Activity } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

/* ── Valeurs DB (sans accents) ↔ Labels affichés (avec accents) ── */
const LINES_MAP = [
  { value: 'PN',           label: 'PN'           },
  { value: 'Granulateur',  label: 'Granulateur'  },
  { value: 'Lavage',       label: 'Lavage'       },
  { value: 'Sechage',      label: 'Séchage'      },
  { value: 'Enrobage',     label: 'Enrobage'     },
  { value: 'PRODUIT FINI', label: 'PRODUIT FINI' },
]

/* Map value→label pour affichage */
const valueToLabel = Object.fromEntries(LINES_MAP.map(l => [l.value, l.label]))
/* Map label→value pour filtre pills */
const labelToValue = Object.fromEntries(LINES_MAP.map(l => [l.label, l.value]))

function getLineColors(dark) {
  return {
    'PN':           { bg: dark ? 'rgba(0,109,183,0.18)'  : '#e8f4fd', color: '#3fa9f5', border: dark ? 'rgba(0,109,183,0.35)' : '#b3d9f5' },
    'Granulateur':  { bg: dark ? 'rgba(217,119,6,0.18)'   : '#fef3e2', color: '#f0a93a', border: dark ? 'rgba(217,119,6,0.35)' : '#fcd48a' },
    'Lavage':       { bg: dark ? 'rgba(5,150,105,0.18)'   : '#e8fdf4', color: '#34d399', border: dark ? 'rgba(5,150,105,0.35)' : '#6ee7b7' },
    'Sechage':      { bg: dark ? 'rgba(147,51,234,0.18)'  : '#fdf2f8', color: '#c084fc', border: dark ? 'rgba(147,51,234,0.35)': '#e9d5ff' },
    'Enrobage':     { bg: dark ? 'rgba(225,29,72,0.18)'   : '#fff1f2', color: '#fb7185', border: dark ? 'rgba(225,29,72,0.35)' : '#fda4af' },
    'PRODUIT FINI': { bg: dark ? 'rgba(22,163,74,0.18)'   : '#f0fdf4', color: '#4ade80', border: dark ? 'rgba(22,163,74,0.35)' : '#86efac' },
  }
}

function getC(dark) {
  return {
    bg:        dark ? '#0d1b2e' : '#f8fafc',
    card:      dark ? '#0f2233' : '#ffffff',
    border:    dark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
    text:      dark ? '#f1f5f9' : '#0f172a',
    textMid:   dark ? '#cbd5e1' : '#334155',
    muted:     dark ? '#94a3b8' : '#64748b',
    inputBg:   dark ? '#0a1929' : '#f8fafc',
    thead:     dark ? '#081524' : '#f8fafc',
    rowHov:    dark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
    pillBg:    dark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
    pillActiveBg: dark ? '#f1f5f9' : '#0f172a',
    pillActiveColor: dark ? '#0f172a' : '#fff',
    chipBg:    dark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
    dash:      dark ? '#475569' : '#cbd5e1',
    minBg:     dark ? 'rgba(217,119,6,0.18)' : '#fef3e2',
    minColor:  dark ? '#f0a93a' : '#d97706',
    maxBg:     dark ? 'rgba(225,29,72,0.18)' : '#fff1f2',
    maxColor:  dark ? '#fb7185' : '#e11d48',
    errBg:     dark ? 'rgba(225,29,72,0.12)' : '#fff1f2',
    errBorder: dark ? 'rgba(225,29,72,0.35)' : '#fda4af',
    errColor:  dark ? '#fb7185' : '#e11d48',
  }
}

/* ── SVG Icons pures (pas de lucide pour éviter bugs) ── */
function TrashIcon({ size = 14, color = '#ffffff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ display: 'block', pointerEvents: 'none' }}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" /><path d="M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  )
}

function WarnIcon({ size = 24, color = '#e11d48' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ display: 'block', pointerEvents: 'none' }}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function ConfirmDialog({ onConfirm, onCancel, C }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: C.card, borderRadius: 16, padding: '28px 32px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
        maxWidth: 360, width: '90%', textAlign: 'center',
        border: `1px solid ${C.border}`,
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: C.errBg, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <WarnIcon size={24} color={C.errColor} />
        </div>
        <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 800, color: C.text }}>
          Supprimer ce seuil ?
        </h3>
        <p style={{ margin: '0 0 24px', fontSize: 13, color: C.muted }}>
          Cette action est irréversible.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={onCancel} style={{
            padding: '9px 20px', borderRadius: 10, border: `1.5px solid ${C.border}`,
            background: C.inputBg, color: C.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>Annuler</button>
          <button onClick={onConfirm} style={{
            padding: '9px 20px', borderRadius: 10, border: 'none',
            background: '#ef4444', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(239,68,68,0.35)',
          }}>Supprimer</button>
        </div>
      </div>
    </div>
  )
}

export default function Settings() {
  const { theme: mode } = useTheme()
  const dark = mode === 'dark'
  const C = getC(dark)
  const LINE_COLORS = getLineColors(dark)

  const [thresholds, setThresholds] = useState([])
  const [form, setForm]             = useState({ sensor_id: '', sensor_name: '', ligne: 'PN', min_value: '', max_value: '', unit: '' })
  const [saved, setSaved]           = useState(false)
  const [saving, setSaving]         = useState(false)
  const [filterLine, setFilterLine] = useState('Toutes')
  const [deletingId, setDeletingId] = useState(null)
  const [confirmId, setConfirmId]   = useState(null)
  const [error, setError]           = useState(null)

  const loadThresholds = async () => {
    try {
      const data = await thresholdService.list()
      setThresholds(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('Erreur chargement seuils :', e)
      setThresholds([])
    }
  }

  useEffect(() => { loadThresholds() }, [])

  /* ── Ajout ── */
  const handleSubmit = async () => {
    if (!form.sensor_id || !form.sensor_name) return
    setSaving(true)
    setError(null)
    try {
      await thresholdService.create({
        ...form,
        min_value: form.min_value !== '' ? parseFloat(form.min_value) : null,
        max_value: form.max_value !== '' ? parseFloat(form.max_value) : null,
      })
      await loadThresholds()
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      setForm({ sensor_id: '', sensor_name: '', ligne: 'PN', min_value: '', max_value: '', unit: '' })
    } catch (e) {
      console.error('Erreur création :', e)
      setError("Impossible d'enregistrer le seuil.")
    } finally {
      setSaving(false)
    }
  }

  const requestDelete = (id) => {
    if (id == null) { console.error('ID manquant'); return }
    setConfirmId(id)
  }

  const confirmDelete = async () => {
    const id = confirmId
    setConfirmId(null)
    setDeletingId(id)
    setError(null)
    try {
      await thresholdService.delete(id)
      setThresholds(prev => prev.filter(t => (t.id ?? t._id) !== id))
      await loadThresholds()
    } catch (e) {
      console.error('Erreur suppression :', e)
      setError(`Impossible de supprimer le seuil (id: ${id}).`)
      await loadThresholds()
    } finally {
      setDeletingId(null)
    }
  }

  /* ── Filter: compare la valeur DB directement ── */
  const filtered  = filterLine === 'Toutes'
    ? thresholds
    : thresholds.filter(t => t.ligne === labelToValue[filterLine] || t.ligne === filterLine)

  /* ── Count: cherche la valeur DB ET le label ── */
  const lineCount = (label) => {
    const val = labelToValue[label] || label
    return thresholds.filter(t => t.ligne === val || t.ligne === label).length
  }

  const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: 10,
    border: `1.5px solid ${C.border}`, fontSize: 13, color: C.text,
    background: C.inputBg, outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{ padding: '28px 32px', minHeight: '100vh', background: C.bg, transition: 'background 0.3s' }}>

      {confirmId != null && (
        <ConfirmDialog onConfirm={confirmDelete} onCancel={() => setConfirmId(null)} C={C} />
      )}

      {error && (
        <div style={{
          marginBottom: 16, padding: '12px 16px', borderRadius: 10,
          background: C.errBg, border: `1px solid ${C.errBorder}`,
          color: C.errColor, fontSize: 13, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ display: 'inline-flex' }}><WarnIcon size={15} color={C.errColor} /></span>
          {error}
          <button onClick={() => setError(null)} style={{
            marginLeft: 'auto', background: 'none', border: 'none',
            cursor: 'pointer', color: C.errColor, fontSize: 16, lineHeight: 1,
          }}>×</button>
        </div>
      )}

      {/* ── Header ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, #006DB7, #00A651)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,109,183,0.3)',
          }}>
            <span style={{ display: 'inline-flex' }}><Settings2 size={20} color="#fff" /></span>
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0 }}>
              Seuils d'alerte
            </h1>
            <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
              Configuration des limites de surveillance des capteurs
            </p>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'TOTAL SEUILS',   value: thresholds.length,                                                         color: '#3fa9f5' },
          { label: 'LIGNES ACTIVES', value: [...new Set(thresholds.map(t => t.ligne))].length,                         color: '#34d399' },
          { label: 'AVEC MIN & MAX', value: thresholds.filter(t => t.min_value != null && t.max_value != null).length, color: '#f0a93a' },
          { label: 'PRODUIT FINI',   value: lineCount('PRODUIT FINI'),                                                 color: '#c084fc' },
        ].map((s, i) => (
          <div key={i} style={{
            background: C.card, borderRadius: 14, padding: '16px 18px',
            border: `1px solid ${C.border}`, boxShadow: dark ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.05)',
            transition: 'background 0.3s',
          }}>
            <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {s.label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── Form ── */}
      <div style={{
        background: C.card, borderRadius: 16, padding: 24,
        border: `1px solid ${C.border}`, boxShadow: dark ? '0 1px 8px rgba(0,0,0,0.3)' : '0 1px 8px rgba(0,0,0,0.06)',
        marginBottom: 24, transition: 'background 0.3s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <span style={{ display: 'inline-flex' }}><Plus size={16} color="#3fa9f5" /></span>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Ajouter un seuil</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 14 }}>
          {[
            { key: 'sensor_id',   label: 'ID Capteur',  placeholder: 'ex: TI-027',       type: 'text' },
            { key: 'sensor_name', label: 'Nom capteur', placeholder: 'ex: Temp Bouille',  type: 'text' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {f.label}
              </label>
              <input
                value={form[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#006DB7'}
                onBlur={e => e.target.style.borderColor = C.border}
              />
            </div>
          ))}

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Ligne
            </label>
            <div style={{ position: 'relative' }}>
              <select
                value={form.ligne}
                onChange={e => setForm(p => ({ ...p, ligne: e.target.value }))}
                style={{ ...inputStyle, padding: '9px 32px 9px 12px', appearance: 'none', cursor: 'pointer' }}
              >
                {LINES_MAP.map(l => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
              <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'inline-flex' }}>
                <ChevronDown size={14} color={C.muted} />
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {[
            { key: 'min_value', label: 'Seuil minimum', placeholder: 'Optionnel', type: 'number' },
            { key: 'max_value', label: 'Seuil maximum', placeholder: 'Optionnel', type: 'number' },
            { key: 'unit',      label: 'Unité',         placeholder: 'ex: °C',    type: 'text'   },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 11, fontWeight: 600, color: C.muted, display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {f.label}
              </label>
              <input
                type={f.type}
                value={form[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#006DB7'}
                onBlur={e => e.target.style.borderColor = C.border}
              />
            </div>
          ))}
        </div>

        <div style={{ marginTop: 18 }}>
          <button
            onClick={handleSubmit}
            disabled={saving || !form.sensor_id || !form.sensor_name}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 22px', borderRadius: 10, border: 'none',
              background: saved ? '#00A651' : 'linear-gradient(135deg, #006DB7, #0088e0)',
              color: '#fff', fontSize: 13, fontWeight: 700,
              cursor: (saving || !form.sensor_id || !form.sensor_name) ? 'not-allowed' : 'pointer',
              opacity: (!form.sensor_id || !form.sensor_name) ? 0.6 : 1,
              transition: 'all 0.3s',
              boxShadow: '0 4px 12px rgba(0,109,183,0.3)',
            }}
          >
            <span style={{ display: 'inline-flex' }}><Save size={14} /></span>
            {saved ? '✓ Enregistré !' : saving ? 'Enregistrement...' : 'Enregistrer le seuil'}
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{
        background: C.card, borderRadius: 16,
        border: `1px solid ${C.border}`, boxShadow: dark ? '0 1px 8px rgba(0,0,0,0.3)' : '0 1px 8px rgba(0,0,0,0.06)',
        overflow: 'hidden', transition: 'background 0.3s',
      }}>
        <div style={{
          padding: '16px 20px', borderBottom: `1px solid ${C.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'inline-flex' }}><Activity size={15} color="#3fa9f5" /></span>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Seuils configurés</span>
            <span style={{
              padding: '2px 9px', borderRadius: 20,
              background: dark ? 'rgba(0,109,183,0.18)' : '#e8f4fd', color: dark ? '#3fa9f5' : '#006DB7',
              fontSize: 11, fontWeight: 700,
            }}>{filtered.length}</span>
          </div>

          {/* Filter pills — affiche le label (Séchage) mais compare la valeur DB */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['Toutes', ...LINES_MAP.map(l => l.label)].map(label => {
              const active = filterLine === label
              const lc = LINE_COLORS[labelToValue[label]]
              return (
                <button
                  key={label}
                  onClick={() => setFilterLine(label)}
                  style={{
                    padding: '4px 11px', borderRadius: 20, border: 'none',
                    fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    background: active
                      ? (label === 'Toutes' ? C.pillActiveBg : (lc?.bg || C.pillBg))
                      : C.pillBg,
                    color: active
                      ? (label === 'Toutes' ? C.pillActiveColor : (lc?.color || C.muted))
                      : C.muted,
                    transition: 'all 0.15s',
                  }}
                >
                  {label === 'Toutes' ? `Toutes (${thresholds.length})` : `${label} (${lineCount(label)})`}
                </button>
              )
            })}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: C.muted }}>
            <span style={{ display: 'inline-flex', marginBottom: 12, opacity: 0.4 }}>
              <WarnIcon size={32} color={C.muted} />
            </span>
            <div style={{ fontSize: 13 }}>Aucun seuil configuré</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.thead }}>
                  {['ID Capteur', 'Nom', 'Ligne', 'Min', 'Max', 'Unité', ''].map((h, i) => (
                    <th key={i} style={{
                      padding: '10px 16px', textAlign: 'left',
                      fontSize: 10, fontWeight: 700, color: C.muted,
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                      borderBottom: `1px solid ${C.border}`,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const rowId      = t.id ?? t._id
                  const lc         = LINE_COLORS[t.ligne] || { bg: C.chipBg, color: C.muted, border: C.border }
                  const isDeleting = deletingId === rowId
                  /* Affiche le label avec accent si dispo */
                  const ligneLabel = valueToLabel[t.ligne] || t.ligne

                  return (
                    <tr
                      key={rowId ?? t.sensor_id}
                      style={{ borderBottom: `1px solid ${C.border}`, transition: 'background 0.15s', opacity: isDeleting ? 0.4 : 1 }}
                      onMouseEnter={e => e.currentTarget.style.background = C.rowHov}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          fontFamily: 'monospace', fontWeight: 700, fontSize: 12,
                          color: C.text, background: C.chipBg,
                          padding: '3px 8px', borderRadius: 6,
                        }}>{t.sensor_id}</span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: C.textMid, fontWeight: 500 }}>
                        {t.sensor_name}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 20,
                          background: lc.bg, color: lc.color,
                          border: `1px solid ${lc.border}`,
                          fontSize: 11, fontWeight: 700,
                        }}>{ligneLabel}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {t.min_value != null
                          ? <span style={{ fontSize: 13, fontWeight: 700, color: C.minColor, background: C.minBg, padding: '3px 8px', borderRadius: 6 }}>{t.min_value}</span>
                          : <span style={{ color: C.dash, fontSize: 13 }}>—</span>}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {t.max_value != null
                          ? <span style={{ fontSize: 13, fontWeight: 700, color: C.maxColor, background: C.maxBg, padding: '3px 8px', borderRadius: 6 }}>{t.max_value}</span>
                          : <span style={{ color: C.dash, fontSize: 13 }}>—</span>}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: C.muted, fontWeight: 500 }}>
                        {t.unit || '—'}
                      </td>
                      <td style={{ padding: '12px 16px', width: 56 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <button
                            onClick={() => requestDelete(rowId)}
                            disabled={isDeleting || rowId == null}
                            title={rowId == null ? 'ID manquant' : 'Supprimer ce seuil'}
                            style={{
                              width: 34, height: 34, borderRadius: 8, border: 'none',
                              background: isDeleting ? '#fca5a5' : '#ef4444',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: (isDeleting || rowId == null) ? 'not-allowed' : 'pointer',
                              transition: 'background 0.15s, transform 0.15s, box-shadow 0.15s',
                              boxShadow: '0 2px 6px rgba(239,68,68,0.45)',
                              opacity: (isDeleting || rowId == null) ? 0.5 : 1,
                              flexShrink: 0, padding: 0,
                            }}
                            onMouseEnter={e => {
                              if (!isDeleting && rowId != null) {
                                e.currentTarget.style.background = '#dc2626'
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239,68,68,0.6)'
                                e.currentTarget.style.transform = 'scale(1.1)'
                              }
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = isDeleting ? '#fca5a5' : '#ef4444'
                              e.currentTarget.style.boxShadow = '0 2px 6px rgba(239,68,68,0.45)'
                              e.currentTarget.style.transform = 'scale(1)'
                            }}
                          >
                            {isDeleting
                              ? <span style={{ width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                              : <TrashIcon size={15} color="#ffffff" />
                            }
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}