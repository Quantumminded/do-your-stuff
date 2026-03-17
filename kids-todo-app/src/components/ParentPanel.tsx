import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  CheckCircle, 
  Clock, 
  Star, 
  Users, 
  Settings, 
  Gift,
  Shield,
  ChevronDown
} from 'lucide-react';
import { AppState, Child, ViewMode } from '../types';
import { addTask, updateTaskStatus, getTasksNeedingApproval } from '../utils/familyLogic';
import { PinPad } from './PinPad';
import { ManageChores } from './ManageChores';
import { supabase } from '../lib/supabase';

interface ParentPanelProps {
  appState: AppState;
  onUpdateState: (newState: AppState) => void;
  onViewChange: (view: ViewMode) => void;
  onModeToggle: () => void;
  setCurrentView: (view: ViewMode) => void;
}

const TASK_TEMPLATES = [
  { title: 'Rifare il letto', description: 'Letti fatti perfettamente!', icon: '🛏️', difficulty: 'easy' as const },
  { title: 'Lavare i denti', description: 'Sorrisi splendenti!', icon: '🦷', difficulty: 'easy' as const },
  { title: 'Mettere in ordine la camera', description: 'Tutto al suo posto!', icon: '🏠', difficulty: 'medium' as const },
  { title: 'Fare i compiti', description: 'Compiti scolastici completati!', icon: '📚', difficulty: 'medium' as const },
  { title: 'Aiutare in cucina', description: 'Piccolo chef aiutante!', icon: '👨‍🍳', difficulty: 'medium' as const },
  { title: 'Pulire il giardino', description: 'Giardino in perfetto ordine!', icon: '🌳', difficulty: 'hard' as const },
];

const DIFFICULTY_CONFIG = {
  easy: { coins: 5, xp: 3, color: 'green' },
  medium: { coins: 10, xp: 7, color: 'yellow' },
  hard: { coins: 20, xp: 15, color: 'red' },
};

const RECURRENCE_CONFIG = {
  daily: { label: 'Giornaliero', icon: '📅' },
  weekly: { label: 'Settimanale', icon: '📆' },
  monthly: { label: 'Mensile', icon: '🗓️' },
  once: { label: 'Una volta', icon: '🎯' },
};

