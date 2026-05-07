/**
 * Institution Service
 * Handles institution/university search and transfer information API calls
 */

import { apiClient } from './api';

export interface InstitutionCodeDto {
  id: number;
  code: string;
  name: string;
  category?: number;
  isCommunityCollege?: boolean;
  state?: string;
  city?: string;
}

export interface InstitutionPairDto {
  fromInstitution: InstitutionCodeDto;
  toInstitution: InstitutionCodeDto;
  agreementCount?: number;
  lastUpdated?: string;
}

export interface InstitutionSyncResponse {
  synced: number;
  failed: number;
  message: string;
  timestamp: string;
}

export interface InstitutionCodeImportRow {
  code: string;
  name: string;
  category?: number;
  isCommunityCollege?: boolean;
  state?: string;
  city?: string;
}

class InstitutionService {
  /**
   * Search institutions by query and filters
   */
  async searchInstitutions(
    query?: string,
    category?: number,
    isCommunityCollege?: boolean
  ): Promise<InstitutionCodeDto[]> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (category !== undefined) params.append('category', category.toString());
    if (isCommunityCollege !== undefined) params.append('isCommunityCollege', isCommunityCollege.toString());

    const queryString = params.toString();
    const endpoint = `/institutions${queryString ? '?' + queryString : ''}`;
    return apiClient.get<InstitutionCodeDto[]>(endpoint);
  }

  /**
   * Get institution by ID
   */
  async getInstitutionById(id: number): Promise<InstitutionCodeDto> {
    return apiClient.get<InstitutionCodeDto>(`/institutions/${id}`);
  }

  /**
   * Get transfer pair information between two institutions
   */
  async getInstitutionPair(toId: number, fromId: number): Promise<InstitutionPairDto> {
    return apiClient.get<InstitutionPairDto>(
      `/institutions/pair?toId=${toId}&fromId=${fromId}`
    );
  }

  /**
   * Sync institutions from Assist.org
   */
  async syncFromAssist(): Promise<InstitutionSyncResponse> {
    return apiClient.post<InstitutionSyncResponse>('/institutions/sync');
  }

  /**
   * Sync institutions from local file
   */
  async syncFromLocalFile(): Promise<InstitutionSyncResponse> {
    return apiClient.post<InstitutionSyncResponse>('/institutions/sync/local');
  }

  /**
   * Import institutions from provided data
   */
  async importInstitutions(rows: InstitutionCodeImportRow[]): Promise<InstitutionSyncResponse> {
    return apiClient.post<InstitutionSyncResponse>('/institutions/import', rows);
  }
}

export const institutionService = new InstitutionService();
export default InstitutionService;
