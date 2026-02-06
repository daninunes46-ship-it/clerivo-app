import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

/**
 * LoginPage - Page de connexion définitive
 * Design: Apple-like, Zero Learning Curve, "Forteresse Immobilière"
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirection si déjà connecté
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      const from = location.state?.from?.pathname || '/';
      console.log('✅ Déjà connecté, redirection vers:', from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        toast.success('Connexion réussie', {
            description: 'Bienvenue dans votre espace sécurisé.'
        });
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      } else {
        setError(result.error || 'Identifiants incorrects');
        toast.error('Accès refusé', {
            description: result.error || 'Vérifiez vos identifiants.'
        });
        // Petit effet de secousse (visuel via CSS class si on voulait, ici juste feedback sonner)
      }
    } catch (err) {
      console.error(err);
      setError('Erreur de connexion au serveur');
      toast.error('Erreur technique', {
          description: 'Impossible de contacter la forteresse.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F5F5F7] p-4 font-sans text-zinc-900">
      
      {/* Container principal (Bento Box centrale) */}
      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-xl shadow-zinc-200/50 p-8 md:p-10 animate-in fade-in zoom-in-95 duration-500 border border-white/50">
        
        {/* Header : Identité & Logo */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center shadow-lg mb-6 rotate-3 hover:rotate-0 transition-transform duration-300">
            {/* Logo Placeholder Stylisé */}
            <ShieldCheck className="text-white w-8 h-8" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mb-2">
            Clerivo
          </h1>
          <p className="text-zinc-500 text-sm font-medium">
            Bienvenue dans votre Forteresse Immobilière
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Email Input */}
          <div className="group">
            <label htmlFor="email" className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 ml-1">
              Adresse Email
            </label>
            <div className="relative transition-all duration-200 focus-within:scale-[1.01]">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-zinc-400 group-focus-within:text-indigo-600 transition-colors" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full pl-11 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-sm font-medium"
                placeholder="nom@agence.com"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="group">
            <label htmlFor="password" className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 ml-1">
              Mot de passe
            </label>
            <div className="relative transition-all duration-200 focus-within:scale-[1.01]">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-zinc-400 group-focus-within:text-indigo-600 transition-colors" />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full pl-11 pr-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-sm font-medium"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50/50 border border-red-100 rounded-xl text-red-600 text-sm animate-in slide-in-from-top-2 duration-300">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-3.5 px-4 mt-6 border border-transparent rounded-xl shadow-lg shadow-zinc-900/5 text-sm font-bold text-white bg-zinc-900 hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Ouverture des portes...
              </>
            ) : (
              'Entrer dans la forteresse'
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-8 text-center space-y-4">
          <a href="#" className="text-sm font-medium text-zinc-400 hover:text-zinc-600 transition-colors">
            Mot de passe oublié ?
          </a>
        </div>
      </div>
      
      {/* Footer Legal */}
      <div className="mt-8 text-center text-xs text-zinc-400">
        <p>&copy; {new Date().getFullYear()} Clerivo. Sécurisé par Swiss Safe.</p>
      </div>
    </div>
  );
};

export default LoginPage;
