import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { 
  Search, 
  Star, 
  Shield, 
  Clock, 
  Users, 
  CheckCircle,
  ArrowRight,
  Wrench,
  Zap,
  Paintbrush,
  Hammer,
  Scissors,
  Baby
} from 'lucide-react';

const Home = () => {
  const services = [
    { name: 'Plumber', icon: Wrench, color: 'text-blue-600' },
    { name: 'Electrician', icon: Zap, color: 'text-yellow-600' },
    { name: 'Beautician', icon: Scissors, color: 'text-pink-600' },
    { name: 'Painter', icon: Paintbrush, color: 'text-purple-600' },
    { name: 'Carpenter', icon: Hammer, color: 'text-orange-600' },
    { name: 'Babysitter', icon: Baby, color: 'text-green-600' },
  ];

  const features = [
    {
      icon: Shield,
      title: 'Verified Providers',
      description: 'All service providers are verified and background checked for your safety.',
    },
    {
      icon: Star,
      title: 'Rated & Reviewed',
      description: 'Read genuine reviews from customers to make informed decisions.',
    },
    {
      icon: Clock,
      title: 'Quick Booking',
      description: 'Book services instantly and get connected with providers in minutes.',
    },
    {
      icon: Users,
      title: 'Local Experts',
      description: 'Connect with skilled professionals in your local area.',
    },
  ];

  const stats = [
    { number: '10,000+', label: 'Service Providers' },
    { number: '50,000+', label: 'Happy Customers' },
    { number: '100+', label: 'Cities Covered' },
    { number: '4.8/5', label: 'Average Rating' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Find Local Service
              <span className="text-primary block">Providers Near You</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Connect with trusted professionals for all your home and personal service needs. 
              From plumbers to beauticians, find the right expert in your area.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/signup">
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Services</h2>
            <p className="text-lg text-gray-600">Find the most requested services in your area</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Card key={service.name} className="text-center hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <Icon className={`w-12 h-12 mx-auto mb-4 ${service.color} group-hover:scale-110 transition-transform`} />
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
            <p className="text-lg text-gray-600">We make finding and booking local services simple and secure</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="text-center">
                  <CardContent className="p-6">
                    <Icon className="w-12 h-12 mx-auto mb-4 text-primary" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Get connected with local service providers in 3 simple steps</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Search & Browse</h3>
              <p className="text-gray-600">
                Search for the service you need and browse through verified providers in your area.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Compare & Book</h3>
              <p className="text-gray-600">
                Compare ratings, reviews, and prices. Book the provider that best fits your needs.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Service</h3>
              <p className="text-gray-600">
                Connect with your provider, get the service done, and leave a review for others.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Find Your Perfect Service Provider?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8">
            Join thousands of satisfied customers who found their ideal service providers through our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/signup">
                Sign Up Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

