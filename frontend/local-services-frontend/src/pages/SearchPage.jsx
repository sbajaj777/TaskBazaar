import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Search, 
  MapPin, 
  Star, 
  Heart, 
  Phone, 
  MessageCircle,
  User
} from 'lucide-react';
import { searchAPI, customerAPI } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

const API_URL = "http://localhost:5000";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);
  
  // Search filters
  const [filters, setFilters] = useState({
    search: searchParams.get('query') || '',
    city: searchParams.get('city') || '',
    area: searchParams.get('area') || ''
  });

  const { user, isAuthenticated } = useAuth();

  // Fetch favorites on mount
  useEffect(() => {
    customerAPI.getFavorites()
      .then(res => {
        setFavorites(res.data.favorites?.map(fav => fav._id) || []);
      })
      .catch(() => setFavorites([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    searchAPI.searchProviders(filters)
      .then(res => {
        setProviders(res.data.providers || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filters]);

  const updateFilter = (key, value) => {
    // Map 'query' to 'search' for the backend
    const mappedKey = key === 'query' ? 'search' : key;
    setFilters(prev => ({ ...prev, [mappedKey]: value }));
    
    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const toggleFavorite = async (providerId) => {
    if (!isAuthenticated || user?.role !== 'Customer') {
      alert('You must be logged in as a customer to use favorites.');
      return;
    }
    try {
      if (favorites.includes(providerId)) {
        await customerAPI.removeFavorite(providerId);
        setFavorites(favorites.filter(id => id !== providerId));
      } else {
        await customerAPI.addFavorite(providerId);
        setFavorites([...favorites, providerId]);
      }
    } catch (error) {
      alert('Failed to update favorites. Please try again.');
    }
  };

  const renderProviderCard = (provider) => (
    <Card key={provider._id} className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            {provider.profilePicture ? (
              <img
                src={provider.profilePicture.startsWith('http')
                  ? provider.profilePicture
                  : `${API_URL}/uploads/${provider.profilePicture}`}
                alt={provider.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-primary" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {provider.name}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">
                      {provider.averageRating?.toFixed(1) || '0.0'}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({provider.totalReviews || 0} reviews)
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 mt-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {provider.location?.city}, {provider.location?.area}
                  </span>
                </div>
              </div>
              {isAuthenticated && user?.role === 'Customer' && (
                <Button variant="ghost" size="sm" onClick={() => toggleFavorite(provider._id)}>
                  <Heart className={`w-4 h-4 ${favorites.includes(provider._id) ? 'fill-primary text-primary' : ''}`} />
                </Button>
              )}
            </div>
            
            <div className="mt-3">
              <div className="flex flex-wrap gap-2">
                {provider.servicesOffered?.slice(0, 3).map((service, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {service}
                  </Badge>
                ))}
                {provider.servicesOffered?.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{provider.servicesOffered.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
            
            {provider.serviceRates?.length > 0 && (
              <div className="mt-2">
                <span className="text-sm text-gray-600">Starting from </span>
                <span className="font-semibold text-primary">
                  ₹{Math.min(...provider.serviceRates.map(rate => rate.price))}
                </span>
              </div>
            )}
            
            <div className="flex space-x-2 mt-4">
              <Button size="sm" asChild>
                <Link to={`/provider/${provider._id}`}>View Profile</Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Service Providers</h1>
          
          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="What service do you need?"
                value={filters.search}
                onChange={(e) => updateFilter('query', e.target.value)}
                className="h-12"
              />
            </div>
            <div className="flex-1">
              <Input
                type="text"
                placeholder="City"
                value={filters.city}
                onChange={(e) => updateFilter('city', e.target.value)}
                className="h-12"
              />
            </div>
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Area"
                value={filters.area}
                onChange={(e) => updateFilter('area', e.target.value)}
                className="h-12"
              />
            </div>
            <Button size="lg" className="h-12 px-8" onClick={() => {}}>
              <Search className="w-5 h-5 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* Results */}
        <div>
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {loading ? 'Searching...' : `${providers.length} providers found`}
              </h2>
              {filters.search && (
                <p className="text-gray-600">Results for "{filters.search}"</p>
              )}
            </div>
          </div>

          {/* Results Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : providers.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No providers found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {providers.map(provider => renderProviderCard(provider))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;

