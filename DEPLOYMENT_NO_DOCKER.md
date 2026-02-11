# MindSupport - Deployment Tanpa Docker (VPS/Hosting)

## 📋 Prasyarat di VPS

- Ubuntu 20.04+ / Debian 11+
- Python 3.11+
- MongoDB 6.0+
- Nginx
- Domain (opsional)

---

## 🚀 Langkah Deployment

### 1. Persiapan Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y python3.11 python3.11-venv python3-pip nginx git curl
```

### 2. Install MongoDB

```bash
# Import MongoDB GPG key
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Add repository
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install
sudo apt update
sudo apt install -y mongodb-org

# Start & enable
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 3. Clone/Upload Project

```bash
# Buat direktori
sudo mkdir -p /var/www/mindsupport
cd /var/www/mindsupport

# Clone dari GitHub
sudo git clone https://github.com/dwijay01/Chatbot_Konseling.git .

# Atau upload via SCP dari lokal
# scp -r ./Chatbot_Konseling/* user@your-vps:/var/www/mindsupport/
```

### 4. Setup Backend

```bash
cd /var/www/mindsupport/backend

# Buat virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Buat file .env
cp .env.example .env
nano .env
```

**Isi file `.env`:**
```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=mindsupport
SECRET_KEY=your-super-secret-key-min-32-chars-change-this
GEMINI_API_KEY=your-gemini-api-key-here
CORS_ORIGINS=https://yourdomain.com,http://yourdomain.com
```

### 5. Setup Systemd Service untuk Backend

```bash
sudo nano /etc/systemd/system/mindsupport.service
```

**Isi file:**
```ini
[Unit]
Description=MindSupport FastAPI Backend
After=network.target mongod.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/mindsupport/backend
Environment="PATH=/var/www/mindsupport/backend/venv/bin"
ExecStart=/var/www/mindsupport/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

```bash
# Set permissions
sudo chown -R www-data:www-data /var/www/mindsupport

# Enable & start service
sudo systemctl daemon-reload
sudo systemctl enable mindsupport
sudo systemctl start mindsupport

# Cek status
sudo systemctl status mindsupport
```

### 6. Setup Nginx

```bash
sudo nano /etc/nginx/sites-available/mindsupport
```

**Isi file:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Atau ganti dengan IP jika belum punya domain:
    # server_name _;

    # Frontend static files
    root /var/www/mindsupport/frontend;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Backend proxy
    location /api/ {
        rewrite ^/api/(.*)$ /$1 break;
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/mindsupport /etc/nginx/sites-enabled/

# Remove default
sudo rm /etc/nginx/sites-enabled/default

# Test config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

### 7. Setup SSL dengan Certbot (Opsional, jika punya domain)

```bash
# Install certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renew sudah otomatis terkonfigurasi
```

### 8. Setup Firewall

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

---

## ✅ Verifikasi Deployment

```bash
# Cek backend service
sudo systemctl status mindsupport

# Cek nginx
sudo systemctl status nginx

# Cek MongoDB
sudo systemctl status mongod

# Test API
curl http://localhost:8000/docs

# Lihat logs
sudo journalctl -u mindsupport -f
```

Buka browser: `http://your-vps-ip/` atau `https://yourdomain.com/`

---

## 🔧 Commands Berguna

```bash
# Restart backend setelah update kode
sudo systemctl restart mindsupport

# Lihat logs backend
sudo journalctl -u mindsupport -f

# Lihat logs nginx
sudo tail -f /var/log/nginx/error.log

# Update dari Git
cd /var/www/mindsupport
sudo git pull
sudo systemctl restart mindsupport
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend tidak start | Cek logs: `sudo journalctl -u mindsupport -f` |
| MongoDB error | Cek: `sudo systemctl status mongod` |
| 502 Bad Gateway | Backend tidak berjalan, restart: `sudo systemctl restart mindsupport` |
| Permission denied | Fix: `sudo chown -R www-data:www-data /var/www/mindsupport` |
| Gemini API error | Cek GEMINI_API_KEY di `.env` |
