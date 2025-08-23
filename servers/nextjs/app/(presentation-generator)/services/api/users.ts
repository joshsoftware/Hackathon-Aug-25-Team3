import { api } from "@/lib/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "member";
  created_at: string;
}

export interface InviteUserRequest {
  email: string;
  name: string;
}

export const usersApi = {
  listUsers: async (): Promise<User[]> => {
    const response = await api.get(`${API_BASE_URL}/api/v1/ppt/users`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch users");
    }

    return response.json();
  },

  inviteUser: async (data: InviteUserRequest): Promise<void> => {
    const response = await api.post(
      `${API_BASE_URL}/api/v1/ppt/users/invite`,
      data
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to invite user");
    }
  },

  updateUserRole: async (
    userId: string,
    role: "admin" | "member"
  ): Promise<void> => {
    const response = await api.put(
      `${API_BASE_URL}/api/v1/ppt/users/${userId}/role`,
      { role }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update user role");
    }
  },

  deleteUser: async (userId: string): Promise<void> => {
    const response = await api.delete(
      `${API_BASE_URL}/api/v1/ppt/users/${userId}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete user");
    }
  },
};
