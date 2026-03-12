import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, User, Star, ChevronRight } from 'lucide-react';
import { Parent, Child } from '../types';

interface FamilySetupProps {
  onComplete: (familyName: string, parents: Parent[], children: Child[]) => void;
}

const AVATARS = ['🦸', '👸', '🤠', '🦄', '🐻', '🦁', '🐰', '🦊', '🐼', '🐨'];
const PARENT_AVATARS = ['👨', '👩', '🧔', '👱‍♀️', '👨‍🦱', '👩‍🦰'];

export function FamilySetup({ onComplete }: FamilySetupProps) {
  const [step, setStep] = useState(1);
  const [familyName, setFamilyName] = useState('');
  const [parents, setParents] = useState<Parent[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [newParentName, setNewParentName] = useState('');
  const [newChildName, setNewChildName] = useState('');
  const [selectedParentAvatar, setSelectedParentAvatar] = useState(PARENT_AVATARS[0]);
  const [selectedChildAvatar, setSelectedChildAvatar] = useState(AVATARS[0]);

  const addParent = () => {
    if (newParentName.trim()) {
      const newParent: Parent = {
        id: Date.now().toString(),
        name: newParentName.trim(),
        avatar: selectedParentAvatar,
        role: 'parent',
      };
      setParents([...parents, newParent]);
      setNewParentName('');
      setSelectedParentAvatar(PARENT_AVATARS[0]);
    }
  };

  const addChild = () => {
    if (newChildName.trim()) {
      const newChild: Child = {
        id: Date.now().toString(),
        name: newChildName.trim(),
        avatar: selectedChildAvatar,
        coins: 0,
        level: 1,
        totalXp: 0,
        parentId: parents[0]?.id || '',
      };
      setChildren([...children, newChild]);
      setNewChildName('');
      setSelectedChildAvatar(AVATARS[0]);
    }
  };

  const handleComplete = () => {
    if (familyName.trim() && parents.length > 0 && children.length > 0) {
      onComplete(familyName.trim(), parents, children);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 p-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
      >
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl mb-4"
          >
            🏠
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Eroi di Casa</h1>
          <p className="text-gray-600">Crea la tua famiglia di super eroi!</p>
        </div>

        {/* Step 1: Family Name */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-purple-600" />
                Nome della Famiglia
              </h2>
              <input
                type="text"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="La mia Super Famiglia"
                className="w-full p-3 border-2 border-purple-200 rounded-xl focus:border-purple-400 focus:outline-none"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStep(2)}
                disabled={!familyName.trim()}
                className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continua
                <ChevronRight className="inline-block ml-2 w-5 h-5" />
              </motion.button>
            </motion.div>
          )}

          {/* Step 2: Add Parents */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-6 h-6 text-blue-600" />
                Genitori
              </h2>
              
              <div className="space-y-3 mb-4">
                {parents.map((parent, index) => (
                  <motion.div
                    key={parent.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl"
                  >
                    <span className="text-2xl">{parent.avatar}</span>
                    <span className="font-semibold text-gray-700">{parent.name}</span>
                  </motion.div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newParentName}
                    onChange={(e) => setNewParentName(e.target.value)}
                    placeholder="Nome del genitore"
                    className="flex-1 p-2 border-2 border-blue-200 rounded-lg focus:border-blue-400 focus:outline-none"
                  />
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  {PARENT_AVATARS.map((avatar) => (
                    <motion.button
                      key={avatar}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedParentAvatar(avatar)}
                      className={`text-2xl p-2 rounded-lg ${
                        selectedParentAvatar === avatar
                          ? 'bg-blue-200 ring-2 ring-blue-400'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {avatar}
                    </motion.button>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={addParent}
                  disabled={!newParentName.trim()}
                  className="w-full bg-blue-500 text-white font-bold py-2 rounded-xl disabled:opacity-50"
                >
                  <Plus className="inline-block mr-2 w-4 h-4" />
                  Aggiungi Genitore
                </motion.button>
              </div>

              <div className="flex gap-2 mt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-200 text-gray-700 font-bold py-2 rounded-xl"
                >
                  Indietro
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStep(3)}
                  disabled={parents.length === 0}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-2 rounded-xl disabled:opacity-50"
                >
                  Continua
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Add Children */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                Piccoli Eroi
              </h2>
              
              <div className="space-y-3 mb-4">
                {children.map((child, index) => (
                  <motion.div
                    key={child.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl"
                  >
                    <span className="text-2xl">{child.avatar}</span>
                    <div>
                      <span className="font-semibold text-gray-700 block">{child.name}</span>
                      <span className="text-xs text-gray-500">Livello {child.level} • {child.coins} monete</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newChildName}
                    onChange={(e) => setNewChildName(e.target.value)}
                    placeholder="Nome del bambino"
                    className="flex-1 p-2 border-2 border-yellow-200 rounded-lg focus:border-yellow-400 focus:outline-none"
                  />
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  {AVATARS.map((avatar) => (
                    <motion.button
                      key={avatar}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedChildAvatar(avatar)}
                      className={`text-2xl p-2 rounded-lg ${
                        selectedChildAvatar === avatar
                          ? 'bg-yellow-200 ring-2 ring-yellow-400'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {avatar}
                    </motion.button>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={addChild}
                  disabled={!newChildName.trim()}
                  className="w-full bg-yellow-500 text-white font-bold py-2 rounded-xl disabled:opacity-50"
                >
                  <Plus className="inline-block mr-2 w-4 h-4" />
                  Aggiungi Bambino
                </motion.button>
              </div>

              <div className="flex gap-2 mt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-200 text-gray-700 font-bold py-2 rounded-xl"
                >
                  Indietro
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleComplete}
                  disabled={children.length === 0}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold py-2 rounded-xl disabled:opacity-50"
                >
                  Inizia Avventura! 🚀
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
