import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, User, Mail, Phone, Building, Calendar, Edit3, Save, X, Lock, Camera, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { useEffect } from "react";
import { userService } from "../services/api";
import { ShieldCheck } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

function getC(dark) {
  return {
    bg:      dark ? "#0d1b2e" : "#f0f4f8",
    card:    dark ? "#0f2233" : "#ffffff",
    border:  dark ? "rgba(255,255,255,0.07)" : "#e2e8f0",
    text:    dark ? "#f1f5f9" : "#111827",
    muted:   dark ? "#94a3b8" : "#6b7280",
    inputBg: dark ? "#0a1929" : "#ffffff",
    inputBorder: dark ? "rgba(255,255,255,0.15)" : "#d1d5db",
    green:   "#16a34a",
    greenBg: dark ? "rgba(22,163,74,0.15)" : "#f0fdf4",
    greenBorder: dark ? "rgba(22,163,74,0.35)" : "#bbf7d0",
    red:     "#ef4444",
    redBg:   dark ? "rgba(239,68,68,0.15)" : "rgba(220,38,38,0.3)",
  };
}

export default function ProfileAdmin() {
  const navigate = useNavigate();
  const { theme: mode } = useTheme();
  const dark = mode === "dark";
  const C = getC(dark);

  const role = localStorage.getItem("role")?.trim().toLowerCase();
  const isAdmin = role === "admin";
  const fileInputRef = useRef(null);

  const [editMode, setEditMode] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [profile, setProfile] = useState(null);
const [loading, setLoading] = useState(true);
 const [form, setForm] = useState({});

  useEffect(() => {

  userService.getMe()
  .then(user => {

    console.log("USER =", user);

    const data = {
  id: user.id,

  nom: user.full_name || user.username,
  prenom: user.prenom || "",

  email: user.email || "",

  telephone: user.telephone || "",

  departement: user.departement || "",

  site: user.site || "OCP Jorf Lasfar",

  role: user.role,

  dateInscription: new Date(
    user.created_at
  ).toLocaleDateString("fr-FR"),

  statut: user.is_active
    ? "Actif"
    : "Désactivé",
};
    const savedPhoto = localStorage.getItem(
  `profilePhoto_${user.id}`
);

if (savedPhoto) {
  setPhoto(savedPhoto);
}
    setProfile(data);
    setForm(data);

  })
  .catch(err => {
    console.log("GETME ERROR =", err);
  })
  .finally(() => {
    setLoading(false);
  });
}, []);
  // ── Modal changement mot de passe ──
  const [showModal, setShowModal] = useState(false);
  const [pwForm, setPwForm] = useState({ old: "", new: "", confirm: "" });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);
  
  const [pwLoading, setPwLoading] = useState(false);

  const openModal = () => {
    setPwForm({ old: "", new: "", confirm: "" });
    setPwError("");
    setPwSuccess(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setPwError("");
    setPwSuccess(false);
  };

  const handleChangePassword = async () => {

  if (!pwForm.old) {
    setPwError("Saisissez votre ancien mot de passe");
    return;
  }

  if (pwForm.new.length < 8) {
    setPwError(
      "Le mot de passe doit contenir au moins 8 caractères"
    );
    return;
  }

  if (!/[A-Z]/.test(pwForm.new)) {
    setPwError(
      "Le mot de passe doit contenir au moins une majuscule"
    );
    return;
  }

  if (!/[0-9]/.test(pwForm.new)) {
    setPwError(
      "Le mot de passe doit contenir au moins un chiffre"
    );
    return;
  }

  if (pwForm.new !== pwForm.confirm) {
    setPwError(
      "Les mots de passe ne correspondent pas"
    );
    return;
  }

  try {

    const token = localStorage.getItem("token");

    await axios.post(
      "http://localhost:8000/auth/change-password",
      {
        old_password: pwForm.old,
        new_password: pwForm.new
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setPwError("");

    setPwSuccess(true);

  } catch (err) {

    setPwError(
      err?.response?.data?.detail ||
      "Erreur lors du changement du mot de passe"
    );
  }
};

  const handleSave = async () => {

  console.log("PROFILE =", profile);
  console.log("FORM =", form);

  try {

    const res = await userService.update(profile.id, {
  full_name: form.nom,
  prenom: form.prenom,
  email: form.email,
  telephone: form.telephone,
  departement: form.departement,
  site: form.site
});
localStorage.setItem(
  "profileNom",
  `${form.nom} ${form.prenom || ""}`
);

window.dispatchEvent(
  new Event("profileUpdated")
);

    console.log("RESPONSE =", res);

    setProfile({ ...form });

    setEditMode(false);

    alert("Profil modifié avec succès");
    
console.log(localStorage.getItem("profileNom"))

  } catch (err) {

    console.log("ERROR =", err);

    alert("Erreur modification");

  }
};

  const handlePhotoChange = (e) => {
    
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setPhoto(dataUrl);
     localStorage.setItem(
  `profilePhoto_${profile.id}`,
  dataUrl
);
      window.dispatchEvent(new Event("profileUpdated"));
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    localStorage.removeItem(
  `profilePhoto_${profile.id}`
);
    window.dispatchEvent(new Event("profileUpdated"));
  };

  const initials = `${profile?.nom || ""} ${profile?.prenom || ""}`
  .trim()
  .substring(0, 2)
  .toUpperCase();
  const fields = [
    { label: "Nom", key: "nom", icon: User },
    { label: "Prénom", key: "prenom", icon: User },
    { label: "Email", key: "email", icon: Mail },
    { label: "Téléphone", key: "telephone", icon: Phone },
    { label: "Département", key: "departement", icon: Building },
    { label: "Site", key: "site", icon: Building },
    { label: "Rôle", key: "role", icon: Shield, readOnly: true },
    { label: "Date d'inscription", key: "dateInscription", icon: Calendar, readOnly: true },
  ];

  const inputStyle = {
    width: "100%", padding: "11px 14px",
    border: "1.5px solid rgba(255,255,255,0.15)",
    borderRadius: 9, background: "rgba(255,255,255,0.08)",
    color: "#f1f5f9", fontSize: 14, outline: "none",
    boxSizing: "border-box",
  };

if (loading) {
  return <div style={{padding:40, background:C.bg, minHeight:"100vh", color:C.text}}>Chargement...</div>
}

if (!profile) {
  return <div style={{padding:40, background:C.bg, minHeight:"100vh", color:C.text}}>Erreur profil</div>
}

  return (
    <div style={{ padding: "2rem", maxWidth: 820, margin: "0 auto", background: C.bg, minHeight: "100vh", transition: "background 0.3s" }}>

      {/* Breadcrumb */}
      <div style={{ fontSize: 13, color: C.muted, marginBottom: 20, display: "flex", gap: 6, alignItems: "center" }}>
        <span style={{ color: "#16a34a", cursor: "pointer", fontWeight: 500 }} onClick={() => navigate("/dashboard")}>Accueil</span>
        <span>›</span>
        <span>Mon profil</span>
      </div>

      {/* Header card */}
      <div style={{
        background: "linear-gradient(135deg, #2d6a1f 0%, #4a9e2f 100%)",
        borderRadius: 16, padding: "28px 32px", marginBottom: 24,
        display: "flex", alignItems: "center", gap: 24,
        boxShadow: "0 4px 20px rgba(74,158,47,0.25)",
      }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{
            width: 80, height: 80, borderRadius: "50%",
            background: photo ? "transparent" : "rgba(255,255,255,0.2)",
            border: "3px solid rgba(255,255,255,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 26, fontWeight: 800, color: "#fff", overflow: "hidden",
          }}>
            {photo ? <img src={photo} alt="profil" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
          </div>
          <button onClick={() => fileInputRef.current.click()} title="Changer la photo" style={{
            position: "absolute", bottom: 0, right: 0,
            width: 26, height: 26, borderRadius: "50%",
            background: "#fff", border: "2px solid #16a34a",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", padding: 0,
          }}>
            <Camera size={13} color="#16a34a" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoChange} />
        </div>

        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#fff" }}>{profile.nom} {profile.prenom}</h2>
          <p style={{ margin: "4px 0 6px", color: "rgba(255,255,255,0.8)", fontSize: 13 }}>{profile.email}</p>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{
              background: "rgba(255,255,255,0.2)", color: "#fff",
              borderRadius: 20, padding: "3px 14px", fontSize: 12, fontWeight: 700,
              border: "1px solid rgba(255,255,255,0.4)",
            }}>{profile.role}</span>
            {photo && (
              <button onClick={handleRemovePhoto} style={{
                background: "rgba(220,38,38,0.3)", color: "#fff",
                border: "1px solid rgba(255,255,255,0.3)", borderRadius: 20,
                padding: "3px 12px", fontSize: 11, cursor: "pointer", fontWeight: 600,
              }}>Supprimer la photo</button>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {editMode ? (
            <>
              <button onClick={handleSave} style={{
                background: "#fff", color: "#16a34a", border: "none", borderRadius: 9,
                padding: "10px 18px", cursor: "pointer", fontWeight: 700, fontSize: 13,
                display: "flex", alignItems: "center", gap: 6,
              }}><Save size={14} /> Enregistrer</button>
              <button onClick={() => { setForm({ ...profile }); setEditMode(false); }} style={{
                background: "rgba(255,255,255,0.15)", color: "#fff",
                border: "1px solid rgba(255,255,255,0.3)", borderRadius: 9,
                padding: "10px 14px", cursor: "pointer", fontWeight: 600, fontSize: 13,
                display: "flex", alignItems: "center", gap: 6,
              }}><X size={14} /> Annuler</button>
            </>
          ) : (
            <button onClick={() => setEditMode(true)} style={{
              background: "rgba(255,255,255,0.15)", color: "#fff",
              border: "1px solid rgba(255,255,255,0.4)", borderRadius: 9,
              padding: "10px 18px", cursor: "pointer", fontWeight: 600, fontSize: 13,
              display: "flex", alignItems: "center", gap: 6,
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
            ><Edit3 size={14} /> Modifier</button>
          )}
        </div>
      </div>

      {/* Statut */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, marginBottom: 24,
        padding: "10px 16px", background: C.greenBg,
        border: `1px solid ${C.greenBorder}`, borderRadius: 10, width: "fit-content",
      }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#16a34a", display: "inline-block" }} />
        <span style={{ fontSize: 13, color: "#16a34a", fontWeight: 600 }}>Compte actif — {profile.site}</span>
      </div>

      {/* Informations */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "24px 28px", marginBottom: 20, transition: "background 0.3s" }}>
        <h3 style={{
          margin: "0 0 20px", fontSize: 15, fontWeight: 700, color: C.text,
          paddingBottom: 14, borderBottom: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", gap: 8,
        }}><User size={16} color="#16a34a" /> Informations personnelles</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 28px" }}>
          {fields.map(({ label, key, icon: Icon, readOnly }) => (
            <div key={key}>
              <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.muted, marginBottom: 6, fontWeight: 600 }}>
                <Icon size={12} color={C.muted} /> {label}
              </label>
              {editMode && !readOnly ? (
                <input
                  value={form[key]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${C.inputBorder}`, borderRadius: 8, background: C.inputBg, color: C.text, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                  onFocus={e => e.target.style.borderColor = "#16a34a"}
                  onBlur={e => e.target.style.borderColor = C.inputBorder}
                />
              ) : (
                <div style={{ padding: "9px 0", fontSize: 14, fontWeight: 500, color: readOnly ? C.muted : C.text }}>
                  {profile[key]}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Securite */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "24px 28px", transition: "background 0.3s" }}>
        <h3 style={{
          margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: C.text,
          paddingBottom: 14, borderBottom: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", gap: 8,
        }}><Lock size={16} color="#16a34a" /> Securite</h3>
        <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>Modifiez votre mot de passe pour securiser votre compte.</p>
        <button
          onClick={openModal}
          style={{
            background: C.greenBg, color: "#16a34a",
            border: "1.5px solid #16a34a", borderRadius: 9,
            padding: "10px 22px", cursor: "pointer",
            fontWeight: 700, fontSize: 13,
            display: "flex", alignItems: "center", gap: 8,
          }}
          onMouseEnter={e => e.currentTarget.style.background = dark ? "rgba(22,163,74,0.25)" : "#dcfce7"}
          onMouseLeave={e => e.currentTarget.style.background = C.greenBg}
        ><Lock size={14} /> Changer le mot de passe</button>
      </div>

      {/* ── MODAL Changement de mot de passe ── */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }} onClick={closeModal}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "linear-gradient(135deg, #0d1b2e 0%, #0d2137 50%, #0a3d2e 100%)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 18, padding: "36px 32px", width: 420,
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            {/* Header modal */}
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{
                width: 48, height: 48, background: "#7dba3a", borderRadius: 12,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 900, color: "#fff", fontSize: 14, margin: "0 auto 12px",
              }}>OCP</div>
              <h2 style={{ color: "#f1f5f9", fontSize: 20, fontWeight: 700, margin: "0 0 6px" }}>Changer le mot de passe</h2>
              <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>Saisissez votre ancien mot de passe puis le nouveau</p>
            </div>

            {pwSuccess ? (

  <div
    style={{
      textAlign: "center",
      padding: "20px 0"
    }}
  >

    <div
      style={{
        width: "90px",
        height: "90px",
        borderRadius: "50%",
        background: "#dcfce7",
        margin: "0 auto 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <ShieldCheck
        size={55}
        color="#16a34a"
        strokeWidth={2.5}
      />
    </div>

    <h2
      style={{
        color: "#fff",
        marginBottom: "10px"
      }}
    >
      Mot de passe modifié
    </h2>

    <p
      style={{
        color: "#cbd5e1",
        marginBottom: "25px"
      }}
    >
      Votre compte a été sécurisé avec succès.
    </p>

    <button
      onClick={() => {

        localStorage.removeItem("token");
        localStorage.removeItem("role");

        window.location.href = "/";

      }}
      style={{
        background: "#00A651",
        color: "#fff",
        border: "none",
        borderRadius: "12px",
        padding: "12px 26px",
        cursor: "pointer",
        fontWeight: "700"
      }}
    >
      Se reconnecter
    </button>

  </div>

) : (
              <>
                {/* Ancien mot de passe */}
                {[
                  { label: "Ancien mot de passe", key: "old", show: showOld, toggle: () => setShowOld(v => !v) },
                  { label: "Nouveau mot de passe", key: "new", show: showNew, toggle: () => setShowNew(v => !v) },
                  { label: "Confirmer le nouveau", key: "confirm", show: showConfirm, toggle: () => setShowConfirm(v => !v) },
                ].map(({ label, key, show, toggle }) => (
                  <div key={key} style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, display: "block", marginBottom: 6 }}>{label}</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={show ? "text" : "password"}
                        value={pwForm[key]}
                        onChange={e => setPwForm(prev => ({ ...prev, [key]: e.target.value }))}
                        style={{ ...inputStyle, paddingRight: 42 }}
                        onFocus={e => e.target.style.borderColor = "#7dba3a"}
                        onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.15)"}
                        placeholder="••••••••"
                      />
                      <button onClick={toggle} style={{
                        position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                        background: "none", border: "none", cursor: "pointer", padding: 0,
                        color: "#94a3b8", display: "flex", alignItems: "center",
                      }}>
                        {show ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                ))}

                {pwError && (
                  <p style={{ color: "#f87171", fontSize: 13, textAlign: "center", marginBottom: 12 }}>{pwError}</p>
                )}

                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                  <button
                    onClick={handleChangePassword}
                    disabled={pwLoading}
                    style={{
                      flex: 1, padding: "12px", background: "#7dba3a",
                      color: "#fff", border: "none", borderRadius: 9,
                      cursor: "pointer", fontSize: 14, fontWeight: 700,
                      opacity: pwLoading ? 0.7 : 1,
                    }}
                  >{pwLoading ? "Modification..." : "Confirmer"}</button>
                  <button
                    onClick={closeModal}
                    style={{
                      flex: 1, padding: "12px",
                      background: "rgba(255,255,255,0.08)", color: "#94a3b8",
                      border: "1px solid rgba(255,255,255,0.15)", borderRadius: 9,
                      cursor: "pointer", fontSize: 14, fontWeight: 600,
                    }}
                  >Annuler</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}