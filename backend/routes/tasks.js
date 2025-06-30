const express = require('express');
const router = express.Router();

const {
  createTask,
  getTasks,
  getTaskById,
  postBid,
  getBidsForTask,
  assignTaskToLowestBidder,
  updateTask,
} = require('../controllers/tasks');

const { authenticateToken, requireRole } = require('../middleware/auth');

// 📌 Customer posts a new task
router.post(
  '/',
  authenticateToken,
  requireRole(['Customer']),
  createTask
);

// 📌 Providers fetch/filter open tasks
router.get('/', authenticateToken, getTasks);

// 📌 Get task details
router.get('/:id', getTaskById);

// 📌 Provider submits a bid
router.post(
  '/:id/bids',
  authenticateToken,
  requireRole(['Provider']),
  postBid
);

// 📌 Get all bids for a task
router.get('/:id/bids', getBidsForTask);

// 📌 Assign task to lowest bid (auto/manual, after timer ends)
router.post(
  '/:id/assign',
  authenticateToken,
  requireRole(['Customer', 'Provider']),
  assignTaskToLowestBidder
);

// 📌 Update a task (status, etc.)
router.put('/:id', authenticateToken, requireRole(['Customer']), updateTask);

module.exports = router;
