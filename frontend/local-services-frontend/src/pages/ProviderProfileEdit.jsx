import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { providerAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Camera, 
  Plus, 
  X, 
  Save,
  Upload,
  Star,
  DollarSign,
  Trash2
} from 'lucide-react';

const getImageUrl = (img) => {
  if (!img) return '';
  if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('blob:')) return img;
  return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/uploads/${img}`;
};

const mapSampleWorkPhotosToWorkPhotos = (sampleWorkPhotos) => {
  if (!Array.isArray(sampleWorkPhotos)) return [];
  return sampleWorkPhotos.map(photo =>
    typeof photo === 'string'
      ? { file: null, preview: getImageUrl(photo), description: '' }
      : { file: null, preview: getImageUrl(photo.filename), description: photo.description || '' }
  );
};

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
  // Add more as needed
];

const ProviderProfileEdit = () => {
  console.log('ProviderProfileEdit loaded');
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [error, setError] = useState('');
  
  // Profile data state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    contactInfo: '',
    location: {
      city: '',
      area: ''
    },
    servicesOffered: [],
    pricing: [],
    profilePicture: '',
    sampleWorkPhotos: []
  });

  // Form states
  const [newService, setNewService] = useState('');
  const [newPricing, setNewPricing] = useState({
    service: '',
    price: '',
    currency: 'USD',
    description: ''
  });

  // Available services list
  const availableServices = [
    'Plumber', 'Electrician', 'Beautician', 'Mehndi Designer', 
    'Watchman', 'Babysitter', 'Carpenter', 'Painter', 'Maid', 
    'Sweeper', 'Gardener', 'Cook', 'Driver', 'Tutor', 'Cleaner'
  ];

  // Add new state for file uploads
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [workPhotos, setWorkPhotos] = useState([]);

  const profilePicInputRef = useRef(null);
  const workPhotoInputRef = useRef(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await providerAPI.getProfile();
      const provider = response.data.provider || {};
      setProfileData({
        ...provider,
        location: provider.location || { city: '', area: '' },
        servicesOffered: provider.servicesOffered || [],
        pricing: provider.pricing || [],
        profilePicture: provider.profilePicture || '',
        sampleWorkPhotos: provider.sampleWorkPhotos || []
      });
      setWorkPhotos(mapSampleWorkPhotosToWorkPhotos(provider.sampleWorkPhotos || []));
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile. Please try again or contact support.');
      // Use mock data for demo
      setProfileData({
        name: user?.name || 'John Smith',
        email: user?.email || 'john@example.com',
        contactInfo: '+1 (555) 123-4567',
        location: { city: 'New York', area: 'Manhattan' },
        servicesOffered: ['Plumber', 'Electrician'],
        pricing: [
          { service: 'Basic Plumbing', price: 50, description: 'Simple repairs and maintenance' },
          { service: 'Emergency Plumbing', price: 100, description: '24/7 emergency service' }
        ],
        profilePicture: '',
        sampleWorkPhotos: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const addService = () => {
    if (newService && !profileData.servicesOffered.includes(newService)) {
      setProfileData(prev => ({
        ...prev,
        servicesOffered: [...prev.servicesOffered, newService]
      }));
      setNewService('');
    }
  };

  const removeService = (service) => {
    setProfileData(prev => ({
      ...prev,
      servicesOffered: prev.servicesOffered.filter(s => s !== service)
    }));
  };

  const addPricing = () => {
    if (newPricing.service && newPricing.price) {
      console.log('Adding pricing:', newPricing);
      setProfileData(prev => ({
        ...prev,
        pricing: [...prev.pricing, { ...newPricing, price: parseFloat(newPricing.price), currency: newPricing.currency || 'USD' }]
      }));
      setNewPricing({ service: '', price: '', currency: 'USD', description: '' });
    }
  };

  const removePricing = (index) => {
    setProfileData(prev => ({
      ...prev,
      pricing: prev.pricing.filter((_, i) => i !== index)
    }));
  };

  const handleFileSelect = (file, type) => {
    if (type === 'profile') {
      setProfilePictureFile(file);
      setProfileData(prev => ({
        ...prev,
        profilePicture: URL.createObjectURL(file)
      }));
    } else if (type === 'work') {
      setWorkPhotos(prev => [
        ...prev,
        { file, preview: URL.createObjectURL(file), description: '' }
      ]);
    }
  };

  const handleWorkPhotoDescriptionChange = (index, value) => {
    setWorkPhotos(prev => prev.map((photo, i) => i === index ? { ...photo, description: value } : photo));
  };

  const removeWorkPhoto = (index) => {
    setWorkPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      setMessage({ type: '', content: '' });

      // Debug log: print pricing array before saving
      console.log('Saving pricing:', profileData.pricing);

      const formData = new FormData();
      formData.append('name', profileData.name);
      formData.append('email', profileData.email);
      formData.append('contactInfo', profileData.contactInfo);
      formData.append('city', profileData.location.city);
      formData.append('area', profileData.location.area);
      profileData.servicesOffered.forEach(service => formData.append('servicesOffered', service));
      formData.append('pricing', JSON.stringify(profileData.pricing));
      if (profilePictureFile) {
        formData.append('profilePicture', profilePictureFile);
      }
      // Send all existing and new photos
      workPhotos.forEach(photo => {
        if (photo.file) {
          formData.append('sampleWorkPhotos', photo.file);
          formData.append('sampleWorkPhotoDescriptions', photo.description);
        } else if (photo.preview) {
          // For existing photos, send filename and description
          formData.append('existingSampleWorkPhotos', JSON.stringify({ filename: photo.preview.split('/').pop(), description: photo.description }));
        }
      });

      const response = await providerAPI.updateProfile(formData);
      setProfileData(response.data.provider);
      setProfilePictureFile(null);
      setWorkPhotos(mapSampleWorkPhotosToWorkPhotos(response.data.provider.sampleWorkPhotos || []));
      updateUser({
        ...user,
        name: response.data.provider.name,
        email: response.data.provider.email
      });
      setMessage({ type: 'success', content: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ type: 'error', content: 'Failed to save profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-700 mb-2">{error}</h2>
          <Button asChild>
            <a href="/provider/dashboard">Back to Dashboard</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
          <p className="text-gray-600 mt-2">
            Update your provider information and showcase your services
          </p>
        </div>

        {/* Message Alert */}
        {message.content && (
          <Alert className={`mb-6 ${message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
            <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
              {message.content}
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Update your personal and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center space-x-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={getImageUrl(profileData.profilePicture)} />
                    <AvatarFallback className="text-lg">
                      {profileData.name?.charAt(0) || 'P'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button
                      variant="outline"
                      className="flex items-center space-x-2"
                      onClick={() => profilePicInputRef.current && profilePicInputRef.current.click()}
                    >
                      <Camera className="h-4 w-4" />
                      <span>Change Photo</span>
                    </Button>
                    <Input
                      id="profile-picture"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={profilePicInputRef}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(file, 'profile');
                      }}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Upload a professional photo (JPG, PNG)
                    </p>
                  </div>
                </div>

                {/* Basic Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact">Contact Number</Label>
                    <Input
                      id="contact"
                      value={profileData.contactInfo}
                      onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={profileData.location?.city || ''}
                      onChange={(e) => handleInputChange('location.city', e.target.value)}
                      placeholder="Enter your city"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="area">Area/Neighborhood</Label>
                    <Input
                      id="area"
                      value={profileData.location?.area || ''}
                      onChange={(e) => handleInputChange('location.area', e.target.value)}
                      placeholder="Enter your area or neighborhood"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Services Offered</CardTitle>
                <CardDescription>
                  Select the services you provide to customers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add Service */}
                <div className="flex space-x-2">
                  <select
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select a service</option>
                    {availableServices
                      .filter(service => !profileData.servicesOffered.includes(service))
                      .map(service => (
                        <option key={service} value={service}>{service}</option>
                      ))
                    }
                  </select>
                  <Button onClick={addService} disabled={!newService}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>

                {/* Current Services */}
                <div className="space-y-2">
                  <Label>Current Services</Label>
                  <div className="flex flex-wrap gap-2">
                    {profileData.servicesOffered.map((service) => (
                      <Badge key={service} variant="secondary" className="flex items-center space-x-1">
                        <span>{service}</span>
                        <button
                          onClick={() => removeService(service)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  {profileData.servicesOffered.length === 0 && (
                    <p className="text-gray-500 text-sm">No services added yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Pricing</CardTitle>
                <CardDescription>
                  Set your rates for different services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Input
                    placeholder="Service name"
                    value={newPricing.service}
                    onChange={(e) => setNewPricing(prev => ({ ...prev, service: e.target.value }))}
                  />
                  <Input
                    type="number"
                    placeholder="Price"
                    value={newPricing.price}
                    onChange={(e) => setNewPricing(prev => ({ ...prev, price: e.target.value }))}
                  />
                  <select
                    value={newPricing.currency}
                    onChange={e => setNewPricing(prev => ({ ...prev, currency: e.target.value }))}
                    className="px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {currencyOptions.map(opt => (
                      <option key={opt.code} value={opt.code}>{opt.symbol} {opt.code} - {opt.name}</option>
                    ))}
                  </select>
                  <Input
                    placeholder="Description (optional)"
                    value={newPricing.description}
                    onChange={(e) => setNewPricing(prev => ({ ...prev, description: e.target.value }))}
                  />
                  <Button onClick={addPricing} disabled={!newPricing.service || !newPricing.price}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>

                {/* Current Pricing */}
                <div className="space-y-4">
                  <Label>Current Pricing</Label>
                  {profileData.pricing.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="font-semibold text-lg text-green-600 mr-2">
                            {currencyOptions.find(opt => opt.code === item.currency)?.symbol || '$'}{item.price}
                          </span>
                          <div>
                            <p className="font-medium">{item.service}</p>
                            <p className="text-sm text-gray-500">{item.description}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removePricing(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {profileData.pricing.length === 0 && (
                    <p className="text-gray-500 text-sm">No pricing information added yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Work Gallery</CardTitle>
                <CardDescription>
                  Showcase your work with photos of completed projects
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Upload Button */}
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    ref={workPhotoInputRef}
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      files.forEach(file => handleFileSelect(file, 'work'));
                    }}
                  />
                  <Button
                    variant="outline"
                    className="flex items-center space-x-2"
                    onClick={() => workPhotoInputRef.current && workPhotoInputRef.current.click()}
                  >
                    <Upload className="h-4 w-4" />
                    <span>Upload Work Photos</span>
                  </Button>
                  <p className="text-sm text-gray-500 mt-1">
                    Upload photos of your completed work (JPG, PNG)
                  </p>
                </div>

                {/* Photo Gallery */}
                {workPhotos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {workPhotos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={photo.preview}
                          alt={`Work sample ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <textarea
                          className="w-full mt-2 p-1 border rounded text-sm"
                          placeholder="Add a description..."
                          value={photo.description}
                          onChange={e => handleWorkPhotoDescriptionChange(index, e.target.value)}
                        />
                        <button
                          onClick={() => removeWorkPhoto(index)}
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {workPhotos.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No work photos uploaded yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end mt-8">
          <Button onClick={saveProfile} disabled={saving} size="lg">
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProviderProfileEdit;

