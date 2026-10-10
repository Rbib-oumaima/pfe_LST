import React, { useCallback, useState, useEffect, memo } from 'react'
import { useRealtime } from '../hooks/useRealtime.js'
import { sensorService, alertService } from '../services/api.js'
import KPICard from '../components/dashboard/KPICard.jsx'
import SensorGrid from '../components/dashboard/SensorGrid.jsx'
import LineChart from '../components/dashboard/LineChart.jsx'
import AlertPanel from '../components/alerts/AlertPanel.jsx'
import {
  Factory,
  TriangleAlert,
  BadgeCheck,
  BellRing,
  RefreshCw
} from "lucide-react";

const LINES = ['PN', 'Granulateur', 'Lavage', 'Sechage', 'Enrobage', 'PRODUIT FINI']

/* ✅ ChartCard EN DEHORS du Dashboard + memo = jamais re-monté */
const ChartCard = memo(({ id, name, unit, color }) => (
  <div style={{
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 12, padding: 20,
    position: 'relative', overflow: 'hidden',
  }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: color }} />
    <LineChart sensorId={id} sensorName={name} unit={unit} color={color} />
  </div>
))

const CHARTS = [
  { id: 'TI-027',  name: 'Temperature PN',     unit: 'C',    color: '#f85149' },
  { id: 'TI-138',  name: 'Temperature Secheur', unit: 'C',    color: '#d29922' },
  { id: 'FIC-001', name: 'Debit PN',            unit: 'm3/h', color: '#388bfd' },
  { id: 'LIC-503', name: 'Niveau AD01',          unit: '%',    color: '#3fb950' },
]

const Bar = () => (
  <div style={{ width: 3, height: 20, background: 'linear-gradient(180deg,#006DB7,#7dba3a)', borderRadius: 2 }} />
)

