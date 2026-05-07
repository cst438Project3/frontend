/**
 * User Service
 * Handles user profile and account management API calls
 */

import { apiClient } from './api';

export interface CreateUserRequest {
  name: string;
  currentInstitutionId?: number;
}

export interface UserResponse {
  id: number;
  studentId: string;
  email: string;
  name: string;
  currentInstitutionId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  studentId: string;
  currentCollege?: string;
  targetUniversity?: string;
  major?: string;
}

export interface UserProfileRequest {
  currentCollege?: string;
  targetUniversity?: string;
  major?: string;
}

class UserService {
  /**
   * Register a new user profile
   */
  async register(data: CreateUserRequest): Promise<UserResponse> {
    return apiClient.post<UserResponse>('/users/register', data);
  }

  /**
   * Get current user profile
   */
  async getCurrentUserProfile(): Promise<UserResponse> {
    return apiClient.get<UserResponse>('/users/me');
  }

  /**
   * Get user by ID
   */
  async getUserById(id: number): Promise<UserResponse> {
    return apiClient.get<UserResponse>(`/users/${id}`);
  }

  /**
   * Update user profile
   */
  async updateUser(id: number, data: CreateUserRequest): Promise<UserResponse> {
    return apiClient.put<UserResponse>(`/users/${id}`, data);
  }

  /**
   * Get current user's detailed profile
   */
  async getProfile(): Promise<UserProfile> {
    return apiClient.get<UserProfile>('/users/me/profile');
  }

  /**
   * Update or create current user's detailed profile
   */
  async upsertProfile(data: UserProfileRequest): Promise<UserProfile> {
    return apiClient.put<UserProfile>('/users/me/profile', data);
  }
}

export const userService = new UserService();
export default UserService;
