import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Phone,
  PhoneCall,
  Calendar,
  AlertCircle,
  Target,
  Users,
  TrendingUp,
  Clock
} from 'lucide-react';
import { dashboardAPI } from '../lib/api';

function StatCard({ icon: Icon, label, value, color, link }) {
  const content = (
    <div className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{label}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full bg-opacity-10 ${color.replace('border-', 'bg-')}`}>
          <Icon className={color.replace('border-', 'text-')} size={24} />
        </div>
      </div>
    </div>
  );

  if (link) {
    return <Link to={link}>{content}</Link>;
  }
  return content;
}

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await dashboardAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500">
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={PhoneCall}
          label="Active Calls"
          value={stats?.active_calls || 0}
          color="border-green-500"
          link="/live-calls"
        />
        <StatCard
          icon={Phone}
          label="Calls Today"
          value={stats?.calls?.today_calls || 0}
          color="border-blue-500"
          link="/call-logs"
        />
        <StatCard
          icon={Calendar}
          label="Today's Appointments"
          value={stats?.today_appointments || 0}
          color="border-purple-500"
          link="/appointments"
        />
        <StatCard
          icon={AlertCircle}
          label="Open Complaints"
          value={stats?.complaints?.open || 0}
          color="border-red-500"
          link="/complaints"
        />
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Target}
          label="Active Leads"
          value={(stats?.leads?.total || 0) - (stats?.leads?.converted || 0) - (stats?.leads?.lost || 0)}
          color="border-yellow-500"
          link="/leads"
        />
        <StatCard
          icon={Users}
          label="Total Customers"
          value={stats?.leads?.converted || 0}
          color="border-indigo-500"
          link="/customers"
        />
        <StatCard
          icon={TrendingUp}
          label="AI Handled Calls"
          value={stats?.calls?.ai_handled || 0}
          color="border-teal-500"
        />
        <StatCard
          icon={Clock}
          label="Avg Call Duration"
          value={`${Math.round(stats?.calls?.avg_duration || 0)}s`}
          color="border-orange-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/demo"
            className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors"
          >
            <PhoneCall className="mx-auto mb-2 text-blue-600" size={24} />
            <span className="text-sm font-medium text-blue-700">Start Demo Call</span>
          </Link>
          <Link
            to="/live-calls"
            className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors"
          >
            <Phone className="mx-auto mb-2 text-green-600" size={24} />
            <span className="text-sm font-medium text-green-700">View Live Calls</span>
          </Link>
          <Link
            to="/appointments"
            className="p-4 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition-colors"
          >
            <Calendar className="mx-auto mb-2 text-purple-600" size={24} />
            <span className="text-sm font-medium text-purple-700">View Appointments</span>
          </Link>
          <Link
            to="/complaints"
            className="p-4 bg-red-50 rounded-lg text-center hover:bg-red-100 transition-colors"
          >
            <AlertCircle className="mx-auto mb-2 text-red-600" size={24} />
            <span className="text-sm font-medium text-red-700">View Complaints</span>
          </Link>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm">AI Agent: Online</span>
          </div>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm">Backend API: Connected</span>
          </div>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm">Voice Calling: Demo Mode</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
