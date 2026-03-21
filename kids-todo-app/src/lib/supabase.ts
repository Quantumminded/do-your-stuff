import { createClient } from '@supabase/supabase-js';

// Configurazione Supabase da variabili d'ambiente
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Debug per verificare le variabili
console.log('🔍 Supabase URL:', supabaseUrl);
console.log('🔍 Supabase Key:', supabaseAnonKey ? 'Presente' : 'Mancante');

// Fallback per sviluppo
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variabili Supabase mancanti! Controlla il file .env');
  throw new Error('Supabase configuration missing');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipi per il database
export interface Database {
  public: {
    Tables: {
      families: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      parents: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          family_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          password_hash: string;
          family_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          password_hash?: string;
          family_id?: string;
          created_at?: string;
        };
      };
      children: {
        Row: {
          id: string;
          name: string;
          avatar: string;
          coins: number;
          total_xp: number;
          level: number;
          family_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          avatar: string;
          coins?: number;
          total_xp?: number;
          level?: number;
          family_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          avatar?: string;
          coins?: number;
          total_xp?: number;
          level?: number;
          family_id?: string;
          created_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string;
          recurrence: 'daily' | 'weekly' | 'monthly' | 'once';
          difficulty: 'easy' | 'medium' | 'hard';
          coins: number;
          xp: number;
          assigned_to: string;
          icon: string;
          status: 'pending' | 'completed' | 'approved';
          is_configured: boolean;
          is_completed: boolean;
          completed_at?: string;
          approved_at?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          recurrence: 'daily' | 'weekly' | 'monthly' | 'once';
          difficulty: 'easy' | 'medium' | 'hard';
          coins: number;
          xp: number;
          assigned_to: string;
          icon: string;
          status?: 'pending' | 'completed' | 'approved';
          is_configured?: boolean;
          is_completed?: boolean;
          completed_at?: string;
          approved_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          recurrence?: 'daily' | 'weekly' | 'monthly' | 'once';
          difficulty?: 'easy' | 'medium' | 'hard';
          coins?: number;
          xp?: number;
          assigned_to?: string;
          icon?: string;
          status?: 'pending' | 'completed' | 'approved';
          is_configured?: boolean;
          is_completed?: boolean;
          completed_at?: string;
          approved_at?: string;
          created_at?: string;
        };
      };
      rewards: {
        Row: {
          id: string;
          name: string;
          description: string;
          cost: number;
          icon: string;
          category: string;
          family_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          cost: number;
          icon: string;
          category: string;
          family_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          cost?: number;
          icon?: string;
          category?: string;
          family_id?: string;
          created_at?: string;
        };
      };
    };
  };
}
