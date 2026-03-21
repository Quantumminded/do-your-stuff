import { createClient } from '@supabase/supabase-js';

console.log('🚀 supabase.ts - File caricato');

// Configurazione Supabase - cerca sia NEXT_PUBLIC (Vercel) che REACT_APP (locale)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🔍 ENV CHECK:', {
  NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'presente' : 'mancante',
  REACT_APP_URL: process.env.REACT_APP_SUPABASE_URL ? 'presente' : 'mancante',
  finalUrl: supabaseUrl ? 'presente' : 'mancante',
  finalKey: supabaseAnonKey ? 'presente' : 'mancante'
});

// Se le variabili non sono disponibili, l'app caricherà da config.json
export let supabase: any;

// Inizializzazione con fallback
if (supabaseUrl && supabaseAnonKey) {
  console.log('✅ Usando Environment Variables');
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('✅ Supabase client creato da ENV');
} else {
  console.log('⚠️ Environment variables non disponibili, supabase = null per ora');
  supabase = null;
}

// Funzione per inizializzare Supabase da API route sicura
export async function initSupabaseFromConfig(): Promise<boolean> {
  console.log('🔧 initSupabaseFromConfig() chiamata');
  
  try {
    // Prova direttamente con config.json (più affidabile)
    console.log('📡 Fetching /config.json...');
    const fallbackResponse = await fetch('/config.json');
    console.log('📡 config.json response:', fallbackResponse.status, fallbackResponse.ok);
    
    if (fallbackResponse.ok) {
      const text = await fallbackResponse.text();
      console.log('📄 config.json raw:', text.substring(0, 100));
      
      try {
        const fallbackConfig = JSON.parse(text);
        console.log('📄 config.json parsed:', {
          url: fallbackConfig.supabaseUrl ? 'presente' : 'mancante',
          key: fallbackConfig.supabaseAnonKey ? 'presente' : 'mancante'
        });
        
        if (fallbackConfig.supabaseUrl && fallbackConfig.supabaseAnonKey) {
          supabase = createClient(fallbackConfig.supabaseUrl, fallbackConfig.supabaseAnonKey);
          console.log('✅ Supabase inizializzato da config.json');
          return true;
        } else {
          console.error('❌ Config.json manca url o key');
        }
      } catch (parseError) {
        console.error('❌ Errore parsing config.json:', parseError);
      }
    } else {
      console.error('❌ config.json fetch failed:', fallbackResponse.status);
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
