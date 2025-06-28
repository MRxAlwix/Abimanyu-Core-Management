import CryptoJS from 'crypto-js';
import { registrationService } from './registrationService';

const SECRET_KEY = 'abimanyu-core-2024-secret';

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  companyName?: string;
  ownerName?: string;
  phone?: string;
  businessType?: string;
  isPremium: boolean;
  premiumUntil?: string;
  createdAt: string;
  lastLogin: string;
  profileImage?: string;
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
      setTimeout(() => {
        // Developer access
        if (username === 'developer' && password === 'dev123456') {
          const user: User = {
            id: 'dev-1',
            username: 'developer',
            email: 'developer@abimanyu.com',
            role: 'developer',
            isPremium: true,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          };

          const token = this.generateToken(user);
          const authState: AuthState = {
            user,
            token,
            isAuthenticated: true,
          };

          const encryptedAuth = this.encryptData(JSON.stringify(authState));
          localStorage.setItem('abimanyu_auth', encryptedAuth);
          resolve(authState);
          return;
        }

        // Demo admin access
        if (username === 'admin' && password === 'admin123') {
          const user: User = {
            id: '1',
            username: 'admin',
            email: 'admin@abimanyu.com',
            role: 'admin',
            companyName: 'Demo Company',
            isPremium: true,
            premiumUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          };

          const token = this.generateToken(user);
          const authState: AuthState = {
            user,
            token,
            isAuthenticated: true,
          };

          const encryptedAuth = this.encryptData(JSON.stringify(authState));
          localStorage.setItem('abimanyu_auth', encryptedAuth);
          resolve(authState);
          return;
        }

        // Check registered users
        const registeredUser = registrationService.findUserByEmail(username);
        if (registeredUser) {
          // For demo, password is email without domain
          const expectedPassword = username.split('@')[0];
          if (password === expectedPassword) {
            const user: User = {
              ...registeredUser,
              lastLogin: new Date().toISOString(),
            };

            const token = this.generateToken(user);
            const authState: AuthState = {
              user,
              token,
              isAuthenticated: true,
            };

            const encryptedAuth = this.encryptData(JSON.stringify(authState));
            localStorage.setItem('abimanyu_auth', encryptedAuth);
            resolve(authState);
            return;
          }
        }

        reject(new Error('Email atau password salah'));
      }, 1000);
    });
  }

  logout(): void {
    localStorage.removeItem('abimanyu_auth');
  }

  getCurrentUser(): AuthState | null {
    try {
      const encryptedAuth = localStorage.getItem('abimanyu_auth');
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

  checkRegistrationStatus(email: string): { status: string; message: string } {
    const registration = registrationService.checkRegistrationStatus(email);
    
    if (!registration) {
      return { status: 'not_found', message: 'Email belum terdaftar' };
    }

    switch (registration.status) {
      case 'pending':
        return { status: 'pending', message: 'Pendaftaran sedang ditinjau oleh developer' };
      case 'approved':
        return { status: 'approved', message: 'Pendaftaran disetujui, silakan login' };
      case 'rejected':
        return { status: 'rejected', message: `Pendaftaran ditolak: ${registration.rejectionReason}` };
      default:
        return { status: 'unknown', message: 'Status tidak diketahui' };
    }
  }
}

export const authService = new AuthService();