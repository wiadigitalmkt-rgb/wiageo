import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext();

// Mesma "forma" de contexto que as telas existentes já esperam
// (user, isAuthenticated, isLoadingAuth, authError, authChecked, logout,
// navigateToLogin, checkUserAuth) — assim ProtectedRoute, PageNotFound,
// UserNotRegisteredError e Sidebar continuam funcionando sem alteração.
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings] = useState({ id: 'wiageo', public_settings: {} });

  useEffect(() => {
    checkUserAuth();

    // Mantém o estado em dia quando a sessão muda em outra aba, expira, etc.
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
        setIsAuthenticated(false);
        setAuthChecked(true);
      }
    });
    return () => listener?.subscription?.unsubscribe();
  }, []);

  // Aqui simplificamos
  // para apenas checar a sessão do usuário — mantido pelo mesmo nome por compatibilidade
  // com quem ainda chamar checkAppState() em algum lugar.
  const checkAppState = async () => checkUserAuth();

  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);
      const currentUser = await api.auth.me();

      // Usuário autenticado no Supabase mas ainda sem empresa_id vinculado
      // (ex.: acabou de se cadastrar e um admin ainda não o associou a um provedor).
      if (!currentUser._registered) {
        setUser(currentUser);
        setIsAuthenticated(false);
        setAuthError({ type: 'user_not_registered', message: 'Usuário ainda não vinculado a uma empresa' });
        setIsLoadingAuth(false);
        setAuthChecked(true);
        return;
      }

      setUser(currentUser);
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
      setAuthChecked(true);
    } catch (error) {
      setIsLoadingAuth(false);
      setIsAuthenticated(false);
      setAuthChecked(true);
      if (error.status === 401 || error.status === 403) {
        setAuthError({ type: 'auth_required', message: 'Authentication required' });
      }
    }
  };

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    api.auth.logout(shouldRedirect ? window.location.href : undefined);
  };

  const navigateToLogin = () => {
    api.auth.redirectToLogin(window.location.href);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      authChecked,
      logout,
      navigateToLogin,
      checkUserAuth,
      checkAppState,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
