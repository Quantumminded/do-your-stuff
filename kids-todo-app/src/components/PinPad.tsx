import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock } from 'lucide-react';

interface PinPadProps {
  isVisible: boolean;
  onCorrectPin: () => void;
  onClose: () => void;
  correctPin: string;
}

export function PinPad({ isVisible, onCorrectPin, onClose, correctPin }: PinPadProps) {
  const [pin, setPin] = useState('');
  const [showError, setShowError] = useState(false);

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      
      if (newPin.length === 4) {
        if (newPin === correctPin) {
          setTimeout(() => {
            onCorrectPin();
            setPin('');
            setShowError(false);
          }, 300);
        } else {
          setShowError(true);
          setTimeout(() => {
            setPin('');
            setShowError(false);
          }, 1000);
        }
      }
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
      setShowError(false);
    }
  };

  const handleClear = () => {
    setPin('');
    setShowError(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Lock className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-800">Accesso Genitore</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* PIN Display */}
          <div className="mb-6">
            <div className={`flex justify-center gap-2 mb-4 ${
              showError ? 'animate-pulse' : ''
            }`}>
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full border-2 transition-all ${
                    showError
                      ? 'border-red-500 bg-red-500'
                      : pin.length > index
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}
                />
              ))}
            </div>
            {showError && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-red-500 font-semibold text-sm"
              >
                PIN errato! Riprova
              </motion.p>
            )}
          </div>

          {/* Number Pad */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <motion.button
                key={num}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNumberClick(num)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-4 rounded-2xl text-xl transition-colors"
              >
                {num}
              </motion.button>
            ))}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClear}
              className="bg-red-100 hover:bg-red-200 text-red-600 font-semibold py-4 rounded-2xl transition-colors"
            >
              Canc
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNumberClick('0')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-4 rounded-2xl text-xl transition-colors"
            >
                0
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDelete}
              className="bg-blue-100 hover:bg-blue-200 text-blue-600 font-semibold py-4 rounded-2xl transition-colors"
            >
              ⌫
            </motion.button>
          </div>

          <div className="text-center text-xs text-gray-500">
            Inserisci il PIN di 4 cifre per accedere
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
