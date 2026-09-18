const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['USER', 'MANAGER']).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const createTicketSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
});

const updateTicketSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').optional(),
  description: z.string().min(1, 'Description cannot be empty').optional(),
});

const updateTicketStatusSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'BLOCKED', 'RESOLVED']),
});

const updateTicketAssigneeSchema = z.object({
  assignee: z.string().nullable(), // Allow null to unassign, or valid string ID
});

module.exports = {
  registerSchema,
  loginSchema,
  createTicketSchema,
  updateTicketSchema,
  updateTicketStatusSchema,
  updateTicketAssigneeSchema,
};
