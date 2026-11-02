import React from 'react';
import { Button } from '../../../components/ui/Button';
import { Plus, RefreshCw, Map as MapIcon, Table as TableIcon, Compass } from 'lucide-react';
import { Entity } from '../../../types/entity';

export type ViewMode = 'split' | 'table';

interface EntityHeaderProps {
  entities: Entity[];
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onAddClick: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const EntityHeader: React.FC<EntityHeaderProps> = ({
  entities,
  viewMode,
  onViewModeChange,
  onAddClick,
  onRefresh,
  isLoading,
}) => {
  const activeCount = entities.filter(e => e.status === 'active').length;
  const maintenanceCount = entities.filter(e => e.status === 'maintenance').length;
  const inactiveCount = entities.filter(e => e.status === 'inactive').length;

  return (
    <header className="h-14 border-b border-slate-200 bg-white px-4 lg:px-6 flex items-center justify-between shrink-0 z-30">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center text-white">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-900 tracking-tight">
                Location & Asset Management
              </span>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4 pl-6 border-l border-slate-200 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Total</span>
            <span className="font-mono font-semibold text-slate-900 tabular-nums">{entities.length}</span>
          </div>
          <span className="text-slate-300">/</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span className="text-slate-600">Active</span>
            <span className="font-mono font-medium text-slate-900 tabular-nums">{activeCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-slate-600">Maint.</span>
            <span className="font-mono font-medium text-slate-900 tabular-nums">{maintenanceCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span className="text-slate-600">Offline</span>
            <span className="font-mono font-medium text-slate-900 tabular-nums">{inactiveCount}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="inline-flex rounded-md border border-slate-200 bg-slate-100 p-0.5">
          <button
            type="button"
            onClick={() => onViewModeChange('split')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === 'split'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Map Workbench</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('table')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === 'table'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Table View</span>
          </button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="gap-1.5"
          title="Synchronize entities"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden lg:inline">Sync</span>
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={onAddClick}
          className="gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Register Entity</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>
    </header>
  );
};
