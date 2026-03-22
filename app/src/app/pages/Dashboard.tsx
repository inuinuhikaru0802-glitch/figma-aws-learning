import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { SummaryCard } from '../components/SummaryCard';
import { DataTable } from '../components/DataTable';
import { Users, DollarSign, TrendingUp, Plus } from 'lucide-react';
import { useNavigate } from 'react-router';

export function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar />
      
      <main className="ml-64 mt-16 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">Overview</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
          </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <SummaryCard
              title="Total Users"
              value="2,543"
              change="+12.5% from last month"
              icon={Users}
              trend="up"
            />
            <SummaryCard
              title="Revenue"
              value="$45,231"
              change="+8.2% from last month"
              icon={DollarSign}
              trend="up"
            />
            <SummaryCard
              title="Growth"
              value="23.5%"
              change="+2.1% from last month"
              icon={TrendingUp}
              trend="up"
            />
            <SummaryCard
              title="Traffic-test"
              value="1,234"
              change="+10.1% from last month"
              icon={TrendingUp}
              trend="up"
            />
          </div>
          
          {/* Action Button */}
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
            <button 
              onClick={() => navigate('/add-user')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add New User
            </button>
          </div>
          
          {/* Data Table */}
          <DataTable />
        </div>
      </main>
    </div>
  );
}
