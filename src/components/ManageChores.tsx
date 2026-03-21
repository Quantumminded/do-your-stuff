import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { 
  Edit, 
  Trash2, 
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  Coffee,
  Home,
  Book
} from 'lucide-react';
import { Task } from '../types';

interface ManageChoresProps {
  appState: any;
  onUpdateState: (newState: any) => void;
  onBack: () => void;
}

const DIFFICULTY_CONFIG = {
  easy: { coins: 10, xp: 5, color: 'bg-green-100 text-green-700' },
  medium: { coins: 15, xp: 10, color: 'bg-yellow-100 text-yellow-700' },
  hard: { coins: 25, xp: 15, color: 'bg-red-100 text-red-700' }
};

const CATEGORIES = ['Mattina', 'Pomeriggio', 'Sera', 'Weekend'];

const getDifficultyColor = (difficulty: string) => {
  const config = DIFFICULTY_CONFIG[difficulty as keyof typeof DIFFICULTY_CONFIG];
  return config?.color || 'bg-gray-100 text-gray-700';
};

export function ManageChores({ appState, onUpdateState, onBack }: ManageChoresProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    recurrence: 'daily' as const,
    difficulty: 'easy' as const,
    icon: '📝'
  });
  const [selectedChild, setSelectedChild] = useState('');

  // Stato di caricamento per ogni task
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  // Aggiorna task su Supabase con feedback
  const updateTaskOnSupabase = async (taskId: string, isConfigured: boolean) => {
    console.log('🔧 Aggiornamento task:', { taskId, isConfigured });
    
    // Verifica se è un UUID valido
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(taskId);
    
    if (!isValidUUID) {
      console.error('❌ TaskId non è un UUID valido:', taskId);
      alert(`⚠️ Questa missione ha un ID locale (${taskId}) e non può essere sincronizzata con Supabase.\n\nPer risolvere:\n1. Esegui il SQL fix in Supabase\n2. Ricrea la missione dal pannello genitore\n\nLe nuove missioni avranno ID UUID validi.`);
      return;
    }
    
    // Mostra spinner immediatamente
    setLoadingStates(prev => ({ ...prev, [taskId]: true }));
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({ is_configured: isConfigured })
        .eq('id', taskId)
        .select();
      
      if (error) {
        console.error('❌ Errore aggiornamento task:', error);
        alert(`❌ Errore database: ${error.message}`);
      } else {
        console.log('✅ Task aggiornata su Supabase:', { taskId, isConfigured, data });
        // Aggiorna stato locale immediatamente
        const newState = {
          ...appState,
          tasks: appState.tasks.map((task: any) => 
            task.id === taskId 
              ? { ...task, isConfigured }
              : task
          )
        };
        onUpdateState(newState);
      }
    } catch (err) {
      console.error('❌ Errore updateTaskOnSupabase:', err);
      alert('❌ Errore di connessione. Riprova.');
    } finally {
      // Nascondi spinner
      setLoadingStates(prev => ({ ...prev, [taskId]: false }));
    }
  };

  const deleteTask = async (taskId: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questa missione?')) {
      try {
        console.log('🗑️ Cancellazione missione da Supabase...', taskId);
        
        // Prima cancella da Supabase
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', taskId);

        if (error) {
          console.error('❌ Errore cancellazione missione:', error);
          alert(`❌ Errore database: ${error.message}`);
          return;
        }

        console.log('✅ Missione cancellata da Supabase');
        
        // Poi aggiorna lo stato locale
        const newState = {
          ...appState,
          tasks: appState.tasks.filter((task: any) => task.id !== taskId)
        };
        onUpdateState(newState);
        setSelectedTask(null);
        setShowEditModal(false);
        
        alert('🗑️ Missione cancellata con successo!');
        
      } catch (err) {
        console.error('❌ Errore cancellazione missione:', err);
        alert('❌ Errore di connessione. Riprova.');
      }
    }
  };

  const addTask = async () => {
    if (!selectedChild || !taskData.title.trim()) {
      alert('Per favore, seleziona un bambino e inserisci un titolo per la missione');
      return;
    }

    // Verifica che selectedChild sia un UUID valido
    const isValidChildUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(selectedChild);
    
    if (!isValidChildUUID) {
      alert(`⚠️ Il bambino selezionato ha un ID locale (${selectedChild}) e non può essere sincronizzato con Supabase.\n\nPer risolvere:\n1. Esegui il SQL fix in Supabase\n2. Ricrea i bambini dal pannello genitore\n\nI nuovi bambini avranno ID UUID validi.`);
      return;
    }

    const config = DIFFICULTY_CONFIG[taskData.difficulty as keyof typeof DIFFICULTY_CONFIG];
    
    try {
      console.log('🔧 Creazione task su Supabase...');
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: taskData.title.trim(),
          description: taskData.description.trim(),
          recurrence: taskData.recurrence,
          difficulty: taskData.difficulty,
          coins: config.coins,
          xp: config.xp,
          assigned_to: selectedChild,
          icon: taskData.icon,
          // created_by: appState.family?.parents?.[0]?.id || null, // Rimosso per evitare errore UUID
          is_configured: true,
          is_completed: false,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Errore creazione task:', error);
        alert(`❌ Errore database: ${error.message}`);
        return;
      }

      console.log('✅ Task creata su Supabase:', data);

      // Aggiungi al stato locale con UUID da Supabase
      const newTask = {
        id: data.id, // UUID da Supabase
        title: data.title,
        description: data.description,
        recurrence: data.recurrence,
        difficulty: data.difficulty,
        coins: data.coins,
        xp: data.xp,
        assignedTo: data.assigned_to,
        icon: data.icon,
        createdBy: data.created_by,
        createdAt: new Date(data.created_at),
        isConfigured: data.is_configured,
        isCompleted: data.is_completed,
        status: data.status
      };

      const newState = {
        ...appState,
        tasks: [...(appState.tasks || []), newTask]
      };
      onUpdateState(newState);
      
      // Reset form
      setTaskData({
        title: '',
        description: '',
        recurrence: 'daily' as const,
        difficulty: 'easy' as const,
        icon: '📝'
      });
      setSelectedChild('');
      
      alert('✅ Missione creata con successo!');
      
    } catch (err) {
      console.error('❌ Errore addTask:', err);
      alert('❌ Errore di connessione. Riprova.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 mb-6 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">📋</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Gestione Missioni</h1>
                <p className="text-sm text-gray-600">Configura e gestisci le missioni familiari</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ChevronUp className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl p-6 border-2 border-blue-200 text-center"
          >
            <div className="text-3xl mb-2">📊</div>
            <div className="text-2xl font-bold text-blue-600">{appState?.tasks?.length || 0}</div>
            <div className="text-sm text-gray-600">Missioni Totali</div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl p-6 border-2 border-green-200 text-center"
          >
            <div className="text-3xl mb-2">✅</div>
            <div className="text-2xl font-bold text-green-600">
              {appState?.tasks?.filter((t: any) => t.isConfigured).length || 0}
            </div>
            <div className="text-sm text-gray-600">Missioni Attive</div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl p-6 border-2 border-orange-200 text-center"
          >
            <div className="text-3xl mb-2">⏸</div>
            <div className="text-2xl font-bold text-orange-600">
              {appState?.tasks?.filter((t: any) => !t.isConfigured).length || 0}
            </div>
            <div className="text-sm text-gray-600">Missioni Disattive</div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-2xl p-6 border-2 border-red-200 text-center"
          >
            <div className="text-3xl mb-2">🧹</div>
            <div className="text-2xl font-bold text-red-600">
              {appState?.tasks?.filter((t: any) => !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(t.id)).length || 0}
            </div>
            <div className="text-sm text-gray-600">Missioni Locali</div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (window.confirm('🧹 Vuoi eliminare tutte le missioni locali e ricominciare con UUID validi?\n\nLe nuove missioni che creerai funzioneranno perfettamente con Supabase!')) {
                  const newState = {
                    ...appState,
                    tasks: appState.tasks.filter((task: any) => 
                      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(task.id)
                    )
                  };
                  onUpdateState(newState);
                  alert('✅ Missioni locali eliminate! Ora crea nuove missioni dal pannello.');
                }
              }}
              className="mt-2 w-full bg-red-500 text-white text-sm py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Pulisci Locali
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Quick Add Task */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-6 shadow-lg mb-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">Aggiungi Missione Veloce</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Titolo</label>
              <input
                type="text"
                value={taskData.title}
                onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                placeholder="Titolo della missione..."
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Descrizione</label>
              <textarea
                value={taskData.description}
                onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
                placeholder="Descrizione della missione..."
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none resize-none"
                rows={2}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Difficoltà</label>
              <select
                value={taskData.difficulty}
                onChange={(e) => setTaskData({ ...taskData, difficulty: e.target.value as any })}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none"
              >
                <option value="easy">Facile</option>
                <option value="medium">Media</option>
                <option value="hard">Difficile</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Ricorrenza</label>
              <select
                value={taskData.recurrence}
                onChange={(e) => setTaskData({ ...taskData, recurrence: e.target.value as any })}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none"
              >
                <option value="daily">Giornaliera</option>
                <option value="weekly">Settimanale</option>
                <option value="monthly">Mensile</option>
                <option value="once">Una tantum</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Assegna a</label>
              <select
                value={selectedChild}
                onChange={(e) => setSelectedChild(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none"
              >
                <option value="">Scegli un bambino...</option>
                {appState.family?.children?.map((child: any) => (
                  <option key={child.id} value={child.id}>
                    {child.avatar} {child.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Icona</label>
              <input
                type="text"
                value={taskData.icon}
                onChange={(e) => setTaskData({ ...taskData, icon: e.target.value })}
                placeholder="📝"
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none"
              />
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={addTask}
            className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 rounded-2xl shadow-lg hover:from-blue-600 hover:to-purple-600 transition-all"
          >
            Aggiungi Missione
          </motion.button>
        </motion.div>

        {/* Missioni Lista */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-lg"
        >
          <h2 className="text-xl font-bold text-gray-800 p-6 border-b border-gray-200">Missioni Esistenti</h2>
          
          <div className="p-6 space-y-4">
            {appState?.tasks?.map((task: any) => (
              <motion.div
                key={task.id}
                whileHover={{ scale: 1.02 }}
                className={`bg-gray-50 rounded-2xl p-4 border-2 transition-all ${
                  !task.isConfigured 
                    ? 'border-gray-200 opacity-60' 
                    : 'border-gray-300 hover:border-blue-400 hover:shadow-lg'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Icona e Informazioni */}
                    <div className="text-3xl mb-2">{task.icon}</div>
                    <div className="flex-1">
                      <h3 className={`font-bold text-gray-800 mb-1 ${
                        !task.isConfigured ? 'line-through text-gray-400' : ''
                      }`}>
                        {task.title}
                      </h3>
                      <p className={`text-sm text-gray-600 mb-2 ${
                        !task.isConfigured ? 'line-through text-gray-400' : ''
                      }`}>
                        {task.description}
                      </p>
                        
                      {/* Badge e Switch */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getDifficultyColor(task.difficulty)}`}>
                          {task.difficulty.charAt(0).toUpperCase() + task.difficulty.slice(1)}
                        </span>
                        
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                          {task.recurrence}
                        </span>
                        
                        {/* Indicatore Task Locale */}
                        {!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(task.id) && (
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-semibold">
                            LOCALE
                          </span>
                        )}
                        
                        {/* Switch Moderno con Spinner */}
                        <div className="relative">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => updateTaskOnSupabase(task.id, !task.isConfigured)}
                            disabled={loadingStates[task.id]}
                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                              task.isConfigured 
                                ? 'bg-emerald-500 focus:ring-emerald-400' 
                                : 'bg-gray-300 focus:ring-gray-400'
                            }`}
                          >
                            {/* Spinner durante caricamento */}
                            {loadingStates[task.id] ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                              />
                            ) : (
                              <motion.div
                                className="inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300"
                                animate={{ x: task.isConfigured ? 28 : 4 }}
                                transition={{ type: "spring", stiffness: 600, damping: 25 }}
                              />
                            )}
                          </motion.button>
                          
                          {/* Label per accessibilità */}
                          <span className="sr-only">
                            {task.isConfigured ? 'Disattiva missione' : 'Attiva missione'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Azioni */}
                  <div className="flex items-center gap-2 ml-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => deleteTask(task.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500">
                  Creata: {new Date(task.createdAt).toLocaleDateString()}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default ManageChores;
