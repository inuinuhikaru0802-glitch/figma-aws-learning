import { BarChart3, Home, Users, Settings, FileText, Calendar } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router';

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { icon: Home, label: 'Overview', path: '/' },
    { icon: BarChart3, label: 'Analytics', path: '#' },
    { icon: Users, label: 'Team', path: '#' },
    { icon: FileText, label: 'Documents', path: '/documents' },
    { icon: Calendar, label: 'Calendar', path: '#' },
    { icon: Settings, label: 'Settings', path: '#' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 fixed left-0 top-16 bottom-0 overflow-y-auto">
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path !== '#' && location.pathname === item.path;
          return (
            <button
              key={item.label}
              onClick={() => {
                if (item.path !== '#') {
                  navigate(item.path);
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
