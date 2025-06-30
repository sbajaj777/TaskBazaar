import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { bookingAPI, providerAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Calendar,
  Clock,
  CheckCircle,
  DollarSign,
  AlertCircle,
  Plus,
  User,
  Settings,
  CreditCard
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../lib/api';

const ProviderDashboard = ({ defaultTab = 'overview' }) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalEarnings: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [myBids, setMyBids] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || defaultTab);
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [availableCurrencies, setAvailableCurrencies] = useState([]);
  const [bidCoins, setBidCoins] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    fetchAssignedTasks();
    fetchBidCoins();
    setActiveTab(tabParam || defaultTab);
    // Refresh BidCoins on window/tab focus
    const handleFocus = () => fetchBidCoins();
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleFocus);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', handleFocus);
      }
    };
  }, [tabParam]);

  const fetchDashboardData = async () => {
    try {
      // Placeholder: Add backend stats here if needed
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tasks', { params: { assignedProvider: 'me' } });
      const filtered = res.data.filter(task =>
        task.assignedProviderId === user?._id ||
        (task.assignedProviderId && task.assignedProviderId._id === user?._id)
      );
      setAssignedTasks(filtered);
      // Fetch bids for each assigned task
      const bidsObj = {};
      const currencyObj = {};
      for (const task of filtered) {
        try {
          const bidRes = await api.get(`/tasks/${task._id}/bids`);
          const myBid = bidRes.data.find(bid => bid.providerId?._id === user?._id || bid.providerId === user?._id);
          if (myBid) {
            bidsObj[task._id] = myBid.amount;
            currencyObj[task._id] = myBid.currency || 'INR';
          }
        } catch {}
      }
      setMyBids(bidsObj);
      // Collect all currencies from completed tasks
      const completedTasks = filtered.filter(t => t.status === 'completed');
      const completedCurrencies = Array.from(new Set(completedTasks.map(t => currencyObj[t._id] || 'INR')));
      // Set default selected currency
      if (completedCurrencies.length > 0 && !selectedCurrency) {
        setSelectedCurrency(completedCurrencies[0]);
      }
      // Calculate stats
      const totalBookings = filtered.length;
      const completedBookings = completedTasks.length;
      const pendingBookings = filtered.filter(t => t.status !== 'completed').length;
      // Calculate earnings for selected currency (case-insensitive, fallback to INR)
      const totalEarnings = completedTasks.reduce((sum, t) => {
        const cur = (currencyObj[t._id] || 'INR').toUpperCase();
        const selCur = (selectedCurrency || 'INR').toUpperCase();
        if (cur === selCur) {
          return sum + (bidsObj[t._id] || 0);
        }
        return sum;
      }, 0);
      setStats({
        totalBookings,
        pendingBookings,
        completedBookings,
        totalEarnings,
        averageRating: stats.averageRating
      });
      // Save available currencies for dropdown
      setAvailableCurrencies(completedCurrencies);
    } catch (error) {
      setAssignedTasks([]);
      setStats({
        totalBookings: 0,
        pendingBookings: 0,
        completedBookings: 0,
        totalEarnings: 0,
        averageRating: 0
      });
      setAvailableCurrencies([]);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      setBookings(prev =>
        prev.map(booking =>
          booking._id === bookingId
            ? { ...booking, status: newStatus }
            : booking
        )
      );
      await bookingAPI.updateBookingStatus(bookingId, { status: newStatus });
    } catch (error) {
      console.error('Error updating booking status:', error);
      fetchDashboardData(); // Re-fetch in case of error
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name || 'Provider'}!
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your services and connect with customers
            </p>
            <div className="mt-4 flex items-center gap-4">
              <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full font-semibold">
                BidCoins: {bidCoins === null ? '...' : bidCoins}
              </span>
              <Button variant="outline" size="sm" onClick={() => navigate('/provider/subscription')}>Buy BidCoins</Button>
            </div>
          </div>
          <Link to="/provider/won-bids">
            <Button variant="default" className="w-full md:w-auto">
              My Won Bids
            </Button>
          </Link>
        </div>

        {subscriptionStatus && !subscriptionStatus.isActive && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              Your subscription is not active.{' '}
              <Link to="/provider/subscription" className="font-medium underline">
                Upgrade now
              </Link>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card><CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent></Card>

          <Card><CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingBookings}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent></Card>

          <Card><CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-gray-900">{stats.completedBookings}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent></Card>

          <Card><CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <div className="flex items-center space-x-2">
                  <p className="text-3xl font-bold text-gray-900">
                    {selectedCurrency === 'USD' ? '$' : selectedCurrency === 'INR' ? '₹' : selectedCurrency === 'EUR' ? '€' : selectedCurrency + ' '}{stats.totalEarnings}
                  </p>
                  {availableCurrencies.length > 1 && (
                    <select
                      value={selectedCurrency}
                      onChange={e => setSelectedCurrency(e.target.value)}
                      className="ml-2 px-2 py-1 border rounded"
                    >
                      {availableCurrencies.map(cur => (
                        <option key={cur} value={cur}>{cur}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent></Card>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="w-full grid grid-cols-2 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your account and services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border h-48 min-h-[12rem] p-6 transition hover:shadow-md cursor-pointer">
                    <Link to="/browse-tasks" className="flex flex-col items-center w-full h-full justify-center">
                      <Plus className="w-10 h-10 text-primary mb-2" />
                      <span className="text-lg font-semibold mb-1">Browse Tasks</span>
                      <span className="text-gray-500 text-sm">Bid on open tasks</span>
                    </Link>
                  </div>
                  <div className="flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border h-48 min-h-[12rem] p-6 transition hover:shadow-md cursor-pointer">
                    <Link to="/provider/profile" className="flex flex-col items-center w-full h-full justify-center">
                      <User className="w-10 h-10 text-primary mb-2" />
                      <span className="text-lg font-semibold mb-1">Complete Profile</span>
                    </Link>
                  </div>
                  <div className="flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border h-48 min-h-[12rem] p-6 transition hover:shadow-md cursor-pointer">
                    <Link to="/provider/subscription" className="flex flex-col items-center w-full h-full justify-center">
                      <CreditCard className="w-10 h-10 text-primary mb-2" />
                      <span className="text-lg font-semibold mb-1">Manage Subscription</span>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Management</CardTitle>
                <CardDescription>Edit your provider information</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-8">
                <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Profile Editor Coming Soon</h3>
                <p className="text-gray-500 mb-4">Full profile editing will be available shortly.</p>
                <Link to="/provider/profile">
                  <Button>Go to Profile Page</Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProviderDashboard;
