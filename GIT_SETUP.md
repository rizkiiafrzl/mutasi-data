# Panduan Upload ke Git

Dokumen ini menjelaskan langkah-langkah untuk mengupload project ini ke Git repository (GitHub, GitLab, dll).

## Persiapan

### 1. Install Git

Jika belum terinstall, download dari https://git-scm.com/

Verifikasi instalasi:
```bash
git --version
```

### 2. Konfigurasi Git (Pertama Kali)

```bash
# Set nama
git config --global user.name "Nama Anda"

# Set email
git config --global user.email "email@example.com"

# Verifikasi
git config --list
```

## Upload ke Repository Baru

### Opsi 1: Upload ke Repository yang Sudah Ada di GitHub/GitLab

#### 1. Inisialisasi Git (jika belum)

```bash
cd "C:\Users\LENOVO\Documents\GitHub\New folder"
git init
```

#### 2. Tambahkan Remote Repository

```bash
# GitHub
git remote add origin https://github.com/username/repository-name.git

# GitLab
git remote add origin https://gitlab.com/username/repository-name.git

# Verifikasi
git remote -v
```

#### 3. Tambahkan File ke Staging

```bash
# Tambahkan semua file
git add .

# Atau tambahkan file tertentu
git add README.md
git add .gitignore
```

#### 4. Commit Perubahan

```bash
git commit -m "Initial commit: Sistem Manajemen TK"
```

#### 5. Push ke Repository

```bash
# Push ke branch main/master
git branch -M main
git push -u origin main

# Jika menggunakan master
git branch -M master
git push -u origin master
```

### Opsi 2: Buat Repository Baru di GitHub

#### 1. Buat Repository di GitHub

1. Login ke GitHub
2. Klik tombol "+" di kanan atas
3. Pilih "New repository"
4. Isi nama repository (misal: `sistem-manajemen-tk`)
5. Pilih Public atau Private
6. **JANGAN** centang "Initialize with README" (karena kita sudah punya)
7. Klik "Create repository"

#### 2. Upload Project

```bash
cd "C:\Users\LENOVO\Documents\GitHub\New folder"

# Inisialisasi git (jika belum)
git init

# Tambahkan remote (ganti URL dengan URL repository Anda)
git remote add origin https://github.com/username/sistem-manajemen-tk.git

# Tambahkan semua file
git add .

# Commit
git commit -m "Initial commit: Sistem Manajemen TK dengan dokumentasi lengkap"

# Push
git branch -M main
git push -u origin main
```

## Update Repository

Setelah perubahan, update repository:

```bash
# Cek status
git status

# Tambahkan file yang berubah
git add .

# Commit
git commit -m "feat: tambah fitur baru"
# atau
git commit -m "fix: perbaiki bug"

# Push
git push
```

## Best Practices

### 1. Jangan Commit File Sensitif

Pastikan file `.env` sudah ada di `.gitignore`:
```bash
# Cek apakah .env di-ignore
git check-ignore .env
```

### 2. Commit Message yang Baik

Gunakan format conventional commits:
- `feat:` - Fitur baru
- `fix:` - Perbaikan bug
- `docs:` - Perubahan dokumentasi
- `style:` - Formatting
- `refactor:` - Refactoring
- `test:` - Test
- `chore:` - Maintenance

Contoh:
```bash
git commit -m "feat: tambah fitur upload massal"
git commit -m "fix: perbaiki error validasi data"
git commit -m "docs: update README dengan instruksi setup"
```

### 3. Buat Branch untuk Fitur Baru

```bash
# Buat branch baru
git checkout -b feature/nama-fitur

# Lakukan perubahan
# ... edit files ...

# Commit
git add .
git commit -m "feat: tambah fitur X"

# Push branch
git push -u origin feature/nama-fitur

# Buat Pull Request di GitHub/GitLab
# Setelah di-merge, kembali ke main
git checkout main
git pull
```

### 4. Update dari Remote

```bash
# Fetch perubahan terbaru
git fetch origin

# Merge ke branch lokal
git merge origin/main

# Atau pull langsung
git pull origin main
```

## Troubleshooting

### Error: "fatal: not a git repository"

**Solusi:**
```bash
git init
```

### Error: "fatal: remote origin already exists"

**Solusi:**
```bash
# Hapus remote yang ada
git remote remove origin

# Tambahkan lagi
git remote add origin <url>
```

### Error: "failed to push some refs"

**Solusi:**
```bash
# Pull dulu
git pull origin main --allow-unrelated-histories

# Push lagi
git push -u origin main
```

### File yang Tidak Ter-commit

**Cek .gitignore:**
```bash
# Lihat file yang di-ignore
git status --ignored

# Jika file penting di-ignore, edit .gitignore
```

### Undo Last Commit (Belum Push)

```bash
# Undo commit, tetap simpan perubahan
git reset --soft HEAD~1

# Undo commit dan perubahan
git reset --hard HEAD~1
```

## Struktur Repository yang Disarankan

```
repository/
├── .gitignore          ✅
├── README.md           ✅
├── SETUP.md            ✅
├── CONTRIBUTING.md     ✅
├── GIT_SETUP.md        ✅
├── LICENSE             (opsional)
├── Back-end/
│   ├── .gitignore
│   ├── package.json
│   └── ...
└── Front-end/
    ├── .gitignore
    ├── package.json
    └── ...
```

## Checklist Sebelum Push

- [ ] File `.env` sudah di-ignore
- [ ] `node_modules/` sudah di-ignore
- [ ] File build (`dist/`) sudah di-ignore
- [ ] README.md sudah lengkap
- [ ] Tidak ada file sensitif (password, API key, dll)
- [ ] Commit message sudah jelas
- [ ] Semua file penting sudah di-commit

## Setelah Upload

1. **Update README** dengan URL repository yang benar
2. **Tambahkan badges** (opsional):
   ```markdown
   ![GitHub](https://img.shields.io/github/license/username/repo)
   ![GitHub stars](https://img.shields.io/github/stars/username/repo)
   ```
3. **Tambahkan topics/tags** di GitHub untuk memudahkan pencarian
4. **Set description** repository di GitHub

## Referensi

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**Selamat!** Project Anda sudah siap untuk di-share dengan dunia! 🚀

