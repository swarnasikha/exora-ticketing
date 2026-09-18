require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const Activity = require('../models/Activity');
const connectDB = require('../config/db');

const seedData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database already seeded, skipping...');
      return;
    }

    // Clear db
    await User.deleteMany();
    await Ticket.deleteMany();
    await Activity.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // Create users
    const users = await User.insertMany([
      { name: 'Admin', email: 'admin@exora.com', passwordHash, role: 'MANAGER' },
      { name: 'Rahul', email: 'rahul@exora.com', passwordHash, role: 'USER' },
      { name: 'Alice', email: 'alice@exora.com', passwordHash, role: 'USER' },
    ]);

    const admin = users[0];
    const rahul = users[1];
    const alice = users[2];

    const tickets = await Ticket.insertMany([
      {
        ticketNumber: 101,
        title: 'Login page is crashing',
        description: 'Users cannot log in when using Safari.',
        priority: 'HIGH',
        status: 'OPEN',
        createdBy: alice._id,
        assignee: rahul._id,
      },
      {
        ticketNumber: 102,
        title: 'Update footer copyright',
        description: 'Update the year to 2026.',
        priority: 'LOW',
        status: 'RESOLVED',
        createdBy: admin._id,
        assignee: alice._id,
      },
      {
        ticketNumber: 103,
        title: 'Database connection timeout',
        description: 'Random timeouts occurring during peak hours.',
        priority: 'HIGH',
        status: 'OPEN',
        createdBy: rahul._id,
        assignee: admin._id,
      },
      {
        ticketNumber: 104,
        title: 'User profile image upload failing',
        description: 'S3 bucket is returning 403 Forbidden.',
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        createdBy: alice._id,
        assignee: rahul._id,
      },
      {
        ticketNumber: 105,
        title: 'Payment gateway integration',
        description: 'Need to integrate the new Stripe API.',
        priority: 'HIGH',
        status: 'OPEN',
        createdBy: admin._id,
        assignee: rahul._id,
      },
    ]);

    for (const ticket of tickets) {
      await Activity.create({
        ticketId: ticket._id,
        actorId: ticket.createdBy,
        action: 'CREATED',
        message: 'Ticket created during DB seed',
      });
    }

    console.log('Database Seeded Successfully!');
  } catch (error) {
    console.error(`Seed Error: ${error.message}`);
  }
};

module.exports = { seedData };
