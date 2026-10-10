import {
  LayoutDashboard, AlertTriangle, FileText, Users,
  Bot, SlidersHorizontal, BarChart3, ChevronRight,
  Sun, Moon, Monitor, LogOut, User, Shield,
  ChevronLeft, Menu
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useSidebar } from "./SidebarContext";

const menuItems = [
  { path: "/dashboard",    label: "Tableau de Bord",          icon: LayoutDashboard   },
  { path: "/alertes",      label: "Alertes",                  icon: AlertTriangle     },
  { path: "/journal",      label: "Journal des Incidents",    icon: FileText          },
  { path: "/ai",           label: "Assistant IA",             icon: Bot               },
  { path: "/rapports",     label: "Rapports d'Intervention",  icon: BarChart3         },
  { path: "/users",        label: "Utilisateurs",             icon: Users             },
  { path: "/parametres",   label: "Configuration",            icon: SlidersHorizontal },
  
];

function getSystemTheme() {
  try { return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"; }
  catch { return "light"; }
}

export const SIDEBAR_OPEN      = 260;
export const SIDEBAR_COLLAPSED = 72;

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const role     = localStorage.getItem("role")?.trim().toLowerCase();
  const logo     = "/logo_ocp.png";

  const { collapsed, setCollapsed } = useSidebar();

  const themeMode = localStorage.getItem("themeMode") || "light";
  const resolvedTheme = themeMode === "system" ? getSystemTheme() : themeMode;
  const isDark = resolvedTheme === "dark";

  const setThemeMode = (mode) => {
    localStorage.setItem("themeMode", mode);
    const t = mode === "system" ? getSystemTheme() : mode;
    document.body.className = t;
    window.dispatchEvent(new Event("themechange"));
  };

  useEffect(() => {
    document.body.className = resolvedTheme;
  }, [resolvedTheme]);

  const divider  = isDark ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.25)";
  const txtMain  = "#FFFFFF";
  const txtMuted = isDark ? "#E2E8F0" : "#F1F5F9";
  const navLabel = isDark ? "#D1FAE5" : "#E6F4EA";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("selectedRole");
    window.location.href = "/";
  };

  const w = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_OPEN;

  return (
    <div style={{
      width: w, minHeight: "100vh",
      backgroundImage: `
        linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%),
        url('/sidebar-bg.png')
      `,
      backgroundSize: "cover",
      backgroundPosition: "center",
      display: "flex", flexDirection: "column",
      position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 200,
      transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
      overflow: "hidden",
      boxShadow: "2px 0 12px rgba(0,0,0,0.15)"
    }}>

      {/* -- HEADER -- */}
      <div style={{
        padding: collapsed ? "16px 8px" : "16px 18px",
        borderBottom: `1px solid ${divider}`,
        display: "flex", flexDirection: "column",
        alignItems: collapsed ? "center" : "stretch",
        gap: 10, flexShrink: 0
      }}>
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: 10, overflow: "hidden"
        }}>
          <img src={logo} alt="OCP" style={{
            height: 40, width: 40,
            objectFit: "contain", flexShrink: 0,
            borderRadius: 10, transition: "all 0.3s",
            background: "#fff", padding: 2
          }} />
          <div style={{
            overflow: "hidden",
            maxWidth: collapsed ? 0 : 160,
            opacity: collapsed ? 0 : 1,
            transition: "max-width 0.3s ease, opacity 0.2s ease",
            whiteSpace: "nowrap"
          }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: txtMain }}>Surveillance</div>
            <div style={{ fontSize: 10, color: "#FFFFFF", opacity: 0.9, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>
              Groupe OCP
            </div>
          </div>
        </div>

        <button
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? "Agrandir" : "Réduire"}
          style={{
            width: "100%", height: 32, borderRadius: 8, border: "none",
            background: "rgba(255,255,255,0.15)",
            color: "#FFFFFF", cursor: "pointer", padding: 0,
            display: "flex", alignItems: "center",
            justifyContent: "center", gap: 6,
            transition: "all 0.2s", fontSize: 12, fontWeight: 600
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
        >
          {collapsed
            ? <Menu size={16} />
            : <><ChevronLeft size={16} /><span style={{ color: "#FFFFFF" }}>Réduire</span></>
          }
        </button>
      </div>

      {/* -- NAVIGATION -- */}
      <div style={{ flex: 1, padding: collapsed ? "12px 8px" : "16px 12px", overflowY: "auto" }}>
        {!collapsed && (
          <div style={{ fontSize: 10, color: navLabel, fontWeight: 700, letterSpacing: 2, padding: "0 10px", marginBottom: 12 }}>
            NAVIGATION
          </div>
        )}

        {menuItems
          .filter(item => {
            if (item.path === "/parametres")  return role === "admin"
            if (item.path === "/users")       return role === "admin"
            // ✅ Rapports visibles pour technicien ET admin
            if (item.path === "/rapports")    return role === "technicien" || role === "admin"
            return true
          })
          .map(item => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <div
                key={item.path}
                onClick={() => navigate(item.path)}
                title={collapsed ? item.label : ""}
                style={{
                  display: "flex", alignItems: "center",
                  gap: collapsed ? 0 : 12,
                  padding: collapsed ? "10px" : "11px 12px",
                  borderRadius: 12, marginBottom: 4,
                  cursor: "pointer", transition: "all 0.2s",
                  justifyContent: collapsed ? "center" : "flex-start",
                  background: isActive ? "rgba(255,255,255,0.2)" : "transparent",
                  border: isActive ? "1px solid rgba(255,255,255,0.4)" : "1px solid transparent",
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.08)" }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent" }}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                  background: isActive ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#FFFFFF",
                }}>
                  <Icon size={16} />
                </div>
                {!collapsed && (
                  <>
                    <span style={{
                      fontSize: 13, fontWeight: isActive ? 700 : 500,
                      color: "#FFFFFF", flex: 1,
                    }}>{item.label}</span>
                    {isActive && <ChevronRight size={14} color="#FFFFFF" />}
                  </>
                )}
              </div>
            );
          })}
      </div>

      {/* -- FOOTER -- */}
      <div style={{ padding: collapsed ? "12px 8px" : "12px 12px 16px", borderTop: `1px solid ${divider}`, flexShrink: 0 }}>
        {!collapsed && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 12px", borderRadius: 10, marginBottom: 8,
            background: "rgba(255,255,255,0.1)"
          }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8, flexShrink: 0,
              background: "rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              {role === "admin" ? <Shield size={14} color="#fff" /> : <User size={14} color="#fff" />}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: txtMain }}>
                {role === "admin" ? "Administrateur" : role === "technicien" ? "Technicien" : "Operateur"}
              </div>
              <div style={{ fontSize: 10, color: txtMuted }}>OCP Jorf Lasfar</div>
            </div>
          </div>
        )}

        {collapsed && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
            <div
              title={role === "admin" ? "Administrateur" : role === "technicien" ? "Technicien" : "Operateur"}
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: "rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
              {role === "admin" ? <Shield size={14} color="#fff" /> : <User size={14} color="#fff" />}
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          style={{
            width: "100%", padding: "12px 16px",
            border: "none", borderTop: "1px solid rgba(255,255,255,0.12)",
            background: "transparent", color: "#FFFFFF",
            display: "flex", alignItems: "center", gap: "10px",
            cursor: "pointer", fontSize: "14px", fontWeight: "500",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.paddingLeft = "22px"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.paddingLeft = "16px"; }}
        >
          <LogOut size={16} />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </div>
  );
}