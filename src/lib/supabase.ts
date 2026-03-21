import { createClient } from '@supabase/supabase-js';

// Configurazione Supabase - cerca sia NEXT_PUBLIC (Vercel) che REACT_APP (locale)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

// Se le variabili non sono disponibili, l'app caricherà da config.json
export let supabase: any;

// Inizializzazione con fallback
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('✅ Supabase inizializzato dalle variabili d\'ambiente');
} else {
  console.log('⚠️ Environment variables non disponibili, caricamento da config.json...');
  // Il client verrà inizializzato dopo il caricamento del config
  supabase = null;
}

// Funzione per inizializzare Supabase da API route sicura
export async function initSupabaseFromConfig(): Promise<boolean> {
  try {
    // Prima prova con API route (per Vercel)
    const response = await fetch('/api/config');
    if (response.ok) {
      const config = await response.json();
      
      if (config.supabaseUrl && config.supabaseAnonKey) {
        supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);
        console.log('✅ Supabase inizializzato da API route');
        return true;
      }
    }
    
    // Fallback a config.json (per locale)
    const fallbackResponse = await fetch('/config.json');
    const fallbackConfig = await fallbackResponse.json();
    
    if (fallbackConfig.supabaseUrl && fallbackConfig.supabaseAnonKey) {
      supabase = createClient(fallbackConfig.supabaseUrl, fallbackConfig.supabaseAnonKey);
      console.log('✅ Supabase inizializzato da config.json');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Errore caricamento configurazione:', error);
    return false;
  }
}
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
