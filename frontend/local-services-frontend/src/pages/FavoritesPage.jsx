import React, { useEffect, useState } from 'react';
import { customerAPI, providerAPI } from '../lib/api';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';
import { User, Star, MapPin } from 'lucide-react';

const API_URL = "http://localhost:5000";

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const favRes = await customerAPI.getFavorites();
        const providers = favRes.data.favorites || [];
        setFavorites(providers);
        setLoading(false);
      } catch (error) {
        setFavorites([]);
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading favorites...</div>;
  }

  if (favorites.length === 0) {
    return <div className="p-8 text-center">You have no favorite providers yet.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Favorites</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map(provider => (
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
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{provider.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">{provider.averageRating?.toFixed(1) || '0.0'}</span>
                      <span className="text-sm text-gray-500">({provider.totalReviews || 0} reviews)</span>
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{provider.location?.city}, {provider.location?.area}</span>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button size="sm" asChild>
                        <Link to={`/provider/${provider._id}`}>View Profile</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage; 