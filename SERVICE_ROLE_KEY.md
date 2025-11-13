# Cara Mendapatkan Service Role Key

Service Role Key diperlukan untuk upload gambar melalui API route (lebih aman).

## Langkah-langkah:

1. Buka Supabase Dashboard: https://supabase.com/dashboard
2. Pilih project Anda: **ridhogithub1's Project**
3. Klik **Settings** (ikon gear) di sidebar kiri
4. Klik **API** di menu Settings
5. Scroll ke bagian **Project API keys**
6. Copy **service_role** key (bukan anon key)
7. Paste ke file `.env.local` sebagai `SUPABASE_SERVICE_ROLE_KEY`

## Update .env.local

Tambahkan atau update baris berikut di file `.env.local`:

```
SUPABASE_SERVICE_ROLE_KEY=paste_service_role_key_di_sini
```

## Catatan Penting:

⚠️ **JANGAN** share service_role key ke publik atau commit ke Git!
- Service role key memiliki akses penuh ke database
- Hanya gunakan di server-side (API routes)
- File `.env.local` sudah di-ignore oleh Git

## Setelah Update:

1. Restart development server (hentikan dengan Ctrl+C, lalu jalankan `npm run dev` lagi)
2. Upload gambar seharusnya sudah berfungsi

