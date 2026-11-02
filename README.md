# Spatial Entity Management — Frontend (`fe-tespuri`)

Aplikasi web berbasis **React + TypeScript** untuk menampilkan dan mengelola entitas yang memiliki informasi lokasi geografis (Kendaraan, Perangkat IoT, dan Lokasi Fasilitas) di atas peta interaktif.

## Link Deployment & Repository

- **Live Frontend App**: https://fe-tespuri.vercel.app/
- **Repository Frontend**: https://github.com/jovijulian/fe-tespuri
- **Live Backend API**: https://tes.reeval.tech
- **Repository Backend**: https://github.com/jovijulian/be-tespuri

---

## Status Fitur (Functional Requirements)

Seluruh kebutuhan fungsional pada dokumen soal *Take-Home Test* telah selesai dikerjakan (100% selesai):

- [x] **Menampilkan entitas ke dalam map**: Menampilkan titik lokasi di peta interaktif dengan warna/ikon berbeda sesuai kategori, dilengkapi fitur filter (pencarian nama/kode, kategori, status) dan mode *Table View*.
- [x] **Menambahkan, menghapus, dan update entitas pada map**: Pengguna dapat menambah lokasi baru (baik dengan klik langsung di peta maupun input koordinat manual), mengubah data/posisi, serta menghapus entitas.
- [x] **Melihat detail entitas pada map**: Klik pada item di daftar maupun pin di peta akan mengarahkan kamera peta ke lokasi tersebut dan membuka panel detail lengkap beserta atribut tambahannya.
- [x] **Validasi input/data**: Validasi form di sisi frontend (field wajib, rentang latitude `-90..90`, rentang longitude `-180..180`) yang terintegrasi dengan validasi di sisi backend.

---

## Struktur Folder & Arsitektur

Project ini menerapkan **Modular Page Structure** dan **Service Layer Architecture** (`contracts` + `implementations`):

```text
web-puri/
├── src/
│   ├── components/
│   │   └── ui/
│   │       ├── Badge.tsx                 # Komponen badge indikator status & kategori
│   │       ├── Button.tsx                # Komponen tombol standar dengan state loading
│   │       └── Modal.tsx                 # Komponen dialog modal aksesibel (ESC & backdrop)
│   ├── lib/
│   │   └── axios.ts                      # Konfigurasi Axios instance, interceptor, & HTTP helper
│   ├── services/
│   │   ├── contracts/
│   │   │   └── IEntityService.ts         # Interface kontrak metode CRUD entitas
│   │   ├── implementations/
│   │   │   └── EntityService.ts          # Implementasi pemanggilan REST API menggunakan Axios
│   │   └── index.ts                      # Eksport instance singleton service
│   ├── types/
│   │   └── entity.ts                     # Definisi tipe data Entity, DTO, dan format response
│   ├── pages/
│   │   └── Entities/
│   │       ├── components/
│   │       │   ├── EntityHeader.tsx      # Topbar statistik ringkas, switch view, & tombol aksi
│   │       │   ├── EntitySidebar.tsx     # Panel daftar lokasi, pencarian, & filter kategori/status
│   │       │   ├── EntityMapCanvas.tsx   # Peta interaktif Leaflet, custom pin, & layer switcher
│   │       │   ├── EntityFormModal.tsx   # Form tambah/edit lokasi & dynamic attribute builder
│   │       │   ├── EntityDetailModal.tsx # Panel detail informasi lokasi & atribut tambahan
│   │       │   ├── EntityTableView.tsx   # Mode tampilan tabel data lengkap
│   │       │   └── DeleteConfirmModal.tsx# Modal konfirmasi penghapusan entitas
│   │       ├── hooks/
│   │       │   └── useEntities.ts        # Custom hook pengelola state, filter, & operasi CRUD
│   │       └── index.tsx                 # Container utama halaman Spatial Entity Management
│   ├── App.tsx                           # Root aplikasi & konfigurasi toast notification
│   ├── main.tsx                          # Entrypoint React DOM
│   └── index.css                         # Konfigurasi Tailwind CSS v4 & override style Leaflet
├── .env.example                          # Template variabel environment
├── package.json                          # Daftar dependency & script npm
└── README.md                             # Dokumentasi aplikasi frontend
```

---

## Cara Menjalankan Program

### 1. Instalasi Dependency
Pastikan **Node.js (v18+)** sudah terpasang, lalu jalankan:
```bash
npm install
```

### 2. Konfigurasi Environment (`.env`)
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```

Isi konfigurasi `.env` (arahkan ke backend lokal atau server production):
```env
# Menggunakan backend production
VITE_API_BASE_URL=https://tes.reeval.tech/api/v1/

# Atau jika menjalankan backend Go secara lokal:
# VITE_API_BASE_URL=http://localhost:3011/api/v1/
```

### 3. Menjalankan Server Development
```bash
npm run dev
```
Aplikasi dapat diakses di `http://localhost:3000`.

### 4. Build untuk Production
```bash
npm run build
npm run preview
```

---

## Alasan Pemilihan Library & Tech Stack

1. **React 18 + TypeScript + Vite**
   Memberikan proses development dan *build* yang cepat serta *type-safety* yang ketat untuk model data entitas dan koordinat spasial.
2. **Leaflet (`leaflet`) + OpenStreetMap / Esri Satellite**
   Dipilih karena ringan, stabil, dan bersifat *open-source* tanpa membutuhkan API Key berbayar (seperti Google Maps/Mapbox), sehingga reviewer dapat langsung menjalankan aplikasi tanpa kendala konfigurasi token.
3. **Axios + Service Layer Architecture (`contracts` & `implementations`)**
   Menggunakan HTTP client terpusat (`src/lib/axios.ts`) yang dipadukan dengan pemisahan kontrak interface (`IEntityService`) dan implementasi (`EntityService`). Pendekatan ini membuat komponen UI tetap bersih dan tidak bergantung langsung pada pemanggilan API mentah.
4. **Tailwind CSS v4 + Lucide Icons**
   Memudahkan pembuatan antarmuka *GIS Workbench* yang bersih, responsif, dan fungsional tanpa memerlukan library komponen UI yang berat.
5. **Custom State Management Hook (`useEntities`)**
   Karena state utama berfokus pada daftar entitas, filter aktif, dan item yang dipilih di peta, penggunaan *custom React hook* (`src/pages/Entities/hooks/useEntities.ts`) jauh lebih ringkas dan minim *boilerplate* dibandingkan Redux, namun tetap terstruktur rapi.

---

## Workflow Penggunaan Agentic AI

Pada pengerjaan proyek ini, **Agentic AI** digunakan sebagai asisten *pair-programming* dengan alur kerja berikut:

1. **Penentuan Arsitektur & Standar Kode oleh Developer**: Developer menetapkan pola HTTP client (`axios.ts`), arsitektur *Service Layer* (`IEntityService` + `EntityService`), serta struktur komponen modular per fitur (`pages/Entities/`).
2. **Implementasi Komponen & Integrasi Peta oleh AI**: AI membantu membangun komponen peta Leaflet (`EntityMapCanvas`), tabel data, serta form input dinamis yang mengubah pasangan *Label/Value* menjadi format `metadata` JSON secara otomatis agar ramah bagi pengguna non-teknis.
3. **Review, Debugging & Polish UI/UX**: Developer menguji interaksi langsung di browser, mengarahkan perbaikan *edge-case* pada rendering pin Leaflet saat proses *filtering*, serta men-deploy aplikasi ke Vercel (`https://fe-tespuri.vercel.app/`).

Detail panduan konteks untuk agen AI tersedia pada file [AGENT.md](./AGENT.md).
