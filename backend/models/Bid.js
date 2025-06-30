const mongoose = require('mongoose');

const BidSchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
  amount: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Bid', BidSchema); 