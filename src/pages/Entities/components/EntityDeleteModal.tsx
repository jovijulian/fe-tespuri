import React from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Entity } from '../../../types/entity';
import { AlertTriangle } from 'lucide-react';

interface EntityDeleteModalProps {
  entity: Entity | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export const EntityDeleteModal: React.FC<EntityDeleteModalProps> = ({
  entity,
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  if (!entity) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-red-700 font-semibold text-sm">
          <AlertTriangle className="w-4 h-4" /> Confirm Entity Removal
        </div>
      }
      width="md"
    >
      <div className="p-5 space-y-4">
        <p className="text-xs text-slate-600 leading-relaxed">
          Remove spatial entity <strong className="text-slate-900">{entity.name}</strong> (
          <code className="font-mono text-slate-800">{entity.code}</code>) from active monitoring?
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded p-3 text-[11px] text-slate-600 font-mono">
          <div>Coordinates: {entity.latitude.toFixed(6)}, {entity.longitude.toFixed(6)}</div>
          <div>Category: {entity.category}</div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Removing...' : 'Delete Entity'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
