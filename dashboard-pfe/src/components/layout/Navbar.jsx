import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Settings, LogOut, ChevronDown, UserCircle, CheckCheck, Wrench, Bell, Sun, Moon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const API_BASE = "http://localhost:8000";

function BellIcon({ active }) {
  return (
    <Bell
      size={20}
      color="#f59e0b"
      fill="#f59e0b"
      style={{ display: "block" }}
    />
  );
}

function WrenchIcon({ color }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : { "Content-Type": "application/json" };
}

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, themeMode, setMode } = useTheme();
  const toggleTheme = () => setMode(theme === "dark" ? "light" : "dark");

  const [menuOpen, setMenuOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const menuRef = useRef(null);
  const bellRef = useRef(null);

  const rawRole = localStorage.getItem("role") || "";
  const role = rawRole.trim().toLowerCase();
  const isAdmin = role === "admin";

  const getPhoto = () => {
    const userId = localStorage.getItem("userId");
    return localStorage.getItem(`profilePhoto_${userId}`) || null;
  };

  const getNom = () => {
    const nom = localStorage.getItem("profileNom");
    if (nom && nom.trim()) return nom.trim();

    const username = localStorage.getItem("username") || "";
    if (username.trim()) return username.trim();

    if (role === "admin") return "Administrateur";
    if (role.includes("technicien")) return "Technicien";
    return "Opérateur";
  };

  const [photo, setPhoto] = useState(getPhoto);
  const [displayName, setDisplayName] = useState(getNom);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/notifications/?receiver_role=technicien`, {
        headers: getAuthHeader(),
      });

      if (res.ok) {
        const data = await res.json();
        const raw = Array.isArray(data) ? data : [];
        const list = raw.filter((n) => n.status !== "TRAITEE");
        setNotifications(list);
        setUnreadCount(
          list.filter((n) => n.is_read === "false" || n.is_read === false).length
        );
      }
    } catch (error) {
      console.error("Erreur notifications:", error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markRead = async (notifId) => {
    try {
      await fetch(`${API_BASE}/notifications/${notifId}/read`, {
        method: "PATCH",
        headers: getAuthHeader(),
      });
      fetchNotifications();
    } catch (error) {
      console.error("Erreur markRead:", error);
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter(
      (n) => n.is_read === "false" || n.is_read === false
    );

    await Promise.all(
      unread.map((n) =>
        fetch(`${API_BASE}/notifications/${n.id}/read`, {
          method: "PATCH",
          headers: getAuthHeader(),
        })
      )
    );

    fetchNotifications();
  };

  useEffect(() => {
    const update = () => {
      setPhoto(getPhoto());
      setDisplayName(getNom());
    };

    window.addEventListener("storage", update);
    window.addEventListener("profileUpdated", update);

    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("profileUpdated", update);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    const userId = localStorage.getItem("userId");

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("selectedRole");
    localStorage.removeItem("profileNom");
    localStorage.removeItem("username");

    if (userId) localStorage.removeItem(`profilePhoto_${userId}`);

    window.location.href = "/";
  };

  const displayRole =
    role === "admin"
      ? "Administrateur"
      : role.includes("technicien")
      ? "Technicien"
      : "Opérateur";

  const initials = displayName.slice(0, 2).toUpperCase();

  const urgenceColor = (u) => {
    if (u === "CRITIQUE") return { color: "#ef4444", bg: "#fff5f5", border: "#fca5a5" };
    if (u === "URGENTE") return { color: "#d97706", bg: "#fef3c7", border: "#fcd48a" };
    return { color: "#7c3aed", bg: "#f5f3ff", border: "#c4b5fd" };
  };

  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "10px 24px",
        background: "var(--bg-card)",
        borderBottom: "1px solid var(--border)",
        boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
        minHeight: 60,
        overflow: "visible",
      }}
    >
      <button
        onClick={toggleTheme}
        aria-label="Changer le theme"
        style={{
          width: 40,
          height: 40,
          padding: 0,
          borderRadius: 10,
          border: "1px solid var(--border, #e2e8f0)",
          background: "var(--bg-secondary, #f8fafc)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.2s",
          outline: "none",
        }}
      >
        {theme === "dark" ? <Moon size={18} color="#ffffff" /> : <Sun size={18} color="#f59e0b" />}
      </button>

      <div style={{ flex: 1 }} />

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {(isAdmin || role.includes("technicien")) && (
          <div ref={bellRef} style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <button
              onClick={() => {
                setBellOpen((o) => !o);
                setMenuOpen(false);
              }}
              style={{
                width: 40,
                height: 40,
                minWidth: 40,
                minHeight: 40,
                padding: 0,
                borderRadius: 10,
                border: "1px solid var(--border, #e2e8f0)",
                background: bellOpen ? "rgba(124,58,237,0.08)" : "var(--bg-secondary, #f8fafc)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                position: "relative",
                transition: "all 0.2s",
                flexShrink: 0,
                outline: "none",
                overflow: "visible",
              }}
              aria-label="Notifications"
            >
              <BellIcon active={unreadCount > 0} />

              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "#ef4444",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid var(--bg-card, #fff)",
                    lineHeight: 1,
                    zIndex: 10,
                  }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {bellOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 8px)",
                  background: "var(--bg-card, #fff)",
                  border: "1px solid var(--border, #e2e8f0)",
                  borderRadius: 14,
                  width: 340,
                  zIndex: 999,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.14)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "14px 16px 12px",
                    borderBottom: "1px solid var(--border, #e2e8f0)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <BellIcon active />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary, #1e293b)" }}>
                      Notifications
                    </span>

                    {unreadCount > 0 && (
                      <span
                        style={{
                          padding: "1px 7px",
                          borderRadius: 20,
                          background: "#7c3aed",
                          color: "#fff",
                          fontSize: 10,
                          fontWeight: 800,
                        }}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </div>

                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "4px 10px",
                        borderRadius: 8,
                        border: "1px solid var(--border, #e2e8f0)",
                        background: "var(--bg-secondary, #f8fafc)",
                        color: "var(--text-secondary, #64748b)",
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <CheckCheck size={12} /> Tout lire
                    </button>
                  )}
                </div>

                <div style={{ maxHeight: 360, overflowY: "auto" }}>
                  {notifications.length === 0 ? (
                    <div
                      style={{
                        padding: "32px 16px",
                        textAlign: "center",
                        color: "var(--text-secondary, #64748b)",
                        fontSize: 13,
                      }}
                    >
                      Aucune notification
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const uc = urgenceColor(n.urgence);
                      const isUnread = n.is_read === "false" || n.is_read === false;

                      return (
                        <div
                          key={n.id}
                          onClick={() => {
                            markRead(n.id);
                            navigate("/journal");
                            setBellOpen(false);
                          }}
                          style={{
                            padding: "12px 16px",
                            borderBottom: "1px solid var(--border, #e2e8f0)",
                            background: isUnread ? "rgba(124,58,237,0.04)" : "transparent",
                            cursor: "pointer",
                            display: "flex",
                            gap: 12,
                            alignItems: "flex-start",
                          }}
                        >
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              borderRadius: 10,
                              flexShrink: 0,
                              background: uc.bg,
                              border: `1px solid ${uc.border}`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <WrenchIcon color={uc.color} />
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 800,
                                  color: uc.color,
                                  padding: "1px 7px",
                                  borderRadius: 20,
                                  background: uc.bg,
                                  border: `1px solid ${uc.border}`,
                                }}
                              >
                                {n.urgence}
                              </span>

                              {isUnread && (
                                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#7c3aed" }} />
                              )}
                            </div>

                            <div style={{ fontSize: 12, color: "var(--text-primary, #1e293b)", fontWeight: 600 }}>
                              Incident #{n.incident_id}
                            </div>

                            <div style={{ fontSize: 11, color: "var(--text-secondary, #64748b)", lineHeight: 1.4 }}>
                              {n.message}
                            </div>

                            <div style={{ fontSize: 10, color: "var(--text-secondary, #64748b)", marginTop: 4 }}>
                              {fmtDate(n.created_at)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {notifications.length > 0 && (
                  <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border, #e2e8f0)" }}>
                    <button
                      onClick={() => {
                        navigate("/journal");
                        setBellOpen(false);
                      }}
                      style={{
                        width: "100%",
                        padding: "8px",
                        borderRadius: 8,
                        border: "none",
                        background: "rgba(124,58,237,0.08)",
                        color: "#7c3aed",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Voir tous les incidents →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div ref={menuRef} style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <button
            onClick={() => {
              setMenuOpen((o) => !o);
              setBellOpen(false);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: menuOpen ? "rgba(0,166,81,0.08)" : "var(--bg-secondary, #f8fafc)",
              border: "1px solid var(--border, #e2e8f0)",
              borderRadius: 10,
              padding: "7px 14px 7px 8px",
              cursor: "pointer",
              outline: "none",
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#006DB7,#00A651)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 800,
                color: "#fff",
                flexShrink: 0,
                boxShadow: "0 0 0 2px rgba(0,166,81,0.25)",
                overflow: "hidden",
              }}
            >
              {photo ? (
                <img src={photo} alt="profil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                initials
              )}
            </div>

            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary, #1e293b)" }}>
                {displayName}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-secondary, #64748b)" }}>
                {displayRole}
              </div>
            </div>

            <ChevronDown
              size={14}
              color="var(--text-secondary, #64748b)"
              style={{
                transition: "transform 0.2s",
                transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </button>

          {menuOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                background: "var(--bg-card, #fff)",
                border: "1px solid var(--border, #e2e8f0)",
                borderRadius: 12,
                minWidth: 200,
                zIndex: 999,
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                overflow: "hidden",
              }}
            >
              <MenuItem
                icon={<UserCircle size={15} />}
                label="Mon profil"
                active={location.pathname === "/profile"}
                onClick={() => {
                  navigate("/profile");
                  setMenuOpen(false);
                }}
              />

              <div style={{ borderTop: "1px solid var(--border, #e2e8f0)", margin: "4px 0" }} />

              <MenuItem icon={<LogOut size={15} />} label="Déconnexion" danger onClick={handleLogout} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function MenuItem({ icon, label, onClick, active = false, danger = false }) {
  const [hovered, setHovered] = useState(false);

  const color = danger
    ? "#ef4444"
    : active
    ? "#00A651"
    : hovered
    ? "var(--text-primary, #1e293b)"
    : "var(--text-secondary, #64748b)";

  const bg = hovered
    ? danger
      ? "rgba(239,68,68,0.08)"
      : "rgba(0,166,81,0.06)"
    : "transparent";

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%",
        padding: "11px 16px",
        background: bg,
        border: "none",
        display: "flex",
        alignItems: "center",
        gap: 10,
        cursor: "pointer",
        color,
        fontSize: 13,
        fontWeight: active ? 700 : 500,
        textAlign: "left",
      }}
    >
      {icon}
      {label}
    </button>
  );
}