const Ticket = require('../models/Ticket');
const User = require('../models/User');

const get_ticket = async ({ ticketNumber }) => {
  const ticket = await Ticket.findOne({ ticketNumber }).populate('assignee', 'name').lean();
  if (!ticket) return { error: `Ticket #${ticketNumber} not found in database.` };
  
  return {
    ticketNumber: ticket.ticketNumber,
    title: ticket.title,
    status: ticket.status,
    priority: ticket.priority,
    assignee: ticket.assignee ? ticket.assignee.name : 'Unassigned',
  };
};

const count_tickets = async ({ status, priority }) => {
  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  
  const count = await Ticket.countDocuments(filter);
  return { count, filterUsed: filter };
};

const search_tickets = async ({ status, priority, limit = 5 }) => {
  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  const tickets = await Ticket.find(filter)
    .populate('assignee', 'name')
    .select('ticketNumber title status priority assignee')
    .limit(limit)
    .lean();

  return tickets.map(t => ({
    ...t,
    assignee: t.assignee ? t.assignee.name : 'Unassigned',
  }));
};

const get_tickets_by_assignee = async ({ name }) => {
  // Regex search for user
  const user = await User.findOne({ name: new RegExp(name, 'i') });
  if (!user) return { error: `No user found matching name "${name}".` };

  const tickets = await Ticket.find({ assignee: user._id })
    .select('ticketNumber title status priority')
    .lean();

  return {
    assigneeName: user.name,
    tickets,
  };
};

const get_ticket_statistics = async () => {
  const total = await Ticket.countDocuments();
  const open = await Ticket.countDocuments({ status: 'OPEN' });
  const inProgress = await Ticket.countDocuments({ status: 'IN_PROGRESS' });
  const blocked = await Ticket.countDocuments({ status: 'BLOCKED' });
  const resolved = await Ticket.countDocuments({ status: 'RESOLVED' });
  
  return { total, open, inProgress, blocked, resolved };
};

module.exports = {
  get_ticket,
  count_tickets,
  search_tickets,
  get_tickets_by_assignee,
  get_ticket_statistics
};
