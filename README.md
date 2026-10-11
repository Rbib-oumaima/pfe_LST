# 🏭 PFE OCP — Tableau de Bord Qualité Production

**Stack:** React.js (Frontend) + FastAPI Python (Backend) + PostgreSQL + Claude AI

---

## 📁 Structure du projet

```
pfe finale oumaima/
│
├── backend-pfe/
│   ├── app/
│   │   ├── database/
│   │   │   ├── connection.py
│   │   │   └── init_db.py
│   │   │
│   │   ├── dependencies/
│   │   │   └── auth.py
│   │   │
│   │   ├── models/
│   │   │   ├── incident.py
│   │   │   ├── intervention_report.py
│   │   │   ├── notification.py
│   │   │   ├── sensor.py
│   │   │   ├── threshold.py
│   │   │   └── user.py
│   │   │
│   │   ├── routers/
│   │   │   ├── ai.py
│   │   │   ├── alerts.py
│   │   │   ├── auth.py
│   │   │   ├── incidents.py
│   │   │   ├── intervention_reports.py
│   │   │   ├── notifications.py
│   │   │   ├── password_reset.py
│   │   │   ├── sensors.py
│   │   │   ├── thresholds.py
│   │   │   └── users.py
│   │   │
│   │   ├── schemas/
│   │   │   └── auth.py
│   │   │
│   │   ├── services/
│   │   │   ├── alert_engine.py
│   │   │   ├── claude_service.py
│   │   │   ├── security.py
│   │   │   ├── sensor_service.py
│   │   │   └── simulator.py
│   │   │
│   │   └── main.py
│   │
│   ├── data/
│   │   ├── capteurs.csv
│   │   ├── generate_data.py
│   │   └── load_to_db.py
│   │
│   ├── Dockerfile
│   └── requirements.txt
│
├── dashboard-pfe/
│   ├── public/
│   │   ├── assistant-ocp.png
│   │   ├── enrobage.jpg
│   │   ├── fonctionnalites-bg.png
│   │   ├── granulateur.jpg
│   │   ├── hero1.jpg
│   │   ├── hero2.jpg
│   │   ├── hero3.jpg
│   │   ├── lavage.jpg
│   │   ├── login.png
│   │   ├── logo_ocp.png
│   │   ├── page d'accueille.jpg
│   │   ├── pn.jpg
│   │   ├── produit-fini.jpg
│   │   ├── roleSelect.png
│   │   ├── sechage.jpg
│   │   └── sidebar-bg.png
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── alerts/
│   │   │   │   └── AlertPanel.jsx
│   │   │   ├── dashboard/
│   │   │   │   ├── KPICard.jsx
│   │   │   │   ├── LineChart.jsx
│   │   │   │   └── SensorGrid.jsx
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── SidebarContext.jsx
│   │   │   │   └── ThemeToggle.jsx
│   │   │   ├── FloatingAssistant.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── context/
│   │   │   └── ThemeContext.jsx
│   │   │
│   │   ├── hooks/
│   │   │   └── useRealtime.js
│   │   │
│   │   ├── pages/
│   │   │   ├── AIAssistant.jsx
│   │   │   ├── Alerts.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Journal.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── ProfileAdmin.jsx
│   │   │   ├── RapportIntervention.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   ├── RoleSelect.jsx
│   │   │   ├── Settings.jsx
│   │   │   └── Users.jsx
│   │   │
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── reportService.js
│   │   │
│   │   ├── styles/
│   │   │   └── global.css
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── favicon.ico
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
├── backup_ocp_dashboard.sql
├── docker-compose.yml
└── README.md
```

---

## 🗄️ ÉTAPE 1 — Configurer PostgreSQL

### Via Docker Compose (utilisé dans ce projet)
PostgreSQL est lancé automatiquement via `docker-compose.yml` avec les paramètres suivants :

```bash
docker compose up --build -d
```

