import { createBrowserRouter } from 'react-router';
import { AddUser } from './pages/AddUser';
import { Documents } from './pages/Documents';
import { Home } from './pages/Home';
import { ProtectedRoute } from '../auth/ProtectedRoute';

function DocumentsRoute() {
  return (
    <ProtectedRoute>
      <Documents />
    </ProtectedRoute>
  );
}

function AddUserRoute() {
  return (
    <ProtectedRoute>
      <AddUser />
    </ProtectedRoute>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Home,
  },
  {
    path: '/documents',
    Component: DocumentsRoute,
  },
  {
    path: '/add-user',
    Component: AddUserRoute,
  },
]);
