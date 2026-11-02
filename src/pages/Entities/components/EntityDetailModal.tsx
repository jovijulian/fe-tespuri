import React, { useState } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Entity } from '../../../types/entity';
import { MapPin, Calendar, Clock, Edit2, Trash2, X, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface EntityDetailModalProps {
  entity: Entity | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (entity: Entity) => void;
  onDelete: (entity: Entity) => void;
}

const formatAttributeLabel = (key: string): string =>
  key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());

export const EntityDetailModal: React.FC<EntityDetailModalProps> = ({
  entity,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [copied, setCopied] = useState(false);

  if (!entity || !isOpen) return null;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return dateStr;
    }
  };

  const handleCopyCoords = () => {
    const text = `${entity.latitude.toFixed(6)}, ${entity.longitude.toFixed(6)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`Coordinates copied: ${text}`);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'maintenance':
        return <Badge variant="warning">Maintenance</Badge>;
      case 'inactive':
        return <Badge variant="outline">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'vehicle':
        return <Badge variant="secondary">Vehicle</Badge>;
      case 'iot_device':
        return <Badge variant="default">IoT Device</Badge>;
      case 'facility':
        return <Badge variant="warning">Facility</Badge>;
      default:
        return <Badge variant="outline">{category}</Badge>;
    }
  };

  const metadataEntries = entity.metadata ? Object.entries(entity.metadata) : [];

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/25 z-[440] md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-x-3 bottom-3 max-h-[60vh] md:max-h-none md:absolute md:inset-x-auto md:top-3 md:right-3 md:bottom-3 w-auto md:w-full md:max-w-[360px] z-[450] bg-white border border-slate-300 rounded-lg shadow-2xl flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-2 shrink-0">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="font-mono text-[11px] font-semibold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
              {entity.code}
            </span>
            {getCategoryLabel(entity.category)}
            {getStatusBadge(entity.status)}
          </div>
          <h3 className="text-sm font-semibold text-slate-900 leading-snug">
            {entity.name}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-200/60 transition-colors shrink-0"
          aria-label="Close details"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="border border-slate-200 rounded-md p-3 bg-slate-50/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-600" /> Location Coordinates
            </span>
            <button
              type="button"
              onClick={handleCopyCoords}
              className="text-[11px] text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200 hover:border-slate-300 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" /> Copy
                </>
              )}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 font-mono text-xs">
            <div className="bg-white p-2 rounded border border-slate-200">
              <span className="text-[10px] text-slate-400 block">LATITUDE</span>
              <span className="text-slate-900 font-semibold tabular-nums">
                {entity.latitude.toFixed(6)}°
              </span>
            </div>
            <div className="bg-white p-2 rounded border border-slate-200">
              <span className="text-[10px] text-slate-400 block">LONGITUDE</span>
              <span className="text-slate-900 font-semibold tabular-nums">
                {entity.longitude.toFixed(6)}°
              </span>
            </div>
          </div>
        </div>

        {entity.description && (
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Description & Notes
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-200">
              {entity.description}
            </p>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Additional Information ({metadataEntries.length})
            </h4>
          </div>

          {metadataEntries.length === 0 ? (
            <div className="text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded p-3 text-center">
              No additional details recorded for this location.
            </div>
          ) : (
            <div className="border border-slate-200 rounded-md divide-y divide-slate-200 overflow-hidden text-xs">
              {metadataEntries.map(([key, val]) => (
                <div key={key} className="flex items-center justify-between px-3 py-2 bg-white gap-2">
                  <span className="text-slate-500 text-xs">
                    {formatAttributeLabel(key)}
                  </span>
                  <span className="font-medium text-slate-900 text-right">
                    {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-slate-200 space-y-1.5 text-[11px] text-slate-500">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Added
            </span>
            <span className="font-mono text-slate-700">{formatDate(entity.created_at)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> Last Updated
            </span>
            <span className="font-mono text-slate-700">{formatDate(entity.updated_at)}</span>
          </div>
        </div>
      </div>

      <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
        <Button
          variant="danger"
          size="sm"
          onClick={() => onDelete(entity)}
          className="gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(entity)}
          className="flex-1 gap-1.5"
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>Edit Details</span>
        </Button>
      </div>
    </div>
    </>
  );
};
