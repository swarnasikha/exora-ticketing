const express = require('express');
const router = express.Router();
const {
  createTicket,
  getTickets,
  getTicket,
  updateTicket,
  updateStatus,
  updateAssignee,
  getActivity,
} = require('../controllers/ticketController');
const { protect, managerOnly } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getTickets)
  .post(protect, createTicket);

router.route('/:ticketNumber')
  .get(protect, getTicket)
  .patch(protect, updateTicket);

router.patch('/:ticketNumber/status', protect, updateStatus);
router.patch('/:ticketNumber/assignee', protect, managerOnly, updateAssignee);

router.get('/:ticketNumber/activity', protect, getActivity);

module.exports = router;
