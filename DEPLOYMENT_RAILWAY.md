# MindSupport - Deployment ke Railway.app (GRATIS)

Railway.app adalah platform cloud yang mendukung Python + MongoDB dengan free tier.

## 📋 Prasyarat

1. Akun GitHub dengan repository project ini
2. Akun Railway.app (daftar dengan GitHub)

---

## 🚀 Langkah Deployment

### Step 1: Daftar Railway

1. Buka https://railway.app
2. Klik **"Login"** → **"Login with GitHub"**
3. Authorize Railway

### Step 2: Buat Project Baru

1. Klik **"New Project"**
2. Pilih **"Deploy from GitHub repo"**
3. Pilih repository: `username/nama-repository-anda`
4. Railway akan auto-detect project

### Step 3: Setup MongoDB

1. Di dashboard project, klik **"+ New"**
2. Pilih **"Database"** → **"Add MongoDB"**
3. Railway akan otomatis membuat MongoDB instance
4. Catat connection string: `${{MongoDB.MONGO_URL}}`

### Step 4: Deploy Backend

1. Klik **"+ New"** → **"GitHub Repo"**
2. Pilih repo yang sama
3. Klik **Settings** → **Root Directory**: `backend`
4. Klik **Variables** dan tambahkan:

```
MONGODB_URL=${{MongoDB.MONGO_URL}}
DATABASE_NAME=mindsupport
SECRET_KEY=your-super-secret-key-min-32-characters
GEMINI_API_KEY=your-gemini-api-key
CORS_ORIGINS=*
PORT=8000
```

5. Railway akan auto-deploy

### Step 5: Deploy Frontend

1. Klik **"+ New"** → **"GitHub Repo"**
2. Pilih repo yang sama
3. Klik **Settings** → **Root Directory**: `frontend`
4. Klik **Variables** dan tambahkan:

```
VITE_API_URL=https://your-backend-url.railway.app
```

### Step 6: Generate Domain

1. Untuk Backend: **Settings** → **Networking** → **Generate Domain**
2. Untuk Frontend: **Settings** → **Networking** → **Generate Domain**
3. Catat kedua URL

### Step 7: Update CORS

Update environment variable backend:
```
CORS_ORIGINS=https://your-frontend-url.railway.app
```

---

## 📁 File Konfigurasi Railway

Railway sudah ada di repo kamu, tapi pastikan file berikut ada:

### Backend: `backend/railway.json`
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn app.main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### Frontend: `frontend/railway.json`
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "python -m http.server $PORT",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

---

## ✅ Verifikasi

1. Buka URL frontend Railway
2. Test register/login
3. Test chat dengan AI
4. Cek logs di Railway dashboard jika ada error

---

## 💰 Biaya

- **Free Tier**: $5 credit/bulan (cukup untuk development)
- **Hobby Plan**: $5/bulan (lebih stabil)

---

## 🔧 Troubleshooting

| Error | Solusi |
|-------|--------|
| Build failed | Cek logs di Railway → Deployments |
| MongoDB connection error | Pastikan `MONGODB_URL` benar |
| CORS error | Tambahkan frontend URL ke `CORS_ORIGINS` |
| Gemini error | Cek `GEMINI_API_KEY` |

---

## 📝 Alternative: Split Hosting (Lebih Hemat)

- **Frontend**: Deploy ke Vercel/Netlify (100% GRATIS)
- **Backend + MongoDB**: Railway (gunakan free credit)

Ini lebih hemat karena frontend static tidak perlu resources.
