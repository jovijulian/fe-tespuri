import React from 'react';
import { Entity, EntityCategory, EntityStatus } from '../../../types/entity';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Search, Truck, Radio, Building2, MapPin, Edit2, Trash2, X } from 'lucide-react';

interface EntityTableViewProps {
  entities: Entity[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  onLocateOnMap: (entity: Entity) => void;
  onEditEntity: (entity: Entity) => void;
  onDeleteEntity: (entity: Entity) => void;
  isLoading: boolean;
}

export const EntityTableView: React.FC<EntityTableViewProps> = ({
  entities,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  onLocateOnMap,
  onEditEntity,
  onDeleteEntity,
  isLoading,
}) => {
  const getCategoryCell = (category: EntityCategory) => {
    switch (category) {
      case 'vehicle':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-700">
            <Truck className="w-3.5 h-3.5 text-blue-600" /> Vehicle
          </span>
        );
      case 'iot_device':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-700">
            <Radio className="w-3.5 h-3.5 text-teal-600" /> IoT Node
          </span>
        );
      case 'facility':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-700">
            <Building2 className="w-3.5 h-3.5 text-amber-600" /> Facility
          </span>
        );
    }
  };

  const getStatusBadge = (status: EntityStatus) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'maintenance':
        return <Badge variant="warning">Maintenance</Badge>;
      case 'inactive':
        return <Badge variant="outline">Inactive</Badge>;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden p-4 lg:p-6">
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs flex flex-col flex-1 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Search by code or entity name..."
              className="w-full bg-white border border-slate-300 rounded-md pl-8 pr-8 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
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

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedCategory}
              onChange={e => onCategoryChange(e.target.value)}
              className="bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
            >
              <option value="">All Categories</option>
              <option value="vehicle">Vehicles</option>
              <option value="iot_device">IoT Devices</option>
              <option value="facility">Facilities</option>
            </select>

            <select
              value={selectedStatus}
              onChange={e => onStatusChange(e.target.value)}
              className="bg-white border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-600"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
              <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-2.5 px-4">Code</th>
                <th className="py-2.5 px-4">Entity Name</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Coordinates (Lat, Lng)</th>
                <th className="py-2.5 px-4">Additional Info</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Loading spatial records...
                  </td>
                </tr>
              ) : entities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No matching spatial entities found.
                  </td>
                </tr>
              ) : (
                entities.map(entity => {
                  const metaKeys = entity.metadata ? Object.entries(entity.metadata) : [];
                  return (
                    <tr key={entity.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-700 whitespace-nowrap">
                        {entity.code}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">{entity.name}</div>
                        {entity.description && (
                          <div className="text-[11px] text-slate-500 truncate max-w-xs">
                            {entity.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">{getCategoryCell(entity.category)}</td>
                      <td className="py-3 px-4 whitespace-nowrap">{getStatusBadge(entity.status)}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 tabular-nums whitespace-nowrap">
                        {entity.latitude.toFixed(6)}, {entity.longitude.toFixed(6)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {metaKeys.slice(0, 3).map(([k, v]) => (
                            <span
                              key={k}
                              className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[10px] text-slate-600"
                            >
                              {k}: {String(v)}
                            </span>
                          ))}
                          {metaKeys.length > 3 && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              +{metaKeys.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onLocateOnMap(entity)}
                            className="h-7 px-2 gap-1 text-[11px]"
                            title="View on Map"
                          >
                            <MapPin className="w-3 h-3 text-blue-600" />
                            <span>Locate</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEditEntity(entity)}
                            className="h-7 w-7"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDeleteEntity(entity)}
                            className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Total {entities.length} locations</span>
        </div>
      </div>
    </div>
  );
};
