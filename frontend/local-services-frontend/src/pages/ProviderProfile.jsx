import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { providerAPI, reviewAPI, customerAPI } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  MessageCircle, 
  Heart, 
  Calendar,
  User,
  Camera,
  Clock,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { ReviewForm } from '../components/ReviewForm';

const API_URL = "http://localhost:5000";

const currencyOptions = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
];

const ProviderProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchProviderData();
    if (isAuthenticated && user?.role === 'Customer') {
      checkFavoriteStatus();
    }
  }, [id, isAuthenticated, user]);

  const fetchProviderData = async () => {
    try {
      const providerRes = await providerAPI.getProvider(id);
      setProvider(providerRes.data.provider);
      try {
        const reviewsRes = await reviewAPI.getProviderReviews(id, { page: 1, limit: 10 });
        setReviews(reviewsRes.data.reviews || []);
      } catch (reviewErr) {
        setReviews([]);
        console.error('Error fetching reviews:', reviewErr);
      }
    } catch (error) {
      console.error('Error fetching provider data:', error);
      setProvider(null); // fallback to show not found
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const response = await customerAPI.getFavorites();
      const favorites = response.data.favorites || [];
      setIsFavorite(favorites.some(fav => fav._id === id));
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated || user?.role !== 'Customer') return;

    try {
      if (isFavorite) {
        await customerAPI.removeFromFavorites(id);
        setIsFavorite(false);
      } else {
        await customerAPI.addToFavorites(id);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : index < rating
            ? 'text-yellow-400 fill-current opacity-50'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  // Helper to get image URL
  const getImageUrl = (img) => {
    if (!img) return '';
    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('blob:')) return img;
    return `${API_URL}/uploads/${img}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Provider not found</h2>
          <p className="text-gray-600 mb-4">The provider you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/search">Back to Search</Link>
          </Button>
          {/* Debug: Show raw response if available */}
          <pre style={{marginTop: 20, color: 'red'}}>{JSON.stringify(provider, null, 2)}</pre>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6" asChild>
          <Link to="/search">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Provider Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start space-x-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage
                      src={provider.profilePicture?.startsWith('http')
                        ? provider.profilePicture
                        : provider.profilePicture
                        ? `${API_URL}/uploads/${provider.profilePicture}`
                        : ''}
                      alt={provider.name}
                    />
                    <AvatarFallback className="text-2xl">
                      {provider.name?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900">{provider.name}</h1>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-1">
                            {renderStars(provider.averageRating || 0)}
                            <span className="text-lg font-semibold ml-2">
                              {provider.averageRating?.toFixed(1) || '0.0'}
                            </span>
                            <span className="text-gray-600">
                              ({provider.totalReviews || 0} reviews)
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 mt-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">
                            {provider.location?.city}, {provider.location?.area}
                          </span>
                        </div>
                      </div>
                      
                      {isAuthenticated && user?.role === 'Customer' && (
                        <Button
                          variant={isFavorite ? 'default' : 'outline'}
                          onClick={toggleFavorite}
                        >
                          <Heart className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                          {isFavorite ? 'Favorited' : 'Add to Favorites'}
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      {provider.servicesOffered?.map((service, index) => (
                        <Badge key={index} variant="secondary">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="about" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About {provider.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">
                      {provider.bio || 'No description available.'}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-gray-700">Verified Provider</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-5 h-5 text-blue-500" />
                        <span className="text-gray-700">Quick Response</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="services" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Services & Pricing</CardTitle>
                    <CardDescription>
                      Professional services offered by {provider.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {provider.pricing?.length > 0 ? (
                      <div className="space-y-4">
                        {provider.pricing.map((service, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold text-gray-900">{service.service}</h4>
                                {service.description && (
                                  <p className="text-gray-600 text-sm mt-1">{service.description}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <span className="text-2xl font-bold text-primary">
                                  {currencyOptions.find(opt => opt.code === service.currency)?.symbol || '$'}{service.price}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        No service rates available. Contact the provider for pricing.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="gallery" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Work Gallery</CardTitle>
                    <CardDescription>
                      Sample work and portfolio by {provider.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {provider.sampleWorkPhotos && provider.sampleWorkPhotos.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {provider.sampleWorkPhotos.map((photo, index) => (
                          <div
                            key={index}
                            className="bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity flex flex-col items-center"
                            onClick={() => setSelectedImage(getImageUrl(photo.filename || photo))}
                          >
                            <img
                              src={getImageUrl(photo.filename || photo)}
                              alt={`Work sample ${index + 1}`}
                              className="w-full h-48 object-cover"
                            />
                            <div className="p-3 text-base font-semibold text-gray-800 bg-white rounded-b-lg shadow border-t border-gray-200 min-h-[2em] text-center w-full">
                              {photo.description || <span className="text-gray-400 italic">No description</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No work samples available yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reviews" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Reviews</CardTitle>
                    <CardDescription>
                      What customers say about {provider.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Customer Reviews */}
                    <div className="bg-white rounded-lg shadow p-6 mt-6">
                      <h2 className="text-xl font-semibold mb-2">Customer Reviews</h2>
                      <p className="text-gray-600 mb-4">What customers say about {provider.name}</p>
                      {reviews.length === 0 ? (
                        <div className="text-gray-500 mb-6">No reviews yet.</div>
                      ) : (
                        <div className="mb-6 space-y-4">
                          {reviews.map((review, idx) => (
                            <div key={review._id || idx} className="border-b pb-4">
                              <div className="flex items-center mb-1">
                                <span className="font-semibold mr-2">{review.customerName || 'Anonymous'}</span>
                                <span className="ml-2 text-xs text-gray-400">{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}</span>
                              </div>
                              <div className="text-gray-700">{review.comment || review.text}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      <h3 className="text-lg font-semibold mb-2">Leave a Review</h3>
                    </div>
                    {/* Review Form for Customers */}
                    {isAuthenticated && user?.role === 'Customer' && (
                      <ReviewForm 
                        providerId={provider._id} 
                        user={user} 
                        reviews={reviews} 
                        onReviewSubmit={fetchProviderData} 
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle>Contact {provider.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {provider.contactInfo && (
                  <a
                    href={`https://wa.me/${provider.contactInfo.replace(/\D/g, '')}?text=${encodeURIComponent('Hello, I am interested in your services!')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-block"
                  >
                    <Button variant="outline" className="w-full">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Send WhatsApp Message
                    </Button>
                  </a>
                )}
                {provider.contactInfo && (
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{provider.contactInfo}</span>
                  </div>
                )}
                {provider.email && (
                  <a
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(provider.email)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-block"
                  >
                    <Button variant="outline" className="w-full flex items-center justify-center">
                      <Mail className="w-4 h-4 mr-2" />
                      Gmail
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Provider Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Reviews</span>
                  <span className="font-semibold">{provider.totalReviews || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Rating</span>
                  <span className="font-semibold">{provider.averageRating?.toFixed(1) || '0.0'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Services Offered</span>
                  <span className="font-semibold">{provider.pricing?.length || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle>Service Area</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{provider.location?.city}, {provider.location?.area}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Serves customers in and around this area
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-full">
            <img
              src={selectedImage}
              alt="Work sample"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderProfile;

