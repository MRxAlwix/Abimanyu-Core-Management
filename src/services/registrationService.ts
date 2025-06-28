import { notificationService } from './notificationService';

export interface RegistrationRequest {
  id: string;
  companyName: string;
  ownerName: string;
  email: string;
  phone: string;
  businessType: string;
  projectCount: number;
  workerCount: number;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  companyName: string;
  ownerName: string;
  phone: string;
  businessType: string;
  isPremium: boolean;
  premiumUntil?: string;
  createdAt: string;
  lastLogin: string;
}

class RegistrationService {
  private readonly STORAGE_KEY = 'abimanyu_registrations';
  private readonly USERS_KEY = 'abimanyu_users';

  submitRegistration(data: Omit<RegistrationRequest, 'id' | 'requestedAt' | 'status'>): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const registration: RegistrationRequest = {
          ...data,
          id: Date.now().toString(),
          requestedAt: new Date().toISOString(),
          status: 'pending',
        };

        const registrations = this.getRegistrations();
        
        // Check if email already exists
        const existingRegistration = registrations.find(r => r.email === data.email);
        if (existingRegistration) {
          reject(new Error('Email sudah terdaftar. Silakan gunakan email lain.'));
          return;
        }

        registrations.push(registration);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(registrations));
        
        notificationService.success('Pendaftaran berhasil dikirim! Tunggu persetujuan dari developer.');
        resolve();
      } catch (error) {
        reject(new Error('Gagal mengirim pendaftaran'));
      }
    });
  }

  getRegistrations(): RegistrationRequest[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  approveRegistration(registrationId: string): void {
    const registrations = this.getRegistrations();
    const registration = registrations.find(r => r.id === registrationId);
    
    if (!registration) {
      throw new Error('Pendaftaran tidak ditemukan');
    }

    // Update registration status
    registration.status = 'approved';
    registration.approvedAt = new Date().toISOString();
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(registrations));

    // Create user account
    const user: User = {
      id: Date.now().toString(),
      username: registration.email.split('@')[0],
      email: registration.email,
      role: 'admin',
      companyName: registration.companyName,
      ownerName: registration.ownerName,
      phone: registration.phone,
      businessType: registration.businessType,
      isPremium: true, // All approved users get premium
      premiumUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
      createdAt: new Date().toISOString(),
      lastLogin: '',
    };

    const users = this.getUsers();
    users.push(user);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));

    notificationService.success(`Pendaftaran ${registration.companyName} telah disetujui`);
  }

  rejectRegistration(registrationId: string, reason: string): void {
    const registrations = this.getRegistrations();
    const registration = registrations.find(r => r.id === registrationId);
    
    if (!registration) {
      throw new Error('Pendaftaran tidak ditemukan');
    }

    registration.status = 'rejected';
    registration.rejectedAt = new Date().toISOString();
    registration.rejectionReason = reason;
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(registrations));
    notificationService.info(`Pendaftaran ${registration.companyName} telah ditolak`);
  }

  getUsers(): User[] {
    try {
      const data = localStorage.getItem(this.USERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  findUserByEmail(email: string): User | null {
    const users = this.getUsers();
    return users.find(u => u.email === email) || null;
  }

  checkRegistrationStatus(email: string): RegistrationRequest | null {
    const registrations = this.getRegistrations();
    return registrations.find(r => r.email === email) || null;
  }
}

export const registrationService = new RegistrationService();