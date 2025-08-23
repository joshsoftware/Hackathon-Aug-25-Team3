import { getAuthToken } from "@/lib/auth";
import { api } from "@/lib/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface OrganizationRegisterRequest {
  email: string;
  password: string;
  organisation_name: string;
  full_name: string;
}

export interface UserInfo {
  id: string;
  email: string;
  organisation_name?: string;
  full_name?: string;
}

export const organizationApi = {
  register: async (data: OrganizationRegisterRequest) => {
    const response = await api.post(
      `${API_BASE_URL}/api/v1/organisations/onboard-with-admin`,
      data,
      { skipAuth: true } // Skip auth for registration
    );

    if (!response.ok) {
      throw new Error("Registration failed");
    }

    return response.json();
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post(
      `${API_BASE_URL}/api/v1/organisations/login`,
      data,
      { skipAuth: true } // Skip auth for login
    );

    if (!response.ok) {
      throw new Error("Login failed");
    }

    return response.json();
  },

  getMe: async (): Promise<UserInfo> => {
    const response = await api.get(`${API_BASE_URL}/api/v1/organisations/me`);

    if (!response.ok) {
      throw new Error("Failed to fetch user info");
    }

    return response.json();
  },

  // Add other organization-related API calls here
  // They will automatically include the auth token
};
