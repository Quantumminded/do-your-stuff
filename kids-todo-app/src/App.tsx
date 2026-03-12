import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FamilySetup } from './components/FamilySetup';
import { ParentPanel } from './components/ParentPanel';
import { ChildPanel } from './components/ChildPanel';
import { RewardManagement } from './components/RewardManagement';
import { useFamilyStorage } from './hooks/useLocalStorage';
import { createFamily, resetRecurringTasks } from './utils/familyLogic';
import { AppState, Family, Parent, Child, ViewMode } from './types';

function App() {
  const { appState, updateState, resetApp } = useFamilyStorage();
  const [currentView, setCurrentView] = useState<ViewMode>('setup');

  // Reset automatico missioni ricorrenti
  React.useEffect(() => {
    if (appState.setupComplete && appState.family) {
      const resetState = resetRecurringTasks(appState);
      if (resetState !== appState) {
        updateState(resetState);
      }
    }
  }, [appState.setupComplete, appState.family?.id]); // Solo quando cambia la famiglia

  // Gestione eventi custom per confetti
  React.useEffect(() => {
    const handleTriggerConfetti = () => {
      // Import dinamico per evitare problemi con l'import
      import('./utils/confetti').then(({ triggerConfetti }) => {
        triggerConfetti();
      });
    };

    window.addEventListener('trigger-confetti', handleTriggerConfetti);

    return () => {
      window.removeEventListener('trigger-confetti', handleTriggerConfetti);
    };
  }, []);

  
  // Handle family setup completion
  const handleFamilySetup = (familyName: string, parents: Parent[], children: Child[]) => {
    const family = createFamily(familyName, parents, children);
    const newState: AppState = {
      family,
      tasks: [],
      rewards: [],
      currentMode: 'parent',
      currentChildId: children[0]?.id || '',
      setupComplete: true,
      parentPin: '1234', // PIN default
    };
    updateState(newState);
    setCurrentView('parent-dashboard');
  };

  // Handle mode toggle (parent/child)
  const handleModeToggle = () => {
    if (!appState.family) return;
    
    const newMode: 'parent' | 'child' = appState.currentMode === 'parent' ? 'child' : 'parent';
    
    if (newMode === 'parent') {
      // Quando si passa a modalità genitore, chiedi PIN con prompt
      const pin = window.prompt('🔐 Inserisci il PIN per accedere all\'area genitori:');
      
      if (pin === appState.parentPin) {
        console.log('🎉 PIN CORRETTO - Accesso consentito');
        const newState = {
          ...appState,
          currentMode: 'parent' as const,
        };
        updateState(newState);
        setCurrentView('parent-dashboard');
      } else if (pin !== null) {
        console.log('❌ PIN ERRATO - Accesso negato');
        alert('❌ PIN errato! Accesso negato.');
      }
    } else {
      // Quando si passa a modalità bambino, vai direttamente
      const newState = {
        ...appState,
        currentMode: newMode,
        currentChildId: appState.family.children.length > 0 
          ? appState.family.children[0].id 
          : '',
      };
      updateState(newState);
      setCurrentView('child-dashboard');
    }
  };

  
  // Handle child selection (for child mode)
  const handleChildSelect = (childId: string) => {
    const newState = {
      ...appState,
      currentChildId: childId,
    };
    updateState(newState);
  };

  // Reset everything
  const handleReset = () => {
    resetApp();
    setCurrentView('setup');
  };

  // Show setup screen if not completed
  if (!appState.setupComplete || !appState.family) {
    return <FamilySetup onComplete={handleFamilySetup} />;
  }

  // Parent Mode
  if (appState.currentMode === 'parent') {
    if (currentView === 'reward-management') {
      return (
        <RewardManagement
          appState={appState}
          onUpdateState={updateState}
          onClose={() => setCurrentView('parent-dashboard')}
        />
      );
    }

    return (
      <ParentPanel
        appState={appState}
        onUpdateState={updateState}
        onViewChange={setCurrentView}
        onModeToggle={handleModeToggle}
      />
    );
  }

  // Child Mode
  if (appState.currentMode === 'child' && appState.currentChildId) {
    const currentChild = appState.family.children.find(c => c.id === appState.currentChildId);
    
    if (!currentChild) {
      // If no child selected, show child selection
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

    return (
      <ChildPanel
        appState={appState}
        child={currentChild}
        onUpdateState={updateState}
        onModeToggle={handleModeToggle}
      />
    );
  }

  // Fallback
  return <FamilySetup onComplete={handleFamilySetup} />;
}

export default App;
