const express = require('express');
const { verifyRazorpaySignature, verifyStripeSignature } = require('../utils/payments');
const Payment = require('../models/Payment');
const Provider = require('../models/Provider');

const router = express.Router();

// Razorpay webhook
router.post('/razorpay', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const payload = req.body;

    // Verify signature (in production, you should verify this properly)
    // For now, we'll process the webhook without signature verification
    const event = JSON.parse(payload);

    console.log('Razorpay webhook received:', event.event);

    switch (event.event) {
      case 'subscription.activated':
        await handleSubscriptionActivated(event.payload.subscription.entity, 'razorpay');
        break;
      case 'subscription.charged':
        await handleSubscriptionCharged(event.payload.payment.entity, 'razorpay');
        break;
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event.payload.subscription.entity, 'razorpay');
        break;
      case 'subscription.completed':
        await handleSubscriptionCompleted(event.payload.subscription.entity, 'razorpay');
        break;
      default:
        console.log('Unhandled Razorpay event:', event.event);
    }

    res.status(200).json({ status: 'success' });

  } catch (error) {
    console.error('Razorpay webhook error:', error);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});

// Stripe webhook
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    const event = verifyStripeSignature(req.body, signature);

    if (!event) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    console.log('Stripe webhook received:', event.type);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleStripeSubscriptionUpdate(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handleStripePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handleStripePaymentFailed(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleStripeSubscriptionDeleted(event.data.object);
        break;
      default:
        console.log('Unhandled Stripe event:', event.type);
    }

    res.status(200).json({ received: true });

  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});

// PayPal webhook
router.post('/paypal', express.json(), async (req, res) => {
  try {
    const event = req.body;

    console.log('PayPal webhook received:', event.event_type);

    switch (event.event_type) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        await handlePayPalSubscriptionActivated(event.resource);
        break;
      case 'BILLING.SUBSCRIPTION.CANCELLED':
        await handlePayPalSubscriptionCancelled(event.resource);
        break;
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        await handlePayPalSubscriptionSuspended(event.resource);
        break;
      case 'PAYMENT.SALE.COMPLETED':
        await handlePayPalPaymentCompleted(event.resource);
        break;
      default:
        console.log('Unhandled PayPal event:', event.event_type);
    }

    res.status(200).json({ status: 'success' });

  } catch (error) {
    console.error('PayPal webhook error:', error);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});

// Helper functions for webhook processing

async function handleSubscriptionActivated(subscription, gateway) {
  try {
    const payment = await Payment.findOne({
      subscriptionId: subscription.id,
      gateway
    });

    if (payment) {
      payment.status = 'active';
      payment.startDate = new Date(subscription.start_at * 1000);
      payment.nextBillingDate = new Date(subscription.current_start * 1000);
      payment.webhookEvents.push({
        eventType: 'subscription.activated',
        eventData: subscription
      });
      await payment.save();

      // Update provider subscription status
      await Provider.findByIdAndUpdate(payment.providerId, {
        isSubscribed: true,
        subscriptionEndDate: payment.nextBillingDate
      });

      console.log('Subscription activated:', subscription.id);
    }
  } catch (error) {
    console.error('Error handling subscription activation:', error);
  }
}

async function handleSubscriptionCharged(payment, gateway) {
  try {
    const paymentRecord = await Payment.findOne({
      subscriptionId: payment.subscription_id,
      gateway
    });

    if (paymentRecord) {
      paymentRecord.webhookEvents.push({
        eventType: 'subscription.charged',
        eventData: payment
      });
      await paymentRecord.save();

      console.log('Subscription charged:', payment.subscription_id);
    }
  } catch (error) {
    console.error('Error handling subscription charge:', error);
  }
}

async function handleSubscriptionCancelled(subscription, gateway) {
  try {
    const payment = await Payment.findOne({
      subscriptionId: subscription.id,
      gateway
    });

    if (payment) {
      payment.status = 'cancelled';
      payment.webhookEvents.push({
        eventType: 'subscription.cancelled',
        eventData: subscription
      });
      await payment.save();

      // Update provider subscription status
      await Provider.findByIdAndUpdate(payment.providerId, {
        isSubscribed: false
      });

      console.log('Subscription cancelled:', subscription.id);
    }
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
  }
}

async function handleSubscriptionCompleted(subscription, gateway) {
  try {
    const payment = await Payment.findOne({
      subscriptionId: subscription.id,
      gateway
    });

    if (payment) {
      payment.status = 'expired';
      payment.endDate = new Date();
      payment.webhookEvents.push({
        eventType: 'subscription.completed',
        eventData: subscription
      });
      await payment.save();

      // Update provider subscription status
      await Provider.findByIdAndUpdate(payment.providerId, {
        isSubscribed: false
      });

      console.log('Subscription completed:', subscription.id);
    }
  } catch (error) {
    console.error('Error handling subscription completion:', error);
  }
}

