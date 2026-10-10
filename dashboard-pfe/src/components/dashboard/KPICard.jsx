import React from "react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

export default function KPICard({ title, value, unit, trend, status = "ok", subtitle }) {
  const config = {
    ok:       { color: "#7dba3a", bg: "rgba(0,166,81,0.08)",   border: "rgba(0,166,81,0.2)"   },
    warning:  { color: "#d97706", bg: "rgba(217,119,6,0.08)",  border: "rgba(217,119,6,0.2)"  },
    critical: { color: "#dc2626", bg: "rgba(220,38,38,0.08)",  border: "rgba(220,38,38,0.2)"  },
  }
  const c = config[status] || config.ok

  return (
    <div style={{ background: "var(--bg-card)", border: `1px solid ${c.border}`, borderRadius: 14, padding: 20, position: "relative", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", transition: "all 0.2s" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: c.color }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <div style={{ color: "var(--text-secondary)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>{subtitle}</div>}
        </div>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: c.color, boxShadow: `0 0 8px ${c.color}` }} />
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 36, fontWeight: 800, color: c.color, fontFamily: "var(--mono)", lineHeight: 1 }}>{value ?? "--"}</span>
        {unit && <span style={{ fontSize: 14, color: "var(--text-dim)", marginBottom: 4 }}>{unit}</span>}
      </div>
      <div style={{ height: 28, display: "flex", alignItems: "flex-end", gap: 3, marginBottom: 8 }}>
        {[8,12,9,15,11,14,10,17,13,18].map((h, i) => (
          <div key={i} style={{ width: 6, height: `${h}px`, borderRadius: 10, background: c.color, opacity: 0.6 }} />
        ))}
      </div>
      {trend !== undefined && (
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600 }}>
          {trend > 0 ? <TrendingUp size={13} color={c.color} /> : trend < 0 ? <TrendingDown size={13} color={c.color} /> : <Minus size={13} color="#94a3b8" />}
          <span style={{ color: trend > 0 ? "#7dba3a" : trend < 0 ? "#dc2626" : "#94a3b8" }}>{trend > 0 ? "+" : ""}{trend}%</span>
          <span style={{ color: "var(--text-dim)", fontSize: 11 }}>vs derniere heure</span>
        </div>
      )}
    </div>
  )
}