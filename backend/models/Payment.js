const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  providerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Provider', 
    required: true 
  },
  subscriptionId: { 
    type: String, 
    required: true 
  },
  gateway: { 
    type: String, 
    enum: ['razorpay', 'stripe', 'paypal'], 
    required: true 
  },
  planId: { 
    type: String, 
    enum: ['monthly', 'yearly'], 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  currency: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'active', 'cancelled', 'expired', 'failed'], 
    default: 'pending' 
  },
  startDate: { 
    type: Date 
  },
  endDate: { 
    type: Date 
  },
  nextBillingDate: { 
    type: Date 
  },
  gatewayData: {
    type: mongoose.Schema.Types.Mixed // Store gateway-specific data
  },
  webhookEvents: [{
    eventType: String,
    eventData: mongoose.Schema.Types.Mixed,
    processedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);

