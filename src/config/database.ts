import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Database Tables Schema
export interface DatabaseSchema {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          username: string;
          role: string;
          company_name: string;
          owner_name: string;
          phone: string;
          business_type: string;
          is_premium: boolean;
          premium_until: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<DatabaseSchema['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<DatabaseSchema['public']['Tables']['users']['Insert']>;
      };
      workers: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          daily_rate: number;
          position: string;
          join_date: string;
          is_active: boolean;
          phone: string | null;
          address: string | null;
          skills: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<DatabaseSchema['public']['Tables']['workers']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<DatabaseSchema['public']['Tables']['workers']['Insert']>;
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: 'income' | 'expense';
          category: string;
          amount: number;
          description: string;
          date: string;
          status: 'completed' | 'pending' | 'cancelled';
          project_id: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<DatabaseSchema['public']['Tables']['transactions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<DatabaseSchema['public']['Tables']['transactions']['Insert']>;
      };
      payroll_records: {
        Row: {
          id: string;
          user_id: string;
          worker_id: string;
          worker_name: string;
          period: string;
          days_worked: number;
          daily_rate: number;
          regular_pay: number;
          overtime: number;
          total_pay: number;
          status: 'pending' | 'paid' | 'cancelled';
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<DatabaseSchema['public']['Tables']['payroll_records']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<DatabaseSchema['public']['Tables']['payroll_records']['Insert']>;
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string;
          location: string;
          start_date: string;
          end_date: string | null;
          status: 'planning' | 'active' | 'completed' | 'paused' | 'cancelled';
          budget: number;
          spent: number;
          manager: string;
          progress: number;
          qr_code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<DatabaseSchema['public']['Tables']['projects']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<DatabaseSchema['public']['Tables']['projects']['Insert']>;
      };
      materials: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          unit: string;
          price_per_unit: number;
          supplier: string;
          category: string;
          stock: number;
          min_stock: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<DatabaseSchema['public']['Tables']['materials']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<DatabaseSchema['public']['Tables']['materials']['Insert']>;
      };
      attendance_records: {
        Row: {
          id: string;
          user_id: string;
          worker_id: string;
          worker_name: string;
          project_id: string;
          date: string;
          check_in: string;
          check_out: string | null;
          status: 'present' | 'absent' | 'late' | 'overtime';
          location: string;
          notes: string | null;
          qr_scanned: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<DatabaseSchema['public']['Tables']['attendance_records']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<DatabaseSchema['public']['Tables']['attendance_records']['Insert']>;
      };
      overtime_records: {
        Row: {
          id: string;
          user_id: string;
          worker_id: string;
          worker_name: string;
          date: string;
          hours: number;
          rate: number;
          total: number;
          description: string;
          project_id: string | null;
          status: 'pending' | 'approved' | 'rejected';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<DatabaseSchema['public']['Tables']['overtime_records']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<DatabaseSchema['public']['Tables']['overtime_records']['Insert']>;
      };
      premium_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          subscription_type: 'monthly' | 'yearly';
          amount: number;
          currency: string;
          status: 'active' | 'cancelled' | 'expired';
          started_at: string;
          expires_at: string;
          midtrans_order_id: string;
          midtrans_transaction_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<DatabaseSchema['public']['Tables']['premium_subscriptions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<DatabaseSchema['public']['Tables']['premium_subscriptions']['Insert']>;
      };
    };
  };
}