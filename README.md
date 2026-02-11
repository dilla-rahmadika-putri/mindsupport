# MindSupport - AI Mental Health Chatbot

Aplikasi chatbot berbasis AI untuk konseling kesehatan mental, dibangun dengan:

- **Backend**: FastAPI (Python) + MongoDB
- **Frontend**: Vue.js 3 + Vanilla CSS
- **AI**: Google Gemini API
- **Deployment**: Docker + Nginx

## 🚀 Quick Start (Development)

### Prerequisites

- Python 3.11+
- MongoDB (running locally atau via Docker)
- Google Gemini API Key

### Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env dengan API keys Anda

# Run server
uvicorn app.main:app --reload --port 8001
```

### Setup Frontend

```bash
cd frontend

# Jalankan simple HTTP server
python -m http.server 3000

# Buka http://localhost:3000
```

## 🐳 Docker Deployment

Lihat [DEPLOYMENT.md](DEPLOYMENT.md) untuk panduan lengkap deployment ke VPS.

```bash
# Quick deploy
cp .env.example .env
# Edit .env dengan API keys Anda

docker-compose build
docker-compose up -d
```

## 📁 Project Structure

```
Chatbot_Konseling/
├── docker-compose.yml      # Docker orchestration
├── .env.example            # Environment template
├── DEPLOYMENT.md           # Deployment guide
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py         # FastAPI app
│       ├── core/           # Config & security
│       ├── db/             # MongoDB connection
│       ├── models/         # Pydantic schemas
│       ├── routers/        # API endpoints
│       └── services/       # Business logic (Gemini AI)
└── frontend/
    ├── Dockerfile
    ├── nginx.conf          # Nginx config
    ├── index.html
    ├── css/
    └── js/
        ├── app.js          # Vue.js app
        ├── services/       # API service
        ├── components/     # Vue components
        └── pages/          # Vue pages
```

## 🔐 Environment Variables

| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | JWT secret key (min 32 chars) |
| `GEMINI_API_KEY` | Google Gemini API key |
| `MONGODB_URL` | MongoDB connection string |
| `DATABASE_NAME` | MongoDB database name |

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register user |
| POST | `/auth/token` | Login |
| GET | `/users/me` | Get current user |
| POST | `/chat/message` | Send chat message |
| GET | `/chat/history` | Get chat history |
| GET | `/forum/posts` | Get forum posts |
| POST | `/forum/posts` | Create post |

## 📄 License

MIT License
