"""
MindSupport Backend - Main Application Entry Point
FastAPI application with all routes and middleware configured.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.db.mongodb import connect_to_mongo, close_mongo_connection
from app.routers import auth, users, chat, forum, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events - startup and shutdown."""
    # Startup
    print("🚀 Starting MindSupport API...")
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()
    print("👋 MindSupport API shutdown complete.")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
## MindSupport API

Platform Konseling Mandiri dengan AI dan Forum Diskusi Anonim untuk Mahasiswa.

### 🎯 Fitur Utama
- 🔐 **Autentikasi** - Login dengan NIM/Email kampus menggunakan JWT
- 🤖 **AI Chatbot** - Konseling empatik dengan dukungan AI (OpenAI GPT)
- 💬 **Forum Anonim** - Berbagi cerita tanpa takut dihakimi
- 📔 **Journal** - Riwayat percakapan untuk refleksi diri

### 🔒 Keamanan
- JWT Authentication dengan expiry 24 jam
- Password Hashing menggunakan bcrypt
- Anonymous ID untuk identitas di forum

### 📖 Cara Penggunaan
1. **Registrasi** - Buat akun baru via `/auth/register`
2. **Login** - Dapatkan token via `/auth/token`
3. **Gunakan Token** - Sertakan di header `Authorization: Bearer <token>`

### 👨‍💻 Dikembangkan oleh
Tim MindSupport - Universitas Indonesia
    """,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS - Allow all origins during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=False,  # Must be False when using wildcard origin
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(chat.router)
app.include_router(forum.router)
app.include_router(admin.router)


# Health check endpoint
@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint."""
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "message": "MindSupport API is running! 🧠💜"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Detailed health check."""
    return {
        "status": "healthy",
        "database": "connected",
        "openai": "configured" if settings.OPENAI_API_KEY else "not configured (using fallback)"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