export function ParentPanel({ appState, onUpdateState, onViewChange, onModeToggle, setCurrentView }: ParentPanelProps) {
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof TASK_TEMPLATES[0] | null>(null);
  const [customTask, setCustomTask] = useState({ title: '', description: '', icon: '📋' });
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [recurrence, setRecurrence] = useState<'daily' | 'weekly' | 'monthly' | 'once'>('daily');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [showPinPad, setShowPinPad] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showManageChores, setShowManageChores] = useState(false);

  const pendingTasks = getTasksNeedingApproval(appState);

  React.useEffect(() => {
    const handleShowPinPad = (event: any) => {
      console.log('🔥 EVENTO RICEVUTO - ParentPanel:', event);
      console.log('📥 MOSTRO PIN PAD');
      setShowPinPad(true);
    };

    const checkGlobalPinPad = () => {
      if ((window as any).showPinPad) {
        console.log('🔥 STATO GLOBALE RILEVATO - ParentPanel');
        console.log('📥 MOSTRO PIN PAD DA STATO GLOBALE');
        setShowPinPad(true);
        (window as any).showPinPad = false; // Resetta lo stato
      }
      
      if ((window as any).showPinPadFunction) {
        console.log('🔥 FUNZIONE GLOBALE RILEVATA - ParentPanel');
        console.log('📥 MOSTRO PIN PAD DA FUNZIONE GLOBALE');
        setShowPinPad(true);
        (window as any).showPinPadFunction = false; // Resetta lo stato
      }
    };

    console.log('👂 PARENT PANEL IN ATTESA DI EVENTI...');
    window.addEventListener('show-pin-pad', handleShowPinPad);
    
    // Controlla anche lo stato globale
    const interval = setInterval(checkGlobalPinPad, 100);

    return () => {
      console.log('👂 PARENT PANEL PULISCI LISTENER');
      window.removeEventListener('show-pin-pad', handleShowPinPad);
      clearInterval(interval);
    };
  }, []);

  const handleAddTask = () => {
    const taskData = selectedTemplate || customTask;
    if (!taskData.title.trim() || !selectedChild) return;

    const config = DIFFICULTY_CONFIG[difficulty];
    const newTask = {
      title: taskData.title.trim(),
      description: taskData.description.trim(),
      recurrence,
      difficulty,
      coins: config.coins,
      xp: config.xp,
      assignedTo: selectedChild,
      icon: taskData.icon,
      createdBy: appState.family!.parents[0].id,
      createdAt: new Date(),
      isConfigured: true, // Di default configurata quando creata
    };

    const newState = addTask(appState, newTask);
    onUpdateState(newState);
    
    // Reset form
    setShowAddTask(false);
    setSelectedTemplate(null);
    setCustomTask({ title: '', description: '', icon: '📋' });
    setSelectedChild('');
    setRecurrence('daily');
    setDifficulty('easy');
  };

  const handleApproveTask = (taskId: string) => {
    const newState = updateTaskStatus(appState, taskId, 'approved');
    onUpdateState(newState);
    // Confetti quando il genitore approva
    setTimeout(() => {
      const event = new CustomEvent('trigger-confetti');
      window.dispatchEvent(event);
    }, 100);
  };

  const handleChangePin = () => {
    const newPin = window.prompt('Inserisci il nuovo PIN di 4 cifre:', appState.parentPin);
    if (newPin && newPin.length === 4 && /^\d{4}$/.test(newPin)) {
      const newState = { ...appState, parentPin: newPin };
      onUpdateState(newState);
      alert('PIN aggiornato con successo!');
    } else if (newPin) {
      alert('PIN non valido! Deve essere di 4 cifre.');
    }
  };

  const handleManageChores = () => {
    console.log('🔥 CLICK GESTIONE MISSIONI - ParentPanel');
    setShowManageChores(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-3xl p-4 mb-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">👨‍👩‍👧‍👦</div>
              <div>
                <h1 className="text-xl font-bold text-white">Pannello Genitore</h1>
                <p className="text-sm text-white/80">{appState.family?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Child Selector */}
              {appState.family?.children && appState.family.children.length > 1 && (
                <select
                  value={appState.currentChildId}
                  onChange={(e) => {
                    const newState = { ...appState, currentChildId: e.target.value };
                    onUpdateState(newState);
                  }}
                  className="bg-white/20 text-white text-sm px-3 py-2 rounded-xl border border-white/30 focus:outline-none focus:border-white/50"
                >
                  {appState.family.children.map(child => (
                    <option key={child.id} value={child.id} className="text-gray-800">
                      {child.avatar} {child.name}
                    </option>
                  ))}
                </select>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onModeToggle}
                className="bg-white/20 text-white p-2 rounded-xl"
                title="Passa a Vista Bambino"
              >
                <Users className="w-5 h-5" />
              </motion.button>

              {/* Pulsante Settings con menu dropdown */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                  className="bg-white/20 text-white p-2 rounded-xl"
                  title="Impostazioni"
                >
                  <Settings className="w-5 h-5" />
                </motion.button>

                {/* Menu Settings Dropdown */}
                <AnimatePresence>
                  {showSettingsMenu && (
                    <>
                      {/* Backdrop per chiudere il menu */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9998]"
                        onClick={() => setShowSettingsMenu(false)}
                      />
                      
                      {/* Menu Dropdown */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border-2 border-gray-200 z-[9999]"
                        onClick={(e) => e.stopPropagation()}
                      >
                      <div className="p-2 space-y-1">
                        {/* Cambia PIN */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleChangePin}
                          className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-3"
                        >
                          <span className="text-xl">🔐</span>
                          <div>
                            <p className="font-semibold text-gray-800">Cambia PIN</p>
                            <p className="text-xs text-gray-500">PIN attuale: {appState.parentPin}</p>
                          </div>
                        </motion.button>

                        {/* Aggiungi Bambino */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={async () => {
                            setShowSettingsMenu(false);
                            const name = prompt('Nome del bambino:');
                            const avatar = prompt('Avatar (emoji):', '👶');
                            if (name && avatar) {
                              try {
                                console.log('🔧 Creazione bambino su Supabase...');
                                
                                const { data, error } = await supabase
                                  .from('children')
                                  .insert({
                                    name: name.trim(),
                                    avatar: avatar.trim(),
                                    coins: 0,
                                    total_xp: 0,
                                    level: 1,
                                    family_id: appState.family?.id || null
                                  })
                                  .select()
                                  .single();

                                if (error) {
                                  console.error('❌ Errore creazione bambino:', error);
                                  alert(`❌ Errore database: ${error.message}`);
                                  return;
                                }

                                console.log('✅ Bambino creato su Supabase:', data);

                                // Aggiungi allo stato locale con UUID da Supabase
                                const newChild = {
                                  id: data.id, // UUID da Supabase
                                  name: data.name,
                                  avatar: data.avatar,
                                  coins: data.coins,
                                  totalXp: data.total_xp,
                                  level: data.level,
                                  parentId: data.family_id
                                };

                                const newState = {
                                  ...appState,
                                  family: {
                                    ...appState.family!,
                                    children: [...appState.family!.children, newChild]
                                  }
                                };
                                onUpdateState(newState);
                                alert(`🎉 ${name} è stato aggiunto alla famiglia con UUID valido!`);
                                
                              } catch (err) {
                                console.error('❌ Errore creazione bambino:', err);
                                alert('❌ Errore di connessione. Riprova.');
                              }
                            }
                          }}
                          className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-3"
                        >
                          <span className="text-xl">👶</span>
                          <div>
                            <p className="font-semibold text-gray-800">Aggiungi Bambino</p>
                            <p className="text-xs text-gray-500">Crea un nuovo profilo bambino</p>
                          </div>
                        </motion.button>

                        
                        {/* Reset Completo */}
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setShowSettingsMenu(false);
                            if (window.confirm('⚠️ Sei sicuro di voler resettare TUTTO?\n\nTutti i dati verranno cancellati:\n• Famiglia\n• Bambini\n• Missioni\n• Premi\n• Monete e XP\n\nQuesta azione non è reversibile!')) {
                              localStorage.removeItem('eroi-di-casa-state');
                              window.location.reload();
                            }
                          }}
                          className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-50 transition-colors flex items-center gap-3"
                        >
                          <span className="text-xl">🔄</span>
                          <div>
                            <p className="font-semibold text-red-600">Reset Completo</p>
                            <p className="text-xs text-red-500">Cancella tutti i dati e ricomincia</p>
                          </div>
                        </motion.button>
                      </div>
                    </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>

        
        {/* Approval Queue */}
        {pendingTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 shadow-xl mb-4"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-yellow-600" />
              Missioni da Approvare ({pendingTasks.length})
            </h2>
            <div className="space-y-3">
              {pendingTasks.map(task => {
                const child = appState.family?.children.find(c => c.id === task.assignedTo);
                return (
                  <motion.div
                    key={task.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-4 border-2 border-yellow-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{task.icon}</div>
                        <div>
                          <h3 className="font-bold text-gray-800">{task.title}</h3>
                          <p className="text-sm text-gray-600">{task.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              {child?.avatar} {child?.name}
                            </span>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              +{task.coins} monete
                            </span>
                          </div>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleApproveTask(task.id)}
                        className="bg-green-500 text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:bg-green-600"
                      >
                        ✅ Approva
                      </motion.button>
                    </div>
                    <div className="text-xs text-gray-500">
                      Completata: {task.completedAt ? new Date(task.completedAt).toLocaleTimeString() : 'Oggi'}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Redeemed Rewards */}
        {appState.rewards.filter(r => r.redeemedBy).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 shadow-xl mb-4"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Gift className="w-6 h-6 text-purple-600" />
              Premi Riscattati ({appState.rewards.filter(r => r.redeemedBy).length})
            </h2>
            <div className="space-y-3">
              {appState.rewards
                .filter(r => r.redeemedBy)
                .sort((a, b) => new Date(b.redeemedAt!).getTime() - new Date(a.redeemedAt!).getTime())
                .map(reward => {
                  const child = appState.family?.children.find(c => c.id === reward.redeemedBy);
                  return (
                    <motion.div
                      key={reward.id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border-2 border-purple-200 opacity-75"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl grayscale">{reward.icon}</div>
                          <div>
                            <h3 className="font-bold text-gray-800 line-through">{reward.name}</h3>
                            <p className="text-sm text-gray-600">{reward.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                {child?.avatar} {child?.name}
                              </span>
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                {reward.cost} monete
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">✅ Riscattato</div>
                          <div className="text-xs text-gray-500">
                            {reward.redeemedAt ? new Date(reward.redeemedAt).toLocaleDateString() : 'Oggi'}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </motion.div>
        )}

        {/* Family Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-xl mb-4"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            La Tua Squadra
          </h2>
          <div className="space-y-3">
            {appState.family?.children.map(child => {
              const childTasks = appState.tasks.filter(t => t.assignedTo === child.id);
              const completedToday = childTasks.filter(t => 
                t.status === 'approved' && 
                t.approvedAt && 
                new Date(t.approvedAt).toDateString() === new Date().toDateString()
              ).length;
              
              return (
                <motion.div
                  key={child.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-3xl"
                      >
                        {child.avatar}
                      </motion.div>
                      <div>
                        <h3 className="font-bold text-gray-800">{child.name}</h3>
                        <div className="flex items-center gap-2 text-sm">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-gray-600">Livello {child.level}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-blue-600 font-semibold">{child.coins} monete</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">{completedToday}</p>
                      <p className="text-xs text-gray-600">Missioni oggi</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddTask(true)}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-4 rounded-3xl shadow-lg flex items-center justify-center gap-2"
          >
            <Plus className="w-6 h-6" />
            Aggiungi Nuova Missione
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onViewChange('reward-management')}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-4 rounded-3xl shadow-lg flex items-center justify-center gap-2"
          >
            <Gift className="w-6 h-6" />
            Gestione Premi
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleManageChores}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold py-4 rounded-3xl shadow-lg flex items-center justify-center gap-2"
          >
            <Settings className="w-6 h-6" />
            Gestione Missioni
          </motion.button>
        </motion.div>

        {/* Add Task Modal */}
        <AnimatePresence>
          {showAddTask && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowAddTask(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Nuova Missione</h2>
                
                {/* Templates */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Template Veloci</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {TASK_TEMPLATES.map((template) => (
                      <motion.button
                        key={template.title}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedTemplate(template)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          selectedTemplate?.title === template.title
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{template.icon}</div>
                        <p className="text-xs font-semibold text-gray-700">{template.title}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Custom Task */}
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Titolo Missione</label>
                    <input
                      type="text"
                      value={selectedTemplate ? selectedTemplate.title : customTask.title}
                      onChange={(e) => setCustomTask({ ...customTask, title: e.target.value })}
                      placeholder="Nome della missione..."
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none"
                      disabled={!!selectedTemplate}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Descrizione</label>
                    <textarea
                      value={selectedTemplate ? selectedTemplate.description : customTask.description}
                      onChange={(e) => setCustomTask({ ...customTask, description: e.target.value })}
                      placeholder="Descrizione della missione..."
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none resize-none"
                      rows={2}
                      disabled={!!selectedTemplate}
                    />
                  </div>
                </div>

                {/* Task Configuration */}
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Assegna a</label>
                    <select
                      value={selectedChild}
                      onChange={(e) => setSelectedChild(e.target.value)}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none"
                    >
                      <option value="">Scegli un bambino...</option>
                      {appState.family?.children.map(child => (
                        <option key={child.id} value={child.id}>
                          {child.avatar} {child.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Ricorrenza</label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(RECURRENCE_CONFIG).map(([key, config]) => (
                        <motion.button
                          key={key}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setRecurrence(key as any)}
                          className={`p-2 rounded-xl border-2 transition-all ${
                            recurrence === key
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-xl mb-1">{config.icon}</div>
                          <p className="text-xs font-semibold text-gray-700">{config.label}</p>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Difficoltà</label>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(DIFFICULTY_CONFIG).map(([key, config]) => (
                        <motion.button
                          key={key}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setDifficulty(key as any)}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            difficulty === key
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <p className="text-sm font-bold capitalize text-gray-700">{key}</p>
                          <p className="text-xs text-gray-600">{config.coins} monete</p>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddTask(false)}
                    className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 rounded-xl"
                  >
                    Annulla
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddTask}
                    disabled={!selectedChild || !(selectedTemplate || customTask.title.trim())}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold py-3 rounded-xl disabled:opacity-50"
                  >
                    Crea Missione
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PIN Pad */}
        <PinPad
          isVisible={showPinPad}
          onCorrectPin={() => {
            setShowPinPad(false);
            onModeToggle();
          }}
          onClose={() => setShowPinPad(false)}
          correctPin={appState.parentPin}
        />
      </div>

      {/* Manage Chores Modal */}
      <AnimatePresence>
        {showManageChores && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowManageChores(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <Settings className="w-6 h-6 text-purple-600" />
                  Gestione Missioni
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowManageChores(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <ChevronDown className="w-5 h-5 rotate-90" />
                </motion.button>
              </div>
              
              <ManageChores
                appState={appState}
                onUpdateState={onUpdateState}
                onBack={() => setShowManageChores(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
