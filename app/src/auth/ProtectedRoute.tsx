import type { ReactNode } from 'react';
import { UnauthenticatedScreen, AuthLoadingScreen } from '../app/components/AuthScreens';
import { useAuth } from './useAuth';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoadingAuth, authError, authNotice, login } = useAuth();

  if (isLoadingAuth) {
    return <AuthLoadingScreen message="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return (
      <UnauthenticatedScreen
        onLogin={() => {
          void login();
        }}
        error={authError}
        notice={authNotice}
      />
    );
  }

  return <>{children}</>;
}
