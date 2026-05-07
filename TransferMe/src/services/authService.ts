/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { apiClient } from './api';

export interface GoogleAuthUrlResponse {
  authUrl: string;
}

export interface GoogleTokenExchangeRequest {
  code: string;
  redirectUri: string;
}

export interface AuthSessionResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface RefreshSessionRequest {
  refreshToken: string;
}

export interface AuthMeResponse {
  id: number;
  studentId: string;
  email: string;
  name: string;
  currentInstitutionId?: number;
  createdAt: string;
  updatedAt: string;
}

class AuthService {
  /**
   * Get Google OAuth URL
   */
  async getGoogleAuthUrl(): Promise<GoogleAuthUrlResponse> {
    return apiClient.get<GoogleAuthUrlResponse>('/auth/google/url');
  }

  /**
   * Exchange Google code for auth tokens
   */
  async exchangeGoogleTokens(
    request: GoogleTokenExchangeRequest
  ): Promise<AuthSessionResponse> {
    const response = await apiClient.post<AuthSessionResponse>(
      '/auth/google/exchange',
      request
    );
    if (response?.accessToken) {
      apiClient.setToken(response.accessToken);
    }
    return response;
  }

  /**
   * Refresh authentication session
   */
  async refreshSession(request: RefreshSessionRequest): Promise<AuthSessionResponse> {
    const response = await apiClient.post<AuthSessionResponse>('/auth/refresh', request);
    if (response?.accessToken) {
      apiClient.setToken(response.accessToken);
    }
    return response;
  }

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<AuthMeResponse> {
    return apiClient.get<AuthMeResponse>('/auth/me');
  }

  /**
   * Sync current user session
   */
  async syncSession(): Promise<AuthMeResponse> {
    return apiClient.post<AuthMeResponse>('/auth/sync');
  }

  /**
   * Logout (invalidate session)
   */
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
    apiClient.setToken(null);
  }
}

export const authService = new AuthService();
export default AuthService;
