/**
 * @file lib/auth.ts
 * @description JWT token management (cookie-based)
 * Sprint 1 — Frontend Team Deliverable
 */

const TOKEN_KEY = 'leados_token';

export function saveToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function saveUser(user: any): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('leados_user', JSON.stringify(user));
  }
}

export function getUser(): any | null {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('leados_user');
    return userStr ? JSON.parse(userStr) : null;
  }
  return null;
}

export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

export function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('leados_user');
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}
