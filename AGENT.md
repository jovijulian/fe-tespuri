# AGENT.md — Panduan Konteks & Workflow Agentic AI (`fe-tespuri`)

Dokumen ini menjelaskan struktur arsitektur frontend, standar kualitas kode, serta alur kolaborasi antara Developer dan **Agentic AI** pada pengerjaan proyek ini.

---

## 1. Workflow Kolaborasi Developer & Agentic AI

Agentic AI berperan sebagai *coding assistant* yang bekerja di bawah arahan arsitektur developer:

1. **Arahan Arsitektur & Desain (Developer)**:
   - Menentukan penggunaan pola Axios wrapper (`src/lib/axios.ts`) dan *Service Layer Pattern* (`contracts` + `implementations`).
   - Mengarahkan desain antarmuka agar bersih, profesional, dan bebas dari istilah teknis seperti `JSON` atau `WGS84` di sisi pengguna akhir.
2. **Generasi Kode & Refactoring (Agentic AI)**:
   - Menyusun komponen modular pada `src/pages/Entities/components/`.
   - Membuat *Dynamic Attribute Builder* pada `EntityFormModal.tsx` (dilengkapi *quick suggestions* per kategori objek) yang mengonversi input *Label & Value* dari user menjadi payload objek JSON untuk backend.
   - Memperbaiki manajemen layer marker Leaflet (`L.LayerGroup`) pada `EntityMapCanvas.tsx` agar pin tetap stabil saat dilakukan pencarian/filter dan perpindahan kamera (`flyTo`).
3. **Pengujian & Deployment (Developer)**:
   - Melakukan pengujian alur CRUD end-to-end terhadap backend production (`https://tes.reeval.tech`).
   - Melakukan deployment ke Vercel (`https://fe-tespuri.vercel.app/`).

---

## 2. Struktur Direktori

```text
src/
├── components/ui/            # Komponen UI reusable (Button, Badge, Modal)
├── lib/
│   └── axios.ts              # Konfigurasi Axios instance, interceptor, & HTTP helper
├── services/
│   ├── contracts/            # Interface kontrak service (IEntityService.ts)
│   ├── implementations/      # Implementasi pemanggilan API (EntityService.ts)
│   └── index.ts              # Dependency injection / singleton export
├── types/
│   └── entity.ts             # Definisi tipe data Entity, DTO, dan Response API
└── pages/
    └── Entities/             # Modul utama halaman Spatial Entity Management
        ├── components/       # Header, Sidebar, MapCanvas, FormModal, DetailModal, TableView
        ├── hooks/            # Custom hook state & operasi CRUD (useEntities.ts)
        └── index.tsx         # Container utama halaman
```

---

## 3. Aturan Teknis & UI/UX

- **Service Layer**: Komponen React tidak boleh memanggil `axios` secara langsung; seluruh komunikasi API wajib melalui `entityService` atau hook `useEntities`.
- **User-Friendly Input**: Atribut tambahan (`metadata`) ditampilkan dan diinput menggunakan baris *Label* dan *Value* yang ramah pengguna, kemudian diserialisasi menjadi objek JSON di balik layar sebelum dikirim ke backend.
- **Validasi Koordinat**: Form wajib memvalidasi `latitude` (`-90` s/d `90`) dan `longitude` (`-180` s/d `180`) sebelum mengirim request ke server.
