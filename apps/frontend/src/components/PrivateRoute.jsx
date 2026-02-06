import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * PrivateRoute - Protège les routes nécessitant une authentification
 * Redirige vers /login si l'utilisateur n'est pas connecté
 */
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Affichage pendant la vérification de session
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-3 text-zinc-500">
          <Loader2 className="animate-spin" size={32} />
          <p className="text-sm font-medium">Vérification de la session...</p>
        </div>
      </div>
    );
  }

  // Redirection vers /login si pas authentifié
  if (!user) {
    console.log('🔒 Accès refusé, redirection vers /login');
    return <Navigate to="/login" replace />;
  }

  // Utilisateur authentifié, afficher le contenu
  console.log('✅ Accès autorisé pour:', user.email);
  return children;
};

export default PrivateRoute;
