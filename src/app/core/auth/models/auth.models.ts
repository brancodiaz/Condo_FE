// Request DTOs

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface CreateBasicUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}

export interface RefreshRequest {
  token: string;
  rememberMe: boolean;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface GoogleLoginRequest {
  googleToken: string;
}

// Response DTOs

export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  user: UserSummaryResponse;
  message: string;
}

export interface UserSummaryResponse {
  id: number;
  firstName: string;
  fullName: string;
  email: string;
  roles: UserGlobalRoleResponse;
}

export interface UserGlobalRoleResponse {
  roleId: number;
  roleDescription: string;
}