// Stripe-specific handlers
async function handleStripeSubscriptionUpdate(subscription) {
  try {
    const payment = await Payment.findOne({
      subscriptionId: subscription.id,
      gateway: 'stripe'
    });

    if (payment) {
      payment.status = subscription.status === 'active' ? 'active' : subscription.status;
      payment.startDate = new Date(subscription.current_period_start * 1000);
      payment.nextBillingDate = new Date(subscription.current_period_end * 1000);
      payment.webhookEvents.push({
        eventType: 'subscription.updated',
        eventData: subscription
      });
      await payment.save();

      // Update provider subscription status
      await Provider.findByIdAndUpdate(payment.providerId, {
        isSubscribed: subscription.status === 'active',
        subscriptionEndDate: new Date(subscription.current_period_end * 1000)
      });

      console.log('Stripe subscription updated:', subscription.id);
    }
  } catch (error) {
    console.error('Error handling Stripe subscription update:', error);
  }
}

async function handleStripePaymentSucceeded(invoice) {
  try {
    const payment = await Payment.findOne({
      subscriptionId: invoice.subscription,
      gateway: 'stripe'
    });

    if (payment) {
      payment.webhookEvents.push({
        eventType: 'payment.succeeded',
        eventData: invoice
      });
      await payment.save();

      console.log('Stripe payment succeeded:', invoice.subscription);
    }
  } catch (error) {
    console.error('Error handling Stripe payment success:', error);
  }
}

async function handleStripePaymentFailed(invoice) {
  try {
    const payment = await Payment.findOne({
      subscriptionId: invoice.subscription,
      gateway: 'stripe'
    });

    if (payment) {
      payment.webhookEvents.push({
        eventType: 'payment.failed',
        eventData: invoice
      });
      await payment.save();

      console.log('Stripe payment failed:', invoice.subscription);
    }
  } catch (error) {
    console.error('Error handling Stripe payment failure:', error);
  }
}

async function handleStripeSubscriptionDeleted(subscription) {
  try {
    const payment = await Payment.findOne({
      subscriptionId: subscription.id,
      gateway: 'stripe'
    });

    if (payment) {
      payment.status = 'cancelled';
      payment.webhookEvents.push({
        eventType: 'subscription.deleted',
        eventData: subscription
      });
      await payment.save();

      // Update provider subscription status
      await Provider.findByIdAndUpdate(payment.providerId, {
        isSubscribed: false
      });

      console.log('Stripe subscription deleted:', subscription.id);
    }
  } catch (error) {
    console.error('Error handling Stripe subscription deletion:', error);
  }
}

// PayPal-specific handlers
async function handlePayPalSubscriptionActivated(subscription) {
  try {
    const payment = await Payment.findOne({
      subscriptionId: subscription.id,
      gateway: 'paypal'
    });

    if (payment) {
      payment.status = 'active';
      payment.startDate = new Date(subscription.start_time);
      payment.webhookEvents.push({
        eventType: 'subscription.activated',
        eventData: subscription
      });
      await payment.save();

      // Update provider subscription status
      await Provider.findByIdAndUpdate(payment.providerId, {
        isSubscribed: true
      });

      console.log('PayPal subscription activated:', subscription.id);
    }
  } catch (error) {
    console.error('Error handling PayPal subscription activation:', error);
  }
}

async function handlePayPalSubscriptionCancelled(subscription) {
  try {
    const payment = await Payment.findOne({
      subscriptionId: subscription.id,
      gateway: 'paypal'
    });

    if (payment) {
      payment.status = 'cancelled';
      payment.webhookEvents.push({
        eventType: 'subscription.cancelled',
        eventData: subscription
      });
      await payment.save();

      // Update provider subscription status
      await Provider.findByIdAndUpdate(payment.providerId, {
        isSubscribed: false
      });

      console.log('PayPal subscription cancelled:', subscription.id);
    }
  } catch (error) {
    console.error('Error handling PayPal subscription cancellation:', error);
  }
}

async function handlePayPalSubscriptionSuspended(subscription) {
  try {
    const payment = await Payment.findOne({
      subscriptionId: subscription.id,
      gateway: 'paypal'
    });

    if (payment) {
      payment.status = 'suspended';
      payment.webhookEvents.push({
        eventType: 'subscription.suspended',
        eventData: subscription
      });
      await payment.save();

      // Update provider subscription status
      await Provider.findByIdAndUpdate(payment.providerId, {
        isSubscribed: false
      });

      console.log('PayPal subscription suspended:', subscription.id);
    }
  } catch (error) {
    console.error('Error handling PayPal subscription suspension:', error);
  }
}

async function handlePayPalPaymentCompleted(payment) {
  try {
    const paymentRecord = await Payment.findOne({
      subscriptionId: payment.billing_agreement_id,
      gateway: 'paypal'
    });

    if (paymentRecord) {
      paymentRecord.webhookEvents.push({
        eventType: 'payment.completed',
        eventData: payment
      });
      await paymentRecord.save();

      console.log('PayPal payment completed:', payment.billing_agreement_id);
    }
  } catch (error) {
    console.error('Error handling PayPal payment completion:', error);
  }
}

module.exports = router;

