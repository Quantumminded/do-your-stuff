import { supabase } from './supabase';

export interface Parent {
  id: string;
  email: string;
  family_id: string;
}

export interface AuthResponse {
  success: boolean;
  parent?: Parent;
  error?: string;
}

// Registrazione genitore e creazione famiglia
export async function registerParent(email: string, password: string, familyName: string): Promise<AuthResponse> {
  try {
    // 1. Crea famiglia
    const { data: family, error: familyError } = await supabase
      .from('families')
      .insert({ name: familyName })
      .select()
      .single();

    if (familyError) throw familyError;

    // 2. Hash password (semplice per ora, in produzione usa bcrypt)
    const passwordHash = password; // TODO: Implementare hash sicuro

    // 3. Crea genitore
    const { data: parent, error: parentError } = await supabase
      .from('parents')
      .insert({
        email,
        password_hash: passwordHash,
        family_id: family.id
      })
      .select()
      .single();

    if (parentError) throw parentError;

    return { success: true, parent };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Errore durante la registrazione' 
    };
  }
}

// Login genitore
export async function loginParent(email: string, password: string): Promise<AuthResponse> {
  try {
    // 1. Trova genitore per email
    const { data: parent, error: parentError } = await supabase
      .from('parents')
      .select('*')
      .eq('email', email)
      .single();

    if (parentError || !parent) {
      return { success: false, error: 'Email non trovata' };
    }

    // 2. Verifica password (semplice per ora)
    if (parent.password_hash !== password) {
      return { success: false, error: 'Password errata' };
    }

    return { success: true, parent };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Errore durante il login' 
    };
  }
}

// Ottenere dati famiglia
export async function getFamilyData(familyId: string) {
  try {
    // 1. Ottieni famiglia
    const { data: family, error: familyError } = await supabase
      .from('families')
      .select('*')
      .eq('id', familyId)
      .single();

    if (familyError) throw familyError;

    // 2. Ottieni genitori
    const { data: parents, error: parentsError } = await supabase
      .from('parents')
      .select('*')
      .eq('family_id', familyId);

    if (parentsError) throw parentsError;

    // 3. Ottieni bambini
    const { data: children, error: childrenError } = await supabase
      .from('children')
      .select('*')
      .eq('family_id', familyId);

    if (childrenError) throw childrenError;

    // 4. Ottieni task
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .in('assigned_to', children.map((c: any) => c.id));

    if (tasksError) throw tasksError;

    // 5. Ottieni rewards
    const { data: rewards, error: rewardsError } = await supabase
      .from('rewards')
      .select('*')
      .eq('family_id', familyId);

    if (rewardsError) throw rewardsError;

    return {
      family,
      parents,
      children,
      tasks,
      rewards
    };
  } catch (error) {
    console.error('Errore nel caricamento dati famiglia:', error);
    return null;
  }
}
