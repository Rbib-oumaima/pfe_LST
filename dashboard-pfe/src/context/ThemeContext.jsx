import { createContext, useContext, useEffect, useState } from "react"

const ThemeContext = createContext()

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export function ThemeProvider({ children }) {
  const saved = localStorage.getItem("themeMode") || "dark"
  const [themeMode, setThemeMode] = useState(saved)
  const theme = themeMode === "system" ? getSystemTheme() : themeMode

  useEffect(() => {
    localStorage.setItem("themeMode", themeMode)
    document.body.className = theme
    if (themeMode === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)")
      const handler = () => { document.body.className = mq.matches ? "dark" : "light" }
      mq.addEventListener("change", handler)
      return () => mq.removeEventListener("change", handler)
    }
  }, [themeMode, theme])

  const setMode = (mode) => setThemeMode(mode)

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}

