from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, clinical, medicine, hospital, analytics, assistant
from app.database import init_db

app = FastAPI(
    title="CareBridge AI - Intelligent Healthcare Access Platform",
    description="Full-stack healthcare prototype addressing rural specialist access, counterfeit medicine verification, and public hospital navigation.",
    version="1.0.0"
)

# Enable CORS for frontend Vite dev server and production builds
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/api")
app.include_router(clinical.router, prefix="/api")
app.include_router(medicine.router, prefix="/api")
app.include_router(hospital.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(assistant.router, prefix="/api")

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "CareBridge AI API",
        "timestamp": "2026-11-24T21:00:00Z",
        "modules": {
            "rural_specialist_support": "operational",
            "medicine_verification": "operational",
            "hospital_navigation": "operational",
            "triage_ml_engine": "operational"
        }
    }

@app.get("/")
def root():
    return {
        "platform": "CareBridge AI",
        "tagline": "Intelligent Healthcare Access and Assistance Platform",
        "docs_url": "/docs",
        "health_url": "/health"
    }

