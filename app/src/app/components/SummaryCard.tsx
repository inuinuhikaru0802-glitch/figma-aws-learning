import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  trend: 'up' | 'down';
}

export function SummaryCard({ title, value, change, icon: Icon, trend }: SummaryCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm mb-1">{title}</p>
          <p className="text-3xl font-semibold text-gray-900">{value}</p>
          <p className={`text-sm mt-2 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {change}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${trend === 'up' ? 'bg-green-50' : 'bg-blue-50'}`}>
          <Icon className={`w-6 h-6 ${trend === 'up' ? 'text-green-600' : 'text-blue-600'}`} />
        </div>
      </div>
    </div>
  );
}
