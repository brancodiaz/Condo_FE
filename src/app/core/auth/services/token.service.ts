import { Injectable, inject } from '@angular/core';
import { StorageService } from '../../services/storage.service';

const REFRESH_TOKEN_KEY = 'rt';
const REMEMBER_ME_KEY = 'rm';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly storage = inject(StorageService);

  private accessToken: string | null = null;
  private expiresAt: number = 0;

  getAccessToken(): string | null {
    if (this.accessToken && Date.now() < this.expiresAt) {
      return this.accessToken;
    }
    return null;
  }

  setAccessToken(token: string, expiresInSeconds: number): void {
    this.accessToken = token;
    this.expiresAt = Date.now() + expiresInSeconds * 1000;
  }

  getTimeUntilExpiry(): number {
    return Math.max(0, this.expiresAt - Date.now());
  }

  clearAccessToken(): void {
    this.accessToken = null;
    this.expiresAt = 0;
  }

  getRefreshToken(): string | null {
    return this.storage.getItem(REFRESH_TOKEN_KEY);
  }

  setRefreshToken(token: string): void {
    this.storage.setItem(REFRESH_TOKEN_KEY, token);
  }

  clearRefreshToken(): void {
    this.storage.removeItem(REFRESH_TOKEN_KEY);
  }

  getRememberMe(): boolean {
    return this.storage.getItem(REMEMBER_ME_KEY) === 'true';
  }

  setRememberMe(value: boolean): void {
    this.storage.setItem(REMEMBER_ME_KEY, value ? 'true' : 'false');
  }

  clearAll(): void {
    this.clearAccessToken();
    this.clearRefreshToken();
    this.storage.removeItem(REMEMBER_ME_KEY);
  }

  hasRefreshToken(): boolean {
    return !!this.getRefreshToken();
  }
}
