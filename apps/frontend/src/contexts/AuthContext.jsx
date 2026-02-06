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

  console.log('🔵 [AUTH CONTEXT] RENDER - loading:', loading, '| user:', user?.email || 'NULL');

  // Vérifier la session au chargement
  useEffect(() => {
    console.log('🟢 [AUTH CONTEXT] useEffect déclenché - Appel checkSession()');
    checkSession();
  }, []);

  // Vérifier si l'utilisateur est authentifié (via cookie httpOnly)
  const checkSession = async () => {
    console.log('🔴 [CHECK SESSION] DÉBUT - loading=true, user=null');
    try {
      console.log('🔐 [CHECK SESSION] Fetch vers /api/auth/me...');
      
      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: 'GET',
        credentials: 'include', // ⚠️ CRITIQUE : Envoie les cookies httpOnly
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('🔴 [CHECK SESSION] Réponse reçue - status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('🔴 [CHECK SESSION] Data:', data);
        if (data.success && data.user) {
          console.log('✅ [CHECK SESSION] Session valide:', data.user.email);
          setUser(data.user);
        } else {
          console.log('⚠️ [CHECK SESSION] Pas de session active - setUser(null)');
          setUser(null);
        }
      } else {
        console.log('⚠️ [CHECK SESSION] Session expirée ou inexistante (status:', response.status, ') - setUser(null)');
        setUser(null);
      }
    } catch (err) {
      console.error('❌ [CHECK SESSION] Erreur vérification session:', err);
      setUser(null);
    } finally {
      console.log('🔴 [CHECK SESSION] FIN - setLoading(false)');
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
