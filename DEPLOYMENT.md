# MindSupport - Deployment Guide

## 🐳 Docker Deployment ke VPS

### Prerequisites

1. VPS dengan Docker dan Docker Compose terinstall
2. Domain (opsional, untuk HTTPS)
3. API Key Gemini

### Langkah Deployment

#### 1. Clone/Upload Project ke VPS

```bash
# Via Git
git clone <your-repo-url> /opt/mindsupport
cd /opt/mindsupport

# Atau via SCP
scp -r ./Chatbot_Konseling user@your-vps:/opt/mindsupport
```

#### 2. Setup Environment Variables

```bash
cd /opt/mindsupport

# Copy environment template
cp .env.example .env

# Edit dengan nilai sebenarnya
nano .env
```

Isi file `.env`:
```
SECRET_KEY=your-super-secret-jwt-key-minimum-32-characters
GEMINI_API_KEY=your-actual-gemini-api-key
```

#### 3. Build dan Run Docker Containers

```bash
# Build images
docker-compose build

# Start containers (daemon mode)
docker-compose up -d

# Cek status
docker-compose ps

# Lihat logs
docker-compose logs -f
```

#### 4. Verifikasi Deployment

```bash
# Cek health backend
curl http://localhost:8000/health

# Atau buka di browser
# http://your-vps-ip/
```
### Konfigurasi Tambahan

#### Setup HTTPS dengan Nginx Reverse Proxy (Opsional)

Jika ingin HTTPS, tambahkan Nginx reverse proxy di host:

```bash
# Install Nginx dan Certbot
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx

# Buat config
sudo nano /etc/nginx/sites-available/mindsupport
```

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/mindsupport /etc/nginx/sites-enabled/

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# Restart Nginx
sudo systemctl restart nginx
```

### Commands Berguna

```bash
# Stop semua containers
docker-compose down

# Stop dan hapus volumes (HATI-HATI: menghapus data!)
docker-compose down -v

# Rebuild setelah perubahan kode
docker-compose build --no-cache
docker-compose up -d

# Lihat logs spesifik
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb

# Masuk ke container untuk debugging
docker-compose exec backend bash
docker-compose exec mongodb mongosh
```

### Struktur File

```
Chatbot_Konseling/
├── docker-compose.yml
├── .env.example
├── .env                    # (buat sendiri, tidak di-commit)
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── requirements.txt
│   └── app/
└── frontend/
    ├── Dockerfile
    ├── .dockerignore
    ├── nginx.conf
    ├── index.html
    ├── css/
    └── js/
```

### Troubleshooting

#### Backend tidak bisa konek ke MongoDB
```bash
# Cek apakah MongoDB healthy
docker-compose ps
docker-compose logs mongodb

# Restart services
docker-compose restart
```

#### Gemini API Error
- Pastikan GEMINI_API_KEY di .env sudah benar
- Cek apakah API key masih valid di https://aistudio.google.com/

#### Port sudah digunakan
```bash
# Cek proses yang menggunakan port
sudo lsof -i :80
sudo lsof -i :8000

# Ubah port di docker-compose.yml jika perlu
```
