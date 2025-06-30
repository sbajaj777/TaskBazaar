import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { bookingAPI, customerAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Calendar, 
  Heart, 
  Search, 
  Star, 
  MapPin, 
  Clock,
  User,
  Phone,
  MessageCircle,
  Plus,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [activeBookings, setActiveBookings] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user?._id]);

  // Refresh data when user returns to the tab
  useEffect(() => {
    const handleFocus = () => {
      if (user?._id) {
        fetchDashboardData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user?._id]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [activeRes, pastRes, favRes] = await Promise.all([
        bookingAPI.getActiveBookings(),
        bookingAPI.getPastBookings(),
        customerAPI.getFavorites()
      ]);

      console.log('Favorites response:', favRes.data); // Debug log

      setActiveBookings(activeRes.data.bookings || []);
      setRecentBookings(pastRes.data.bookings?.slice(0, 3) || []);
      
      // Ensure we're using the correct field from the response
      const favoritesData = favRes.data.favorites || [];
      console.log('Setting favorites:', favoritesData); // Debug log
      setFavorites(favoritesData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set empty arrays on error to prevent undefined issues
      setActiveBookings([]);
      setRecentBookings([]);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const refreshData = () => {
    fetchDashboardData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Debug log for favorites count
  console.log('Dashboard render - favorites count:', favorites.length);
  console.log('Dashboard render - favorites data:', favorites);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back!
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your bookings and discover new services
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-8">
          <div className="bg-white rounded-lg shadow p-8 flex flex-col items-center">
            <span className="text-4xl mb-4">🔍</span>
            <h2 className="text-xl font-semibold mb-2">Find Services</h2>
            <p className="text-gray-600 mb-4">Discover local service providers</p>
            <a href="/search" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Find Services</a>
          </div>
          <div className="bg-white rounded-lg shadow p-8 flex flex-col items-center">
            <span className="text-4xl mb-4">❤️</span>
            <h2 className="text-xl font-semibold mb-2">Favorites</h2>
            <p className="text-gray-600 mb-4">Your saved providers</p>
            <a href="/favorites" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Favorites</a>
          </div>
          <div className="bg-white rounded-lg shadow p-8 flex flex-col items-center">
            <span className="text-4xl mb-4">📝</span>
            <h2 className="text-xl font-semibold mb-2">My Tasks</h2>
            <p className="text-gray-600 mb-4">View and manage your posted tasks</p>
            <a href="/my-tasks" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">My Tasks</a>
          </div>
          <div className="bg-white rounded-lg shadow p-8 flex flex-col items-center">
            <span className="text-4xl mb-4">➕</span>
            <h2 className="text-xl font-semibold mb-2">Post Task</h2>
            <p className="text-gray-600 mb-4">Let providers bid for your work</p>
            <a href="/post-task" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Post Task</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;

