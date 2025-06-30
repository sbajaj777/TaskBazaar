import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  signup: (data) => api.post('/auth/signup', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadAvatar: (formData) => api.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// Provider API
export const providerAPI = {
  getProfile: () => api.get('/providers/profile'),
  updateProfile: (data) => api.post('/providers/profile', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getProvider: (id) => api.get(`/providers/${id}`),
  uploadProfilePicture: (formData) => api.post('/providers/profile-picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadWorkSamples: (formData) => api.post('/providers/work-samples', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateServices: (data) => api.put('/providers/services', data),
  updatePricing: (data) => api.put('/providers/pricing', data),
  getBidCoins: () => api.get('/providers/bidcoins'),
  buyBidCoins: (amount) => api.post('/providers/bidcoins/buy', { amount }),
  createBidCoinOrder: (price) => api.post('/providers/bidcoins/create-order', { price }),
  verifyBidCoinPayment: (data) => api.post('/providers/bidcoins/verify-payment', data),
};

// Customer API
export const customerAPI = {
  getProfile: () => api.get('/customers/profile'),
  updateProfile: (data) => api.put('/customers/profile', data),
  getFavorites: async () => {
    const response = await api.get('/customers/favorites');
    console.log('API getFavorites response:', response.data);
    return response;
  },
  addFavorite: (providerId) => api.post('/customers/favorites', { providerId }),
  removeFavorite: (providerId) => api.delete(`/customers/favorites/${providerId}`),
};

// Search API
export const searchAPI = {
  searchProviders: (params) => api.get('/search/providers', { params }),
  getServices: () => api.get('/search/services'),
  getLocations: () => api.get('/search/locations'),
};

// Booking API
export const bookingAPI = {
  createBooking: (data) => api.post('/bookings', data),
  getCustomerBookings: (params) => api.get('/bookings/customer', { params }),
  getProviderBookings: (params) => api.get('/bookings/provider', { params }),
  updateBookingStatus: (bookingId, data) => api.put(`/bookings/${bookingId}/status`, data),
  cancelBooking: (bookingId) => api.put(`/bookings/${bookingId}/cancel`),
};

// Review API
export const reviewAPI = {
  createReview: (data) => api.post('/reviews', data),
  getProviderReviews: (providerId, params) => api.get(`/reviews/${providerId}`, { params }),
  getCustomerReviews: (params) => api.get('/reviews/customer', { params }),
  updateReview: (reviewId, data) => api.put(`/reviews/${reviewId}`, data),
  deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}`),
};

// Chat API
export const chatAPI = {
  getConversations: () => api.get('/chat/conversations'),
  getMessages: (conversationId) => api.get(`/chat/${conversationId}/messages`),
  sendMessage: (conversationId, content) => api.post(`/chat/${conversationId}/messages`, { content }),
  createConversation: (data) => api.post('/chat/conversations', data),
  markAsRead: (conversationId) => api.put(`/chat/${conversationId}/read`),
};

// Payment API
export const paymentAPI = {
  createPaymentIntent: (data) => api.post('/payments/create-intent', data),
  confirmPayment: (data) => api.post('/payments/confirm', data),
  getPaymentHistory: (params) => api.get('/payments/history', { params }),
  getSubscriptionStatus: () => api.get('/payments/subscription/status'),
  createSubscription: (data) => api.post('/payments/subscribe', data),
  cancelSubscription: () => api.post('/payments/subscription/cancel'),
  updateSubscription: (data) => api.put('/payments/subscription/update', data),
};

export default api;

