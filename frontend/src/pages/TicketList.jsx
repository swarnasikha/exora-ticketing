import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { CreateTicketModal } from '../components/CreateTicketModal';

export const TicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (statusFilter) filters.status = statusFilter;
      if (priorityFilter) filters.priority = priorityFilter;

      const data = await api.tickets.getAll(filters);
      setTickets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter]);

  const filteredTickets = tickets.filter(t => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      String(t.ticketNumber).includes(q) ||
      (t.assignee?.name || '').toLowerCase().includes(q)
    );
  });

  const statusBadge = (status) => {
    const colors = {
      OPEN: 'bg-blue-100 text-blue-700',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
      BLOCKED: 'bg-red-100 text-red-700',
      RESOLVED: 'bg-green-100 text-green-700',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || ''}`}>{status.replace('_', ' ')}</span>;
  };

  const priorityBadge = (priority) => {
    const colors = {
      LOW: 'bg-gray-100 text-gray-600',
      MEDIUM: 'bg-blue-50 text-blue-600',
      HIGH: 'bg-orange-100 text-orange-700',
      CRITICAL: 'bg-red-100 text-red-700',
    };
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[priority] || ''}`}>{priority}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary space-x-2">
          <Plus className="w-4 h-4" />
          <span>New Ticket</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            className="input"
            placeholder="Search by title, number, or assignee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            className="input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="BLOCKED">Blocked</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            className="input"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </div>

      {error && <div className="text-red-500 bg-red-50 p-4 rounded">{error}</div>}

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">Loading tickets...</td></tr>
            ) : filteredTickets.length === 0 ? (
              <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">No tickets found</td></tr>
            ) : (
              filteredTickets.map((ticket) => (
                <tr key={ticket._id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link to={`/tickets/${ticket.ticketNumber}`} className="text-brand-600 hover:underline">#{ticket.ticketNumber}</Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <Link to={`/tickets/${ticket.ticketNumber}`} className="hover:underline">{ticket.title}</Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{statusBadge(ticket.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{priorityBadge(ticket.priority)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ticket.assignee ? ticket.assignee.name : <span className="text-gray-400 italic">Unassigned</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CreateTicketModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreated={fetchTickets}
      />
    </div>
  );
};
