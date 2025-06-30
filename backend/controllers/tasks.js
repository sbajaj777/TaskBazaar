const Task = require('../models/Task');
const Bid = require('../models/Bid');
const Provider = require('../models/Provider');
const mongoose = require('mongoose');

// POST /tasks - Customer posts a new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, address, category, timerEnd } = req.body;
    const userId = req.user._id;
    const task = await Task.create({
      title,
      description,
      address,
      category,
      userId,
      timerEnd,
      status: 'open',
    });

    const msUntilEnd = new Date(timerEnd) - new Date();
    if (msUntilEnd > 0) {
      setTimeout(async () => {
        await autoAssignTask(task._id);
      }, msUntilEnd);
    }

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /tasks - Providers fetch/filter open tasks or their own assigned tasks
exports.getTasks = async (req, res) => {
  try {
    console.log('assignedProvider:', req.query.assignedProvider, 'req.user:', req.user);
    const { category, address, assignedProvider, userId } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (address) filter.address = address;

    if (assignedProvider && req.user && assignedProvider === 'me') {
      filter.assignedProviderId = req.user._id;
      console.log('USING WON BIDS FILTER:', filter);
    } else if (req.query.status) {
      filter.status = req.query.status;
    } else if (!(userId && req.user && userId === 'me')) {
      filter.status = 'open';
    }

    if (userId && req.user && userId === 'me') {
      filter.userId = req.user._id;
    }

    let tasks = await Task.find(filter)
      .populate('assignedProviderId', 'name email contactInfo')
      .sort({ timerEnd: 1 });

    // For each assigned task, add winningBidAmount
    const tasksWithBid = await Promise.all(tasks.map(async (task) => {
      const t = task.toObject();
      if (t.assignedProviderId) {
        const winningBid = await Bid.findOne({ taskId: t._id, providerId: t.assignedProviderId }).sort({ amount: 1 });
        if (winningBid) t.winningBidAmount = winningBid.amount;
      }
      return t;
    }));

    console.log('Assigned tasks filter:', filter);
    console.log('Assigned tasks returned:', tasksWithBid);
    res.json(tasksWithBid);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /tasks/:id - Get task details
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('assignedProviderId', 'name email');
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /tasks/:id/bids - Provider submits a bid
exports.postBid = async (req, res) => {
  try {
    const { amount } = req.body;
    const providerId = req.user._id;
    const taskId = req.params.id;

    // Check provider's BidCoin balance
    const provider = await Provider.findById(providerId);
    if (!provider) return res.status(404).json({ error: 'Provider not found.' });
    if (provider.bidCoins < 1) return res.status(400).json({ error: 'Not enough BidCoins to place a bid.' });

    const existing = await Bid.findOne({ taskId, providerId });
    if (existing) return res.status(400).json({ error: 'You have already bid on this task.' });

    // Deduct 1 BidCoin
    provider.bidCoins -= 1;
    await provider.save();

    const bid = await Bid.create({ taskId, providerId, amount });
    res.status(201).json(bid);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /tasks/:id/bids - Get all bids for a task
exports.getBidsForTask = async (req, res) => {
  try {
    const bids = await Bid.find({ taskId: req.params.id }).populate('providerId', 'name email');
    res.json(bids);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /tasks/:id/assign - Manual assignment to lowest bid (optional)
exports.assignTaskToLowestBidder = async (req, res) => {
  try {
    const task = await autoAssignTask(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found or already assigned.' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔧 Helper: Assign to lowest bidder after timer ends
async function autoAssignTask(taskId) {
  console.log("AUTO ASSIGN FUNCTION CALLED FOR TASK:", taskId);

  const task = await Task.findById(taskId);
  if (!task || task.status !== 'open') return null;

  if (new Date() < new Date(task.timerEnd)) return null;

  const bids = await Bid.find({ taskId }).sort({ amount: 1 });
  console.log('Bids found for task', taskId, ':', bids);

  if (bids.length === 0) {
    console.log(`Task ${taskId} had no bids. Skipping assignment.`);
    return task;
  }

  const lowestBid = bids[0];
  console.log('Assigning task', taskId, 'to provider', lowestBid.providerId);
  task.status = 'assigned';
  task.assignedProviderId = lowestBid.providerId ? new mongoose.Types.ObjectId(lowestBid.providerId) : null;
  await task.save();
  console.log('Saved task:', task);
  return task;
}

exports.autoAssignTask = autoAssignTask;

// Periodic cron-like check to auto-assign overdue tasks
setInterval(async () => {
  try {
    const now = new Date();
    const overdueTasks = await Task.find({ status: 'open', timerEnd: { $lte: now } });
    for (const task of overdueTasks) {
      await autoAssignTask(task._id);
    }
  } catch (err) {
    console.error('Error in periodic auto-assign:', err);
  }
}, 60 * 1000); // every 1 minute

// PUT /tasks/:id - Update a task (status, etc.)
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    // Only the owner can update
    if (String(task.userId) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Not authorized to update this task' });
    }
    // Allow updating status and description (extend as needed)
    if (req.body.status) task.status = req.body.status;
    if (req.body.description) task.description = req.body.description;
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
