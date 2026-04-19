import { createContext, useEffect, useState, type ReactNode } from 'react';
import {
  type AuthSession,
  type AuthUser,
  AuthError,
  clearAuthStorage,
  initializeAuth,
  startLogin,
  startLogout,
} from './authService';

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  user: AuthUser | null;
  accessToken: string | null;
  idToken: string | null;
  authError: string | null;
  authNotice: string | null;
  login: () => Promise<void>;
  logout: () => void;
  clearAuthError: () => void;
  clearAuthNotice: () => void;
};

const defaultContext: AuthContextValue = {
  isAuthenticated: false,
  isLoadingAuth: true,
  user: null,
  accessToken: null,
  idToken: null,
  authError: null,
  authNotice: null,
  login: async () => {},
  logout: () => {},
  clearAuthError: () => {},
  clearAuthNotice: () => {},
};

export const AuthContext = createContext<AuthContextValue>(defaultContext);

function toContextValue(session: AuthSession | null) {
  return {
    isAuthenticated: Boolean(session),
    user: session?.user ?? null,
    accessToken: session?.accessToken ?? null,
    idToken: session?.idToken ?? null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      try {
        const result = await initializeAuth();

        if (!isMounted) {
          return;
        }

        setSession(result.session);
        setAuthNotice(result.notice);
        setAuthError(null);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        clearAuthStorage();
        setSession(null);
        setAuthError(error instanceof AuthError ? error.message : 'Authentication failed.');
      } finally {
        if (isMounted) {
          setIsLoadingAuth(false);
        }
      }
    };

    bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async () => {
    setAuthError(null);
    await startLogin();
  };

  const logout = () => {
    setSession(null);
    setAuthError(null);
    startLogout();
  };

  const contextValue: AuthContextValue = {
    ...toContextValue(session),
    isLoadingAuth,
    authError,
    authNotice,
    login,
    logout,
    clearAuthError: () => setAuthError(null),
    clearAuthNotice: () => setAuthNotice(null),
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
