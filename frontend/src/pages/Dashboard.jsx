import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import { BarChart3, AlertCircle, Clock, CheckCircle, ShieldAlert, Layers } from 'lucide-react';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.dashboard.getStats();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="text-gray-500 py-12 text-center">Loading dashboard...</div>;
  if (error) return <div className="text-red-500 bg-red-50 p-6 rounded-lg">Error: {error}</div>;

  const statCards = [
    { label: 'Total Tickets', value: stats.total, icon: <Layers className="w-6 h-6" />, color: 'text-gray-900', bg: 'bg-gray-50' },
    { label: 'Open', value: stats.open, icon: <AlertCircle className="w-6 h-6" />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'In Progress', value: stats.inProgress, icon: <Clock className="w-6 h-6" />, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Blocked', value: stats.blocked, icon: <ShieldAlert className="w-6 h-6" />, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Resolved', value: stats.resolved, icon: <CheckCircle className="w-6 h-6" />, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'High Priority (Open)', value: stats.highPriorityOpen, icon: <BarChart3 className="w-6 h-6" />, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const statusBadge = (status) => {
    const colors = {
      OPEN: 'bg-blue-100 text-blue-700',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
      BLOCKED: 'bg-red-100 text-red-700',
      RESOLVED: 'bg-green-100 text-green-700',
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors[status] || ''}`}>{status.replace('_', ' ')}</span>;
  };

  const priorityBadge = (priority) => {
    const colors = {
      LOW: 'bg-gray-100 text-gray-600',
      MEDIUM: 'bg-blue-50 text-blue-600',
      HIGH: 'bg-orange-100 text-orange-700',
      CRITICAL: 'bg-red-100 text-red-700',
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors[priority] || ''}`}>{priority}</span>;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">{stat.label}</h3>
              <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Recent Tickets</h2>
          <Link to="/tickets" className="text-sm text-brand-600 hover:underline font-medium">View all →</Link>
        </div>
        <div className="divide-y divide-gray-100">
          {stats.recentTickets.map(ticket => (
            <Link to={`/tickets/${ticket.ticketNumber}`} key={ticket._id} className="block px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-mono text-gray-400">#{ticket.ticketNumber}</span>
                  <span className="text-sm font-medium text-gray-900">{ticket.title}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {statusBadge(ticket.status)}
                  {priorityBadge(ticket.priority)}
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Assignee: {ticket.assignee ? ticket.assignee.name : 'Unassigned'}
              </p>
            </Link>
          ))}
          {stats.recentTickets.length === 0 && (
            <div className="px-6 py-8 text-gray-400 text-center">No recent tickets</div>
          )}
        </div>
      </div>
    </div>
  );
};