Les conteneurs créés :
- `pfefinaleoumaima-postgres-1`  → PostgreSQL 15 Alpine (port 5432)
- `pfefinaleoumaima-backend-1`   → FastAPI (port 8000)
- `pfefinaleoumaima-frontend-1`  → React/Vite (port 3000)

### Paramètres de connexion
| Paramètre | Valeur |
|-----------|--------|
| Host | `localhost` |
| Port | `5432` |
| Database | `ocp_dashboard` |
| Username | `ocp_user` |
| Password | `ocp_password` |

### Vérifier la connexion
```bash
docker exec pfefinaleoumaima-postgres-1 psql -U ocp_user -d ocp_dashboard -c "\conninfo"
```

### Structure des 6 tables (créées automatiquement au démarrage)

```sql
-- Table des mesures capteurs (383 110 lignes simulées)
CREATE TABLE sensor_readings (
    id          SERIAL PRIMARY KEY,
    timestamp   TIMESTAMPTZ DEFAULT NOW(),
    ligne       VARCHAR,      -- PN, Granulateur, Lavage, Séchage, Enrobage, PRODUIT FINI
    sensor_id   VARCHAR,      -- FIC-001, TI-027, LIC-503...
    sensor_name VARCHAR,      -- Nom lisible du capteur
    value       DOUBLE PRECISION,
    unit        VARCHAR       -- °C, m3/h, T/h, %
);
-- Index
CREATE INDEX ix_sensor_readings_timestamp ON sensor_readings(timestamp);
CREATE INDEX ix_sensor_readings_sensor_id ON sensor_readings(sensor_id);
CREATE INDEX ix_sensor_readings_ligne     ON sensor_readings(ligne);

-- Table des incidents détectés (87 incidents)
CREATE TABLE incidents (
    id              SERIAL PRIMARY KEY,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    resolved_at     TIMESTAMPTZ,
    ligne           VARCHAR,
    sensor_id       VARCHAR,
    sensor_name     VARCHAR,
    value           VARCHAR,
    threshold_value VARCHAR,
    severity        VARCHAR,   -- CRITIQUE, AVERTISSEMENT
    status          VARCHAR,   -- OUVERT, RESOLU
    description     TEXT,
    action_taken    TEXT
);
-- Index
CREATE INDEX ix_incidents_created_at ON incidents(created_at);
CREATE INDEX ix_incidents_ligne      ON incidents(ligne);

-- Table des seuils configurables (18 seuils)
CREATE TABLE thresholds (
    id          SERIAL PRIMARY KEY,
    sensor_id   VARCHAR UNIQUE,
    sensor_name VARCHAR,
    ligne       VARCHAR,
    min_value   DOUBLE PRECISION,
    max_value   DOUBLE PRECISION,
    unit        VARCHAR,
    is_active   BOOLEAN DEFAULT TRUE
);

-- Table des utilisateurs (3 utilisateurs)
CREATE TABLE users (
    id                  SERIAL PRIMARY KEY,
    username            VARCHAR NOT NULL UNIQUE,
    password            VARCHAR NOT NULL,
    full_name           VARCHAR(100),
    prenom              VARCHAR(100),
    telephone           VARCHAR(30),
    departement         VARCHAR(100),
    site                VARCHAR(100),
    role                VARCHAR NOT NULL,   -- admin, technicien
    email               VARCHAR UNIQUE,
    is_active           BOOLEAN,
    created_at          TIMESTAMP,
    reset_token         VARCHAR,
    reset_token_expiry  TIMESTAMP
);

-- Table des notifications
CREATE TABLE notifications (
    id          SERIAL PRIMARY KEY,
    incident_id INTEGER REFERENCES incidents(id),
    -- autres colonnes selon votre modèle
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Table des rapports d'intervention
CREATE TABLE intervention_reports (
    id                 SERIAL PRIMARY KEY,
    incident_id        INTEGER NOT NULL REFERENCES incidents(id),
    technicien_id      INTEGER NOT NULL REFERENCES users(id),
    ligne              VARCHAR(100),
    capteur            VARCHAR(100),
    date_intervention  TIMESTAMPTZ,
    type_intervention  VARCHAR(100),  -- Corrective, Préventive, Urgence
    cause              VARCHAR(100),
    heure_debut        VARCHAR(20),
    heure_fin          VARCHAR(20),
    description        TEXT,
    action_effectuee   TEXT,
    pieces             TEXT,
    recommandations    TEXT,
    duree              VARCHAR(50),
    risque             VARCHAR(50),   -- Faible, Moyen, Élevé
    statut             VARCHAR(50),   -- Brouillon, Soumis, Validé
    created_at         TIMESTAMPTZ DEFAULT NOW()
);
```

