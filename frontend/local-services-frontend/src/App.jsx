import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CustomerDashboard from './pages/CustomerDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import ProviderProfileEdit from './pages/ProviderProfileEdit';
import SubscriptionPage from './pages/SubscriptionPage';
import SearchPage from './pages/SearchPage';
import ProviderProfile from './pages/ProviderProfile';
import ChatInterface from './pages/ChatInterface';
import BookPage from './pages/BookPage';
import FavoritesPage from './pages/FavoritesPage';
import './App.css';
import About from './pages/About';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import PostTask from './pages/PostTask';
import MyTasks from './pages/MyTasks';
import BrowseTasks from './pages/BrowseTasks';
import TaskDetails from './pages/TaskDetails';
import WonBids from './pages/WonBids';

// Loading component
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
);

// Dashboard redirect component
const DashboardRedirect = () => {
  const { user } = useAuth();
  
  if (user?.role === 'Provider') {
    return <Navigate to="/provider/dashboard" replace />;
  }
  
  return <Navigate to="/dashboard" replace />;
};

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/provider/:id" element={<ProviderProfile />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          
          {/* Protected customer routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute requiredRole="Customer">
                <CustomerDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Protected provider routes */}
          <Route 
            path="/provider/dashboard" 
            element={
              <ProtectedRoute requiredRole="Provider">
                <ProviderDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Protected general routes */}
          <Route 
            path="/messages" 
            element={
              <ProtectedRoute>
                <ChatInterface />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirect /app to appropriate dashboard */}
          <Route 
            path="/app" 
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            } 
          />
          
          {/* Placeholder routes for future implementation */}
          <Route path="/bookings" element={<div className="p-8 text-center">Bookings page coming soon...</div>} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/provider/profile" element={
            <ProtectedRoute requiredRole="Provider">
              <ProviderProfileEdit />
            </ProtectedRoute>
          } />
          <Route path="/provider/bookings" element={
            <ProtectedRoute requiredRole="Provider">
              <ProviderDashboard defaultTab="bookings" />
            </ProtectedRoute>
          } />
          <Route path="/provider/messages" element={<div className="p-8 text-center">Provider messages coming soon...</div>} />
          <Route path="/provider/subscription" element={
            <ProtectedRoute requiredRole="Provider">
              <SubscriptionPage />
            </ProtectedRoute>
          } />
          <Route path="/book/:id" element={<BookPage />} />
          <Route path="/chat" element={<ChatInterface />} />
          <Route path="/post-task" element={<ProtectedRoute requiredRole="Customer"><PostTask /></ProtectedRoute>} />
          <Route path="/my-tasks" element={
            <ProtectedRoute requiredRole="Customer">
              <MyTasks />
            </ProtectedRoute>
          } />
          <Route path="/browse-tasks" element={<ProtectedRoute requiredRole="Provider"><BrowseTasks /></ProtectedRoute>} />
          <Route path="/task/:id" element={<TaskDetails />} />
          <Route path="/provider/won-bids" element={
            <ProtectedRoute requiredRole="Provider">
              <WonBids />
            </ProtectedRoute>
          } />
          <Route path="/provider/profile/:id" element={<ProviderProfile />} />
          
          {/* 404 route */}
          <Route path="*" element={<div className="p-8 text-center">Page not found</div>} />
        </Routes>
      </Layout>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

