# Panduan Setup Detail

Dokumentasi ini berisi panduan setup yang lebih detail untuk berbagai skenario.

## Setup Awal

### 1. Persiapan Environment

#### Windows
```bash
# Install Node.js dari https://nodejs.org/
# Verifikasi instalasi
node --version
npm --version
```

#### Linux (Ubuntu/Debian)
```bash
# Install Node.js menggunakan nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Atau menggunakan apt
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### macOS
```bash
# Install menggunakan Homebrew
brew install node

# Atau menggunakan nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

### 2. Clone dan Setup Project

```bash
# Clone repository
git clone <url-repository>
cd "New folder"

# Install backend dependencies
cd Back-end
npm install

# Install frontend dependencies
cd ../Front-end
npm install
```

## Konfigurasi Environment

### Backend Environment Variables

Buat file `.env` di folder `Back-end/`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Data Paths (optional, menggunakan default jika tidak diisi)
# DATA_PATH=./src/data
# TEMPLATE_PATH=./src/templates
```

### Frontend Environment Variables

Buat file `.env` di folder `Front-end/`:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000

# Development
VITE_APP_TITLE=Sistem Manajemen TK
```

Untuk production, buat file `.env.production`:

```env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_APP_TITLE=Sistem Manajemen TK
```

## Menjalankan di Development

### Opsi 1: Terminal Terpisah (Recommended)

**Terminal 1 - Backend:**
```bash
cd Back-end
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd Front-end
npm run dev
```

### Opsi 2: Menggunakan Concurrently

Install `concurrently` secara global:
```bash
npm install -g concurrently
```

Buat script di root project (`package.json`):
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix Back-end\" \"npm run dev --prefix Front-end\"",
    "start": "npm run start --prefix Back-end"
  }
}
```

Jalankan:
```bash
npm run dev
```

## Setup untuk Production

### 1. Build Frontend

```bash
cd Front-end
npm run build
```

File hasil build ada di `Front-end/dist/`

### 2. Setup Backend sebagai Service

#### Windows (menggunakan PM2)

```bash
# Install PM2
npm install -g pm2

# Start backend
cd Back-end
pm2 start index.js --name tk-backend

# Save PM2 configuration
pm2 save
pm2 startup
```

#### Linux (menggunakan systemd)

Buat file `/etc/systemd/system/tk-backend.service`:

```ini
[Unit]
Description=TK Management Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/project/Back-end
ExecStart=/usr/bin/node index.js
Restart=always
Environment=NODE_ENV=production
Environment=PORT=5000

[Install]
WantedBy=multi-user.target
```

Aktifkan service:
```bash
sudo systemctl enable tk-backend
sudo systemctl start tk-backend
```

### 3. Setup Nginx sebagai Reverse Proxy

Buat file `/etc/nginx/sites-available/tk-app`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /path/to/project/Front-end/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Templates
    location /templates {
        proxy_pass http://localhost:5000;
    }
}
```

Aktifkan konfigurasi:
```bash
sudo ln -s /etc/nginx/sites-available/tk-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Setup Database (Opsional - untuk Production)

Saat ini aplikasi menggunakan file JSON untuk storage. Untuk production, disarankan menggunakan database.

### PostgreSQL Setup

1. Install PostgreSQL
2. Buat database:
```sql
CREATE DATABASE tk_management;
CREATE USER tk_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE tk_management TO tk_user;
```

3. Install driver:
```bash
cd Back-end
npm install pg
```

4. Update backend untuk menggunakan database (perlu modifikasi kode)

### MongoDB Setup

1. Install MongoDB
2. Install driver:
```bash
cd Back-end
npm install mongodb
```

3. Update backend untuk menggunakan MongoDB (perlu modifikasi kode)

## Troubleshooting Setup

### Port Already in Use

**Windows:**
```bash
# Cari process yang menggunakan port
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
# Cari process
lsof -ti:5000

# Kill process
kill -9 $(lsof -ti:5000)
```

### Permission Denied

**Linux:**
```bash
# Berikan permission untuk folder
chmod -R 755 Back-end/src/data
chmod -R 755 Back-end/src/templates
```

### Module Not Found

```bash
# Hapus node_modules dan install ulang
rm -rf node_modules package-lock.json
npm install
```

### CORS Error

Pastikan:
1. Backend sudah berjalan
2. `VITE_API_BASE_URL` di frontend benar
3. CORS sudah dikonfigurasi di backend (sudah ada di `index.js`)

## Verifikasi Setup

### 1. Test Backend

```bash
# Test health endpoint
curl http://localhost:5000/health

# Expected response:
# {"status":"ok","timestamp":1234567890}
```

### 2. Test Frontend

Buka browser dan akses `http://localhost:5173`

### 3. Test API Connection

Buka browser console dan cek apakah ada error connection

## Next Steps

Setelah setup selesai:
1. Baca [README.md](./README.md) untuk penggunaan aplikasi
2. Lihat dokumentasi di `Front-end/notes/` untuk detail teknis
3. Mulai menggunakan aplikasi!