### Requêtes utiles pour vérification
```sql
-- Nombre de lignes dans chaque table
SELECT 'sensor_readings'      AS table_name, COUNT(*) FROM sensor_readings
UNION ALL
SELECT 'incidents',                          COUNT(*) FROM incidents
UNION ALL
SELECT 'thresholds',                         COUNT(*) FROM thresholds
UNION ALL
SELECT 'users',                              COUNT(*) FROM users
UNION ALL
SELECT 'notifications',                      COUNT(*) FROM notifications
UNION ALL
SELECT 'intervention_reports',               COUNT(*) FROM intervention_reports;

-- Dernières mesures par capteur
SELECT DISTINCT ON (sensor_id)
    sensor_id, sensor_name, ligne, value, unit, timestamp
FROM sensor_readings
ORDER BY sensor_id, timestamp DESC;

-- Incidents ouverts
SELECT * FROM incidents WHERE status = 'OUVERT' ORDER BY created_at DESC;

-- Historique d'un capteur
SELECT timestamp, value FROM sensor_readings
WHERE sensor_id = 'TI-027'
ORDER BY timestamp DESC LIMIT 100;

-- Stats par ligne
SELECT ligne, COUNT(*) AS nb_lectures, ROUND(AVG(value)::numeric, 2) AS moyenne
FROM sensor_readings
GROUP BY ligne ORDER BY ligne;
```

### Vérifier depuis PowerShell
```powershell
# Voir toutes les tables
docker exec pfefinaleoumaima-postgres-1 psql -U ocp_user -d ocp_dashboard -c "\dt"

# Voir la structure d'une table
docker exec pfefinaleoumaima-postgres-1 psql -U ocp_user -d ocp_dashboard -c "\d intervention_reports"

# Compter les lignes
docker exec pfefinaleoumaima-postgres-1 psql -U ocp_user -d ocp_dashboard -c "SELECT COUNT(*) FROM sensor_readings;"
```

## ⚙️ ÉTAPE 2 — Lancer le Backend

```bash
# Le backend est lancé automatiquement via Docker Compose
docker compose up --build -d
```

L'API sera disponible sur : http://localhost:8000
Documentation Swagger : http://localhost:8000/docs

### Variables d'environnement (.env)
```env
DATABASE_URL=postgresql://ocp_user:ocp_password@postgres:5432/ocp_dashboard
GROQ_API_KEY=gsk_VOTRE_CLE_ICI
```

### Dépendances principales (installées automatiquement)
fastapi==0.143.0
fastapi-mail==1.6.8
SQLAlchemy==2.1.4
uvicorn==0.54.0
pandas==3.0.6


### Endpoints disponibles
- `GET /sensors/live` — Dernières valeurs de tous les capteurs
- `GET /sensors/live?ligne=PN` — Filtré par ligne
- `GET /sensors/history?sensor_id=TI-027` — Historique capteur
- `GET /alerts/active` — Alertes actives (seuils dépassés)
- `GET /incidents/` — Journal des incidents
- `PATCH /incidents/{id}` — Mettre à jour un incident
- `GET /reports/` — Lister les rapports d'intervention
- `POST /reports/` — Créer un rapport d'intervention
- `DELETE /reports/{id}` — Supprimer un rapport
- `GET /notifications/` — Lister les notifications
- `GET /thresholds/` — Lister les seuils
- `POST /thresholds/` — Créer/modifier un seuil
- `POST /ai/query` — Question à l'assistant IA (Groq)

