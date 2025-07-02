import { supabase } from '../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { notificationService } from './notificationService';

const JWT_SECRET = import.meta.env.VITE_JWT_SECRET || 'abimanyu-core-2024-secret';

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

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

class AuthService {
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  private generateToken(user: User): string {
    return jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  async register(userData: {
    email: string;
    password: string;
    username: string;
    companyName: string;
    ownerName: string;
    phone: string;
    businessType: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', userData.email)
        .single();

      if (existingUser) {
        return { success: false, message: 'Email sudah terdaftar' };
      }

      // Hash password
      const hashedPassword = await this.hashPassword(userData.password);

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            username: userData.username,
            company_name: userData.companyName,
            owner_name: userData.ownerName,
            phone: userData.phone,
            business_type: userData.businessType,
          }
        }
      });

      if (authError) {
        throw authError;
      }

      // Insert user data into custom users table
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: authData.user!.id,
          email: userData.email,
          username: userData.username,
          role: 'admin',
          company_name: userData.companyName,
          owner_name: userData.ownerName,
          phone: userData.phone,
          business_type: userData.businessType,
          is_premium: false,
          premium_until: null,
        });

      if (insertError) {
        throw insertError;
      }

      return { 
        success: true, 
        message: 'Registrasi berhasil! Silakan cek email untuk verifikasi.' 
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.message || 'Gagal melakukan registrasi' 
      };
    }
  }

  async login(email: string, password: string): Promise<AuthState> {
    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        throw new Error('Email atau password salah');
      }

      // Get user data from custom users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (userError || !userData) {
        throw new Error('Data pengguna tidak ditemukan');
      }

      const user: User = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        role: userData.role,
        companyName: userData.company_name,
        ownerName: userData.owner_name,
        phone: userData.phone,
        businessType: userData.business_type,
        isPremium: userData.is_premium,
        premiumUntil: userData.premium_until,
        createdAt: userData.created_at,
        lastLogin: new Date().toISOString(),
      };

      const token = this.generateToken(user);

      // Update last login
      await supabase
        .from('users')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', user.id);

      const authState: AuthState = {
        user,
        token,
        isAuthenticated: true,
      };

      // Store in localStorage for offline access
      localStorage.setItem('abimanyu_auth', JSON.stringify(authState));

      return authState;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Gagal login');
    }
  }

  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('abimanyu_auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  getCurrentUser(): AuthState | null {
    try {
      const stored = localStorage.getItem('abimanyu_auth');
      if (!stored) return null;
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  async refreshSession(): Promise<AuthState | null> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        localStorage.removeItem('abimanyu_auth');
        return null;
      }

      // Get updated user data
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!userData) return null;

      const user: User = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        role: userData.role,
        companyName: userData.company_name,
        ownerName: userData.owner_name,
        phone: userData.phone,
        businessType: userData.business_type,
        isPremium: userData.is_premium,
        premiumUntil: userData.premium_until,
        createdAt: userData.created_at,
        lastLogin: new Date().toISOString(),
      };

      const authState: AuthState = {
        user,
        token: session.access_token,
        isAuthenticated: true,
      };

      localStorage.setItem('abimanyu_auth', JSON.stringify(authState));
      return authState;
    } catch (error) {
      console.error('Session refresh error:', error);
      return null;
    }
  }

  validateToken(token: string): boolean {
    try {
      jwt.verify(token, JWT_SECRET);
      return true;
    } catch {
      return false;
    }
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      notificationService.success('Password berhasil diubah');
      return true;
    } catch (error: any) {
      notificationService.error(error.message || 'Gagal mengubah password');
      return false;
    }
  }

  async resetPassword(email: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        throw error;
      }

      notificationService.success('Link reset password telah dikirim ke email Anda');
      return true;
    } catch (error: any) {
      notificationService.error(error.message || 'Gagal mengirim reset password');
      return false;
    }
  }
}

export const authService = new AuthService();