from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import sensors, alerts, incidents, ai, thresholds, auth, users, notifications  # ← ajouter
from app.database.connection import engine, SessionLocal
from app.database import init_db
from app.models.sensor import SensorReading
from app.services.sensor_service import load_csv_to_db
import threading, random, time
from datetime import datetime
from app.routers.intervention_reports import router as reports_router
app = FastAPI(title="PFE OCP Dashboard API", version="1.0.0")

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(reports_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SENSORS = [
    ('PF-N','N (Azote)','PRODUIT FINI','%',10.5,12.5),
    ('PF-P2O5','P2O5','PRODUIT FINI','%',43.0,47.0),
    ('PF-K2O','K2O','PRODUIT FINI','%',13.5,16.5),
    ('PF-S','Soufre','PRODUIT FINI','%',4.5,8.0),
    ('PF-B','Alesage','PRODUIT FINI','%',0.02,0.20),
    ('PF-TG24','T.G [2-4]','PRODUIT FINI','%',84.0,96.0),
    ('PF-TG14','T.G [1-4]','PRODUIT FINI','%',90.0,99.0),
    ('FIC-001','ACP 29% contre PN','PN','m3/h',50.0,65.0),
    ('FIC-002','Liquide Lavage AD01','PN','m3/h',45.0,60.0),
    ('FIC-003','ACP 54% contre PN','PN','m3/h',48.0,62.0),
    ('FIC-004','H2SO4 vers PN','PN','m3/h',50.0,60.0),
    ('FIC-028','Pulpe versus PN','PN','m3/h',7.0,10.0),
    ('FIC-008','NH3 GAZ vers PN','PN','T/h',40.0,50.0),
    ('TI-027','Temp Bouille','PN','C',95.0,115.0),
    ('FI-669','NH3 liq AE05','PN','T/h',2.0,4.0),
    ('FI-655','NH3 liq AE04','PN','T/h',90.0,110.0),
    ('DEN-PN','Densite PN','PN','kg/m3',1200.0,1300.0),
    ('RM-PN','Rapport Molaire PN','PN','-',1.4,1.6),
    ('FIC-033','Bouille AP01','Granulateur','T/h',25.0,35.0),
    ('FIC-043','Bouille KP01','Granulateur','T/h',25.0,35.0),
    ('FIC-072','NH3 Liq AM03','Granulateur','T/h',25.0,35.0),
    ('FIC-053A','ACP 54% AM03','Granulateur','m3/h',25.0,35.0),
    ('IW-471','Additif AW01','Granulateur','T/h',25.0,35.0),
    ('WI-481','Additif AW02','Granulateur','T/h',25.0,35.0),
    ('RM-SAG','RM S/AG','Granulateur','-',1.4,1.6),
    ('FIC-500','LL AR02 vers AD01','Lavage','m3/h',10.0,20.0),
    ('FIC-501','ACP 29% AD01','Lavage','m3/h',10.0,20.0),
    ('FIC-007','NH3 Gaine PN','Lavage','T/h',10.0,20.0),
    ('TI-504','Temp AD01','Lavage','C',50.0,80.0),
    ('LIC-503','Niveau AD01','Lavage','%',30.0,80.0),
    ('PDI-496','Depression AD01','Lavage','mm',15.0,25.0),
    ('DEN-D01','Densite AD01','Lavage','kg/m3',1100.0,1300.0),
    ('RM-D01','RM AD01','Lavage','-',1.0,1.5),
    ('FIC-544','ACP 29% AR02','Lavage','m3/h',10.0,20.0),
    ('FIC-545','Liq Fosse AR02','Lavage','m3/h',10.0,20.0),
    ('FIC-564','ACP 54% AR02','Lavage','m3/h',10.0,20.0),
    ('FIC-645','LL AD04 AR02','Lavage','m3/h',10.0,20.0),
    ('FI-766','Eau Brute','Lavage','m3/h',10.0,20.0),
    ('LIC-543','Niveau AR02','Lavage','%',30.0,80.0),
    ('TI-524','Temp AD02','Lavage','C',50.0,80.0),
    ('TI-534','Temp AD03','Lavage','C',50.0,80.0),
    ('DPI-523','Depression AD02','Lavage','mm',-50.0,-10.0),
    ('DPI-533','Depression AD03','Lavage','mm',-50.0,-10.0),
    ('DEN-R02','Densite AR02','Lavage','kg/m3',1100.0,1300.0),
    ('RM-R02','RM AR02','Lavage','-',0.8,1.2),
    ('TI-138','Temp Gaz Sortie','Sechage','C',85.0,130.0),
    ('PI-159','Depression AF01','Sechage','mm',28.0,35.0),
    ('ZI-586','Pct Volet AC01','Sechage','%',25.0,35.0),
    ('SI-122','Vitesse AC06','Sechage','tr/min',28.0,35.0),
    ('TI-216','Temp Produit','Sechage','C',25.0,35.0),
    ('HUM-TQ','Humidite','Sechage','%',0.5,3.0),
    ('FIC-384','Enrobage vers AM04','Enrobage','Kg/h',25.0,35.0),
    ('WI-407','Bascule AT07','Enrobage','T/h',25.0,35.0),
    ('RAT-CON','RATIO Consigne','Enrobage','-',0.8,1.2),
    ('RAT-REL','RATIO Reel','Enrobage','-',0.8,1.2),
    ('PI-385','Pression Pulv','Enrobage','Bar',2.0,6.0),
    ('TIC-716','Temp Bac Tampon','Enrobage','C',60.0,80.0),
    ('TIC-717','Temp Asp Pompe','Enrobage','C',55.0,75.0),
    ('ANA-RM-PN','RM PN (Analyse)','Analyses','-',1.4,1.6),
    ('ANA-DEN-PN','Densite PN (Analyse)','Analyses','kg/m3',1200.0,1300.0),
    ('ANA-RM-D01','RM AD01 (Analyse)','Analyses','-',1.0,1.5),
    ('ANA-DEN-D01','Densite AD01 (Analyse)','Analyses','kg/m3',1100.0,1300.0),
    ('ANA-RM-R02','RM AR02 (Analyse)','Analyses','-',0.8,1.2),
    ('ANA-DEN-R02','Densite AR02 (Analyse)','Analyses','kg/m3',1100.0,1300.0),
    ('ANA-RM-SAG','RM SAG (Analyse)','Analyses','-',1.3,1.6),
]

def simulate_realtime():
    time.sleep(20)
    while True:
        try:
            db = SessionLocal()
            ts = datetime.utcnow()
            for sid, name, ligne, unit, vmin, vmax in SENSORS:
                val = round(random.uniform(vmin, vmax), 2)
                r = SensorReading(
                    timestamp=ts, ligne=ligne,
                    sensor_id=sid, sensor_name=name,
                    value=val, unit=unit
                )
                db.add(r)
            db.commit()
            db.close()
        except Exception as e:
            print(f"Simulation error: {e}")
        time.sleep(10)

@app.on_event("startup")
async def startup_event():
    init_db.create_tables()
    load_csv_to_db()
    t = threading.Thread(target=simulate_realtime, daemon=True)
    t.start()
    print("Realtime simulation started")

app.include_router(sensors.router,       prefix="/sensors",       tags=["sensors"])
app.include_router(alerts.router,        prefix="/alerts",        tags=["alerts"])
app.include_router(incidents.router,     prefix="/incidents",     tags=["incidents"])
app.include_router(ai.router,            prefix="/ai",            tags=["ai"])
app.include_router(thresholds.router,    prefix="/thresholds",    tags=["thresholds"])
app.include_router(notifications.router, prefix="/notifications", tags=["notifications"])  # ← nouveau

@app.get("/")
def root():
    return {"message": "PFE OCP Dashboard API is running"}