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
        try {
          // First check registered users with proper password validation
          const registeredUser = registrationService.findUserByCredentials(username, password);
          if (registeredUser) {
            const user: User = {
              id: registeredUser.id,
              username: registeredUser.username,
              email: registeredUser.email,
              role: registeredUser.role,
              companyName: registeredUser.companyName,
              ownerName: registeredUser.ownerName,
              phone: registeredUser.phone,
              businessType: registeredUser.businessType,
              isPremium: registeredUser.isPremium,
              premiumUntil: registeredUser.premiumUntil,
              createdAt: registeredUser.createdAt,
              lastLogin: new Date().toISOString(),
            };

            // Update last login
            const users = registrationService.getUsers();
            const userIndex = users.findIndex(u => u.id === registeredUser.id);
            if (userIndex !== -1) {
              users[userIndex].lastLogin = user.lastLogin;
              localStorage.setItem('abimanyu_users', JSON.stringify(users));
            }

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

          // Fallback for demo accounts (backward compatibility)
          if (username === 'developer@abimanyu.com' && password === 'dev123456') {
            const user: User = {
              id: 'dev-1',
              username: 'developer',
              email: 'developer@abimanyu.com',
              role: 'developer',
              companyName: 'Abimanyu Development',
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

          if (username === 'admin@abimanyu.com' && password === 'admin123') {
            const user: User = {
              id: 'admin-1',
              username: 'admin',
              email: 'admin@abimanyu.com',
              role: 'admin',
              companyName: 'Abimanyu Demo Company',
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

          // Check if user exists but password is wrong
          const userExists = registrationService.findUserByEmail(username);
          if (userExists) {
            reject(new Error('Password salah. Silakan coba lagi.'));
            return;
          }

          // Check registration status
          const registration = registrationService.checkRegistrationStatus(username);
          if (registration) {
            switch (registration.status) {
              case 'pending':
                reject(new Error('Pendaftaran Anda sedang ditinjau oleh developer. Silakan tunggu konfirmasi.'));
                return;
              case 'rejected':
                reject(new Error(`Pendaftaran ditolak: ${registration.rejectionReason || 'Tidak memenuhi syarat'}`));
                return;
              case 'approved':
                reject(new Error('Akun sudah disetujui. Silakan gunakan password yang benar.'));
                return;
            }
          }

          reject(new Error('Email tidak terdaftar. Silakan daftar terlebih dahulu atau periksa email Anda.'));
        } catch (error) {
          reject(new Error('Terjadi kesalahan saat login. Silakan coba lagi.'));
        }
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
      return { status: 'not_found', message: 'Email belum terdaftar. Silakan daftar terlebih dahulu.' };
    }

    switch (registration.status) {
      case 'pending':
        return { status: 'pending', message: 'Pendaftaran sedang ditinjau oleh developer. Harap tunggu konfirmasi.' };
      case 'approved':
        return { status: 'approved', message: 'Pendaftaran disetujui. Silakan login dengan password yang Anda daftarkan.' };
      case 'rejected':
        return { status: 'rejected', message: `Pendaftaran ditolak: ${registration.rejectionReason || 'Tidak memenuhi syarat'}` };
      default:
        return { status: 'unknown', message: 'Status pendaftaran tidak diketahui.' };
    }
  }

  // Change password
  changePassword(userId: string, oldPassword: string, newPassword: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const user = registrationService.findUserByEmail(this.getCurrentUser()?.user?.email || '');
        if (!user || user.password !== oldPassword) {
          reject(new Error('Password lama tidak benar'));
          return;
        }

        if (newPassword.length < 6) {
          reject(new Error('Password baru minimal 6 karakter'));
          return;
        }

        const success = registrationService.updateUserPassword(userId, newPassword);
        if (success) {
          resolve(true);
        } else {
          reject(new Error('Gagal mengubah password'));
        }
      } catch (error) {
        reject(new Error('Terjadi kesalahan saat mengubah password'));
      }
    });
  }
}

export const authService = new AuthService();