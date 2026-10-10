import { createContext, useContext, useState, useCallback } from "react"

const SidebarContext = createContext()

export function SidebarProvider({ children }) {
  const [collapsed, setCollapsedState] = useState(false)

  // âœ… useCallback pour stabiliser la rÃ©fÃ©rence
  const setCollapsed = useCallback((val) => {
    setCollapsedState(prev => typeof val === "function" ? val(prev) : val)
  }, [])

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  return useContext(SidebarContext)
}