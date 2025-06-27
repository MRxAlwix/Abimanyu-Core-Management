import CryptoJS from 'crypto-js';
import { STORAGE_KEYS } from '../config/constants';

const SECRET_KEY = 'abimanyu-core-2024-secret';

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  lastLogin: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

class AuthService {
  private encryptData(data: string): string {
    return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
  }

  private decryptData(encryptedData: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  login(username: string, password: string): Promise<AuthState> {
    return new Promise((resolve, reject) => {
      // Simulate API call
      setTimeout(() => {
        // Demo credentials
        if (username === 'admin' && password === 'admin123') {
          const user: User = {
            id: '1',
            username: 'admin',
            email: 'admin@abimanyu.com',
            role: 'admin',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          };

          const token = this.generateToken(user);
          const authState: AuthState = {
            user,
            token,
            isAuthenticated: true,
          };

          // Store encrypted auth data
          const encryptedAuth = this.encryptData(JSON.stringify(authState));
          localStorage.setItem(STORAGE_KEYS.AUTH, encryptedAuth);

          resolve(authState);
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  }

  getCurrentUser(): AuthState | null {
    try {
      const encryptedAuth = localStorage.getItem(STORAGE_KEYS.AUTH);
      if (!encryptedAuth) return null;

      const decryptedAuth = this.decryptData(encryptedAuth);
      return JSON.parse(decryptedAuth);
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  private generateToken(user: User): string {
    const payload = {
      userId: user.id,
      username: user.username,
      role: user.role,
      exp: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
    };
    return this.encryptData(JSON.stringify(payload));
  }

  validateToken(token: string): boolean {
    try {
      const decryptedToken = this.decryptData(token);
      const payload = JSON.parse(decryptedToken);
      return payload.exp > Date.now();
    } catch {
      return false;
    }
  }
}

export const authService = new AuthService();