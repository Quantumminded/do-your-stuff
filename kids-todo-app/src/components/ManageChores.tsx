import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  Calendar,
  Filter,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  Coffee,
  Home,
  Book
} from 'lucide-react';
import { AppState, Task } from '../types';

interface ManageChoresProps {
  appState: AppState;
  onUpdateState: (newState: AppState) => void;
  onBack: () => void;
}

const DIFFICULTY_COLORS = {
  easy: 'bg-green-100 text-green-700 border-green-300',
  medium: 'bg-orange-100 text-orange-700 border-orange-300',
  hard: 'bg-red-100 text-red-700 border-red-300',
};

const CATEGORIES = {
  morning: 'Mattina',
  afternoon: 'Pomeriggio', 
  evening: 'Sera',
  anytime: 'Sempre',
};

export function ManageChores({ appState, onUpdateState, onBack }: ManageChoresProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Raggruppa le missioni per categoria
  const tasksByCategory = appState.tasks.reduce((acc, task) => {
    const category = task.category || 'Altro';
    if (!acc[category]) acc[category] = [];
    acc[category].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  // Funzioni di gestione
  const toggleTask = (taskId: string) => {
    const newState = {
      ...appState,
      tasks: appState.tasks.map(task => 
        task.id === taskId 
          ? { ...task, isConfigured: !task.isConfigured }
          : task
      )
    };
    onUpdateState(newState);
  };

  const deleteTask = (taskId: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questa missione?')) {
      const newState = {
        ...appState,
        tasks: appState.tasks.filter(task => task.id !== taskId)
      };
      onUpdateState(newState);
      setSelectedTask(null);
      setShowEditModal(false);
    }
  };

  const updateTask = (updatedTask: Task) => {
    const newState = {
      ...appState,
      tasks: appState.tasks.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      )
    };
    onUpdateState(newState);
    setSelectedTask(null);
    setShowEditModal(false);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const getDifficultyColor = (difficulty: string) => {
    return DIFFICULTY_COLORS[difficulty as keyof typeof DIFFICULTY_COLORS] || DIFFICULTY_COLORS.easy;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-6 mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <ChevronDown className="w-5 h-5 rotate-90" />
              </motion.button>
              <div className="flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Gestione Missioni</h1>
                  <p className="text-sm text-gray-600">Crea e gestisci tutte le missioni</p>
                </div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowEditModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nuova Missione
            </motion.button>
          </div>
        </motion.div>

        {/* Lista Missioni per Categoria */}
        <div className="space-y-6">
          {Object.entries(tasksByCategory).map(([category, tasks]) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl shadow-xl overflow-hidden"
            >
              {/* Header Categoria */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleCategory(category)}
                className="w-full p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 flex items-center justify-between hover:from-blue-100 hover:to-indigo-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {category === 'Mattina' && <Sun className="w-5 h-5 text-yellow-500" />}
                    {category === 'Pomeriggio' && <Coffee className="w-5 h-5 text-orange-500" />}
                    {category === 'Sera' && <Moon className="w-5 h-5 text-indigo-500" />}
                    {category === 'Weekend' && <Home className="w-5 h-5 text-purple-500" />}
                    {(!category || category === 'Altro') && <Book className="w-5 h-5 text-gray-500" />}
                    <h2 className="text-lg font-bold text-gray-800">
                      {category || 'Altro'} ({tasks.length})
                    </h2>
                  </div>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-600 transition-transform ${
                      expandedCategories[category] ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                
                {/* Statistiche Categoria */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    Configurate: {tasks.filter(t => t.isConfigured).length}/{tasks.length}
                  </span>
                </div>
              </motion.button>

              {/* Lista Missioni della Categoria */}
              {expandedCategories[category] && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  className="border-t border-gray-200"
                >
                  <div className="p-4 space-y-3">
                    {tasks.map((task) => (
                      <motion.div
                        key={task.id}
                        whileHover={{ scale: 1.02 }}
                        className={`bg-white rounded-2xl p-4 border-2 transition-all ${
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
                                
                                {task.timeSlot && (
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                    {task.timeSlot}
                                  </span>
                                )}
                                
                                {/* Switch Intertuttore */}
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => toggleTask(task.id)}
                                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                                    task.isConfigured 
                                      ? 'bg-green-500 hover:bg-green-600' 
                                      : 'bg-gray-300 hover:bg-gray-400'
                                  }`}
                                >
                                  <div className={`absolute inset-0 rounded-full transition-colors ${
                                    task.isConfigured ? 'bg-white' : 'bg-transparent'
                                  }`}>
                                    <div className={`absolute top-1/2 left-1/2 w-5 h-5 bg-white rounded-full transition-transform ${
                                      task.isConfigured ? 'translate-x-5' : 'translate-x-0'
                                    }`}>
                                      <div className={`w-2 h-2 rounded-full transition-colors ${
                                        task.isConfigured ? 'bg-white' : 'bg-gray-400'
                                      }`} />
                                    </div>
                                  </div>
                                </motion.button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Azioni */}
                          <div className="flex items-center gap-2 ml-4">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setSelectedTask(task);
                                setShowEditModal(true);
                              }}
                              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </motion.button>
                            
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
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modale Modifica Missione */}
      <AnimatePresence>
        {showEditModal && selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Modifica Missione</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Titolo</label>
                  <input
                    type="text"
                    value={selectedTask.title}
                    onChange={(e) => setSelectedTask({...selectedTask, title: e.target.value})}
                    className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-blue-400 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Descrizione</label>
                  <textarea
                    value={selectedTask.description}
                    onChange={(e) => setSelectedTask({...selectedTask, description: e.target.value})}
                    rows={3}
                    className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-blue-400 focus:outline-none resize-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Difficoltà</label>
                    <select
                      value={selectedTask.difficulty}
                      onChange={(e) => setSelectedTask({...selectedTask, difficulty: e.target.value as any})}
                      className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-blue-400 focus:outline-none"
                    >
                      <option value="easy">Facile</option>
                      <option value="medium">Media</option>
                      <option value="hard">Difficile</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Frequenza</label>
                    <select
                      value={selectedTask.recurrence}
                      onChange={(e) => setSelectedTask({...selectedTask, recurrence: e.target.value as any})}
                      className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-blue-400 focus:outline-none"
                    >
                      <option value="daily">Giornaliero</option>
                      <option value="weekly">Settimanale</option>
                      <option value="monthly">Mensile</option>
                      <option value="once">Una volta</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Monete</label>
                    <input
                      type="number"
                      value={selectedTask.coins}
                      onChange={(e) => setSelectedTask({...selectedTask, coins: parseInt(e.target.value) || 0})}
                      className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">XP</label>
                    <input
                      type="number"
                      value={selectedTask.xp}
                      onChange={(e) => setSelectedTask({...selectedTask, xp: parseInt(e.target.value) || 0})}
                      className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-300"
                  >
                    Annulla
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => updateTask(selectedTask)}
                    className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700"
                  >
                    Salva
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ManageChores;
