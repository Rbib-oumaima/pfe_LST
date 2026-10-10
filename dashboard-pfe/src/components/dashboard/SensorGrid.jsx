import React from "react"

export default function SensorGrid({ sensors = [] }) {
  const getStatus = (s) => {
    const v = Number(s.value)
    if (s.status === "CRITIQUE"      || s.severity === "CRITIQUE")      return "critical"
    if (s.status === "AVERTISSEMENT" || s.severity === "AVERTISSEMENT") return "warning"
    return "normal"
  }
  const colors = {
    critical: { color: "#dc2626", bg: "rgba(220,38,38,0.08)",  border: "rgba(220,38,38,0.2)",  label: "CRITIQUE" },
    warning:  { color: "#d97706", bg: "rgba(217,119,6,0.08)",  border: "rgba(217,119,6,0.2)",  label: "AVERTISSEMENT" },
    normal:   { color: "#7dba3a", bg: "rgba(0,166,81,0.08)",   border: "rgba(0,166,81,0.15)",  label: "NORMAL" },
  }

  return (
    <div className="grid-4">
      {sensors.map((s) => {
        const status = getStatus(s)
        const c = colors[status]
        return (
          <div key={`${s.sensor_id}-${s.ligne}`} style={{ background: "var(--bg-card)", border: `1px solid ${c.border}`, borderRadius: 14, padding: 18, position: "relative", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", transition: "all 0.2s" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: c.color }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 700, letterSpacing: 1 }}>{s.sensor_id}</div>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.color, boxShadow: `0 0 6px ${c.color}` }} />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, marginBottom: 8 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1, fontFamily: "var(--mono)" }}>{s.value ?? "--"}</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 3 }}>{s.unit}</div>
            </div>
            <div style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: 600, marginBottom: 10 }}>{s.sensor_name || "Capteur"}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 11, color: "var(--text-dim)" }}>{s.ligne}</div>
              <div style={{ fontSize: 10, padding: "3px 8px", borderRadius: 10, fontWeight: 700, background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>{c.label}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}