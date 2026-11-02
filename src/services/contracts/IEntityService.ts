import { ApiResponse, CreateEntityPayload, Entity, EntityMapPoint, UpdateEntityPayload } from '../../types/entity';

export interface EntityFilterParams {
  page?: number;
  per_page?: number;
  search?: string;
  category?: string;
  status?: string;
}

export interface MapFilterParams {
  category?: string;
  status?: string;
}

export interface IEntityService {
  getEntities(params?: EntityFilterParams): Promise<ApiResponse<Entity[]>>;
  getMapPoints(params?: MapFilterParams): Promise<ApiResponse<EntityMapPoint[]>>;
  getEntityById(id: number): Promise<ApiResponse<Entity>>;
  createEntity(payload: CreateEntityPayload): Promise<ApiResponse<Entity>>;
  updateEntity(id: number, payload: UpdateEntityPayload): Promise<ApiResponse<Entity>>;
  deleteEntity(id: number): Promise<ApiResponse<null>>;
}
