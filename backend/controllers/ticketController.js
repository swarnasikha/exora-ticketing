const Ticket = require('../models/Ticket');
const Activity = require('../models/Activity');
const { createTicketSchema, updateTicketSchema, updateTicketStatusSchema, updateTicketAssigneeSchema } = require('../validators');

const logActivity = async (ticketId, actorId, action, oldValue = null, newValue = null, message = null) => {
  await Activity.create({ ticketId, actorId, action, oldValue, newValue, message });
};

const createTicket = async (req, res) => {
  const parseResult = createTicketSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: 'Validation Error', errors: parseResult.error.errors });
  }

  const { title, description, priority } = parseResult.data;

  // Simple auto-increment for ticket number
  const lastTicket = await Ticket.findOne().sort({ ticketNumber: -1 });
  const ticketNumber = lastTicket && lastTicket.ticketNumber ? lastTicket.ticketNumber + 1 : 101;

  const ticket = await Ticket.create({
    ticketNumber,
    title,
    description,
    priority: priority || 'LOW',
    createdBy: req.user._id,
  });

  await logActivity(ticket._id, req.user._id, 'CREATED', null, null, 'Ticket created');

  res.status(201).json(ticket);
};

const getTickets = async (req, res) => {
  const { status, priority, assignee } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignee) filter.assignee = assignee;

  const tickets = await Ticket.find(filter)
    .populate('assignee', 'name email')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });
  res.json(tickets);
};

const getTicket = async (req, res) => {
  const ticket = await Ticket.findOne({ ticketNumber: req.params.ticketNumber })
    .populate('assignee', 'name email')
    .populate('createdBy', 'name email');

  if (!ticket) {
    return res.status(404).json({ message: 'Ticket not found' });
  }

  res.json(ticket);
};

const updateTicket = async (req, res) => {
  const parseResult = updateTicketSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: 'Validation Error', errors: parseResult.error.errors });
  }

  const ticket = await Ticket.findOne({ ticketNumber: req.params.ticketNumber });
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

  // Only creator or manager can update basic details
  if (ticket.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'MANAGER') {
    return res.status(403).json({ message: 'Not authorized to update this ticket' });
  }

  const { title, description } = parseResult.data;
  let updated = false;

  if (title && ticket.title !== title) {
    await logActivity(ticket._id, req.user._id, 'DETAILS_UPDATED', ticket.title, title, 'Title updated');
    ticket.title = title;
    updated = true;
  }
  if (description && ticket.description !== description) {
    await logActivity(ticket._id, req.user._id, 'DETAILS_UPDATED', null, null, 'Description updated');
    ticket.description = description;
    updated = true;
  }

  if (updated) {
    await ticket.save();
  }

  res.json(ticket);
};

const allowedTransitions = {
  'OPEN': ['IN_PROGRESS', 'BLOCKED'],
  'IN_PROGRESS': ['BLOCKED', 'RESOLVED'],
  'BLOCKED': ['IN_PROGRESS'],
  'RESOLVED': []
};

const updateStatus = async (req, res) => {
  const parseResult = updateTicketStatusSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: 'Validation Error', errors: parseResult.error.errors });
  }

  const ticket = await Ticket.findOne({ ticketNumber: req.params.ticketNumber });
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

  const { status: newStatus } = parseResult.data;
  const currentStatus = ticket.status;

  if (currentStatus === newStatus) {
    return res.json(ticket);
  }

  if (!allowedTransitions[currentStatus].includes(newStatus)) {
    return res.status(400).json({ message: `Invalid status transition from ${currentStatus} to ${newStatus}` });
  }

  ticket.status = newStatus;
  await ticket.save();

  await logActivity(ticket._id, req.user._id, 'STATUS_CHANGED', currentStatus, newStatus, `Status changed to ${newStatus}`);

  res.json(ticket);
};

const updateAssignee = async (req, res) => {
  const parseResult = updateTicketAssigneeSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: 'Validation Error', errors: parseResult.error.errors });
  }

  const ticket = await Ticket.findOne({ ticketNumber: req.params.ticketNumber });
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

  const { assignee: newAssignee } = parseResult.data;
  const oldAssignee = ticket.assignee;

  ticket.assignee = newAssignee;
  await ticket.save();

  await logActivity(
    ticket._id, 
    req.user._id, 
    'ASSIGNEE_CHANGED', 
    oldAssignee ? oldAssignee.toString() : 'unassigned', 
    newAssignee ? newAssignee.toString() : 'unassigned', 
    'Assignee updated'
  );

  res.json(ticket);
};

const getActivity = async (req, res) => {
  const ticket = await Ticket.findOne({ ticketNumber: req.params.ticketNumber });
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

  const activities = await Activity.find({ ticketId: ticket._id })
    .populate('actorId', 'name email')
    .sort({ createdAt: -1 });

  res.json(activities);
};

module.exports = {
  createTicket,
  getTickets,
  getTicket,
  updateTicket,
  updateStatus,
  updateAssignee,
  getActivity,
};
