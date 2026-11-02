import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Entity } from '../../../types/entity';
import { Maximize2, Layers, Crosshair, X } from 'lucide-react';

interface EntityMapCanvasProps {
  entities: Entity[];
  selectedEntity: Entity | null;
  onSelectEntity: (entity: Entity) => void;
  onEditEntity: (entity: Entity) => void;
  onDeleteEntity: (entity: Entity) => void;
  onMapClick?: (lat: number, lng: number) => void;
  onCancelPick?: () => void;
  isPickingLocation?: boolean;
}

type TileStyle = 'street' | 'humanitarian' | 'satellite';

const TILE_LAYERS: Record<TileStyle, { name: string; url: string; attribution: string }> = {
  street: {
    name: 'Standard Map',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  humanitarian: {
    name: 'Clean Terrain',
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
  },
};

function buildMarkerHtml(entity: Entity, isSelected: boolean): string {
  let primaryColor = '#2563eb';
  let innerGlyph = `<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/><path d="M15 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 13.52 8H12"/>`;

  if (entity.category === 'iot_device') {
    primaryColor = '#0d9488';
    innerGlyph = `<path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/>`;
  } else if (entity.category === 'facility') {
    primaryColor = '#d97706';
    innerGlyph = `<rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/>`;
  }

  const statusColor =
    entity.status === 'active'
      ? '#16a34a'
      : entity.status === 'maintenance'
        ? '#f59e0b'
        : '#64748b';

  const scale = isSelected ? 'scale(1.22)' : 'scale(1)';
  const ringShadow = isSelected
    ? '0 0 0 4px rgba(15, 23, 42, 0.85), 0 8px 20px rgba(15, 23, 42, 0.35)'
    : '0 3px 10px rgba(15, 23, 42, 0.28)';

  return `
    <div style="display:flex;flex-direction:column;align-items:center;transform:${scale};transform-origin:bottom center;transition:transform 0.18s ease;">
      <div style="position:relative;width:36px;height:36px;border-radius:50% 50% 50% 0;background:${primaryColor};transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;border:2.5px solid #ffffff;box-shadow:${ringShadow};">
        <div style="transform:rotate(45deg);display:flex;align-items:center;justify-content:center;color:#ffffff;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            ${innerGlyph}
          </svg>
        </div>
        <span style="position:absolute;top:-2px;right:-2px;width:11px;height:11px;border-radius:50%;background:${statusColor};border:2px solid #ffffff;"></span>
      </div>
      <div style="margin-top:5px;padding:1px 6px;border-radius:4px;background:${isSelected ? '#0f172a' : 'rgba(15, 23, 42, 0.85)'};color:#ffffff;font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:600;white-space:nowrap;box-shadow:0 2px 4px rgba(0,0,0,0.15);border:1px solid rgba(255,255,255,0.2);">
        ${entity.name}
      </div>
    </div>
  `;
}

export const EntityMapCanvas: React.FC<EntityMapCanvasProps> = ({
  entities,
  selectedEntity,
  onSelectEntity,
  onEditEntity,
  onDeleteEntity,
  onMapClick,
  onCancelPick,
  isPickingLocation = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markerLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const markersMapRef = useRef<Map<number, { marker: L.Marker; entity: Entity }>>(new Map());

  const callbacksRef = useRef({ onSelectEntity, onEditEntity, onDeleteEntity, onMapClick });
  callbacksRef.current = { onSelectEntity, onEditEntity, onDeleteEntity, onMapClick };

  const [tileStyle, setTileStyle] = useState<TileStyle>('street');
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number }>({
    lat: -6.917464,
    lng: 107.619122,
  });

  // 1. Initialize Map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const defaultCenter: [number, number] = [-6.917464, 107.619122];
    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 12,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const initialTileLayer = L.tileLayer(TILE_LAYERS.street.url, {
      attribution: TILE_LAYERS.street.attribution,
      maxZoom: 19,
    }).addTo(map);

    const markerGroup = L.layerGroup().addTo(map);

    tileLayerRef.current = initialTileLayer;
    markerLayerGroupRef.current = markerGroup;
    mapRef.current = map;

    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setCursorCoords({
        lat: Number(e.latlng.lat.toFixed(5)),
        lng: Number(e.latlng.lng.toFixed(5)),
      });
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      if (callbacksRef.current.onMapClick) {
        callbacksRef.current.onMapClick(
          Number(e.latlng.lat.toFixed(6)),
          Number(e.latlng.lng.toFixed(6))
        );
      }
    });

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      markerLayerGroupRef.current = null;
      markersMapRef.current.clear();
    };
  }, []);

  // 2. Switch Tile Style
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    const cfg = TILE_LAYERS[tileStyle];
    tileLayerRef.current = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      maxZoom: 19,
    }).addTo(map);
  }, [tileStyle]);

  // 3. Synchronize Markers when `entities` list changes
  useEffect(() => {
    const map = mapRef.current;
    const markerGroup = markerLayerGroupRef.current;
    if (!map || !markerGroup) return;

    markerGroup.clearLayers();
    markersMapRef.current.clear();

    entities.forEach(entity => {
      const lat = Number(entity.latitude);
      const lng = Number(entity.longitude);
      if (isNaN(lat) || isNaN(lng)) return;

      const isSelected = selectedEntity?.id === entity.id;

      const icon = L.divIcon({
        html: buildMarkerHtml(entity, isSelected),
        className: 'custom-gis-marker',
        iconSize: [44, 58],
        iconAnchor: [22, 42],
        popupAnchor: [0, -40],
      });

      const marker = L.marker([lat, lng], {
        icon,
        zIndexOffset: isSelected ? 1000 : 0,
      });

      const statusLabel =
        entity.status === 'active'
          ? 'Active'
          : entity.status === 'maintenance'
            ? 'Maintenance'
            : 'Inactive';

      const statusColor =
        entity.status === 'active'
          ? '#15803d'
          : entity.status === 'maintenance'
            ? '#b45309'
            : '#475569';

      const popupHtml = `
        <div style="padding:12px;background:#ffffff;color:#0f172a;min-width:220px;font-family:'Inter',sans-serif;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px;">
            <span style="font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:600;color:#64748b;">${entity.code}</span>
            <span style="font-size:10px;font-weight:600;padding:2px 6px;border-radius:4px;background:${statusColor}15;color:${statusColor};">
              ${statusLabel}
            </span>
          </div>
          <div style="font-weight:600;font-size:13px;color:#0f172a;margin-bottom:8px;">${entity.name}</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#475569;background:#f8fafc;padding:6px 8px;border-radius:4px;border:1px solid #e2e8f0;margin-bottom:10px;">
            ${lat.toFixed(5)}, ${lng.toFixed(5)}
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <button id="popup-inspect-${entity.id}" style="flex:1;background:#2563eb;color:#ffffff;font-size:11px;font-weight:500;padding:5px 8px;border-radius:4px;border:none;cursor:pointer;">
              View Details
            </button>
            <button id="popup-edit-${entity.id}" style="background:#f1f5f9;color:#334155;font-size:11px;font-weight:500;padding:5px 10px;border-radius:4px;border:1px solid #cbd5e1;cursor:pointer;">
              Edit
            </button>
            <button id="popup-del-${entity.id}" style="background:#fef2f2;color:#b91c1c;font-size:11px;font-weight:500;padding:5px 8px;border-radius:4px;border:1px solid #fecaca;cursor:pointer;">
              Delete
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: 'gis-popup',
        closeButton: false,
        autoPan: false,
      });

      marker.on('click', () => {
        callbacksRef.current.onSelectEntity(entity);
      });

      marker.on('popupopen', () => {
        setTimeout(() => {
          const inspectBtn = document.getElementById(`popup-inspect-${entity.id}`);
          const editBtn = document.getElementById(`popup-edit-${entity.id}`);
          const delBtn = document.getElementById(`popup-del-${entity.id}`);

          if (inspectBtn) inspectBtn.onclick = () => callbacksRef.current.onSelectEntity(entity);
          if (editBtn) editBtn.onclick = () => callbacksRef.current.onEditEntity(entity);
          if (delBtn) delBtn.onclick = () => callbacksRef.current.onDeleteEntity(entity);
        }, 10);
      });

      marker.addTo(markerGroup);
      markersMapRef.current.set(entity.id, { marker, entity });
    });

    if (
      entities.length > 0 &&
      (!selectedEntity || !entities.some(e => e.id === selectedEntity.id))
    ) {
      const validCoords = entities
        .map(e => [Number(e.latitude), Number(e.longitude)] as [number, number])
        .filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng));
      if (validCoords.length === 1) {
        map.setView(validCoords[0], 14, { animate: true });
      } else if (validCoords.length > 1) {
        const bounds = L.latLngBounds(validCoords);
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
      }
    }
  }, [entities]);

  // 4. Focus and highlight when `selectedEntity` changes (without destroying marker DOM)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersMapRef.current.forEach(({ marker, entity }, id) => {
      const isSelected = selectedEntity?.id === id;
      const el = marker.getElement();
      if (el) {
        el.innerHTML = buildMarkerHtml(entity, isSelected);
      }
      marker.setZIndexOffset(isSelected ? 1000 : 0);
    });

    if (!selectedEntity) return;

    const lat = Number(selectedEntity.latitude);
    const lng = Number(selectedEntity.longitude);
    if (isNaN(lat) || isNaN(lng)) return;

    map.invalidateSize();

    const targetEntry = markersMapRef.current.get(selectedEntity.id);

    map.setView([lat, lng], Math.max(map.getZoom(), 14), {
      animate: true,
      duration: 0.5,
    });

    const timer = setTimeout(() => {
      if (targetEntry) {
        targetEntry.marker.openPopup();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedEntity, entities]);

  const fitAllMarkers = () => {
    const map = mapRef.current;
    if (!map || entities.length === 0) return;
    const validCoords = entities
      .map(e => [Number(e.latitude), Number(e.longitude)] as [number, number])
      .filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng));
    if (validCoords.length === 0) return;
    const bounds = L.latLngBounds(validCoords);
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
  };

  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-slate-200 ${
        isPickingLocation ? 'cursor-crosshair' : ''
      }`}
    >
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {isPickingLocation && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[500] bg-slate-900 text-white text-xs font-medium px-4 py-2 rounded-md shadow-lg border border-slate-700 flex items-center gap-3">
          <Crosshair className="w-4 h-4 text-blue-400 animate-spin" />
          <span>Click anywhere on the map to set the location</span>
          {onCancelPick && (
            <button
              type="button"
              onClick={onCancelPick}
              className="ml-2 text-slate-300 hover:text-white p-0.5 rounded hover:bg-slate-800"
              title="Cancel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      <div className="absolute top-2.5 left-2.5 right-2.5 sm:right-auto z-[400] flex items-center justify-between sm:justify-start gap-1.5 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-xs border border-slate-300 rounded-md shadow-xs p-0.5 flex items-center text-xs pointer-events-auto">
          <span className="hidden sm:flex px-2 py-1 text-slate-500 items-center gap-1 font-medium border-r border-slate-200">
            <Layers className="w-3.5 h-3.5" /> Map Style
          </span>
          {(['street', 'humanitarian', 'satellite'] as TileStyle[]).map(style => (
            <button
              key={style}
              type="button"
              onClick={() => setTileStyle(style)}
              className={`px-2 sm:px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                tileStyle === style
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {TILE_LAYERS[style].name}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={fitAllMarkers}
          title="Show all locations on map"
          className="bg-white/95 backdrop-blur-xs hover:bg-white text-slate-700 hover:text-slate-900 px-2 sm:px-2.5 py-1.5 rounded-md border border-slate-300 shadow-xs transition-colors text-[11px] font-medium flex items-center gap-1 shrink-0 pointer-events-auto"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span className="hidden xs:inline sm:inline">Show All</span>
        </button>
      </div>

      <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-xs border border-slate-300 rounded px-2.5 py-1 shadow-xs flex items-center gap-2.5 text-[11px] font-mono text-slate-600 tabular-nums pointer-events-none">
        <span>Lat: {cursorCoords.lat.toFixed(5)}</span>
        <span className="text-slate-300">|</span>
        <span>Lng: {cursorCoords.lng.toFixed(5)}</span>
      </div>
    </div>
  );
};
