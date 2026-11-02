import { IEntityService, EntityFilterParams, MapFilterParams } from '../contracts/IEntityService';
import { ApiResponse, CreateEntityPayload, Entity, EntityMapPoint, UpdateEntityPayload } from '../../types/entity';
import { endpointUrl, httpDelete, httpGet, httpPost, httpPut } from '../../lib/axios';

export class EntityService implements IEntityService {
  async getEntities(params?: EntityFilterParams): Promise<ApiResponse<Entity[]>> {
    const url = endpointUrl('entities');
    const response = await httpGet<ApiResponse<Entity[]>>(url, false, params);
    return response.data;
  }

  async getMapPoints(params?: MapFilterParams): Promise<ApiResponse<EntityMapPoint[]>> {
    const url = endpointUrl('entities/map');
    const response = await httpGet<ApiResponse<EntityMapPoint[]>>(url, false, params);
    return response.data;
  }

  async getEntityById(id: number): Promise<ApiResponse<Entity>> {
    const url = endpointUrl(`entities/${id}`);
    const response = await httpGet<ApiResponse<Entity>>(url, false);
    return response.data;
  }

  async createEntity(payload: CreateEntityPayload): Promise<ApiResponse<Entity>> {
    const url = endpointUrl('entities');
    const response = await httpPost<ApiResponse<Entity>>(url, payload, false);
    return response.data;
  }

  async updateEntity(id: number, payload: UpdateEntityPayload): Promise<ApiResponse<Entity>> {
    const url = endpointUrl(`entities/${id}`);
    const response = await httpPut<ApiResponse<Entity>>(url, payload, false);
    return response.data;
  }

  async deleteEntity(id: number): Promise<ApiResponse<null>> {
    const url = endpointUrl(`entities/${id}`);
    const response = await httpDelete<ApiResponse<null>>(url, false);
    return response.data;
  }
}

export const entityServiceInstance: IEntityService = new EntityService();
