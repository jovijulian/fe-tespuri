export type EntityCategory = 'vehicle' | 'iot_device' | 'facility';
export type EntityStatus = 'active' | 'inactive' | 'maintenance';

export interface Entity {
  id: number;
  name: string;
  code: string;
  category: EntityCategory;
  status: EntityStatus;
  latitude: number;
  longitude: number;
  description?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface EntityMapPoint {
  id: number;
  name: string;
  code: string;
  category: EntityCategory;
  status: EntityStatus;
  latitude: number;
  longitude: number;
}

export interface CreateEntityPayload {
  name: string;
  code: string;
  category: EntityCategory;
  status: EntityStatus;
  latitude: number;
  longitude: number;
  description?: string;
  metadata?: Record<string, any>;
}

export interface UpdateEntityPayload {
  name: string;
  category: EntityCategory;
  status: EntityStatus;
  latitude: number;
  longitude: number;
  description?: string;
  metadata?: Record<string, any>;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Array<{ field: string; message: string }>;
  meta?: {
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
    server_time: string;
  };
}
