import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LoginScreen } from './components/LoginScreen';
import { ParentPanel } from './components/ParentPanel';
import { ChildPanel } from './components/ChildPanel';
import { RewardManagement } from './components/RewardManagement';
import { ManageChores } from './components/ManageChores';
import { supabase } from './lib/supabase';
import { ViewMode, Family, Child, Parent, Task, Reward, AppState } from './types';

function App() {
  // PULIZIA LOCALSTORAGE ALL'AVVIO
  React.useEffect(() => {
    console.log('🧹 Pulizia localStorage all\'avvio...');
    localStorage.clear();
  }, []);

  const [appState, setAppState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(false); // Non caricare all'avvio
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewMode>('parent-dashboard');

  // Login
  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. Trova genitore
      const { data: parent, error: parentError } = await supabase
        .from('parents')
        .select('*')
        .eq('email', email)
        .single();

      if (parentError || !parent) {
        setError('Email non trovata');
        setLoading(false);
        return;
      }

      // 2. Verifica password
      if (parent.password_hash !== password) {
        setError('Password errata');
        setLoading(false);
        return;
      }

      // 3. Carica dati famiglia
      const { data: family } = await supabase
        .from('families')
        .select('*')
        .eq('id', parent.family_id)
        .single();

      const { data: children } = await supabase
        .from('children')
        .select('*')
        .eq('family_id', parent.family_id);

      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .in('assigned_to', children?.map(c => c.id) || []);

      const { data: rewards } = await supabase
        .from('rewards')
        .select('*')
        .eq('family_id', parent.family_id);

      if (family && children && tasks && rewards) {
        const transformedData: AppState = {
          family: {
            id: family.id,
            name: family.name,
            parents: [parent],
            children: children.map((c: any) => ({
              id: c.id,
              name: c.name,
              avatar: c.avatar,
              coins: c.coins,
              totalXp: c.total_xp,
              level: c.level,
              parentId: parent.family_id
            })),
            createdAt: family.created_at ? new Date(family.created_at) : new Date()
          },
          tasks: tasks.map((t: any) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            recurrence: t.recurrence,
            difficulty: t.difficulty,
            coins: t.coins,
            xp: t.xp,
            assignedTo: t.assigned_to,
            icon: t.icon,
            status: t.status,
            isConfigured: t.is_configured,
            isCompleted: t.is_completed,
            completedAt: t.completed_at ? new Date(t.completed_at) : undefined,
            approvedAt: t.approved_at ? new Date(t.approved_at) : undefined,
            createdAt: new Date(t.created_at),
            createdBy: parent.id
          })),
          rewards: rewards.map((r: any) => ({
            id: r.id,
            name: r.name,
            description: r.description,
            cost: r.cost,
            icon: r.icon,
            category: r.category,
            familyId: r.family_id,
            createdBy: parent.id
          })),
          currentMode: 'parent',
          currentChildId: '',
          setupComplete: true,
          parentPin: '1234'
        };
        
        setAppState(transformedData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante il login');
    }
    
    setLoading(false);
  };

  // Registrazione
  const handleRegister = async (email: string, password: string, familyName: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. Crea famiglia
      const { data: family, error: familyError } = await supabase
        .from('families')
        .insert({ name: familyName })
        .select()
        .single();

      if (familyError || !family) {
        setError('Errore nella creazione della famiglia');
        setLoading(false);
        return;
      }

      // 2. Crea genitore
      const { data: parent, error: parentError } = await supabase
        .from('parents')
        .insert({
          email,
          password_hash: password,
          family_id: family.id
        })
        .select()
        .single();

      if (parentError || !parent) {
        setError('Errore nella creazione del genitore');
        setLoading(false);
        return;
      }

      // Auto-login dopo registrazione
      await handleLogin(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante la registrazione');
      setLoading(false);
    }
  };

  // Logout
  const handleLogout = () => {
    setAppState(null);
    setError(null);
    setCurrentView('parent-dashboard');
  };

  // Toggle modalità
  const handleModeToggle = () => {
    if (appState) {
      const pin = prompt('🔐 Inserisci PIN genitore:');
      if (pin === appState.parentPin) {
        setAppState({
          ...appState,
          currentMode: appState.currentMode === 'parent' ? 'child' : 'parent',
          currentChildId: ''
        });
      }
    }
  };

  // Selezione bambino
  const handleChildSelect = (childId: string) => {
    if (appState) {
      setAppState({
        ...appState,
        currentMode: 'child',
        currentChildId: childId
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-6xl"
        >
          🏠
        </motion.div>
      </div>
    );
  }

  // Login screen
  if (!appState) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        onRegister={handleRegister}
        loading={loading}
        error={error}
      />
    );
  }

  // Child Mode - Selezione bambino
  if (appState.currentMode === 'child' && !appState.currentChildId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 p-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
        >
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Chi sei?</h1>
          <div className="space-y-3">
            {appState.family.children.map((child: Child) => (
              <motion.button
                key={child.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleChildSelect(child.id)}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-3"
              >
                <span className="text-3xl">{child.avatar}</span>
                <span className="text-lg">{child.name}</span>
              </motion.button>
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleModeToggle}
            className="w-full mt-4 bg-gray-200 text-gray-700 font-bold py-3 rounded-xl"
          >
            Torna ai Genitori
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Child Mode - Dashboard bambino
  if (appState.currentMode === 'child' && appState.currentChildId) {
    const currentChild = appState.family.children.find((c: Child) => c.id === appState.currentChildId);
    
    if (!currentChild) {
      return null;
    }

    return (
      <ChildPanel
        appState={appState}
        child={currentChild}
        onUpdateState={setAppState}
        onModeToggle={handleModeToggle}
      />
    );
  }

  // Parent Mode - Dashboard genitore
  if (currentView === 'parent-dashboard') {
    return (
      <ParentPanel
        appState={appState}
        onUpdateState={setAppState}
        onViewChange={setCurrentView}
        setCurrentView={setCurrentView}
        onModeToggle={handleModeToggle}
      />
    );
  }

  // Reward Management
  if (currentView === 'reward-management') {
    return (
      <RewardManagement
        appState={appState}
        onUpdateState={setAppState}
        onClose={() => setCurrentView('parent-dashboard')}
      />
    );
  }

  // Manage Chores
  if (currentView === 'manage-chores') {
    return (
      <ManageChores
        appState={appState}
        onUpdateState={setAppState}
        onBack={() => setCurrentView('parent-dashboard')}
      />
    );
  }

  return null;
}

export default App;