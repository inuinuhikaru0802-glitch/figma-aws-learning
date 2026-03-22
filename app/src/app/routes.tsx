import { createBrowserRouter } from 'react-router';
import { Dashboard } from './pages/Dashboard';
import { AddUser } from './pages/AddUser';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Dashboard,
  },
  {
    path: '/add-user',
    Component: AddUser,
  },
]);
