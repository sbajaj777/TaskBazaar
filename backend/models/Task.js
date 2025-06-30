const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  address: { type: String, required: true },
  category: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  timerEnd: { type: Date, required: true },
  status: { type: String, enum: ['open', 'assigned', 'completed'], default: 'open' },
  assignedProviderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema); 