export interface UserProfileResponse {
  id: number;
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string;
  phone: string | null;
  dateOfBirth: string | null;
  documentType: string | null;
  documentId: string | null;
  themePreference: string | null;
  createdAt: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  middleName?: string | null;
  lastName: string;
  phone?: string | null;
  dateOfBirth?: string | null;
  documentType?: string | null;
  documentId?: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdatePreferencesRequest {
  themePreference: string;
}
