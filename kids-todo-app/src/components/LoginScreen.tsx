import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Users, Sparkles } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (email: string, password: string) => void;
  onRegister: (email: string, password: string, familyName: string) => void;
  loading?: boolean;
  error?: string | null;
}

export function LoginScreen({ onLogin, onRegister, loading, error }: LoginScreenProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    familyName: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isRegistering) {
      onRegister(formData.email, formData.password, formData.familyName);
    } else {
      onLogin(formData.email, formData.password);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 p-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="inline-block text-6xl mb-4"
          >
            🏠
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            Eroi di Casa
          </h1>
          <p className="text-gray-600">
            {isRegistering ? 'Crea la tua famiglia' : 'Accedi alla tua famiglia'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Nome Famiglia
              </label>
              <input
                type="text"
                value={formData.familyName}
                onChange={(e) => setFormData({ ...formData, familyName: e.target.value })}
                placeholder="La famiglia Rossi..."
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email Genitore
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="genitore@email.com"
                className="w-full p-3 pl-10 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full p-3 pl-10 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-3 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Caricamento...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Users className="w-5 h-5" />
                {isRegistering ? 'Crea Famiglia' : 'Accedi'}
              </div>
            )}
          </motion.button>
        </form>

        {/* Toggle Login/Register */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
          >
            {isRegistering 
              ? 'Hai già un account? Accedi' 
              : 'Nuovo qui? Crea una famiglia'
            }
          </button>
        </div>
      </motion.div>
    </div>
  );
}
