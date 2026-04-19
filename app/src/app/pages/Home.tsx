import { Dashboard } from './Dashboard';
import { AuthLoadingScreen, UnauthenticatedScreen } from '../components/AuthScreens';
import { useAuth } from '../../auth/useAuth';

export function Home() {
  const { isAuthenticated, isLoadingAuth, authError, authNotice, login } = useAuth();

  if (isLoadingAuth) {
    const message = window.location.search.includes('code=') ? 'Signing you in...' : 'Checking authentication...';
    return <AuthLoadingScreen message={message} />;
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

  return <Dashboard />;
}
