export interface User {
  id: number;
  username: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
}

export interface SessionResponse {
  authenticated: boolean;
  user?: User;
}
