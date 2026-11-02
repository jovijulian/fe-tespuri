import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Entity, CreateEntityPayload, UpdateEntityPayload, EntityCategory, EntityStatus } from '../../../types/entity';
import { MapPin, AlertCircle, Crosshair, Plus, Trash2 } from 'lucide-react';

interface EntityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateEntityPayload | UpdateEntityPayload) => Promise<boolean>;
  entityToEdit?: Entity | null;
  onPickOnMapRequest?: () => void;
  pickedCoordinates?: { lat: number; lng: number } | null;
}

interface AttributeItem {
  id: string;
  label: string;
  value: string;
}

const CATEGORY_SUGGESTIONS: Record<EntityCategory, Array<{ label: string; placeholder: string }>> = {
  vehicle: [
    { label: 'Plate Number', placeholder: 'e.g. D 1024 AA' },
    { label: 'Driver Name', placeholder: 'e.g. Budi Santoso' },
    { label: 'Speed (km/h)', placeholder: 'e.g. 60' },
    { label: 'Fuel Level (%)', placeholder: 'e.g. 85' },
    { label: 'Vehicle Type', placeholder: 'e.g. Logistics Box Van' },
  ],
  iot_device: [
    { label: 'Sensor Type', placeholder: 'e.g. Air Quality Monitor' },
    { label: 'Battery Level (%)', placeholder: 'e.g. 95' },
    { label: 'Temperature (°C)', placeholder: 'e.g. 24.5' },
    { label: 'Signal Status', placeholder: 'e.g. Strong (LoRaWAN)' },
    { label: 'Firmware Version', placeholder: 'e.g. v2.1.0' },
  ],
  facility: [
    { label: 'Address', placeholder: 'e.g. Jl. Soekarno Hatta No. 442' },
    { label: 'Person in Charge', placeholder: 'e.g. Hendra Wijaya' },
    { label: 'Contact Phone', placeholder: 'e.g. 022-5202682' },
    { label: 'Capacity', placeholder: 'e.g. 500 personnel' },
    { label: 'Operating Hours', placeholder: 'e.g. 24 Hours' },
  ],
};

function formatKeyToLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}

