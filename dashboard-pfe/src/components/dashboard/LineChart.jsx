import React, { useState, useEffect, useRef, useCallback } from "react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Line
} from "recharts"
import { sensorService } from "../../services/api.js"
import { format } from "date-fns"

export default function LineChart({ sensorId, sensorName, unit, color = "#006DB7" }) {
  const [data, setData]     = useState([])
  const dataRef             = useRef([])
  const isMounted           = useRef(true)

  useEffect(() => {
    isMounted.current = true
    return () => { isMounted.current = false }
  }, [])

  const fetchData = useCallback(() => {
    if (!sensorId) return
    sensorService.getHistory(sensorId, 50)
      .then(rows => {
        if (!isMounted.current) return
        const formatted = rows
          .slice()
          .reverse()
          .map(r => ({
            time:  format(new Date(r.timestamp), "HH:mm:ss"),
            value: Number(r.value),
          }))
        // ✅ Ne met à jour QUE si la dernière valeur a changé
        const lastNew  = formatted[formatted.length - 1]?.value
        const lastPrev = dataRef.current[dataRef.current.length - 1]?.value
        if (lastNew !== lastPrev || formatted.length !== dataRef.current.length) {
          dataRef.current = formatted
          setData(formatted)
        }
      })
      .catch(() => {})
  }, [sensorId])

  useEffect(() => {
    fetchData()
    // ✅ Polling toutes les 5 secondes
    const timer = setInterval(fetchData, 5000)
    return () => clearInterval(timer)
  }, [fetchData])

  const latest = data.length > 0 ? data[data.length - 1].value : "--"
  const max    = data.length > 0 ? Math.max(...data.map(d => d.value)) : "--"
  const min    = data.length > 0 ? Math.min(...data.map(d => d.value)) : "--"

  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: 14, padding: 18,
      position: "relative", overflow: "hidden",
      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: color }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{sensorName}</div>
          <div style={{ fontSize: 11, color: "var(--text-dim)" }}>Historique temps reel</div>
        </div>
        <div style={{
          padding: "6px 10px", borderRadius: 10,
          background: `${color}15`, border: `1px solid ${color}33`,
          color, fontSize: 12, fontWeight: 700, fontFamily: "monospace",
        }}>
          {latest} {unit}
        </div>
      </div>

      <div style={{ display: "flex", gap: 18, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 10, color: "var(--text-dim)", marginBottom: 3 }}>MAX</div>
          <div style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 13 }}>{typeof max === 'number' ? max.toFixed(2) : max}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: "var(--text-dim)", marginBottom: 3 }}>MIN</div>
          <div style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: 13 }}>{typeof min === 'number' ? min.toFixed(2) : min}</div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`g-${sensorId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0}    />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fill: "var(--text-dim)", fontSize: 10 }}
            axisLine={false} tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: "var(--text-dim)", fontSize: 10 }}
            axisLine={false} tickLine={false}
            width={38}
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 10, color: "var(--text-primary)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
            }}
            labelStyle={{ color: "var(--text-secondary)" }}
            itemStyle={{ color }}
          />
          {max !== "--" && (
            <ReferenceLine
              y={max * 0.95}
              stroke="#dc2626"
              strokeDasharray="4 4"
              opacity={0.4}
            />
          )}
          {/* ✅ isAnimationActive false = pas de saut visuel à chaque update */}
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#g-${sensorId})`}
            isAnimationActive={false}
            dot={false}
            activeDot={{ r: 4, stroke: color, strokeWidth: 2, fill: "#fff" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}