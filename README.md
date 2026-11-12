# Calvin Portfolio

Portfolio statis dalam Mandarin Sederhana (bahasa awal), Indonesia, dan English. Sertifikat menjadi konten utama, TOEIC di depan lalu TOCFL. Pendidikan, PANTAUTOKO, dan kontak LinkedIn tersedia dalam tiga bahasa.

## Update tanpa ZIP
Repo: https://github.com/Calvinwu948/calvinwu-portofolio

Hubungkan repo ini ke proyek Vercel sekali saja. Agar URL website lama tetap sama, buka proyek tersebut > Settings > Git > Connect Git Repository dan pilih repo ini. Untuk proyek baru, gunakan Import Git Repository.

- Production branch: main
- Framework: Other
- Root directory: akar repo
- Build / install command: kosong
- Output directory: .

Konfigurasi ada di vercel.json. Setelah integrasi terhubung, push ke main memicu deployment otomatis, tanpa ZIP.
Dokumentasi: https://vercel.com/docs/git/vercel-for-github

## Pesan privat: setup database masih diperlukan
Project URL dan publishable key pemilik telah dipasang di config.js. Ini kredensial publik browser, bukan secret/service_role key.

Pada pemeriksaan 12 November 2026, REST API Supabase mengembalikan PGRST205: tabel public.portfolio_messages belum ada. Akses admin belum tersedia. messagingEnabled masih false, sehingga formulir tidak menjanjikan pengiriman yang belum berfungsi.

1. Buka SQL Editor di proyek Supabase mknvpctdzhcmvxxxqehf.
2. Jalankan supabase-setup.sql sekali. Script membuat tabel, mengaktifkan RLS, dan hanya memberi pengunjung izin INSERT untuk kolom input. Tidak memberi SELECT, UPDATE, atau DELETE.
3. Ubah messagingEnabled menjadi true di config.js, commit dan push.
4. Uji pengiriman dari website, periksa pesan di Table Editor, dan pastikan kredensial pengunjung tidak dapat membaca, mengubah, atau menghapus pesan.

Jangan jalankan SQL ulang jika tabel sudah ada tanpa memeriksa struktur dan policy. Jangan masukkan secret/service_role key ke repo. Pesan hanya tersimpan di database, bukan dikirim sebagai DM atau email.
Validasi panjang, email, honeypot, indikator proses, dan penanganan kegagalan tersedia. Honeypot bukan rate limiting atau CAPTCHA.

## Edit konten
- index.html: struktur, foto, tautan, pendidikan.
- translations.js: teks tiga bahasa.
- style.css: desain dan animasi; mendukung prefers-reduced-motion.
- app.js: bahasa, tab, animasi, dan formulir.
- assets/calvin-profile.png: foto profil saat ini.

Mandarin memuat Noto Sans SC melalui Google Fonts; font sistem menjadi fallback jika layanan font tidak tersedia.

## Pemeriksaan
JavaScript diperiksa dengan node --check. Aset lokal, anchor, ID unik, dan kelengkapan bahasa diperiksa. Bahasa, tab awal sertifikat, urutan TOEIC, dan layout desktop/ponsel diperiksa di browser. Pengiriman database belum diuji end-to-end karena tabel belum dibuat.
