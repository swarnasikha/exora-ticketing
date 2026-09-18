const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      // e.g. 'CREATED', 'STATUS_CHANGED', 'ASSIGNEE_CHANGED', 'DETAILS_UPDATED'
    },
    oldValue: {
      type: String,
    },
    newValue: {
      type: String,
    },
    message: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Activity', activitySchema);