export default function Dashboard() {
  const [selectedLine, setSelectedLine] = useState('PN')
  const [time, setTime] = useState(new Date())
  const [aiSummary, setAiSummary] = useState({
  etat: {
    titre: "",
    description: ""
  },
  anomalies: {
    titre: "",
    description: ""
  },
  qualite: {
    titre: "",
    description: ""
  },
  alertes: {
    titre: "",
    description: ""
  }
});
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  useEffect(() => {

  loadSummary();

  const timer = setInterval(
    loadSummary,
    60000
  );

  return () => clearInterval(timer);

}, []);
  const loadSummary = async () => {

  try {

    const res = await fetch(
      "http://localhost:8000/ai/summary"
    );

    const data = await res.json();

    setAiSummary(data);

  } catch (err) {

    console.error(err);

  }

};

  const fetchSensors = useCallback(() => sensorService.getLive(), [])
  const fetchAlerts  = useCallback(() => alertService.getActive(), [])
  const { data: sensors = [], loading: loadingSensors } = useRealtime(fetchSensors, 5000, 'sensors-live')
  const { data: alerts  = [] }                          = useRealtime(fetchAlerts,  5000, 'alerts-active')

  const safeSensors = Array.isArray(sensors) ? sensors : []
  const safeAlerts  = Array.isArray(alerts)  ? alerts  : []

  const uniqueSensors = Object.values(
    safeSensors
      .filter(s => s.ligne === selectedLine)
      .reduce((acc, s) => { acc[s.sensor_id] = s; return acc }, {})
  )

  const pf     = safeSensors.filter(s => s.ligne === 'PRODUIT FINI')
  const getNPK = (id) => pf.find(s => s.sensor_id === id)?.value
  const critiques = safeAlerts.filter(a => a.severity === 'CRITIQUE').length

  const kpiSensors = [
    { id: 'PF-N',    label: 'N (Azote)',            unit: '%', target: 11.5 },
    { id: 'PF-P2O5', label: 'P2O5',                 unit: '%', target: 44   },
    { id: 'PF-K2O',  label: 'K2O',                  unit: '%', target: 15   },
    { id: 'PF-TG24', label: 'Taux Granulometrique', unit: '%', target: 88   },
  ]

  const units = ['Granulateur', 'Lavage', 'Sechage', 'Enrobage', 'Produit Fini']

  const heatColors = {
    critique: '#dc2626', eleve: '#f59e0b',
    moyen: '#facc15', faible: '#84cc16', normal: '#15803d',
  }

  const heatmapData = units.map(unit =>
    [0, 4, 8, 12, 16, 20, 24, 28, 32, 36].map(slot => {
      const rel = safeAlerts.filter(a => {
        if (!a.timestamp) return false
        const h = new Date(a.timestamp).getHours()
        return a.ligne?.toLowerCase().includes(unit.toLowerCase()) && h >= slot && h < slot + 4
      })
      if (rel.some(a => a.severity === 'CRITIQUE'))      return 'critique'
      if (rel.some(a => a.severity === 'AVERTISSEMENT')) return 'eleve'
      if (rel.length > 0)                                return 'faible'
      return 'normal'
    })
  )

  const dateStr = time.toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
  const timeStr = time.toLocaleTimeString('fr-FR')

  return (
    <div style={{ padding: 28, minHeight: '100vh', background: 'var(--bg-primary)' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
        <div style={{
          background: 'linear-gradient(135deg, #0d1b2e 0%, #0f2a1a 60%, #1a3a0a 100%)',
          borderRadius: 16, padding: '24px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 4px 24px rgba(125,186,58,0.15)',
          border: '1px solid rgba(125,186,58,0.2)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(125,186,58,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(125,186,58,0.15)', border: '1.5px solid rgba(125,186,58,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <img src="/logo_ocp.png" alt="OCP" style={{ height: 32, objectFit: 'contain' }} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#ffffff', letterSpacing: '0.3px', lineHeight: 1.2 }}>
                Surveillance de Production NPK
              </h1>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>OCP Group · Jorf Lasfar</span>
                <span style={{ color: 'rgba(125,186,58,0.5)' }}>•</span>
                <span style={{ textTransform: 'capitalize' }}>{dateStr}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 28, fontWeight: 700, color: '#7dba3a', letterSpacing: '2px', lineHeight: 1 }}>
              {timeStr}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 14px', background: critiques === 0 ? 'rgba(125,186,58,0.12)' : 'rgba(248,81,73,0.12)', border: `1px solid ${critiques === 0 ? 'rgba(125,186,58,0.35)' : 'rgba(248,81,73,0.35)'}`, borderRadius: 20 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: critiques === 0 ? '#7dba3a' : '#f85149', boxShadow: `0 0 6px ${critiques === 0 ? '#7dba3a' : '#f85149'}` }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: critiques === 0 ? '#7dba3a' : '#f85149' }}>
                {critiques === 0 ? 'Production normale' : `${critiques} alerte(s) critique(s)`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Produit Fini ── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Bar />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Qualite Produit Fini</span>
          <span style={{ marginLeft: 'auto', fontSize: 10, color: '#4d9fff', padding: '3px 10px', border: '1px solid rgba(77,159,255,0.3)', borderRadius: 12, fontWeight: 600 }}>NPK 15-44-15</span>
        </div>
        <div className="grid-4">
          {kpiSensors.map(({ id, label, unit, target }) => {
            const val = getNPK(id)
            return (
              <KPICard key={id} title={label}
                value={val !== undefined ? val.toFixed(2) : '--'}
                unit={unit}
                status={val !== undefined && Math.abs(val - target) / target > 0.05 ? 'warning' : 'ok'}
                subtitle={`Cible : ${target} ${unit}`}
              />
            )
          })}
        </div>
      </div>

      {/* ── Alertes actives ── */}
      {safeAlerts.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Bar />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              Alertes actives - {safeAlerts.length}
            </span>
          </div>
          <AlertPanel alerts={safeAlerts.slice(0, 5)} />
        </div>
      )}

      {/* ── Capteurs par ligne ── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Bar />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              Capteurs - {selectedLine} ({uniqueSensors.length})
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {LINES.map(l => (
              <button key={l} onClick={() => setSelectedLine(l)} style={{
                padding: '5px 13px', fontSize: 11, borderRadius: 20,
                fontWeight: selectedLine === l ? 700 : 400, cursor: 'pointer',
                background: selectedLine === l ? 'linear-gradient(135deg,#006DB7,#7dba3a)' : 'transparent',
                color: selectedLine === l ? '#fff' : 'var(--text-secondary)',
                border: `1px solid ${selectedLine === l ? 'transparent' : '#1e3a5f'}`,
              }}>{l}</button>
            ))}
          </div>
        </div>
        {loadingSensors
          ? <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-secondary)', background: 'var(--bg-card)', borderRadius: 10 }}>Chargement...</div>
          : uniqueSensors.length === 0
            ? <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-secondary)', background: 'var(--bg-card)', borderRadius: 10 }}>Aucun capteur pour {selectedLine}</div>
            : <SensorGrid sensors={uniqueSensors} />
        }
      </div>

      {/* ── Historique ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bar />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Historique Temps Reel</span>
        </div>
        <div
  
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20
  }}
>
  {CHARTS.map(c => (
    <ChartCard
      key={c.id}
      {...c}
    />
  ))}
</div>
        <div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: 20
  }}
>
          <div
          
  style={{
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: 16,
    padding: 20
  }}
>

 <div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20
  }}
>

  {/* Etat */}
  <div
    style={{
      background: "var(--bg-card)",
      borderRadius: 16,
      padding: 18,
      borderLeft: "5px solid #16a34a",
      boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
    }}
  >
    <Factory size={38} color="#16a34a" />

    <div
      style={{
        marginTop: 10,
        fontWeight: 800,
        color: "#16a34a",
        fontSize: 13
      }}
    >
      ÉTAT GÉNÉRAL
    </div>

    <div
      style={{
        marginTop: 6,
        fontSize: 13
      }}
    >
     <div style={{ fontWeight: 700, marginBottom: 8 }}>
  {aiSummary?.etat?.titre || ""}
</div>

<div>
  {aiSummary?.etat?.description || ""}
</div>
    </div>
  </div>

  {/* Anomalies */}
  <div
    style={{
      background: "var(--bg-card)",
      borderRadius: 16,
      padding: 18,
      borderLeft: "5px solid #f59e0b",
      boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
    }}
  >
    <TriangleAlert size={38} color="#f59e0b" />

    <div
      style={{
        marginTop: 10,
        fontWeight: 800,
        color: "#f59e0b",
        fontSize: 13
      }}
    >
      ANOMALIES
    </div>

    <div
      style={{
        marginTop: 6,
        fontSize: 13
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 8 }}>
  {aiSummary?.anomalies?.titre || ""}
</div>

<div>
  {aiSummary?.anomalies?.description || ""}
</div>
    </div>
  </div>

  {/* Qualite */}
  <div
    style={{
      background: "var(--bg-card)",
      borderRadius: 16,
      padding: 18,
      borderLeft: "5px solid #2563eb",
      boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
    }}
  >
    <BadgeCheck size={38} color="#2563eb" />

    <div
      style={{
        marginTop: 10,
        fontWeight: 800,
        color: "#2563eb",
        fontSize: 13
      }}
    >
      QUALITÉ
    </div>

    <div
      style={{
        marginTop: 6,
        fontSize: 13
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 8 }}>
  {aiSummary?.qualite?.titre || ""}
</div>

<div>
  {aiSummary?.qualite?.description || ""}
</div>
    </div>
  </div>

  {/* Alertes */}
  <div
    style={{
      background: "var(--bg-card)",
      borderRadius: 16,
      padding: 18,
      borderLeft: "5px solid #dc2626",
      boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
    }}
  >
    <BellRing size={38} color="#dc2626" />

    <div
      style={{
        marginTop: 10,
        fontWeight: 800,
        color: "#dc2626",
        fontSize: 13
      }}
    >
      ALERTES
    </div>

    <div
      style={{
        marginTop: 6,
        fontSize: 13
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 8 }}>
  {aiSummary?.alertes?.titre || ""}
</div>

<div>
  {aiSummary?.alertes?.description || ""}
</div>
    </div>
  </div>

</div>

<div
  style={{
    marginTop: 16,
    paddingTop: 12,
    borderTop: "1px solid var(--border)",
    display: "flex",
    justifyContent: "space-between",
    fontSize: 12
  }}
>
  

  <span
    style={{
      color: "#16a34a",
      fontWeight: 600
    }}
  >
    Analyse IA temps réel
  </span>
</div>

  <div
    style={{
      marginTop: 15,
      display: "flex",
      alignItems: "center",
      width: "100%",
      justifyContent: "space-between",
      fontSize: 12
    }}
  >
    <span>
      {new Date().toLocaleString()}
    </span>

    <span
      style={{
        color: "#16a34a",
        display: "flex",
        alignItems: "center",
        gap: 6
      }}
    >
      <RefreshCw size={14} />
      Actualisation automatique
    </span>
  </div>

</div>
          {/* Heatmap */}
<div
  style={{
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
  }}
>
  {/* Header */}
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 24
    }}
  >
    <div
      style={{
        width: 4,
        height: 20,
        background: "linear-gradient(180deg,#006DB7,#7dba3a)",
        borderRadius: 2
      }}
    />

    <span
      style={{
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: 1,
        textTransform: "uppercase",
        color: "var(--text-primary)"
      }}
    >
      Heatmap Anomalies 24h
    </span>
  </div>

  {/* Corps Heatmap */}
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "120px 1fr 100px",
      gap: 20,
      alignItems: "start"
    }}
  >
    {/* Noms des lignes */}
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        paddingTop: 2
      }}
    >
      {units.map(line => (
        <div
          key={line}
          style={{
            height: 38,
            display: "flex",
            alignItems: "center",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--text-primary)"
          }}
        >
          {line}
        </div>
      ))}
    </div>

    {/* Grille */}
    <div>
      {heatmapData.map((row, rowIndex) => (
        <div
          key={rowIndex}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(10,38px)",
            gap: 6,
            marginBottom: 6
          }}
        >
          {row.map((level, colIndex) => (
            <div
              key={colIndex}
              title={`${units[rowIndex]} - ${level}`}
              style={{
                width: 38,
                height: 38,
                borderRadius: 8,
                background: heatColors[level],
                cursor: "pointer",
                boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                transition: "all .2s"
              }}
            />
          ))}
        </div>
      ))}

      {/* Axe Temps */}
