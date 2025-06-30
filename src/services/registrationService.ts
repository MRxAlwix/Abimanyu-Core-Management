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
  password: string; // Added password field
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
  password: string; // Added password field
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

  constructor() {
    // Initialize with default admin and developer accounts
    this.initializeDefaultAccounts();
  }

  private initializeDefaultAccounts() {
    const users = this.getUsers();
    
    // Check if admin account exists
    const adminExists = users.find(u => u.email === 'admin@abimanyu.com');
    if (!adminExists) {
      const adminUser: User = {
        id: 'admin-1',
        username: 'admin',
        email: 'admin@abimanyu.com',
        password: 'admin123',
        role: 'admin',
        companyName: 'Abimanyu Demo Company',
        ownerName: 'Admin User',
        phone: '081234567890',
        businessType: 'Demo',
        isPremium: true,
        premiumUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        lastLogin: '',
      };
      users.push(adminUser);
    }

    // Check if developer account exists
    const devExists = users.find(u => u.email === 'developer@abimanyu.com');
    if (!devExists) {
      const devUser: User = {
        id: 'dev-1',
        username: 'developer',
        email: 'developer@abimanyu.com',
        password: 'dev123456',
        role: 'developer',
        companyName: 'Abimanyu Development',
        ownerName: 'Developer',
        phone: '081234567891',
        businessType: 'Software Development',
        isPremium: true,
        premiumUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        lastLogin: '',
      };
      users.push(devUser);
    }

    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  submitRegistration(data: Omit<RegistrationRequest, 'id' | 'requestedAt' | 'status'>): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Validate password
        if (!data.password || data.password.length < 6) {
          reject(new Error('Password minimal 6 karakter'));
          return;
        }

        const registration: RegistrationRequest = {
          ...data,
          id: Date.now().toString(),
          requestedAt: new Date().toISOString(),
          status: 'pending',
        };

        const registrations = this.getRegistrations();
        
        // Check if email already exists in registrations
        const existingRegistration = registrations.find(r => r.email === data.email);
        if (existingRegistration) {
          reject(new Error('Email sudah terdaftar. Silakan gunakan email lain.'));
          return;
        }

        // Check if email already exists in users
        const existingUser = this.findUserByEmail(data.email);
        if (existingUser) {
          reject(new Error('Email sudah digunakan. Silakan gunakan email lain.'));
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

    // Create user account with the registered password
    const user: User = {
      id: Date.now().toString(),
      username: registration.email.split('@')[0],
      email: registration.email,
      password: registration.password, // Use the password from registration
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

  findUserByCredentials(email: string, password: string): User | null {
    const users = this.getUsers();
    return users.find(u => u.email === email && u.password === password) || null;
  }

  checkRegistrationStatus(email: string): RegistrationRequest | null {
    const registrations = this.getRegistrations();
    return registrations.find(r => r.email === email) || null;
  }

  // Update user password
  updateUserPassword(userId: string, newPassword: string): boolean {
    try {
      const users = this.getUsers();
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        return false;
      }

      users[userIndex].password = newPassword;
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
      return true;
    } catch {
      return false;
    }
  }
}

export const registrationService = new RegistrationService();