import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Trophy, 
  Star, 
  Award, 
  CheckCircle2,
  Clock,
  Zap,
  Users,
  Sparkles
} from 'lucide-react';
import { AppState, Child, Task, Reward } from '../types';
import { updateTaskStatus, getTasksForChild, redeemReward } from '../utils/familyLogic';
import { triggerConfetti } from '../utils/confetti';

interface ChildPanelProps {
  appState: AppState;
  child: Child;
  onUpdateState: (newState: AppState) => void;
  onModeToggle: () => void;
}

export function ChildPanel({ appState, child, onUpdateState, onModeToggle }: ChildPanelProps) {
  const [activeTab, setActiveTab] = useState<'missions' | 'rewards'>('missions');
  const todayTasks = getTasksForChild(appState, child.id);
  const availableRewards = appState.rewards.filter(r => !r.redeemedBy && r.cost <= child.coins);

  
  const handleTaskComplete = (taskId: string) => {
    const task = todayTasks.find(t => t.id === taskId);
    if (!task || task.isCompleted) return;

    // Aggiorna isCompleted e lastCompletedDate
    const newState = {
      ...appState,
      tasks: appState.tasks.map(t => 
        t.id === taskId 
          ? { 
              ...t, 
              isCompleted: true,
              lastCompletedDate: new Date(),
              status: 'completed' as const,
              completedAt: new Date()
            }
          : t
      )
    };
    onUpdateState(newState);
    // Non più confetti qui - solo quando il genitore approva
  };

  const handleRewardRedeem = (rewardId: string) => {
    const newState = redeemReward(appState, rewardId, child.id);
    if (newState !== appState) {
      onUpdateState(newState);
      triggerConfetti();
    }
  };

  
  const xpForNextLevel = child.level * 50;
  const xpProgress = (child.totalXp % 50) / 50 * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-3xl p-4 mb-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-4xl"
              >
                {child.avatar}
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-white">{child.name}</h1>
                <p className="text-sm text-white/80">Eroe di Casa</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onModeToggle}
              className="bg-white/20 text-white p-2 rounded-xl"
              title="Passa a Vista Genitore"
            >
              <Users className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Dashboard */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-6 mb-4 shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" />
              <span className="text-lg font-bold text-gray-800">Livello {child.level}</span>
            </div>
            <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <span className="text-xl font-bold text-yellow-600">{child.coins}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-purple-500" />
                XP: {child.totalXp % 50}/{xpForNextLevel}
              </span>
              <span className="text-gray-600">Livello {child.level + 1}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-2 mb-4 shadow-xl"
        >
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'missions', icon: Home, label: 'Missioni' },
              { id: 'rewards', icon: Award, label: 'Premi' },
            ].map(({ id, icon: Icon, label }) => (
              <motion.button
                key={id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(id as any)}
                className={`flex flex-col items-center p-3 rounded-2xl transition-all ${
                  activeTab === id
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-semibold">{label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Missions Tab */}
          {activeTab === 'missions' && (
            <motion.div
              key="missions"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div className="bg-white rounded-3xl p-6 shadow-xl">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  Missioni di Oggi
                </h2>
                
                {todayTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🎉</div>
                    <p className="text-gray-600 font-semibold">Nessuna missione oggi!</p>
                    <p className="text-sm text-gray-500 mt-2">Riposati e preparati per nuove avventure!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayTasks.map(task => (
                      <motion.div
                        key={task.id}
                        whileHover={{ scale: !task.isCompleted ? 1.02 : 1 }}
                        whileTap={{ scale: !task.isCompleted ? 0.98 : 1 }}
                        onClick={() => !task.isCompleted && handleTaskComplete(task.id)}
                        className={`bg-gradient-to-r rounded-2xl p-4 transition-all ${
                          !task.isCompleted
                            ? 'from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 cursor-pointer'
                            : task.isCompleted && task.status === 'completed'
                            ? 'from-yellow-50 to-orange-50 cursor-not-allowed opacity-75'
                            : task.isCompleted && task.status === 'approved'
                            ? 'from-green-50 to-emerald-50'
                            : 'from-blue-50 to-purple-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <motion.div
                              animate={task.status === 'approved' ? { rotate: 360 } : {}}
                              transition={{ duration: 0.5 }}
                              className={`text-3xl ${
                                task.status === 'approved' ? 'grayscale' : ''
                              }`}
                            >
                              {task.icon}
                            </motion.div>
                            <div className="flex-1">
                              <h3 className={`font-bold text-lg ${
                                task.isCompleted && task.status === 'approved' 
                                  ? 'text-gray-500 line-through' 
                                  : task.isCompleted && task.status === 'completed'
                                  ? 'text-gray-600'
                                  : 'text-gray-800'
                              }`}>
                                {task.title}
                              </h3>
                              <p className={`text-sm ${
                                task.isCompleted && task.status === 'approved' 
                                  ? 'text-gray-400 line-through' 
                                  : task.isCompleted && task.status === 'completed'
                                  ? 'text-gray-500'
                                  : 'text-gray-600'
                              }`}>
                                {task.description}
                              </p>
                            </div>
                          </div>
                          
                          <motion.div
                            animate={task.status === 'completed' ? { scale: [1, 1.2, 1] } : {}}
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              task.status === 'approved'
                                ? 'bg-green-500'
                                : task.status === 'completed'
                                ? 'bg-yellow-500'
                                : 'bg-gray-200'
                            }`}
                          >
                            {task.status === 'approved' && <CheckCircle2 className="w-5 h-5 text-white" />}
                            {task.status === 'completed' && <Clock className="w-5 h-5 text-white" />}
                          </motion.div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-full">
                              <Trophy className="w-4 h-4 text-yellow-600" />
                              <span className="text-sm font-semibold text-yellow-600">{task.coins}</span>
                            </div>
                            <div className="flex items-center gap-1 bg-purple-100 px-2 py-1 rounded-full">
                              <Zap className="w-4 h-4 text-purple-600" />
                              <span className="text-sm font-semibold text-purple-600">{task.xp} XP</span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            {!task.isCompleted && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleTaskComplete(task.id)}
                                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-2 px-4 rounded-xl text-sm shadow-lg"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Fatto!
                              </motion.button>
                            )}
                            {task.isCompleted && task.status === 'completed' && (
                              <div className="bg-yellow-100 text-yellow-700 font-semibold py-2 px-4 rounded-xl text-sm border-2 border-yellow-300">
                                <Clock className="w-4 h-4 mr-1 inline" />
                                In attesa di verifica
                              </div>
                            )}
                            {task.isCompleted && task.status === 'approved' && (
                              <div className="bg-green-100 text-green-700 font-semibold py-2 px-4 rounded-xl text-sm border-2 border-green-300">
                                <CheckCircle2 className="w-4 h-4 mr-1 inline" />
                                Approvata!
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Rewards Tab */}
          {activeTab === 'rewards' && (
            <motion.div
              key="rewards"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="bg-white rounded-3xl p-6 shadow-xl">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Award className="w-6 h-6 text-orange-600" />
                  Negozio dei Premi
                </h2>
                
                {availableRewards.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🏪</div>
                    <p className="text-gray-600 font-semibold">Nessun premio disponibile</p>
                    <p className="text-sm text-gray-500 mt-2">Completa più missioni per sbloccare premi!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {availableRewards.map(reward => (
                      <motion.div
                        key={reward.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRewardRedeem(reward.id)}
                        className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl p-4 shadow-lg cursor-pointer hover:shadow-xl"
                      >
                        <div className="text-center mb-3">
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                            className="text-4xl mb-2"
                          >
                            {reward.icon}
                          </motion.div>
                        </div>

                        <h3 className="font-bold text-center mb-1 text-gray-800">
                          {reward.name}
                        </h3>
                        
                        <p className="text-xs text-center text-gray-600 mb-3">
                          {reward.description}
                        </p>

                        <div className="flex items-center justify-center gap-2 bg-yellow-100 px-3 py-2 rounded-full">
                          <Trophy className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm font-bold text-yellow-600">{reward.cost}</span>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full mt-3 bg-gradient-to-r from-orange-400 to-pink-400 text-white font-bold py-2 rounded-xl text-sm"
                        >
                          Riscatta!
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