<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(6,1fr)",
    width: 434, // 10*(38+6) qriban
    marginTop: 12
  }}
>
  {["00h","04h","08h","12h","16h","20h"].map(t => (
    <span
      key={t}
      style={{
        textAlign: "center",
        fontSize: 12,
        color: "var(--text-secondary)"
      }}
    >
      {t}
    </span>
  ))}
</div>
    </div>

    {/* Légende */}
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        paddingTop: 4
      }}
    >
      {[
        { label: "Critique", color: "#dc2626" },
        { label: "Elevé", color: "#f97316" },
        { label: "Moyen", color: "#facc15" },
        { label: "Faible", color: "#84cc16" },
        { label: "Normal", color: "#16a34a" }
      ].map(item => (
        <div
          key={item.label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 4,
              background: item.color
            }}
          />

          <span
            style={{
              fontSize: 11,
              color: "var(--text-secondary)"
            }}
          >
            {item.label}
          </span>
        </div>
      ))}
    </div>
  </div>

  {/* Footer */}
  <div
    style={{
      marginTop: 30,
      paddingTop: 14,
      borderTop: "1px solid var(--border)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}
  >
    <span
      style={{
        fontSize: 14,
        color: "var(--text-secondary)"
      }}
    >
      Zone la plus instable :
      <span
        style={{
          color: "#f97316",
          fontWeight: 700,
          marginLeft: 6
        }}
      >
        Séchage (12h - 16h)
      </span>
    </span>

    <span
      style={{
        fontSize: 14,
        fontWeight: 700,
        color: "#16a34a"
      }}
    >
      Niveau global : Stable
    </span>
  </div>
</div>
        </div>
      </div>
    </div>
  )
}