import React from "react";
import { useNavigate } from "react-router-dom";

export default function RoleSelect() {
  const navigate = useNavigate();
  const goTo = (role) => {
    localStorage.setItem("selectedRole", role);
    navigate("/login", { state: { role } });
  };
  return (
    <div style={{ minHeight:"100vh", position:"relative", display:"flex", alignItems:"center", justifyContent:"center", padding:"48px 24px", fontFamily:"'Segoe UI', Arial, sans-serif", overflow:"hidden" }}>
      <img src="/roleSelect.png" alt="background" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", zIndex:0 }} />
      <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.52)", zIndex:1 }} />
      <div style={{ position:"relative", zIndex:2, width:"100%", maxWidth:920 }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <h1 style={{ fontSize:30, fontWeight:900, color:"#fff", margin:"0 0 10px" }}>Choisissez votre profil</h1>
          <p style={{ fontSize:15, color:"rgba(255,255,255,0.65)", margin:0 }}>
            Selectionnez votre role pour acceder au tableau de bord OCP Monitoring
          </p>
        </div>
        <div style={{ display:"flex", gap:"1.5rem", flexWrap:"wrap", justifyContent:"center" }}>
          <RoleCard role="admin" accentColor="#7dba3a" icon={<IconShield />}
            title="Administrateur"
            desc="Gerez la plateforme, les utilisateurs et les configurations globales"
            features={["Gestion des utilisateurs","Configuration des seuils","Supervision globale de la production","Consultation des alertes et incidents"]}
            btnLabel="Connexion Admin" onSelect={goTo} />
          <RoleCard role="operateur" accentColor="#006DB7" icon={<IconActivity />}
            title="Operateur"
            desc="Surveillez les lignes de production et signalez les anomalies en temps reel"
            features={["Surveillance des capteurs en temps reel","Consultation des alertes de production","Suivi des indicateurs de qualite","Consultation du journal des incidents"]}
            btnLabel="Connexion Operateur" onSelect={goTo} />
          <RoleCard role="technicien" accentColor="#475569" icon={<IconChart />}
            title="Technicien Maintenance"
            desc="Intervenez rapidement sur les incidents et assurez la continuite de production"
            features={["Consultation des alertes","Gestion et traitement des incidents","Ajout des rapports d'intervention","Assistance a la resolution des anomalies"]}
            btnLabel="Connexion Technicien" onSelect={goTo} />
        </div>
      </div>
    </div>
  );
}

function RoleCard({ role, accentColor, icon, title, desc, features, btnLabel, onSelect }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div style={{ background:"#ffffff", borderRadius:24, padding:"2.2rem 1.8rem 1.8rem", width:268, display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", transition:"transform 0.25s ease, box-shadow 0.25s ease", transform:hovered?"translateY(-6px)":"translateY(0)", boxShadow:hovered?"0 20px 50px rgba(0,0,0,0.35)":"0 8px 30px rgba(0,0,0,0.22)" }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div style={{ color:accentColor, marginBottom:"1rem" }}>{icon}</div>
      <h2 style={{ fontSize:20, fontWeight:800, color:"#0d1b2e", marginBottom:"0.6rem" }}>{title}</h2>
      <p style={{ fontSize:13.5, color:"#475569", lineHeight:1.65, marginBottom:"1.2rem", fontWeight:600, minHeight:56 }}>{desc}</p>
      <ul style={{ listStyle:"none", padding:0, margin:"0 0 1.6rem", textAlign:"left", width:"100%" }}>
        {features.map((f) => (
          <li key={f} style={{ fontSize:13, color:"#334155", padding:"4px 0", display:"flex", alignItems:"flex-start", gap:8 }}>
            <span style={{ color:accentColor, fontWeight:700 }}>&#10003;</span>{f}
          </li>
        ))}
      </ul>
      <button style={{ width:"100%", padding:"13px 16px", borderRadius:10, border:"none", background:accentColor, color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}
        onClick={() => onSelect(role)}
        onMouseEnter={e => e.currentTarget.style.opacity="0.88"}
        onMouseLeave={e => e.currentTarget.style.opacity="1"}>{btnLabel}</button>
    </div>
  );
}

function IconShield() {
  return (<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l7 4v5c0 4.5-3 8-7 9-4-1-7-4.5-7-9V7z"/><path d="M9 12l2 2 4-4"/></svg>);
}
function IconActivity() {
  return (<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>);
}
function IconChart() {
  return (<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="12" width="4" height="8"/><rect x="10" y="7" width="4" height="13"/><rect x="17" y="3" width="4" height="17"/></svg>);
}