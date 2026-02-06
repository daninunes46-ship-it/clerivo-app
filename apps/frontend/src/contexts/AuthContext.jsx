import React, { createContext, useState, useContext, useEffect } from 'react';

// URL API relative (proxy Vite)
const API_URL = '';

// Création du Context
const AuthContext = createContext(null);

// Hook personnalisé pour utiliser le contexte
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

// Provider d'authentification
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Vérifier la session au chargement
  useEffect(() => {
    checkSession();
  }, []);

  // Vérifier si l'utilisateur est authentifié (via cookie httpOnly)
  const checkSession = async () => {
    try {
      console.log('🔐 Vérification de la session...');
      
      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: 'GET',
        credentials: 'include', // ⚠️ CRITIQUE : Envoie les cookies httpOnly
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          console.log('✅ Session valide:', data.user.email);
          setUser(data.user);
        } else {
          console.log('⚠️ Pas de session active');
          setUser(null);
        }
      } else {
        console.log('⚠️ Session expirée ou inexistante');
        setUser(null);
      }
    } catch (err) {
      console.error('❌ Erreur vérification session:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Fonction de connexion
  const login = async (email, password) => {
    try {
      setError(null);
      console.log('🔐 Tentative de connexion:', email);

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        credentials: 'include', // ⚠️ CRITIQUE : Reçoit les cookies httpOnly
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('✅ Connexion réussie:', data.user.email);
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        const errorMsg = data.message || 'Identifiants incorrects';
        console.error('❌ Échec connexion:', errorMsg);
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = 'Erreur réseau lors de la connexion';
      console.error('❌ Erreur login:', err);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    try {
      console.log('🚪 Déconnexion...');

      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include', // ⚠️ CRITIQUE : Envoie les cookies pour les détruire
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Déconnexion réussie');
      setUser(null);
    } catch (err) {
      console.error('❌ Erreur logout:', err);
      // Déconnecter quand même côté client
      setUser(null);
    }
  };

  // Valeurs exposées par le contexte
  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    checkSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
