import { createBrowserRouter } from 'react-router';
import { Dashboard } from './pages/Dashboard';
import { AddUser } from './pages/AddUser';
import { Documents } from './pages/Documents';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Dashboard,
  },
  {
    path: '/documents',
    Component: Documents,
  },
  {
    path: '/add-user',
    Component: AddUser,
  },
]);
