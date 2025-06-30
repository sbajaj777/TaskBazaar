const Razorpay = require('razorpay');
const Stripe = require('stripe');
const paypal = require('paypal-rest-sdk');

// Initialize payment gateways
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

paypal.configure({
  mode: process.env.NODE_ENV === 'production' ? 'live' : 'sandbox',
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET
});

// Subscription plans
const SUBSCRIPTION_PLANS = {
  monthly: {
    name: 'Monthly Subscription',
    amount: 999, // ₹9.99 or $9.99
    currency: 'INR',
    interval: 'month',
    description: 'Monthly subscription for service providers'
  },
  yearly: {
    name: 'Yearly Subscription',
    amount: 9999, // ₹99.99 or $99.99
    currency: 'INR',
    interval: 'year',
    description: 'Yearly subscription for service providers (2 months free)'
  }
};

// Razorpay functions
const createRazorpaySubscription = async (planId, customerId, customerEmail) => {
  try {
    const plan = SUBSCRIPTION_PLANS[planId];
    if (!plan) {
      throw new Error('Invalid plan ID');
    }

    // Create Razorpay plan if it doesn't exist
    let razorpayPlan;
    try {
      razorpayPlan = await razorpay.plans.fetch(`plan_${planId}`);
    } catch (error) {
      // Plan doesn't exist, create it
      razorpayPlan = await razorpay.plans.create({
        id: `plan_${planId}`,
        item: {
          name: plan.name,
          amount: plan.amount * 100, // Convert to paise
          currency: plan.currency,
          description: plan.description
        },
        period: plan.interval,
        interval: 1
      });
    }

    // Create subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: razorpayPlan.id,
      customer_notify: 1,
      total_count: plan.interval === 'month' ? 12 : 1,
      notes: {
        customer_id: customerId,
        customer_email: customerEmail
      }
    });

    return {
      subscriptionId: subscription.id,
      paymentUrl: `https://checkout.razorpay.com/v1/checkout.js`,
      amount: plan.amount,
      currency: plan.currency,
      planId: razorpayPlan.id
    };
  } catch (error) {
    console.error('Razorpay subscription creation error:', error);
    throw error;
  }
};

// Stripe functions
const createStripeSubscription = async (planId, customerId, customerEmail) => {
  try {
    const plan = SUBSCRIPTION_PLANS[planId];
    if (!plan) {
      throw new Error('Invalid plan ID');
    }

    // Create or retrieve customer
    let customer;
    try {
      const customers = await stripe.customers.list({
        email: customerEmail,
        limit: 1
      });
      
      if (customers.data.length > 0) {
        customer = customers.data[0];
      } else {
        customer = await stripe.customers.create({
          email: customerEmail,
          metadata: {
            internal_customer_id: customerId
          }
        });
      }
    } catch (error) {
      throw new Error('Failed to create/retrieve Stripe customer');
    }

    // Create or retrieve price
    let price;
    try {
      const prices = await stripe.prices.list({
        lookup_keys: [`${planId}_subscription`],
        limit: 1
      });
      
      if (prices.data.length > 0) {
        price = prices.data[0];
      } else {
        price = await stripe.prices.create({
          unit_amount: plan.amount * 100, // Convert to cents
          currency: plan.currency.toLowerCase(),
          recurring: {
            interval: plan.interval
          },
          product_data: {
            name: plan.name,
            description: plan.description
          },
          lookup_key: `${planId}_subscription`
        });
      }
    } catch (error) {
      throw new Error('Failed to create/retrieve Stripe price');
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{
        price: price.id
      }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        internal_customer_id: customerId,
        plan_id: planId
      }
    });

    return {
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      amount: plan.amount,
      currency: plan.currency
    };
  } catch (error) {
    console.error('Stripe subscription creation error:', error);
    throw error;
  }
};

// PayPal functions
const createPayPalSubscription = async (planId, customerId, customerEmail) => {
  try {
    const plan = SUBSCRIPTION_PLANS[planId];
    if (!plan) {
      throw new Error('Invalid plan ID');
    }

    // Create billing plan
    const billingPlan = {
      name: plan.name,
      description: plan.description,
      type: 'INFINITE',
      payment_definitions: [{
        name: 'Regular payment',
        type: 'REGULAR',
        frequency: plan.interval.toUpperCase(),
        frequency_interval: '1',
        amount: {
          value: (plan.amount / 100).toFixed(2),
          currency: plan.currency === 'INR' ? 'USD' : plan.currency // PayPal doesn't support INR for subscriptions
        },
        cycles: '0'
      }],
      merchant_preferences: {
        auto_bill_amount: 'YES',
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
        return_url: `${process.env.FRONTEND_URL}/payment/success`,
        initial_fail_amount_action: 'CONTINUE',
        max_fail_attempts: '1'
      }
    };

    return new Promise((resolve, reject) => {
      paypal.billingPlan.create(billingPlan, (error, plan) => {
        if (error) {
          console.error('PayPal plan creation error:', error);
          reject(error);
        } else {
          // Activate the plan
          const updatePlan = [{
            op: 'replace',
            path: '/',
            value: {
              state: 'ACTIVE'
            }
          }];

          paypal.billingPlan.update(plan.id, updatePlan, (updateError) => {
            if (updateError) {
              console.error('PayPal plan activation error:', updateError);
              reject(updateError);
            } else {
              // Create billing agreement
              const billingAgreement = {
                name: plan.name,
                description: plan.description,
                start_date: new Date(Date.now() + 60000).toISOString(), // Start 1 minute from now
                plan: {
                  id: plan.id
                },
                payer: {
                  payment_method: 'paypal'
                }
              };

              paypal.billingAgreement.create(billingAgreement, (agreementError, agreement) => {
                if (agreementError) {
                  console.error('PayPal agreement creation error:', agreementError);
                  reject(agreementError);
                } else {
                  const approvalUrl = agreement.links.find(link => link.rel === 'approval_url');
                  resolve({
                    subscriptionId: agreement.id,
                    paymentUrl: approvalUrl ? approvalUrl.href : null,
                    amount: plan.amount,
                    currency: plan.currency
                  });
                }
              });
            }
          });
        }
      });
    });
  } catch (error) {
    console.error('PayPal subscription creation error:', error);
    throw error;
  }
};

// Verify payment signatures
const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(orderId + '|' + paymentId)
    .digest('hex');
  
  return expectedSignature === signature;
};

const verifyStripeSignature = (payload, signature) => {
  try {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('Stripe signature verification failed:', error);
    return null;
  }
};

module.exports = {
  SUBSCRIPTION_PLANS,
  createRazorpaySubscription,
  createStripeSubscription,
  createPayPalSubscription,
  verifyRazorpaySignature,
  verifyStripeSignature,
  razorpay,
  stripe,
  paypal
};

