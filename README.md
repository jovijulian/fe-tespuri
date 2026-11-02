# Spatial Entity Monitoring Web Client (web-puri)

Frontend application for visualizing and managing geographical entities (IoT telemetry sensors, fleet logistics vehicles, and critical infrastructure facilities).

Adapted from the **Forta Design System** with an industrial dark theme, built with **React 18**, **TypeScript**, **Tailwind CSS**, and **Leaflet (Carto Dark Matter)**.

---

## 1. Features

- **Interactive Map Canvas**:
  - OpenStreetMap tiles styled via Carto Dark Matter.
  - Distinct SVG markers per category:
    - 🔵 **Vehicles** (Logistics vans, freight trucks, patrol units)
    - 🟢 **IoT Devices** (Air quality nodes, microclimate stations, water level sensors)
    - 🟡 **Facilities** (Headquarters, distribution centers, maintenance depots)
  - Live status indicators (Active, Maintenance, Inactive).
  - Rich interactive popups with direct actions: *View Details*, *Edit*, *Delete*.
  - **Pick on Map**: Click anywhere on the map to set coordinates directly when creating or updating entities.
- **Sidebar & Live Filters**:
  - Real-time search by entity name or code.
  - Quick category filtering pills (All, Vehicles, IoT Devices, Facilities).
  - Status dropdown filter (All, Active, Maintenance, Inactive).
  - Smooth pan/zoom (`map.flyTo`) when clicking any asset in the list.
- **Entity Management (CRUD)**:
  - **Create**: Add new entity with coordinate range validation (`[-90, 90]`, `[-180, 180]`).
  - **Read**: Detail modal displaying telemetry attributes and formatted timestamps.
  - **Update**: Edit operational status, relocate coordinates, and update telemetry JSON.
  - **Delete**: Confirmation modal before soft deletion.
- **Dual-Layer Validation**:
  - Client-side validation prevents invalid bounds before triggering HTTP requests.
  - Friendly toast notifications via `react-hot-toast` for backend responses and errors.

---

## 2. Setup & Execution Guide

### Prerequisites
- Node.js version 18 or newer
- npm version 9 or newer

### Installation
```bash
cd web-puri
npm install
```

### Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Target the live deployed backend or your local instance:
```env
# Default: Live deployed Cloud Backend
VITE_API_URL=https://tes.reeval.tech/api/v1

# Or Local Backend:
# VITE_API_URL=http://127.0.0.1:3011/api/v1
```

### Development Server
```bash
npm run dev
```
The application will launch on `http://localhost:3000`.

### Production Build
```bash
npm run build
```
Generates optimized static assets in the `dist/` directory.

---

## 3. Tech Stack Justification

| Library | Purpose | Justification |
| :--- | :--- | :--- |
| **React 18 + TypeScript** | UI Library | Strong type-safety matching backend DTO schemas, declarative component lifecycle, and high rendering performance. |
| **Leaflet** | Map Engine | Lightweight (no heavy WebGL overhead), zero mandatory external API keys, smooth marker management, and full tile customization. |
| **Tailwind CSS** | Styling System | Utility-first architecture with custom dark theme colors inherited from Forta design system (`surface: #1A1D24`, `background: #0F1115`, `primary: #00E676`). |
| **Lucide React** | Iconography | Clean, consistent, lightweight SVG icons representing vehicles, IoT radios, and facilities. |
| **Axios** | HTTP Client | Built-in request/response interceptors, centralized base URL management, and predictable error handling. |
| **React Hot Toast** | Notifications | Immediate, non-blocking feedback on user interactions and backend validation errors. |
