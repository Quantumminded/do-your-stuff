import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trophy, 
  Gift, 
  Pizza, 
  Tv, 
  Gamepad2, 
  IceCream, 
  Crown,
  X
} from 'lucide-react';
import { AppState, Reward } from '../types';
import { addReward } from '../utils/familyLogic';

interface RewardManagementProps {
  appState: AppState;
  onUpdateState: (newState: AppState) => void;
  onClose: () => void;
}

const REWARD_TEMPLATES = [
  { name: 'Pizza Party', description: 'Scegli la tua pizza preferita!', icon: '🍕', cost: 100 },
  { name: 'Ora di TV Extra', description: '30 minuti di cartoni animati!', icon: '📺', cost: 50 },
  { name: 'Gelato Favorito', description: 'Una pallina del tuo gusto preferito!', icon: '🍦', cost: 30 },
  { name: 'Gioco Online', description: '1 ora di giochi online!', icon: '🎮', cost: 60 },
  { name: 'Notte Tarda', description: 'Dormi 30 minuti più tardi!', icon: '🌙', cost: 80 },
  { name: 'Super Eroe della Settimana', description: 'Scegli la cena per una settimana!', icon: '👑', cost: 200 },
];

const CATEGORIES = [
  { id: 'cibo', name: 'Cibo', icon: Pizza },
  { id: 'intrattenimento', name: 'Intrattenimento', icon: Tv },
  { id: 'privilegi', name: 'Privilegi', icon: Crown },
  { id: 'giochi', name: 'Giochi', icon: Gamepad2 },
];

export function RewardManagement({ appState, onUpdateState, onClose }: RewardManagementProps) {
  const [showAddReward, setShowAddReward] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof REWARD_TEMPLATES[0] | null>(null);
  const [customReward, setCustomReward] = useState({ name: '', description: '', icon: '🎁', cost: 50 });
  const [selectedCategory, setSelectedCategory] = useState('cibo');

  const handleAddReward = () => {
    const rewardData = selectedTemplate || customReward;
    if (!rewardData.name.trim()) return;

    const newReward = {
      name: rewardData.name.trim(),
      description: rewardData.description.trim(),
      cost: rewardData.cost,
      icon: rewardData.icon,
      category: selectedCategory,
      createdBy: appState.family!.parents[0].id,
    };

    const newState = addReward(appState, newReward);
    onUpdateState(newState);
    
    // Reset form
    setShowAddReward(false);
    setSelectedTemplate(null);
    setCustomReward({ name: '', description: '', icon: '🎁', cost: 50 });
    setSelectedCategory('cibo');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-pink-400 to-purple-400 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 mb-4 shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Gift className="w-8 h-8 text-orange-600" />
              Gestione Premi
            </h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="bg-gray-200 text-gray-700 p-2 rounded-xl"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddReward(true)}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2"
          >
            <Plus className="w-6 h-6" />
            Aggiungi Nuovo Premio
          </motion.button>
        </motion.div>

        {/* Existing Rewards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-xl"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">Premi Disponibili</h2>
          
          {appState.rewards.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🏪</div>
              <p className="text-gray-600 font-semibold">Nessun premio ancora</p>
              <p className="text-sm text-gray-500 mt-2">Aggiungi premi per motivare i tuoi eroi!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appState.rewards.map(reward => {
                const isRedeemed = !!reward.redeemedBy;
                const child = appState.family?.children.find(c => c.id === reward.redeemedBy);
                
                return (
                  <motion.div
                    key={reward.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`bg-gradient-to-r rounded-2xl p-4 ${
                      isRedeemed 
                        ? 'from-gray-50 to-gray-100 opacity-60' 
                        : 'from-orange-50 to-pink-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={isRedeemed ? { scale: 0.8 } : { rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 2, repeat: !isRedeemed ? Infinity : 0 }}
                          className={`text-3xl ${isRedeemed ? 'grayscale' : ''}`}
                        >
                          {reward.icon}
                        </motion.div>
                        <div>
                          <h3 className={`font-bold text-lg ${
                            isRedeemed ? 'text-gray-500 line-through' : 'text-gray-800'
                          }`}>
                            {reward.name}
                          </h3>
                          <p className="text-sm text-gray-600">{reward.description}</p>
                          {isRedeemed && (
                            <p className="text-xs text-green-600 mt-1">
                              Riscattato da {child?.name}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-1 bg-yellow-100 px-3 py-2 rounded-full">
                          <Trophy className="w-4 h-4 text-yellow-600" />
                          <span className="font-bold text-yellow-600">{reward.cost}</span>
                        </div>
                        <span className="text-xs text-gray-500 mt-1 block">
                          {reward.category}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Add Reward Modal */}
        <AnimatePresence>
          {showAddReward && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowAddReward(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Nuovo Premio</h2>
                
                {/* Templates */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Template Veloci</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {REWARD_TEMPLATES.map((template) => (
                      <motion.button
                        key={template.name}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedTemplate(template)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          selectedTemplate?.name === template.name
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{template.icon}</div>
                        <p className="text-xs font-semibold text-gray-700">{template.name}</p>
                        <p className="text-xs text-gray-500">{template.cost} monete</p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Custom Reward */}
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nome Premio</label>
                    <input
                      type="text"
                      value={selectedTemplate ? selectedTemplate.name : customReward.name}
                      onChange={(e) => setCustomReward({ ...customReward, name: e.target.value })}
                      placeholder="Nome del premio..."
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none"
                      disabled={!!selectedTemplate}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Descrizione</label>
                    <textarea
                      value={selectedTemplate ? selectedTemplate.description : customReward.description}
                      onChange={(e) => setCustomReward({ ...customReward, description: e.target.value })}
                      placeholder="Descrizione del premio..."
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none resize-none"
                      rows={2}
                      disabled={!!selectedTemplate}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Costo in Monete</label>
                    <input
                      type="number"
                      value={selectedTemplate ? selectedTemplate.cost : customReward.cost}
                      onChange={(e) => setCustomReward({ ...customReward, cost: parseInt(e.target.value) || 0 })}
                      min="1"
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:outline-none"
                      disabled={!!selectedTemplate}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Categoria</label>
                    <div className="grid grid-cols-2 gap-2">
                      {CATEGORIES.map((category) => (
                        <motion.button
                          key={category.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`p-2 rounded-xl border-2 transition-all flex items-center gap-2 ${
                            selectedCategory === category.id
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <category.icon className="w-4 h-4" />
                          <span className="text-xs font-semibold text-gray-700">{category.name}</span>
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
                    onClick={() => setShowAddReward(false)}
                    className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 rounded-xl"
                  >
                    Annulla
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddReward}
                    disabled={!selectedTemplate && !customReward.name.trim()}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-3 rounded-xl disabled:opacity-50"
                  >
                    Crea Premio
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
