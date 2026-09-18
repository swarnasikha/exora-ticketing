import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Clock, User, AlertTriangle, ArrowRight } from 'lucide-react';

export const TicketDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [assignMsg, setAssignMsg] = useState('');

  const fetchData = async () => {
    try {
      const [ticketData, activityData, usersData] = await Promise.all([
        api.tickets.getOne(id),
        api.tickets.getActivity(id),
        api.users.getAll(),
      ]);
      setTicket(ticketData);
      setActivities(activityData);
      setUsers(usersData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    if (newStatus === ticket.status) return;
    setStatusMsg('');
    try {
      await api.tickets.updateStatus(id, newStatus);
      setStatusMsg(`Status changed to ${newStatus}`);
      fetchData();
    } catch (err) {
      try {
        const parsed = JSON.parse(err.message);
        setStatusMsg(parsed.message || err.message);
      } catch {
        setStatusMsg(err.message);
      }
    }
  };

  const handleAssigneeChange = async (newAssigneeId) => {
    setAssignMsg('');
    try {
      await api.tickets.updateAssignee(id, newAssigneeId || null);
      setAssignMsg('Assignee updated');
      fetchData();
    } catch (err) {
      try {
        const parsed = JSON.parse(err.message);
        setAssignMsg(parsed.message || err.message);
      } catch {
        setAssignMsg(err.message);
      }
    }
  };

  const statusBadge = (status) => {
    const colors = {
      OPEN: 'bg-blue-100 text-blue-700 border-blue-200',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      BLOCKED: 'bg-red-100 text-red-700 border-red-200',
      RESOLVED: 'bg-green-100 text-green-700 border-green-200',
    };
    return <span className={`px-3 py-1 rounded-full text-xs font-bold border ${colors[status] || ''}`}>{status.replace('_', ' ')}</span>;
  };

  const priorityBadge = (priority) => {
    const colors = {
      LOW: 'bg-gray-100 text-gray-600',
      MEDIUM: 'bg-blue-50 text-blue-600',
      HIGH: 'bg-orange-100 text-orange-700',
      CRITICAL: 'bg-red-100 text-red-700',
    };
    return <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors[priority] || ''}`}>{priority}</span>;
  };

  const actionIcon = (action) => {
    if (action === 'STATUS_CHANGED') return <ArrowRight className="w-4 h-4 text-blue-500" />;
    if (action === 'ASSIGNEE_CHANGED') return <User className="w-4 h-4 text-purple-500" />;
    if (action === 'CREATED') return <AlertTriangle className="w-4 h-4 text-green-500" />;
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  if (loading) return <div className="text-gray-500 py-12 text-center">Loading ticket...</div>;
  if (error) return <div className="text-red-500 bg-red-50 p-6 rounded-lg">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-sm font-mono text-gray-400">#{ticket.ticketNumber}</span>
              {statusBadge(ticket.status)}
              {priorityBadge(ticket.priority)}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{ticket.title}</h1>
            <p className="text-sm text-gray-500 mt-2">
              Created by <span className="font-medium text-gray-700">{ticket.createdBy?.name}</span> on {new Date(ticket.createdAt).toLocaleString()}
            </p>
            {ticket.updatedAt !== ticket.createdAt && (
              <p className="text-xs text-gray-400 mt-1">Last updated: {new Date(ticket.updatedAt).toLocaleString()}</p>
            )}
          </div>
        </div>

        <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
        </div>
      </div>

      {/* Actions Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Update Status</h3>
          <select
            className="input"
            value={ticket.status}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="BLOCKED">Blocked</option>
            <option value="RESOLVED">Resolved</option>
          </select>
          {statusMsg && <p className="text-sm mt-2 text-gray-600">{statusMsg}</p>}
          <p className="text-xs text-gray-400 mt-2">
            Allowed: OPEN → IN_PROGRESS/BLOCKED, IN_PROGRESS → BLOCKED/RESOLVED, BLOCKED → IN_PROGRESS
          </p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Assignee</h3>
          {user?.role === 'MANAGER' ? (
            <>
              <select
                className="input"
                value={ticket.assignee?._id || ''}
                onChange={(e) => handleAssigneeChange(e.target.value)}
              >
                <option value="">Unassigned</option>
                {users.map(u => (
                  <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                ))}
              </select>
              {assignMsg && <p className="text-sm mt-2 text-gray-600">{assignMsg}</p>}
            </>
          ) : (
            <p className="text-gray-700 font-medium">{ticket.assignee?.name || <span className="text-gray-400 italic">Unassigned</span>}</p>
          )}
          {user?.role !== 'MANAGER' && (
            <p className="text-xs text-gray-400 mt-2">Only managers can change the assignee.</p>
          )}
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 border-b pb-4 mb-4">Activity Timeline</h2>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-gray-400 text-sm text-center py-4">No activity recorded yet.</div>
          ) : (
            activities.map((act) => (
              <div key={act._id} className="flex items-start space-x-3 text-sm">
                <div className="mt-0.5">{actionIcon(act.action)}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{act.actorId?.name || 'System'}</span>
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-500 text-xs font-mono">{act.action}</span>
                  </div>
                  <p className="text-gray-600 mt-0.5">{act.message}</p>
                  {act.oldValue && act.newValue && (
                    <p className="text-xs text-gray-400 mt-0.5">{act.oldValue} → {act.newValue}</p>
                  )}
                  <p className="text-xs text-gray-300 mt-1">{new Date(act.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
