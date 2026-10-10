import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Gauge,
  Bell,
  ClipboardList,
  Bot,
  Users,
  Settings
} from "lucide-react";

import {
  Target,
  Zap,
  BrainCircuit,
  ShieldCheck,
  Factory
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const green = "#7dba3a";
  const logo  = "/logo_ocp.png";

  const features = [
    {
      icon: <Gauge size={42} color="#8CC63F" />,
      title: "Dashboard Temps Réel",
      desc: "Visualisation en direct des données de production."
    },
    {
      icon: <Bell size={42} color="#8CC63F" />,
      title: "Alertes Intelligentes",
      desc: "Système d'alertes avancées et personnalisables."
    },
    {
      icon: <ClipboardList size={42} color="#8CC63F" />,
      title: "Journal des Incidents",
      desc: "Historique complet des événements et anomalies."
    },
    {
      icon: <Bot size={42} color="#8CC63F" />,
      title: "Assistant IA",
      desc: "Assistant intelligent pour l'analyse et le diagnostic."
    },
    {
      icon: <Users size={42} color="#8CC63F" />,
      title: "Gestion des Utilisateurs",
      desc: "Gestion des rôles et permissions des utilisateurs."
    },
    {
      icon: <Settings size={42} color="#8CC63F" />,
      title: "Paramètres & Seuils",
      desc: "Configuration des seuils et paramètres de production."
    }
  ];

  const slides = [
    {
      image: "/hero1.jpg",
      title: "Cultiver aujourd'hui pour nourrir demain",
      subtitle: "ENGAGÉS POUR L'AVENIR",
      description:
        "OCP Manufacturing accompagne les opérateurs, les responsables de site et les équipes qualité tout au long du processus de production d'engrais NPK en temps réel."
    },
    {
      image: "/hero2.jpg",
      title: "L'excellence industrielle au service de la qualité",
      subtitle: "PERFORMANCE INDUSTRIELLE",
      description:
        "Surveillez les lignes de production, analysez les données des capteurs et garantissez une qualité optimale à chaque étape du processus."
    },
    {
      image: "/hero3.jpg",
      title: "De la matière première au produit fini",
      subtitle: "PRODUCTION INTELLIGENTE",
      description:
        "Un suivi en temps réel des paramètres critiques pour assurer la conformité et la traçabilité des engrais produits."
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ margin: 0, padding: 0, fontFamily: "'Segoe UI', Arial, sans-serif" }}>

      {/* NAVBAR */}
      <nav style={{
        display: "flex", alignItems: "center",
        padding: "0 36px", height: 64, background: "transparent",
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 999,
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}>
        <img src={logo} alt="OCP" style={{ height: 98, objectFit: "contain", filter: "brightness(1.20) contrast(1.1)" }} />

        <div style={{ flex: 1, display: "flex", justifyContent: "center", gap: 40 }}>
          {[
            { label: "Accueil",                 href: "#home"     },
            { label: "À propos",                href: "#about"    },
            { label: "Fonctionnalités",         href: "#features" },
            { label: "Processus de Production", href: "#stats"    },
            { label: "Contact",                 href: "#footer"   },
          ].map(({ label, href }) => (
            <a key={label} href={href} style={{
              color: "rgba(255,255,255,0.85)", fontSize: 15,
              textDecoration: "none", fontWeight: 600, letterSpacing: 0.3,
            }}
            onMouseEnter={e => e.target.style.color = green}
            onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.85)"}
            >{label}</a>
          ))}
        </div>

        <button onClick={() => navigate("/role-select")} style={{
          padding: "9px 24px", borderRadius: 8,
          background: green, border: "none",
          color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
        onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >Se connecter</button>
      </nav>

      {/* HERO */}
      <div
        id="home"
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          backgroundImage: `url(${slides[currentSlide].image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transition: "all 5s ease-in-out"
        }}
      >
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(0,0,0,0.50)",
          zIndex: 1,
        }} />
        <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
          <div style={{
            color: "#8BC53F",
            fontWeight: 800,
            letterSpacing: 3,
            marginBottom: 15,
            textTransform: "uppercase",
          }}>
            {slides[currentSlide].subtitle}
          </div>
          <h1 style={{
            fontSize: 56,
            fontWeight: 900,
            color: "#fff",
            margin: "0 0 18px",
            lineHeight: 1.2,
          }}>
            {slides[currentSlide].title}
          </h1>
          <p style={{
            fontSize: 22,
            color: "rgba(255,255,255,0.88)",
            maxWidth: 900,
            margin: "0 auto 36px",
            lineHeight: 1.8,
          }}>
            {slides[currentSlide].description}
          </p>
        </div>
      </div>

      {/* ABOUT */}
      <div id="about" style={{ background: "#fff", padding: "52px 40px", textAlign: "center" }}>
        <h2 style={{
          fontSize: 20, fontWeight: 900, color: green,
          textTransform: "uppercase", letterSpacing: 2, marginBottom: 10,
        }}>À propos de la surveillance OCP</h2>
        <div style={{ width: 70, height: 4, background: green, margin: "0 auto 24px", borderRadius: 2 }} />
        <p style={{
          fontSize: 15, color: "#4a5568",
          maxWidth: 600, margin: "0 auto 28px", lineHeight: 1.9,
        }}>
          Le suivi de la qualité de production est aujourd'hui marqué par une forte complexité.<br />
          OCP Manufacturing est né pour centraliser les données capteurs de toutes les lignes de production
          d'engrais, détecter les anomalies et assister les opérateurs en temps réel.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          {["Accompagnement", "Traçabilité", "Professionnalisation"].map(label => (
            <span key={label} style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "9px 22px", borderRadius: 99,
              border: `2px solid ${green}`, color: green,
              fontSize: 14, fontWeight: 700,
            }}>&#10003; {label}</span>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <div id="features" style={{
        backgroundImage: "url('/fonctionnalites-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        padding: "100px 40px"
      }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <p style={{ color: "#8CC63F", fontWeight: 800, letterSpacing: 2, marginBottom: 10 }}>
            NOS FONCTIONNALITÉS
          </p>
          <h2 style={{ fontSize: 42, fontWeight: 900, color: "#041937", marginBottom: 10 }}>
            Une Plateforme Complète
          </h2>
          <div style={{ width: 70, height: 4, background: "#8CC63F", margin: "0 auto", borderRadius: 10 }} />
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "30px",
          maxWidth: "1200px",
          margin: "0 auto"
        }}>
          {features.map((feature) => (
            <div
              key={feature.title}
              style={{
                background: "#fff",
                borderRadius: 20,
                padding: 35,
                textAlign: "center",
                boxShadow: "0 8px 25px rgba(0,0,0,.08)",
                transition: "0.3s"
              }}
            >
              <div style={{ marginBottom: 20 }}>{feature.icon}</div>
              <h3 style={{ color: "#041937", fontSize: 20, marginBottom: 15, minHeight: 50 }}>
                {feature.title}
              </h3>
              <p style={{ color: "#64748b", lineHeight: 1.7, fontSize: 14 }}>
                {feature.desc}
              </p>
              <div style={{ width: 50, height: 3, background: "#8CC63F", margin: "20px auto 0", borderRadius: 10 }} />
            </div>
          ))}
        </div>
      </div>

      {/* STATS / PROCESSUS */}
      <div id="stats" style={{
        backgroundImage: "url('/process-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        padding: "100px 40px"
      }}>
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <p style={{ color: "#8CC63F", fontWeight: "800", letterSpacing: "2px", marginBottom: "10px" }}>
            NOS LIGNES DE PRODUCTION
          </p>
          <h2 style={{ fontSize: "48px", fontWeight: "900", color: "#041937", marginBottom: "20px" }}>
            Processus de Production Surveillé
          </h2>
          <p style={{ color: "#64748b", maxWidth: "850px", margin: "auto", lineHeight: "1.8" }}>
            Suivez en temps réel chaque étape de production à travers nos lignes automatisées afin de garantir une qualité optimale des engrais NPK.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(350px,1fr))", gap: "30px" }}>
          {[
            {
              num: "01", title: "PN", img: "/pn.jpg",
              desc: "Unité de neutralisation assurant la préparation et le contrôle des réactions chimiques nécessaires à la production des engrais NPK.",
              sensors: ["Température", "Débit", "pH"]
            },
            {
              num: "02", title: "Granulateur", img: "/granulateur.jpg",
              desc: "Transformation de la matière première en granulés homogènes grâce au procédé de granulation contrôlée.",
              sensors: ["Vitesse tambour", "Humidité", "Taille granulés"]
            },
            {
              num: "03", title: "Lavage", img: "/lavage.jpg",
              desc: "Étape dédiée à l'élimination des résidus et à l'amélioration de la qualité des granulés avant traitement thermique.",
              sensors: ["Débit eau", "Filtration", "Conductivité"]
            },
            {
              num: "04", title: "Séchage", img: "/sechage.jpg",
              desc: "Réduction contrôlée du taux d'humidité afin d'assurer la stabilité et la conformité du produit.",
              sensors: ["Température", "Humidité", "Temps de séjour"]
            },
            {
              num: "05", title: "Enrobage", img: "/enrobage.jpg",
              desc: "Application d'une couche protectrice sur les granulés pour améliorer leur conservation et leurs performances.",
              sensors: ["Débit solution", "Vitesse rotation", "Uniformité"]
            },
            {
              num: "06", title: "Produit Fini", img: "/produit-fini.jpg",
              desc: "Contrôle qualité final, stockage et préparation du produit conforme avant expédition.",
              sensors: ["N", "P₂O₅", "K₂O", "Humidité"]
            }
          ].map((step) => (
            <div
              key={step.title}
              style={{
                background: "#fff", borderRadius: "20px", overflow: "hidden",
                boxShadow: "0 5px 20px rgba(0,0,0,.08)", transition: "all .35s ease", cursor: "pointer"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-10px) scale(1.03)";
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 5px 20px rgba(0,0,0,.08)";
              }}
            >
              <img src={step.img} alt={step.title} style={{ width: "100%", height: "180px", objectFit: "cover" }} />
              <div style={{ padding: "18px" }}>
                <div style={{
                  width: "55px", height: "55px", borderRadius: "50%",
                  background: "#8CC63F", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: "800", fontSize: "18px", marginBottom: "15px"
                }}>
                  {step.num}
                </div>
                <h3 style={{ color: "#2e7d32", fontSize: "22px", fontWeight: "800", marginBottom: "10px" }}>
                  {step.title}
                </h3>
                <p style={{ color: "#475569", lineHeight: "1.8", marginBottom: "20px" }}>
                  {step.desc}
                </p>
                <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "15px" }}>
                  {step.sensors.map(sensor => (
                    <div key={sensor} style={{ color: "#2e7d32", marginBottom: "10px", fontWeight: "600" }}>
                      ✓ {sensor}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ENGAGEMENTS */}
      <div style={{ background: "#fff", padding: "100px 40px", textAlign: "center", position: "relative" }}>
        <h5 style={{ color: "#7BC043", letterSpacing: "4px", fontWeight: "800", marginBottom: "15px" }}>
          NOS ENGAGEMENTS
        </h5>
        <h2 style={{ color: "#0B1F3A", fontSize: "48px", fontWeight: "900", marginBottom: "20px" }}>
          Une plateforme au service de l'excellence opérationnelle
        </h2>
        <p style={{ color: "#64748B", maxWidth: "700px", margin: "auto", marginBottom: "80px", fontSize: "18px", lineHeight: "1.8" }}>
          Nous mettons la donnée et l'intelligence au cœur de nos priorités
          pour garantir qualité, sécurité et performance.
        </p>
        <div style={{ width: "80%", height: "4px", background: "#7BC043", margin: "0 auto 70px", borderRadius: "10px" }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "30px" }}>
          {[
            { icon: <Target size={50} color="#7BC043" />,        title: "Qualité Produit",          text: "Assurer une conformité optimale des engrais produits."          },
            { icon: <Zap size={50} color="#7BC043" />,           title: "Réactivité",               text: "Détection rapide des anomalies et alertes en temps réel."       },
            { icon: <BrainCircuit size={50} color="#7BC043" />,  title: "Intelligence Artificielle", text: "Analyse avancée des données et recommandations intelligentes." },
            { icon: <ShieldCheck size={50} color="#7BC043" />,   title: "Traçabilité",              text: "Historique complet des données et des interventions."          },
            { icon: <Factory size={50} color="#7BC043" />,       title: "Performance",              text: "Optimisation continue des lignes de production."               },
          ].map((item, index) => (
            <div key={index} style={{ textAlign: "center" }}>
              <div style={{
                width: "110px", height: "110px", margin: "auto", borderRadius: "50%",
                background: "#FFFFFF", border: "3px solid #7BC043",
                boxShadow: "0 10px 30px rgba(123,192,67,.20)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "45px", marginBottom: "20px"
              }}>
                {item.icon}
              </div>
              <h3 style={{ color: "#0B1F3A", fontWeight: "800", marginBottom: "15px" }}>{item.title}</h3>
              <p style={{ color: "#64748B", lineHeight: "1.8" }}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div id="footer" style={{
        background: "linear-gradient(135deg, #071B35 0%, #0A2647 55%, #14532D 100%)",
        padding: "44px 40px 24px", textAlign: "center",
      }}>
        <div style={{ color: "#7BC043", fontSize: "13px", fontWeight: "700", letterSpacing: "4px", marginBottom: "15px", textTransform: "uppercase" }}>
          Excellence • Qualité • Innovation
        </div>
        <div style={{ width: "100px", height: "4px", background: "#7BC043", margin: "0 auto 25px", borderRadius: "20px" }} />
        <img src={logo} alt="OCP" style={{ height: 70, objectFit: "contain", marginBottom: 14, filter: "brightness(1.15) contrast(1.1)" }} />
        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, maxWidth: 500, margin: "0 auto 16px", lineHeight: 1.8 }}>
          Plateforme intelligente de surveillance de la qualité et des performances industrielles, assurant un suivi en temps réel des lignes de production d'engrais.
        </p>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 24 }}>
          &#128222; +212 522 924 000
        </p>
        <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.07)", marginBottom: 18 }} />
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginBottom: 16 }}>
          OCP Group 2026. Tous droits réservés.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 20 }}>
          {[
            { name: "Facebook",  href: "https://web.facebook.com/OCPGroupINT",      svg: <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> },
            { name: "Instagram", href: "https://www.instagram.com/ocpgroup/",        svg: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg> },
            { name: "X",         href: "https://x.com/ocpgroup",                     svg: <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
            { name: "LinkedIn",  href: "https://ma.linkedin.com/company/ocpgroup",   svg: <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg> },
            { name: "YouTube",   href: "https://www.youtube.com/ocpchannel",         svg: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
          ].map(({ name, href, svg }) => (
            <a key={name} href={href} target="_blank" rel="noopener noreferrer"
              style={{
                width: 40, height: 40, borderRadius: 8,
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", textDecoration: "none",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "#7BC043";
                e.currentTarget.style.transform = "translateY(-5px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
              title={name}
            >{svg}</a>
          ))}
        </div>
      </div>

    </div>
  );
}