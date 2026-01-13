import { Outlet, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Phone,
  PlayCircle,
  Users,
  Calendar,
  AlertCircle,
  Target,
  Car,
  FileText,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/live-calls', icon: Phone, label: 'Live Calls' },
  { path: '/demo', icon: PlayCircle, label: 'Demo Call' },
  { path: '/customers', icon: Users, label: 'Customers' },
  { path: '/appointments', icon: Calendar, label: 'Appointments' },
  { path: '/complaints', icon: AlertCircle, label: 'Complaints' },
  { path: '/leads', icon: Target, label: 'Leads' },
  { path: '/vehicles', icon: Car, label: 'Vehicles' },
  { path: '/call-logs', icon: FileText, label: 'Call Logs' },
];

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          {sidebarOpen && (
            <div>
              <h1 className="text-xl font-bold text-blue-400">Satis Motor</h1>
              <p className="text-xs text-gray-400">AI CRM System</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <item.icon size={20} />
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        {sidebarOpen && (
          <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
            <p>Tata Motors Dealer</p>
            <p>Pune, Maharashtra</p>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            Satis Motor CRM
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Admin</span>
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;
