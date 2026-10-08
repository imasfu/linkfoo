# Linkfoo

Website halaman link (landing, daftar/login, OTP email, edit) - Powered by IMFOO OFFICIAL.
HTML/CSS/JS murni tanpa build, bisa langsung di-hosting di GitHub Pages maupun Vercel.

## Struktur

| File | Fungsi |
|---|---|
| `index.html` | Landing page (titik 3 kanan atas: Login / Edit / Logout; tombol gulir muncul jika link > 4) |
| `login.html` | Daftar / Login |
| `otp.html` | Verifikasi OTP 4 digit |
| `edit.html` | Edit foto profil, background, username, title, dan link |
| `js/config.js` | Konfigurasi EmailJS (public key, service id, template id) |
| `api/send-otp.js`, `api/verify-otp.js` | Serverless function Vercel untuk OTP (opsional, lebih aman) |

## Deploy

```bash
git init && git add . && git commit -m "Linkfoo"
git branch -M main
git remote add origin https://github.com/USERNAME/linkfoo.git
git push -u origin main
```

- GitHub Pages: Settings > Pages > Deploy from a branch > `main` / root.
- Vercel: Add New > Project > import repo, Framework "Other", Deploy.

## Mengaktifkan OTP email (EmailJS)

### 1. Buat template di EmailJS
Email Templates > Create New Template. Isi:
- **To Email**: `{{to_email}}`
- **Subject**: `Kode OTP Linkfoo`
- **Content**: `Kode OTP kamu: {{otp_code}} (berlaku 5 menit)`

Simpan, lalu salin **Template ID**.

### 2. Isi `js/config.js`
Ganti `GANTI_TEMPLATE_ID` dengan Template ID. Public key dan service id sudah diisi.
Dengan ini OTP sudah terkirim ke email asli, baik di GitHub Pages maupun Vercel.

### 3. (Opsional, lebih aman) Kirim lewat server Vercel
Di EmailJS: Account > Security > aktifkan **Allow EmailJS API for non-browser applications**.
Lalu di Vercel > Settings > Environment Variables isi:

- `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`
- `EMAILJS_PRIVATE_KEY` (private key, **jangan** masuk ke GitHub)
- `OTP_SECRET` (teks acak panjang)

Lalu Redeploy. Jika variabel ini ada, kode OTP dibuat dan diverifikasi di server.

Urutan otomatis: server Vercel -> EmailJS dari browser -> mode demo (kode tampil di halaman).

## Catatan

- Akun, profil, link, dan gambar disimpan di **localStorage browser**, jadi tidak publik untuk semua pengunjung. Untuk itu perlu database (mis. Supabase).
- Tanpa server (langkah 2 saja), kode OTP dibuat di browser sehingga keamanannya setara demo. Pakai langkah 3 untuk verifikasi yang sebenarnya.
- Batas gratis EmailJS terbatas per bulan; cek paketnya di dashboard.
