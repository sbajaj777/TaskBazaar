import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { paymentAPI, providerAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  CreditCard, 
  Check, 
  X, 
  Star, 
  Calendar,
  DollarSign,
  Shield,
  Zap,
  Crown,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

const SubscriptionPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedGateway, setSelectedGateway] = useState('razorpay');
  const [message, setMessage] = useState({ type: '', content: '' });
  const [bidCoins, setBidCoins] = useState(null);
  const [buyAmount, setBuyAmount] = useState('');
  const [buyLoading, setBuyLoading] = useState(false);
  const [buyMessage, setBuyMessage] = useState('');

  // Subscription plans
  const plans = [
    {
      id: 'standard',
      name: 'Standard',
      price: 9.99,
      currency: 'USD',
      interval: 'month',
      features: [
        'Unlimited service listings',
        'Profile customization',
        'Email support',
        'Standard search visibility'
      ],
      limitations: [],
      popular: true
    }
  ];

  // Payment gateways
  const paymentGateways = [
    {
      id: 'razorpay',
      name: 'Razorpay',
      description: 'UPI, Cards, Net Banking, Wallets (India)',
      logo: '🇮🇳',
      currencies: ['INR'],
      methods: ['UPI', 'Cards', 'Net Banking', 'Wallets']
    },
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Credit/Debit Cards (International)',
      logo: '💳',
      currencies: ['USD', 'EUR', 'GBP'],
      methods: ['Credit Cards', 'Debit Cards', 'Apple Pay', 'Google Pay']
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'PayPal Account & Cards (Global)',
      logo: '🌐',
      currencies: ['USD', 'EUR', 'GBP'],
      methods: ['PayPal Balance', 'Credit Cards', 'Bank Transfer']
    }
  ];

  const bidCoinPlans = [
    { amount: 5, price: 50 },
    { amount: 20, price: 180 },
    { amount: 100, price: 700 },
  ];

  useEffect(() => {
    loadSubscriptionData();
    fetchBidCoins();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      
      // Load current subscription and payment history
      const [subscriptionRes, historyRes] = await Promise.all([
        paymentAPI.getSubscriptionStatus(),
        paymentAPI.getPaymentHistory({ limit: 10 })
      ]);

      setCurrentSubscription(subscriptionRes.data.subscription);
      setPaymentHistory(historyRes.data.payments || []);
    } catch (error) {
      console.error('Error loading subscription data:', error);
      
      // Mock data for demo
      setCurrentSubscription({
        id: 'sub_123',
        planId: 'premium',
        status: 'active',
        currentPeriodStart: new Date(Date.now() - 15 * 86400000),
        currentPeriodEnd: new Date(Date.now() + 15 * 86400000),
        cancelAtPeriodEnd: false,
        amount: 19.99,
        currency: 'USD'
      });

      setPaymentHistory([
        {
          id: 'pay_123',
          amount: 19.99,
          currency: 'USD',
          status: 'succeeded',
          createdAt: new Date(Date.now() - 30 * 86400000),
          description: 'Premium Plan - Monthly'
        },
        {
          id: 'pay_124',
          amount: 19.99,
          currency: 'USD',
          status: 'succeeded',
          createdAt: new Date(Date.now() - 60 * 86400000),
          description: 'Premium Plan - Monthly'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBidCoins = async () => {
    try {
      const res = await providerAPI.getBidCoins();
      setBidCoins(res.data.bidCoins);
    } catch {
      setBidCoins(null);
    }
  };

  const handleBuyPlan = async (amount, price) => {
    setBuyLoading(true);
    setBuyMessage('');
    try {
      // 1. Create Razorpay order on backend
      const res = await providerAPI.createBidCoinOrder(price);
      const { orderId, amount: orderAmount, currency } = res.data;

      // 2. Open Razorpay Checkout
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        console.error('VITE_RAZORPAY_KEY_ID is not set in the frontend .env file!');
        setBuyMessage('Payment setup error. Please contact support.');
        setBuyLoading(false);
        return;
      }
      const options = {
        key: razorpayKey,
        amount: orderAmount,
        currency,
        name: 'TaskBazaar',
        description: `Buy ${amount} BidCoins`,
        order_id: orderId,
        handler: async function (response) {
          try {
            // 3. On success, verify payment and credit BidCoins
            const verifyRes = await providerAPI.verifyBidCoinPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bidCoins: amount,
            });
            setBuyMessage(`Successfully purchased ${amount} BidCoins!`);
            setBidCoins(verifyRes.data.bidCoins);
          } catch (err) {
            setBuyMessage('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: { color: '#3B82F6' },
      };
      if (typeof window !== 'undefined' && window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      setBuyMessage('Payment failed. Please try again.');
    } finally {
      setBuyLoading(false);
    }
  };

  const handleSubscribe = async (plan) => {
    try {
      setProcessing(true);
      setMessage({ type: '', content: '' });

      const subscriptionData = {
        planId: plan.id,
        gateway: selectedGateway,
        currency: plan.currency
      };

      const response = await paymentAPI.createSubscription(subscriptionData);
      
      // Handle different payment gateways
      if (selectedGateway === 'razorpay') {
        // Initialize Razorpay
        const options = {
          key: response.data.key,
          subscription_id: response.data.subscriptionId,
          name: 'TaskBazaar',
          description: `${plan.name} Plan Subscription`,
          handler: async (response) => {
            await confirmPayment(response);
          },
          prefill: {
            name: user?.name,
            email: user?.email
          },
          theme: {
            color: '#3B82F6'
          }
        };
        
        if (typeof window !== 'undefined') {
          const rzp = new window.Razorpay(options);
          rzp.open();
        }
      } else if (selectedGateway === 'stripe') {
        // Redirect to Stripe Checkout
        if (typeof window !== 'undefined') {
          window.location.href = response.data.checkoutUrl;
        }
      } else if (selectedGateway === 'paypal') {
        // Redirect to PayPal
        if (typeof window !== 'undefined') {
          window.location.href = response.data.approvalUrl;
        }
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      setMessage({ 
        type: 'error', 
        content: 'Failed to create subscription. Please try again.' 
      });
    } finally {
      setProcessing(false);
    }
  };

  const confirmPayment = async (paymentData) => {
    try {
      await paymentAPI.confirmPayment(paymentData);
      setMessage({ 
        type: 'success', 
        content: 'Subscription activated successfully!' 
      });
      loadSubscriptionData(); // Refresh data
    } catch (error) {
      console.error('Error confirming payment:', error);
      setMessage({ 
        type: 'error', 
        content: 'Payment confirmation failed. Please contact support.' 
      });
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setProcessing(true);
      await paymentAPI.cancelSubscription();
      setMessage({ 
        type: 'success', 
        content: 'Subscription will be cancelled at the end of the current period.' 
      });
      loadSubscriptionData();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      setMessage({ 
        type: 'error', 
        content: 'Failed to cancel subscription. Please try again.' 
      });
    } finally {
      setProcessing(false);
    }
  };

  const getCurrentPlan = () => {
    if (!currentSubscription) return null;
    return plans.find(plan => plan.id === currentSubscription.planId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'succeeded':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentPlan = getCurrentPlan();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">Buy BidCoins</h1>
        <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
          <p className="text-yellow-800 text-sm">
            <strong>BidCoins</strong> are required to place bids on tasks. Each bid costs 1 BidCoin. You currently have:
            <span className="ml-2 font-bold text-yellow-900">{bidCoins === null ? '...' : bidCoins} BidCoins</span>
          </p>
        </div>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Purchase BidCoins</CardTitle>
            <CardDescription>Select a plan to buy BidCoins instantly</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              {bidCoinPlans.map(plan => (
                <div key={plan.amount} className="border rounded-lg p-6 flex flex-col items-center bg-white shadow-sm">
                  <div className="text-3xl font-bold mb-2">{plan.amount} <span className="text-yellow-600">🪙</span></div>
                  <div className="text-lg font-semibold mb-4">₹{plan.price}</div>
                  <Button onClick={() => handleBuyPlan(plan.amount, plan.price)} disabled={buyLoading} className="w-full">
                    {buyLoading ? 'Processing...' : `Buy ${plan.amount} BidCoins`}
                  </Button>
                </div>
              ))}
            </div>
            {buyMessage && <div className={`mt-2 ${buyMessage.startsWith('Successfully') ? 'text-green-700' : 'text-red-700'}`}>{buyMessage}</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionPage;

