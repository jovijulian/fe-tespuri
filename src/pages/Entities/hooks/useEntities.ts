import { useState, useEffect, useCallback } from 'react';
import { entityService } from '../../../services';
import { Entity, CreateEntityPayload, UpdateEntityPayload } from '../../../types/entity';
import { ViewMode } from '../components/EntityHeader';
import toast from 'react-hot-toast';

export function useEntities() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('split');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [entityToEdit, setEntityToEdit] = useState<Entity | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [entityToDelete, setEntityToDelete] = useState<Entity | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [pickedCoordinates, setPickedCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  const fetchEntities = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await entityService.getEntities({
        page: 1,
        per_page: 100,
        search: searchQuery,
        category: selectedCategory,
        status: selectedStatus,
      });

      if (response.success) {
        setEntities(response.data);
      }
    } catch (err: any) {
      console.error('Entity fetch error:', err);
      toast.error('Failed to synchronize spatial entities from server');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedStatus]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchEntities();
    }, 250);
    return () => clearTimeout(handler);
  }, [fetchEntities]);

  const handleFormSubmit = async (payload: CreateEntityPayload | UpdateEntityPayload): Promise<boolean> => {
    try {
      if (entityToEdit) {
        const response = await entityService.updateEntity(entityToEdit.id, payload as UpdateEntityPayload);
        if (response.success) {
          toast.success(`Entity "${response.data.name}" updated`);
          setSelectedEntity(response.data);
          fetchEntities();
          return true;
        }
      } else {
        const response = await entityService.createEntity(payload as CreateEntityPayload);
        if (response.success) {
          toast.success(`Entity "${response.data.name}" registered`);
          setSelectedEntity(response.data);
          fetchEntities();
          return true;
        }
      }
      return false;
    } catch (err: any) {
      const msg =
        err.response?.data?.errors?.[0]?.message ||
        err.response?.data?.message ||
        'Operation failed. Verify input parameters.';
      toast.error(msg);
      return false;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!entityToDelete) return;
    setIsDeleting(true);
    try {
      const response = await entityService.deleteEntity(entityToDelete.id);
      if (response.success) {
        toast.success(`Entity "${entityToDelete.name}" removed`);
        if (selectedEntity?.id === entityToDelete.id) {
          setSelectedEntity(null);
          setIsDetailOpen(false);
        }
        setIsDeleteOpen(false);
        setEntityToDelete(null);
        fetchEntities();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Delete operation failed');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePickOnMapRequest = () => {
    setViewMode('split');
    setIsPickingLocation(true);
    setIsFormOpen(false);
  };

  const handleCancelPick = () => {
    setIsPickingLocation(false);
    setIsFormOpen(true);
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (isPickingLocation) {
      setPickedCoordinates({ lat, lng });
      setIsPickingLocation(false);
      setIsFormOpen(true);
      toast.success(`Coordinates captured: ${lat}, ${lng}`);
    }
  };

  return {
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
  };
}
