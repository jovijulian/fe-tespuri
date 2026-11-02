import React from 'react';
import { useEntities } from './hooks/useEntities';
import { EntityHeader } from './components/EntityHeader';
import { EntitySidebar } from './components/EntitySidebar';
import { EntityMapCanvas } from './components/EntityMapCanvas';
import { EntityTableView } from './components/EntityTableView';
import { EntityDetailModal } from './components/EntityDetailModal';
import { EntityFormModal } from './components/EntityFormModal';
import { EntityDeleteModal } from './components/EntityDeleteModal';

export const EntitiesPage: React.FC = () => {
  const {
    entities,
    selectedEntity,
    setSelectedEntity,
    isLoading,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    isDetailOpen,
    setIsDetailOpen,
    isFormOpen,
    setIsFormOpen,
    entityToEdit,
    setEntityToEdit,
    isDeleteOpen,
    setIsDeleteOpen,
    entityToDelete,
    setEntityToDelete,
    isDeleting,
    isPickingLocation,
    pickedCoordinates,
    setPickedCoordinates,
    fetchEntities,
    handleFormSubmit,
    handleDeleteConfirm,
    handlePickOnMapRequest,
    handleCancelPick,
    handleMapClick,
  } = useEntities();

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 overflow-hidden font-sans">
      <EntityHeader
        entities={entities}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddClick={() => {
          setEntityToEdit(null);
          setIsFormOpen(true);
        }}
        onRefresh={fetchEntities}
        isLoading={isLoading}
      />

      {viewMode === 'split' ? (
        <div className="flex flex-1 overflow-hidden relative">
          <EntitySidebar
            entities={entities}
            selectedEntity={selectedEntity}
            onSelectEntity={entity => {
              setSelectedEntity(entity);
              setIsDetailOpen(true);
            }}
            onEditEntity={entity => {
              setEntityToEdit(entity);
              setIsFormOpen(true);
            }}
            onDeleteEntity={entity => {
              setEntityToDelete(entity);
              setIsDeleteOpen(true);
            }}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            isLoading={isLoading}
          />

          <main className="flex-1 h-full relative">
            <EntityMapCanvas
              entities={entities}
              selectedEntity={selectedEntity}
              onSelectEntity={entity => {
                setSelectedEntity(entity);
                setIsDetailOpen(true);
              }}
              onEditEntity={entity => {
                setEntityToEdit(entity);
                setIsFormOpen(true);
              }}
              onDeleteEntity={entity => {
                setEntityToDelete(entity);
                setIsDeleteOpen(true);
              }}
              onMapClick={handleMapClick}
              onCancelPick={handleCancelPick}
              isPickingLocation={isPickingLocation}
            />

            <EntityDetailModal
              isOpen={isDetailOpen}
              onClose={() => setIsDetailOpen(false)}
              entity={selectedEntity}
              onEdit={entity => {
                setEntityToEdit(entity);
                setIsFormOpen(true);
              }}
              onDelete={entity => {
                setEntityToDelete(entity);
                setIsDeleteOpen(true);
              }}
            />
          </main>
        </div>
      ) : (
        <EntityTableView
          entities={entities}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          onLocateOnMap={entity => {
            setSelectedEntity(entity);
            setIsDetailOpen(true);
            setViewMode('split');
          }}
          onEditEntity={entity => {
            setEntityToEdit(entity);
            setIsFormOpen(true);
          }}
          onDeleteEntity={entity => {
            setEntityToDelete(entity);
            setIsDeleteOpen(true);
          }}
          isLoading={isLoading}
        />
      )}

      <EntityFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEntityToEdit(null);
          setPickedCoordinates(null);
        }}
        onSubmit={handleFormSubmit}
        entityToEdit={entityToEdit}
        onPickOnMapRequest={handlePickOnMapRequest}
        pickedCoordinates={pickedCoordinates}
      />

      <EntityDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setEntityToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        entity={entityToDelete}
      />
    </div>
  );
};

export default EntitiesPage;
