import React from 'react';
import { motion } from 'framer-motion';

interface MissionCardProps {
  mission: any;
  child?: any;
  onApprove?: (missionId: string) => void;
  onComplete?: (missionId: string) => void;
  isChildView?: boolean;
  xp: number;
  level: number;
  coins: number;
}

export function MissionCard({ 
  mission, 
  child, 
  onApprove, 
  onComplete, 
  isChildView = false,
  xp,
  level,
  coins
}: MissionCardProps) {
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [showCoinAnimation, setShowCoinAnimation] = React.useState(false);
  const [coinPosition, setCoinPosition] = React.useState({ x: 0, y: 0 });

  const handleApprove = () => {
    if (onApprove) {
      onApprove(mission.id);
      // Esplosione di coriandoli
      setTimeout(() => {
        const event = new CustomEvent('trigger-confetti');
        window.dispatchEvent(event);
      }, 100);
      
      // Notifica per il bambino
      if (!isChildView) {
        setTimeout(() => {
          const notification = document.createElement('div');
          notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-bounce';
          notification.innerHTML = `
            <div class="flex items-center gap-2">
              <span class="text-2xl">🎉</span>
              <div>
                <div class="font-bold">Missione Approvata!</div>
                <div class="text-sm">Hai guadagnato ${mission.coins} monete e ${mission.xp} XP!</div>
              </div>
            </div>
          `;
          document.body.appendChild(notification);
          
          // Rimuovi notifica dopo 5 secondi
          setTimeout(() => {
            notification.remove();
          }, 5000);
        }, 500);
      }
    }
  };

  const handleComplete = () => {
    if (onComplete && !isAnimating) {
      setIsAnimating(true);
      setShowCoinAnimation(true);
      
      // Calcola posizione del contatore monete
      const coinCounter = document.getElementById('coin-counter');
      if (coinCounter) {
        const rect = coinCounter.getBoundingClientRect();
        const cardRect = document.getElementById(`mission-${mission.id}`)?.getBoundingClientRect();
        
        if (cardRect) {
          setCoinPosition({
            x: cardRect.left + cardRect.width / 2,
            y: cardRect.top
          });
        }
      }
      
      // Notifica per il bambino
      if (isChildView) {
        setTimeout(() => {
          const notification = document.createElement('div');
          notification.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-bounce';
          notification.innerHTML = `
            <div class="flex items-center gap-2">
              <span class="text-2xl">✅</span>
              <div>
                <div class="font-bold">Missione Completata!</div>
                <div class="text-sm">In attesa di approvazione...</div>
              </div>
            </div>
          `;
          document.body.appendChild(notification);
          
          // Rimuovi notifica dopo 3 secondi
          setTimeout(() => {
            notification.remove();
          }, 3000);
        }, 500);
      }
      
      setTimeout(() => {
        onComplete(mission.id);
        setIsAnimating(false);
        setShowCoinAnimation(false);
      }, 1500);
    }
  };

  // Colori basati sulla difficoltà
  const getDifficultyColors = (difficulty: string) => {
    const colors = {
      easy: {
        border: 'border-emerald-200',
        shadow: 'shadow-emerald-100',
        bg: 'from-emerald-50 to-green-50',
        badge: 'bg-emerald-500 text-white',
        coin: 'text-yellow-500'
      },
      medium: {
        border: 'border-orange-200',
        shadow: 'shadow-orange-100',
        bg: 'from-orange-50 to-amber-50',
        badge: 'bg-orange-500 text-white',
        coin: 'text-yellow-600'
      },
      hard: {
        border: 'border-red-200',
        shadow: 'shadow-red-200',
        bg: 'from-red-50 to-rose-50',
        badge: 'bg-red-500 text-white',
        coin: 'text-yellow-400'
      }
    };
    return colors[difficulty as keyof typeof colors] || colors.easy;
  };

  const difficultyColors = getDifficultyColors(mission.difficulty);

  return (
    <>
      {/* Animazione Moneta Volante */}
      {showCoinAnimation && (
        <motion.div
          initial={{ 
            opacity: 1, 
            scale: 1,
            x: coinPosition.x - window.scrollX,
            y: coinPosition.y - window.scrollY
          }}
          animate={{ 
            opacity: 0,
            scale: 1.5,
            x: coinPosition.x - window.scrollX - 100,
            y: coinPosition.y - window.scrollY - 100
          }}
          transition={{ 
            duration: 1.5, 
            ease: [0.4, 0.0, 0.2, 1] 
          }}
          className="fixed z-50 pointer-events-none"
        >
          <div className="text-4xl">💰</div>
        </motion.div>
      )}

      {/* Card Missione Animata */}
      <motion.div
        id={`mission-${mission.id}`}
        whileHover={{ 
          scale: 1.03,
          boxShadow: `0 10px 30px rgba(0,0,0,0.15), 0 0px 0px ${difficultyColors.shadow.replace('shadow-', 'rgba(').replace('100', '0.3)')}`
        }}
        whileTap={{ scale: 0.95 }}
        className={`relative bg-gradient-to-br rounded-2xl p-6 border-2 transition-all duration-300 ${
          mission.status === 'completed' 
            ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50' 
            : mission.status === 'approved'
            ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50'
            : `${difficultyColors.border} ${difficultyColors.shadow} ${difficultyColors.bg}`
        }`}
      >
        {/* Badge Difficoltà */}
        <div className="absolute top-3 right-3">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className={`px-3 py-1 rounded-full text-xs font-bold ${difficultyColors.badge}`}
          >
            {mission.difficulty.charAt(0).toUpperCase() + mission.difficulty.slice(1)}
          </motion.div>
        </div>

        {/* Icona e Titolo */}
        <div className="flex items-start gap-4 mb-4">
          <motion.div
            animate={{ 
              rotate: mission.status === 'pending' ? [0, 5, -5, 0] : 0 
            }}
            transition={{ 
              duration: 2, 
              repeat: mission.status === 'pending' ? Infinity : 0 
            }}
            className="text-4xl"
          >
            {mission.icon}
          </motion.div>
          
          <div className="flex-1">
            <h3 className={`text-xl font-bold mb-2 ${
              mission.status === 'completed' || mission.status === 'approved'
                ? 'text-gray-500 line-through'
                : 'text-gray-800'
            }`}>
              {mission.title}
            </h3>
            <p className={`text-sm ${
              mission.status === 'completed' || mission.status === 'approved'
                ? 'text-gray-400'
                : 'text-gray-600'
            }`}>
              {mission.description}
            </p>
            
            {/* Ricompense */}
            <div className="flex items-center gap-3 mt-3">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  mission.status === 'completed' || mission.status === 'approved'
                    ? 'bg-gray-100 text-gray-500'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                ⭐ +{mission.xp} XP
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.1 }}
                className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${
                  mission.status === 'completed' || mission.status === 'approved'
                    ? 'bg-gray-100 text-gray-500'
                    : 'bg-yellow-100'
                }`}
              >
                <span className={mission.difficulty === 'hard' ? difficultyColors.coin : 'text-yellow-600'}>
                  💰
                </span>
                <span className={mission.difficulty === 'hard' ? difficultyColors.coin : 'text-yellow-700'}>
                  +{mission.coins}
                </span>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Stato Missione */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            {mission.status === 'pending' && '⏳ In attesa'}
            {mission.status === 'completed' && `✅ Completata: ${mission.completedAt ? new Date(mission.completedAt).toLocaleTimeString() : 'Oggi'}`}
            {mission.status === 'approved' && `🎉 Approvata: ${mission.approvedAt ? new Date(mission.approvedAt).toLocaleTimeString() : 'Oggi'}`}
          </div>

          {/* Azioni */}
          <div className="flex gap-2">
            {isChildView && mission.status === 'pending' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleComplete}
                disabled={isAnimating}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  isAnimating 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg'
                }`}
              >
                {isAnimating ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  '✅ Completa'
                )}
              </motion.button>
            )}

            {!isChildView && mission.status === 'completed' && onApprove && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleApprove}
                className="px-4 py-2 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg"
              >
                🎉 Approva
              </motion.button>
            )}
          </div>
        </div>

              </motion.div>
    </>
  );
}

export default MissionCard;
