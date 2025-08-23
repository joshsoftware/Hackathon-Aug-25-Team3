import {
  organizationApi,
  LoginRequest,
  OrganizationRegisterRequest,
} from "@/app/(presentation-generator)/services/api/organizations";
import { cookies } from "next/headers";

interface JwtPayload {
  sub: string; // user_id
  exp: number;
  [key: string]: any;
}

function decodeToken(token: string): JwtPayload | null {
  try {
    // Split the token and get the payload part
    const base64Payload = token.split(".")[1];
    // Decode the base64
    const payload = JSON.parse(atob(base64Payload));
    return payload;
  } catch (e) {
    console.error("Error decoding token:", e);
    return null;
  }
}

export async function login(credentials: LoginRequest) {
  try {
    const response = await organizationApi.login(credentials);
    setAuthToken(response.access_token);
    // Log user_id from token
    const decoded = decodeToken(response.access_token);
    if (decoded) {
      console.log("Logged in user_id:", decoded.sub);
    }
    return response;
  } catch (error) {
    throw error;
  }
}

export async function signup(credentials: OrganizationRegisterRequest) {
  try {
    const response = await organizationApi.register(credentials);
    if (response.access_token) {
      setAuthToken(response.access_token);
      // Log user_id from token
      const decoded = decodeToken(response.access_token);
      if (decoded) {
        console.log("Signed up user_id:", decoded.sub);
      }
    }
    return response;
  } catch (error) {
    throw error;
  }
}

export function setAuthToken(token: string): void {
  localStorage.setItem("auth_token", token);
  document.cookie = `auth_token=${token}; path=/; max-age=2592000`; // 30 days
  // Log user_id when token is set
  const decoded = decodeToken(token);
  if (decoded) {
    console.log("Setting token for user_id:", decoded.sub);
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem("auth_token");
}

export function getUserIdFromToken(): string | null {
  const token = getAuthToken();
  if (!token) return null;

  const decoded = decodeToken(token);
  return decoded?.sub || null;
}

export function removeAuthToken(): void {
  // Log user_id being logged out
  const token = getAuthToken();
  if (token) {
    const decoded = decodeToken(token);
    if (decoded) {
      console.log("Logging out user_id:", decoded.sub);
    }
  }
  localStorage.removeItem("auth_token");
  document.cookie =
    "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

// Helper to handle 401 responses
export function handleAuthError(error: any): never {
  if (error.status === 401) {
    removeAuthToken();
    window.location.href = "/login";
  }
  throw error;
}
