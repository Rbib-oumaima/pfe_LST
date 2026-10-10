import { Sun, Moon, Monitor } from "lucide-react"
import { useTheme } from "../../context/ThemeContext"

const MODES = [
  { key: "light",  Icon: Sun,     label: "Clair"   },
  { key: "dark",   Icon: Moon,    label: "Sombre"  },
  { key: "system", Icon: Monitor, label: "Système" },
]

export default function ThemeToggle() {
  const { themeMode, setMode, theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <div style={{
      display: "flex",
      gap: 4,
      padding: "4px",
      borderRadius: 12,
      background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
      border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)"}`,
    }}>
      {MODES.map(({ key, Icon, label }) => {
        const isActive = themeMode === key
        return (
          <button
            key={key}
            onClick={() => setMode(key)}
            title={label}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              padding: "7px 10px",
              borderRadius: 9,
              border: "none",
              cursor: "pointer",
              fontSize: 11,
              fontWeight: isActive ? 700 : 500,
              transition: "all 0.2s",
              background: isActive
                ? "linear-gradient(135deg,#006DB7,#7dba3a)"
                : "transparent",
              color: isActive
                ? "#fff"
                : isDark ? "#6b8aad" : "#64748b",
              boxShadow: isActive ? "0 2px 8px rgba(0,109,183,0.3)" : "none",
            }}
          >
            <Icon size={13} />
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}

