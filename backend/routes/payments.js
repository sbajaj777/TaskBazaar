const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  SUBSCRIPTION_PLANS,
  createRazorpaySubscription,
  createStripeSubscription,
  createPayPalSubscription
} = require('../utils/payments');
const Payment = require('../models/Payment');
const Provider = require('../models/Provider');

const router = express.Router();

// Get available subscription plans
router.get('/plans', (req, res) => {
  res.json({
    success: true,
    plans: SUBSCRIPTION_PLANS
  });
});

// Create subscription
router.post('/subscribe', authenticateToken, requireRole(['Provider']), async (req, res) => {
  try {
    const providerId = req.user._id;
    const { gateway, planId } = req.body;

    // Validate input
    if (!gateway || !planId) {
      return res.status(400).json({
        success: false,
        message: 'Gateway and plan ID are required'
      });
    }

    if (!['razorpay', 'stripe', 'paypal'].includes(gateway)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment gateway'
      });
    }

    if (!SUBSCRIPTION_PLANS[planId]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan ID'
      });
    }

    // Check if provider already has an active subscription
    const existingPayment = await Payment.findOne({
      providerId,
      status: 'active'
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active subscription'
      });
    }

    let subscriptionData;
    
    try {
      switch (gateway) {
        case 'razorpay':
          subscriptionData = await createRazorpaySubscription(planId, providerId, req.user.email);
          break;
        case 'stripe':
          subscriptionData = await createStripeSubscription(planId, providerId, req.user.email);
          break;
        case 'paypal':
          subscriptionData = await createPayPalSubscription(planId, providerId, req.user.email);
          break;
        default:
          throw new Error('Unsupported payment gateway');
      }
    } catch (error) {
      console.error('Subscription creation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create subscription'
      });
    }

    // Save payment record
    const payment = new Payment({
      providerId,
      subscriptionId: subscriptionData.subscriptionId,
      gateway,
      planId,
      amount: subscriptionData.amount,
      currency: subscriptionData.currency,
      status: 'pending',
      gatewayData: subscriptionData
    });

    await payment.save();

    res.json({
      success: true,
      message: 'Subscription created successfully',
      paymentId: payment._id,
      subscriptionData
    });

  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get subscription status
router.get('/subscription/status', authenticateToken, requireRole(['Provider']), async (req, res) => {
  try {
    const providerId = req.user._id;

    const payment = await Payment.findOne({
      providerId,
      status: { $in: ['pending', 'active'] }
    }).sort({ createdAt: -1 });

    if (!payment) {
      return res.json({
        success: true,
        subscription: null,
        isSubscribed: false
      });
    }

    res.json({
      success: true,
      subscription: {
        id: payment._id,
        subscriptionId: payment.subscriptionId,
        gateway: payment.gateway,
        planId: payment.planId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        startDate: payment.startDate,
        endDate: payment.endDate,
        nextBillingDate: payment.nextBillingDate
      },
      isSubscribed: payment.status === 'active'
    });

  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Cancel subscription
router.post('/subscription/cancel', authenticateToken, requireRole(['Provider']), async (req, res) => {
  try {
    const providerId = req.user._id;

    const payment = await Payment.findOne({
      providerId,
      status: 'active'
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    // Update payment status
    payment.status = 'cancelled';
    await payment.save();

    // Update provider subscription status
    await Provider.findByIdAndUpdate(providerId, {
      isSubscribed: false,
      subscriptionEndDate: new Date()
    });

    res.json({
      success: true,
      message: 'Subscription cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get payment history
router.get('/history', authenticateToken, requireRole(['Provider']), async (req, res) => {
  try {
    const providerId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const payments = await Payment.find({ providerId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-gatewayData -webhookEvents');

    const total = await Payment.countDocuments({ providerId });

    res.json({
      success: true,
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;