---

## 🖥️ ÉTAPE 3 — Lancer le Frontend

```bash
# Le frontend est lancé automatiquement via Docker Compose
docker compose up --build -d
```

L'interface sera disponible sur : http://localhost:3000

> Le port interne est 5173 (Vite), exposé sur le port 3000 via Docker.

### Dépendances npm (installées automatiquement)
```json
"dependencies": {
  "axios": "^1.7.2",
  "date-fns": "^3.6.0",
  "lucide-react": "^0.383.0",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.23.1",
  "recharts": "^2.15.4"
}
```

### Scripts disponibles
```bash
npm run dev      # Mode développement
npm run build    # Build production
npm run preview  # Prévisualiser le build
```

### Configuration
```env
VITE_API_URL=http://localhost:8000
```

---

## 🐳 ÉTAPE 4 — Déploiement avec Docker (tout en une commande)

```bash
# À la racine du projet (où est docker-compose.yml)
docker compose up --build -d
```

Services lancés :
- PostgreSQL : localhost:**5432**
- Backend FastAPI : localhost:**8000**
- Frontend React : localhost:**3000**

### Variables d'environnement (backend-pfe/.env)
```env
DATABASE_URL=postgresql://ocp_user:ocp_password@postgres:5432/ocp_dashboard
GROQ_API_KEY=gsk_VOTRE_CLE_ICI
```

---

## 🔑 Obtenir une clé API Groq
1. Créer un compte sur https://console.groq.com
2. Aller dans API Keys → Create Key
3. Copier la clé dans `backend-pfe/.env`

---

## 📊 Données de simulation

Le fichier `data/generate_data.py` génère `capteurs.csv` avec **30 jours** de données simulées basées sur les vraies mesures OCP, avec un intervalle de **10 minutes** entre chaque mesure et **2% de chance d'anomalie** par lecture.

### Capteurs simulés par ligne

| Ligne | Capteurs |
|-------|---------|
| PN | FIC-001, FIC-002, FIC-003, FIC-004, FIC-028, FIC-008, TI-027 |
| Granulateur | FIC-033, FIC-043, FIC-072, FIC-053A |
| Lavage | FIC-500, TI-504, LIC-503, PDI-496 |
| Séchage | TI-138, PI-159, TI-216 |
| Enrobage | FIC-384, TIC-716 |
| Produit Fini | PF-N, PF-P2O5, PF-K2O, PF-TG24 |

---

## 🏗️ Architecture technique
[generate_data.py] → [capteurs.csv] → [PostgreSQL]
↓
[FastAPI Backend]
↓
[React Frontend] ← Rafraîchissement 5s
↓
[Groq API / llama-3.3-70b]
← Questions opérateurs
← Réponses en FR / EN / Darija

---

## 🤖 Assistant IA
- **Fournisseur** : Groq
- **Modèle** : `llama-3.3-70b-versatile`
- **Langues supportées** : Français, Anglais, Arabe classique, Darija marocain
- **Endpoint** : `POST /ai/query`

---

## 👨‍💻 Répartition du travail

| Oumaima (Backend) | Binôme (Frontend) |
|---|---|
| FastAPI + PostgreSQL | React + Recharts |
| sensor_service.py | Dashboard.jsx + KPICard |
| alert_engine.py | Alerts.jsx + AlertPanel |
| claude_service.py (Groq) | AIAssistant.jsx |
| generate_data.py | Journal.jsx + Settings.jsx |
| Docker + déploiement | Tests utilisateurs + UI |