function formatLabelToKey(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export const EntityFormModal: React.FC<EntityFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  entityToEdit,
  onPickOnMapRequest,
  pickedCoordinates,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState<EntityCategory>('vehicle');
  const [status, setStatus] = useState<EntityStatus>('active');
  const [latitude, setLatitude] = useState<string>('-6.917464');
  const [longitude, setLongitude] = useState<string>('107.619122');
  const [description, setDescription] = useState('');
  const [attributes, setAttributes] = useState<AttributeItem[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (entityToEdit) {
      setName(entityToEdit.name);
      setCode(entityToEdit.code);
      setCategory(entityToEdit.category);
      setStatus(entityToEdit.status);
      setLatitude(entityToEdit.latitude.toString());
      setLongitude(entityToEdit.longitude.toString());
      setDescription(entityToEdit.description || '');

      const existingMeta = entityToEdit.metadata || {};
      const items: AttributeItem[] = Object.entries(existingMeta).map(([k, v], idx) => ({
        id: `attr-${idx}-${Date.now()}`,
        label: formatKeyToLabel(k),
        value: String(v ?? ''),
      }));
      setAttributes(items);
    } else {
      setName('');
      setCode('');
      setCategory('vehicle');
      setStatus('active');
      setLatitude('-6.917464');
      setLongitude('107.619122');
      setDescription('');
      setAttributes([
        { id: 'default-1', label: 'Plate Number', value: '' },
      ]);
    }
    setErrors({});
  }, [entityToEdit, isOpen]);

  useEffect(() => {
    if (pickedCoordinates) {
      setLatitude(pickedCoordinates.lat.toString());
      setLongitude(pickedCoordinates.lng.toString());
    }
  }, [pickedCoordinates]);

  const handleAddAttribute = (suggestedLabel = '') => {
    if (
      suggestedLabel &&
      attributes.some(a => a.label.toLowerCase() === suggestedLabel.toLowerCase())
    ) {
      return;
    }
    setAttributes(prev => [
      ...prev,
      {
        id: `attr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        label: suggestedLabel,
        value: '',
      },
    ]);
  };

  const handleUpdateAttribute = (id: string, field: 'label' | 'value', val: string) => {
    setAttributes(prev =>
      prev.map(item => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  const handleRemoveAttribute = (id: string) => {
    setAttributes(prev => prev.filter(item => item.id !== id));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    } else if (name.trim().length > 150) {
      newErrors.name = 'Name cannot exceed 150 characters';
    }

    if (!entityToEdit) {
      if (!code.trim()) {
        newErrors.code = 'Unique code is required';
      } else if (code.trim().length < 2 || code.trim().length > 50) {
        newErrors.code = 'Code must be between 2 and 50 characters';
      }
    }

    const latNum = parseFloat(latitude);
    if (latitude.trim() === '' || isNaN(latNum)) {
      newErrors.latitude = 'Please enter a valid latitude number';
    } else if (latNum < -90 || latNum > 90) {
      newErrors.latitude = 'Latitude must be between -90 and 90';
    }

    const lngNum = parseFloat(longitude);
    if (longitude.trim() === '' || isNaN(lngNum)) {
      newErrors.longitude = 'Please enter a valid longitude number';
    } else if (lngNum < -180 || lngNum > 180) {
      newErrors.longitude = 'Longitude must be between -180 and 180';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const compiledMetadata: Record<string, any> = {};
    attributes.forEach(item => {
      const cleanKey = formatLabelToKey(item.label);
      const cleanVal = item.value.trim();
      if (cleanKey && cleanVal !== '') {
        const asNumber = Number(cleanVal);
        compiledMetadata[cleanKey] =
          !isNaN(asNumber) && cleanVal !== '' && !/^0\d+/.test(cleanVal)
            ? asNumber
            : cleanVal;
      }
    });

    setIsSubmitting(true);
    try {
      const payload: any = {
        name: name.trim(),
        category,
        status,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        description: description.trim(),
        metadata: compiledMetadata,
      };

      if (!entityToEdit) {
        payload.code = code.trim().toUpperCase();
      }

      const success = await onSubmit(payload);
      if (success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const suggestions = CATEGORY_SUGGESTIONS[category] || [];
  const labelClass = 'block text-xs font-medium text-slate-700 mb-1';
  const inputClass =
    'w-full bg-white border border-slate-300 rounded-md px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={entityToEdit ? `Edit Location — ${entityToEdit.name}` : 'Add New Location / Entity'}
      width="xl"
    >
      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Weather Station Gedung Sate"
              className={inputClass}
            />
            {errors.name && (
              <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" /> {errors.name}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>
              ID / Code <span className="text-red-500">*</span>{' '}
              {entityToEdit && <span className="text-[10px] text-slate-400 font-normal">(cannot be changed)</span>}
            </label>
            <input
              type="text"
              value={code}
              disabled={!!entityToEdit}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. IOT-BDG-004"
              className={`${inputClass} font-mono ${
                entityToEdit ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''
              }`}
            />
            {errors.code && (
              <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" /> {errors.code}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as EntityCategory)}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="vehicle">Vehicle (Car, Truck, Fleet)</option>
              <option value="iot_device">IoT Device (Sensor, Weather Node)</option>
              <option value="facility">Facility (Office, Warehouse, Depot)</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>
              Current Status <span className="text-red-500">*</span>
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as EntityStatus)}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="active">Active (Normal Operation)</option>
              <option value="maintenance">Maintenance (Under Repair)</option>
              <option value="inactive">Inactive (Offline)</option>
            </select>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" /> Map Coordinates
            </span>
            {onPickOnMapRequest && (
              <button
                type="button"
                onClick={onPickOnMapRequest}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 bg-white px-2.5 py-1 rounded border border-slate-300 hover:border-blue-400 shadow-2xs transition-colors"
              >
                <Crosshair className="w-3.5 h-3.5" />
                Choose on Map
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Latitude (-90 to 90) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={latitude}
                onChange={e => setLatitude(e.target.value)}
                placeholder="-6.917464"
                className={`${inputClass} font-mono`}
              />
              {errors.latitude && (
                <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {errors.latitude}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Longitude (-180 to 180) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={longitude}
                onChange={e => setLongitude(e.target.value)}
                placeholder="107.619122"
                className={`${inputClass} font-mono`}
              />
              {errors.longitude && (
                <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {errors.longitude}
                </p>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className={labelClass}>Notes / Description</label>
          <textarea
            rows={2}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Write a brief description or location landmark..."
            className={`${inputClass} resize-none`}
          />
        </div>

        <div className="border border-slate-200 rounded-md p-3.5 bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-semibold text-slate-800">
                Additional Information (Optional)
              </label>
              <p className="text-[11px] text-slate-500">
                Click a suggestion below or add your own custom details.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleAddAttribute('')}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 bg-white px-2.5 py-1 rounded border border-slate-300 hover:border-blue-400 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Detail
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {suggestions.map(sug => {
              const isAdded = attributes.some(
                a => a.label.toLowerCase() === sug.label.toLowerCase()
              );
              return (
                <button
                  key={sug.label}
                  type="button"
                  disabled={isAdded}
                  onClick={() => handleAddAttribute(sug.label)}
                  className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                    isAdded
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-default'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-blue-500 hover:text-blue-600'
                  }`}
                >
                  + {sug.label}
                </button>
              );
            })}
          </div>

          {attributes.length > 0 && (
            <div className="space-y-2 pt-1">
              {attributes.map(attr => {
                const matchedSug = suggestions.find(
                  s => s.label.toLowerCase() === attr.label.toLowerCase()
                );
                return (
                  <div key={attr.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={attr.label}
                      onChange={e => handleUpdateAttribute(attr.id, 'label', e.target.value)}
                      placeholder="Label (e.g. Plate Number)"
                      className="w-2/5 bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                    />
                    <input
                      type="text"
                      value={attr.value}
                      onChange={e => handleUpdateAttribute(attr.id, 'value', e.target.value)}
                      placeholder={matchedSug ? matchedSug.placeholder : 'Enter value...'}
                      className="flex-1 bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveAttribute(attr.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                      title="Remove row"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : entityToEdit ? 'Save Changes' : 'Save Location'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
