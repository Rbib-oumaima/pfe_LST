import React, { memo } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./context/ThemeContext"
import { SidebarProvider, useSidebar } from "./components/layout/SidebarContext"
import Sidebar, { SIDEBAR_OPEN, SIDEBAR_COLLAPSED } from "./components/layout/Sidebar"
import ProtectedRoute from "./components/ProtectedRoute.jsx"
import FloatingAssistant from "./components/FloatingAssistant.jsx"
import Dashboard from "./pages/Dashboard.jsx"
import Settings from "./pages/Settings.jsx"
import Alerts from "./pages/Alerts.jsx"
import Journal from "./pages/Journal.jsx"
import AIAssistant from "./pages/AIAssistant.jsx"
import Login from "./pages/Login.jsx"
import LandingPage from "./pages/LandingPage.jsx"
import RoleSelect from "./pages/RoleSelect.jsx"
import ResetPassword from "./pages/ResetPassword.jsx"
import Users from "./pages/Users.jsx"
import ProfileAdmin from "./pages/ProfileAdmin.jsx"
import Navbar from "./components/layout/Navbar.jsx"
import RapportIntervention from "./pages/RapportIntervention.jsx"

const DashboardMemo   = memo(Dashboard)
const AlertsMemo      = memo(Alerts)
const JournalMemo     = memo(Journal)
const AIAssistantMemo = memo(AIAssistant)
const SettingsMemo    = memo(Settings)
const UsersMemo       = memo(Users)

function MainContent() {
  const { collapsed } = useSidebar()
  const role = localStorage.getItem("role")?.toLowerCase()

  return (
    <div style={{
      marginLeft: collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_OPEN,
      flex: 1,
      minHeight: "100vh",
      transition: "margin-left 0.25s ease",
      background: "#f0f4f8",
      boxSizing: "border-box",
    }}>
      <Navbar />

      <Routes>
        <Route path="/dashboard"  element={<DashboardMemo />} />
        <Route path="/alertes"    element={<AlertsMemo />} />
        <Route path="/journal"    element={<JournalMemo />} />
        <Route path="/ai"         element={<AIAssistantMemo />} />
        <Route path="/parametres" element={role === "admin" ? <SettingsMemo /> : <DashboardMemo />} />
        <Route path="/users"      element={role === "admin" ? <UsersMemo /> : <DashboardMemo />} />

        <Route path="/rapports"
          element={role === "technicien" || role === "admin"
            ? <RapportIntervention />
            : <DashboardMemo />}
        />

        <Route path="*" element={<DashboardMemo />} />
      </Routes>

      <FloatingAssistant />
    </div>
  )
}

const AppLayout = memo(function AppLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <MainContent />
    </div>
  )
})

export default function App() {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <BrowserRouter>
          <Routes>
            {/* Pages sans sidebar ni navbar */}
            <Route path="/"               element={<LandingPage />}   />
            <Route path="/role-select"    element={<RoleSelect />}    />
            <Route path="/login"          element={<Login />}         />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Page profil — sans sidebar, avec navbar intégrée dans la page */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfileAdmin />
              </ProtectedRoute>
            } />

            {/* Pages avec sidebar + navbar */}
            <Route path="*" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </SidebarProvider>
    </ThemeProvider>
  )
}