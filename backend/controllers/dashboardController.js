const Ticket = require('../models/Ticket');

const getDashboardStats = async (req, res) => {
  try {
    const total = await Ticket.countDocuments();
    const open = await Ticket.countDocuments({ status: 'OPEN' });
    const inProgress = await Ticket.countDocuments({ status: 'IN_PROGRESS' });
    const blocked = await Ticket.countDocuments({ status: 'BLOCKED' });
    const resolved = await Ticket.countDocuments({ status: 'RESOLVED' });
    const highPriorityOpen = await Ticket.countDocuments({ 
      status: 'OPEN', 
      priority: { $in: ['HIGH', 'CRITICAL'] } 
    });
    
    const recentTickets = await Ticket.find()
      .populate('assignee', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      total,
      open,
      inProgress,
      blocked,
      resolved,
      highPriorityOpen,
      recentTickets
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
};

module.exports = {
  getDashboardStats
};
