import React from 'react';
import { Entity, EntityCategory, EntityStatus } from '../../../types/entity';
import { Search, Truck, Radio, Building2, X, Edit2, Trash2 } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';

interface EntitySidebarProps {
  entities: Entity[];
  selectedEntity: Entity | null;
  onSelectEntity: (entity: Entity) => void;
  onEditEntity: (entity: Entity) => void;
  onDeleteEntity: (entity: Entity) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  isLoading: boolean;
}

export const EntitySidebar: React.FC<EntitySidebarProps> = ({
  entities,
  selectedEntity,
  onSelectEntity,
  onEditEntity,
  onDeleteEntity,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  isLoading,
}) => {
  const categories: { label: string; value: string }[] = [
    { label: 'All', value: '' },
    { label: 'Vehicles', value: 'vehicle' },
    { label: 'IoT Devices', value: 'iot_device' },
    { label: 'Facilities', value: 'facility' },
  ];

  const statuses: { label: string; value: string }[] = [
    { label: 'All Status', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Maintenance', value: 'maintenance' },
    { label: 'Inactive', value: 'inactive' },
  ];

  const getStatusBadge = (status: EntityStatus) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="success" className="gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            Active
          </Badge>
        );
      case 'maintenance':
        return (
          <Badge variant="warning" className="gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            Maint
          </Badge>
        );
      case 'inactive':
        return (
          <Badge variant="outline" className="gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Offline
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCategoryMeta = (category: EntityCategory) => {
    switch (category) {
      case 'vehicle':
        return {
          icon: <Truck className="w-3.5 h-3.5 text-blue-600" />,
          label: 'Vehicle',
          bg: 'bg-blue-50 border-blue-200',
        };
      case 'iot_device':
        return {
          icon: <Radio className="w-3.5 h-3.5 text-teal-600" />,
          label: 'IoT Device',
          bg: 'bg-teal-50 border-teal-200',
        };
      case 'facility':
        return {
          icon: <Building2 className="w-3.5 h-3.5 text-amber-600" />,
          label: 'Facility',
          bg: 'bg-amber-50 border-amber-200',
        };
    }
  };

  return (
    <aside className="w-full h-[55%] md:h-full md:w-[380px] lg:w-[400px] flex flex-col bg-white border-t md:border-t-0 md:border-r border-slate-200 shrink-0 z-10 overflow-hidden">
      <div className="p-3 md:p-3.5 border-b border-slate-200 space-y-2 bg-slate-50/60 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Filter by code or entity name..."
            className="w-full bg-white border border-slate-300 rounded-md pl-8 pr-8 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 bg-slate-200/70 p-0.5 rounded-md">
          {categories.map(cat => (
            <button
              key={cat.value}
              type="button"
              onClick={() => onCategoryChange(cat.value)}
              className={`flex-1 text-[11px] py-1 px-2 rounded font-medium transition-colors ${
                selectedCategory === cat.value
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs pt-0.5">
          <span className="text-[11px] font-medium text-slate-500">Operational status</span>
          <div className="flex items-center gap-1">
            {statuses.map(st => (
              <button
                key={st.value}
                type="button"
                onClick={() => onStatusChange(st.value)}
                className={`text-[11px] px-2 py-0.5 rounded border transition-colors ${
                  selectedStatus === st.value
                    ? 'bg-slate-900 text-white border-slate-900 font-medium'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {st.label === 'All Status' ? 'All' : st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {isLoading ? (
          <div className="p-8 text-center space-y-2">
            <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500">Loading spatial index...</p>
          </div>
        ) : entities.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <p className="text-xs font-medium text-slate-800">No matching entities</p>
            <p className="text-xs text-slate-500">
              Clear active search or category filters to view all registered locations.
            </p>
            {(searchQuery || selectedCategory || selectedStatus) && (
              <button
                type="button"
                onClick={() => {
                  onSearchChange('');
                  onCategoryChange('');
                  onStatusChange('');
                }}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium underline pt-1"
              >
                Reset all filters
              </button>
            )}
          </div>
        ) : (
          entities.map(entity => {
            const isSelected = selectedEntity?.id === entity.id;
            const catMeta = getCategoryMeta(entity.category);

            return (
              <div
                key={entity.id}
                onClick={() => onSelectEntity(entity)}
                className={`group relative px-4 py-3 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/60 border-l-[3px] border-l-blue-600 pl-[13px]'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-6 h-6 rounded border flex items-center justify-center shrink-0 ${catMeta.bg}`}
                    >
                      {catMeta.icon}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-slate-900 truncate">
                        {entity.name}
                      </h4>
                      <span className="text-[11px] font-mono text-slate-500 block">
                        {entity.code}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1">
                    {getStatusBadge(entity.status)}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pl-8 text-[11px]">
                  <span className="font-mono text-slate-500 tabular-nums">
                    {entity.latitude.toFixed(5)}, {entity.longitude.toFixed(5)}
                  </span>

                  <div
                    className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => onEditEntity(entity)}
                      title="Edit entity"
                      className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteEntity(entity)}
                      title="Delete entity"
                      className="p-1 rounded text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
        <span>Showing {entities.length} locations</span>
        <span>Click item to view on map</span>
      </div>
    </aside>
  );
};
