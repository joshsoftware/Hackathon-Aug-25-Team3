export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  organizationName: string;
  userName: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    organizationId: string;
    organizationName: string;
  };
}

export interface AuthError {
  message: string;
  code?: string;
}
