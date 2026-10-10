import React from "react"
import { AlertTriangle, AlertCircle, Info } from "lucide-react"

export default function AlertPanel({ alerts = [] }) {
  if (!alerts.length) return (
    <div style={{ height: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,166,81,0.06)", border: "1px solid rgba(0,166,81,0.2)", borderRadius: 14, color: "#7dba3a", fontSize: 14, fontWeight: 600 }}>
      Aucune alerte active
    </div>
  )

  const getConfig = (severity) => {
    switch (severity) {
      case "CRITIQUE":      return { icon: <AlertCircle size={17} color="#dc2626" />,  color: "#dc2626", bg: "rgba(220,38,38,0.08)",  border: "rgba(220,38,38,0.2)",  badge: "CRITIQUE" }
      case "AVERTISSEMENT": return { icon: <AlertTriangle size={17} color="#d97706" />, color: "#d97706", bg: "rgba(217,119,6,0.08)",  border: "rgba(217,119,6,0.2)",  badge: "AVERTISSEMENT" }
      default:              return { icon: <Info size={17} color="#006DB7" />,           color: "#006DB7", bg: "rgba(0,109,183,0.08)", border: "rgba(0,109,183,0.2)", badge: "INFO" }
    }
  }

  return (
    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: 18, maxHeight: 360, overflowY: "auto", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
      {alerts.map((a, i) => {
        const cfg = getConfig(a.severity)
        return (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 0", borderBottom: i < alerts.length - 1 ? "1px solid var(--border)" : "none" }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: cfg.bg, border: `1px solid ${cfg.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {cfg.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 3 }}>
                    {a.sensor_name} <span style={{ color: "var(--text-dim)", fontWeight: 500 }}>— {a.ligne}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-dim)" }}>{new Date().toLocaleTimeString("fr-FR")}</div>
                </div>
                <div style={{ padding: "4px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color, whiteSpace: "nowrap" }}>{cfg.badge}</div>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>{a.description}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}