import React from 'react';
import { Users, Shield, MapPin, Star, Wrench, Heart, Coins, Target, TrendingDown, Clock } from 'lucide-react';

const About = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    {/* Hero Section */}
    <div className="max-w-6xl mx-auto px-4 pt-16 pb-12">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
          Your Local Services,
          <span className="text-blue-600"> All in One Place</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Your trusted TaskBazaar platform where skilled professionals meet customers who need reliable, quality services right in their neighborhood. Post tasks, receive bids, and get the best deals!
        </p>
      </div>

      {/* Mission Statement */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
        <div className="text-center mb-8">
          <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
        </div>
        <p className="text-lg text-gray-700 leading-relaxed text-center max-w-4xl mx-auto">
          We believe every community deserves access to trusted, skilled professionals at competitive prices. Our platform bridges the gap between service providers and customers through innovative bidding, creating meaningful connections that strengthen local economies and build lasting relationships.
        </p>
      </div>

      {/* Unique Bidding Feature Highlight */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-8 text-white mb-16">
        <div className="text-center mb-8">
          <Coins className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Revolutionary Bidding System</h2>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Post your task and let professionals compete for your project with competitive bids. Get the best service at the best price!
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <Target className="w-12 h-12 mx-auto mb-3" />
            <h3 className="text-xl font-semibold mb-2">Post Your Task</h3>
            <p className="opacity-90">Describe what you need and set your requirements</p>
          </div>
          <div className="text-center">
            <TrendingDown className="w-12 h-12 mx-auto mb-3" />
            <h3 className="text-xl font-semibold mb-2">Receive Competitive Bids</h3>
            <p className="opacity-90">Professionals bid using BidCoins for your project</p>
          </div>
          <div className="text-center">
            <Star className="w-12 h-12 mx-auto mb-3" />
            <h3 className="text-xl font-semibold mb-2">Get Auto-Assigned</h3>
            <p className="opacity-90">Lowest bidder gets automatically assigned to your task</p>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Services We Connect</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[
            { name: 'Plumbers', icon: '🔧' },
            { name: 'Electricians', icon: '⚡' },
            { name: 'Carpenters', icon: '🔨' },
            { name: 'Beauticians', icon: '💄' },
            { name: 'Mehandi Artists', icon: '🎨' },
            { name: 'Cleaners', icon: '🧹' },
            { name: 'Gardeners', icon: '🌱' },
            { name: 'Cooks', icon: '👨‍🍳' }
          ].map((service, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center">
              <div className="text-3xl mb-3">{service.icon}</div>
              <h3 className="font-semibold text-gray-800">{service.name}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="bg-blue-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-7 h-7 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-3">Verified Professionals</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Every service provider goes through our verification process to ensure reliability and quality.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="bg-green-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
            <MapPin className="w-7 h-7 text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-3">Local Focus</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Find services right in your neighborhood. Support local businesses while getting convenient service.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="bg-purple-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
            <TrendingDown className="w-7 h-7 text-purple-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-3">Best Price Guaranteed</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Our automatic assignment to the lowest bidder ensures you always get the best competitive rates.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="bg-orange-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
            <Star className="w-7 h-7 text-orange-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-3">Quality Assured</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Read reviews, compare bids, and choose the best fit for your needs with our rating system.
          </p>
        </div>
      </div>

      {/* How It Works - Updated */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
        
        {/* For Customers */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-gray-800 mb-8 text-center">For Customers</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Post Your Task</h4>
              <p className="text-gray-600 text-sm">Describe your project requirements, location, and budget expectations.</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Receive Bids</h4>
              <p className="text-gray-600 text-sm">Qualified professionals submit competitive bids for your project.</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Auto-Assignment</h4>
              <p className="text-gray-600 text-sm">The lowest bidder gets automatically assigned to your task.</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">4</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Contact & Get Work Done</h4>
              <p className="text-gray-600 text-sm">Contact the assigned professional directly and enjoy quality service.</p>
            </div>
          </div>
        </div>

        {/* For Professionals */}
        <div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-8 text-center">For Service Providers</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Create Profile</h4>
              <p className="text-gray-600 text-sm">Build your professional profile with skills, experience, and portfolio.</p>
            </div>
            <div className="text-center">
              <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Browse Tasks</h4>
              <p className="text-gray-600 text-sm">Find relevant tasks posted by customers in your service area.</p>
            </div>
            <div className="text-center">
              <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Place Bids</h4>
              <p className="text-gray-600 text-sm">Use BidCoins to submit competitive proposals for projects you want.</p>
            </div>
            <div className="text-center">
              <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">4</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Win & Work</h4>
              <p className="text-gray-600 text-sm">Get selected for projects and build your reputation through quality work.</p>
            </div>
          </div>
        </div>
      </div>

      {/* BidCoin System Explanation */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-8 text-white mb-16">
        <div className="text-center mb-8">
          <Coins className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">BidCoin System</h2>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Our unique BidCoin system ensures serious, qualified bids while keeping the platform efficient and competitive.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white bg-opacity-80 rounded-xl p-6 text-center">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">1 BidCoin Per Bid</h3>
            <p className="opacity-90 text-gray-800">Each bid on a task costs 1 BidCoin,  ensuring professionals are serious about their proposals.</p>
          </div>
          <div className="bg-white bg-opacity-80 rounded-xl p-6 text-center">
            <div className="text-3xl mb-4">🎁</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">10 Free BidCoins</h3>
            <p className="opacity-90 text-gray-800">Every new service provider gets 10 free BidCoins to start bidding on projects immediately.</p>
          </div>
          <div className="bg-white bg-opacity-80 rounded-xl p-6 text-center">
            <div className="text-3xl mb-4">💳</div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Buy More Anytime</h3>
            <p className="opacity-90 text-gray-800">Providers can purchase additional BidCoins as needed to keep bidding on new projects.</p>
          </div>
        </div>
      </div>

      {/* For Service Providers */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center mb-16">
        <Wrench className="w-16 h-16 mx-auto mb-6 text-white" />
        <h2 className="text-3xl font-bold mb-4">Are You a Service Provider?</h2>
        <p className="text-xl mb-6 opacity-90">
          Join our community of trusted professionals and grow your business by bidding on local projects and connecting with customers.
        </p>
        <div className="grid md:grid-cols-3 gap-6 text-left">
          <div className="bg-white bg-opacity-80 rounded-lg p-4">
            <h3 className="font-semibold mb-2 text-gray-900">✓ Create Your Profile</h3>
            <p className="text-sm opacity-90 text-gray-800">Showcase your skills, experience, portfolio, and competitive rates</p>
          </div>
          <div className="bg-white bg-opacity-80 rounded-lg p-4">
            <h3 className="font-semibold mb-2 text-gray-900">✓ Bid on Projects</h3>
            <p className="text-sm opacity-90 text-gray-800">Use BidCoins to compete for tasks and win more customers</p>
          </div>
          <div className="bg-white bg-opacity-80 rounded-lg p-4">
            <h3 className="font-semibold mb-2 text-gray-900">✓ Build Your Reputation</h3>
            <p className="text-sm opacity-90 text-gray-800">Earn reviews, win projects, and grow your business consistently</p>
          </div>
        </div>
      </div>

      {/* Community Impact */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Building Stronger Communities</h2>
        <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
          Every connection made on our platform strengthens the local economy. When you choose local service providers through our competitive bidding system, you're not just getting quality work at great prices – you're supporting families, creating jobs, and building a more connected community where neighbors help neighbors thrive while ensuring fair market competition.
        </p>
      </div>
    </div>
  </div>
);

export default About;