import { BarChart3, Home, Users, Settings, FileText, Calendar } from 'lucide-react';

export function Sidebar() {
  const menuItems = [
    { icon: Home, label: 'Overview', active: true },
    { icon: BarChart3, label: 'Analyticscscs', active: false },
    { icon: Users, label: 'Team', active: false },
    { icon: FileText, label: 'Documents', active: false },
    { icon: Calendar, label: 'Calendar', active: false },
    { icon: Settings, label: 'Settings', active: false },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 fixed left-0 top-16 bottom-0 overflow-y-auto">
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                item.active
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
