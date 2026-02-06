import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

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

// Provider d'authentification avec Supabase
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Vérifier la session au chargement + écouter les changements d'état
  useEffect(() => {
    // Vérifier la session existante
    checkSession();

    // Écouter les changements d'authentification (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          firstName: session.user.user_metadata?.firstName || session.user.email.split('@')[0],
          lastName: session.user.user_metadata?.lastName || '',
          role: session.user.user_metadata?.role || 'AGENT'
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup : se désabonner quand le composant est démonté
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Vérifier si l'utilisateur est authentifié (session Supabase)
  const checkSession = async () => {
    try {
      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();

      if (error) {
        console.error('Erreur lors de la vérification de session:', error.message);
        setUser(null);
        setLoading(false);
        return;
      }

      if (supabaseUser) {
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email,
          firstName: supabaseUser.user_metadata?.firstName || supabaseUser.email.split('@')[0],
          lastName: supabaseUser.user_metadata?.lastName || '',
          role: supabaseUser.user_metadata?.role || 'AGENT'
        });
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Erreur de connexion à Supabase:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Fonction de connexion avec Supabase Auth
  const login = async (email, password) => {
    try {
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: password
      });

      if (error) {
        // Gestion des erreurs Supabase
        let errorMsg = 'Identifiants incorrects';
        
        if (error.message.includes('Invalid login credentials')) {
          errorMsg = 'Email ou mot de passe incorrect';
        } else if (error.message.includes('Email not confirmed')) {
          errorMsg = 'Email non confirmé. Vérifiez votre boîte mail.';
        } else if (error.message.includes('User not found')) {
          errorMsg = 'Aucun compte associé à cet email';
        } else {
          errorMsg = error.message;
        }

        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      if (data.user) {
        const userData = {
          id: data.user.id,
          email: data.user.email,
          firstName: data.user.user_metadata?.firstName || data.user.email.split('@')[0],
          lastName: data.user.user_metadata?.lastName || '',
          role: data.user.user_metadata?.role || 'AGENT'
        };
        
        setUser(userData);
        return { success: true, user: userData };
      }

      return { success: false, error: 'Erreur lors de la connexion' };
    } catch (err) {
      const errorMsg = 'Erreur réseau lors de la connexion';
      console.error('❌ Erreur login:', err);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  // Fonction de déconnexion avec Supabase Auth
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erreur lors de la déconnexion:', error.message);
      }
      
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
