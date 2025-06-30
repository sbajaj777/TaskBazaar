const Provider = require('../models/Provider');
const Payment = require('../models/Payment');

// Middleware to check if provider has active subscription
const requireActiveSubscription = async (req, res, next) => {
  try {
    // Only apply to providers
    if (req.user.role !== 'Provider') {
      return next();
    }

    const providerId = req.user._id;

    // Check if provider has active subscription
    const activePayment = await Payment.findOne({
      providerId,
      status: 'active'
    });

    if (!activePayment) {
      return res.status(403).json({
        success: false,
        message: 'Active subscription required to access this feature',
        code: 'SUBSCRIPTION_REQUIRED'
      });
    }

    // Check if subscription has expired
    if (activePayment.endDate && activePayment.endDate < new Date()) {
      // Update payment status
      activePayment.status = 'expired';
      await activePayment.save();

      // Update provider subscription status
      await Provider.findByIdAndUpdate(providerId, {
        isSubscribed: false
      });

      return res.status(403).json({
        success: false,
        message: 'Subscription has expired. Please renew to continue.',
        code: 'SUBSCRIPTION_EXPIRED'
      });
    }

    // Add subscription info to request
    req.subscription = activePayment;
    next();

  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Middleware to check subscription for specific features
const requireSubscriptionForFeature = (feature) => {
  return async (req, res, next) => {
    try {
      // Only apply to providers
      if (req.user.role !== 'Provider') {
        return next();
      }

      const providerId = req.user._id;

      // Check if provider has active subscription
      const activePayment = await Payment.findOne({
        providerId,
        status: 'active'
      });

      if (!activePayment) {
        return res.status(403).json({
          success: false,
          message: `Active subscription required to ${feature}`,
          code: 'SUBSCRIPTION_REQUIRED',
          feature
        });
      }

      next();

    } catch (error) {
      console.error('Feature subscription check error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

// Middleware to allow limited access for non-subscribed providers
const allowLimitedAccess = (limits) => {
  return async (req, res, next) => {
    try {
      // Only apply to providers
      if (req.user.role !== 'Provider') {
        return next();
      }

      const providerId = req.user._id;

      // Check if provider has active subscription
      const activePayment = await Payment.findOne({
        providerId,
        status: 'active'
      });

      if (activePayment) {
        // Has subscription, allow full access
        req.hasSubscription = true;
        return next();
      }

      // No subscription, apply limits
      req.hasSubscription = false;
      req.limits = limits;

      // You can implement specific limit checks here
      // For example, limit number of bookings, profile updates, etc.

      next();

    } catch (error) {
      console.error('Limited access check error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

module.exports = {
  requireActiveSubscription,
  requireSubscriptionForFeature,
  allowLimitedAccess
};

