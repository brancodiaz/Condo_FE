export interface UserProfileResponse {
  id: number;
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string;
  countryCodePhone: string | null;
  phoneNumber: string | null;
  dateOfBirth: string | null;
  documentType: string | null;
  documentId: string | null;
  hasLocalLogin: boolean;
  theme: string | null;
  createdAt: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  middleName?: string | null;
  lastName: string;
  countryCodePhone?: string | null;
  phoneNumber?: string | null;
  dateOfBirth?: string | null;
  documentType?: string | null;
  documentId?: string | null;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
