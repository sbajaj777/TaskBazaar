import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, MessageCircle, Headphones, Users, Send, CheckCircle, Star, Globe, Shield, Zap } from 'lucide-react';

const Contact = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [hoveredCard, setHoveredCard] = useState(null);

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email',
      value: 'bajajshivam178@gmail.com',
      link: 'mailto:bajajshivam178@gmail.com',
      color: 'blue',
      description: 'Get detailed responses'
    },
    {
      icon: Phone,
      title: 'Phone',
      value: '+91 7728058141',
      link: 'tel:+917728058141',
      color: 'green',
      description: 'Immediate assistance'
    },
    {
      icon: MapPin,
      title: 'Location',
      value: 'Alwar, Rajasthan, India',
      link: '#',
      color: 'purple',
      description: 'Our home base'
    },
    {
      icon: Clock,
      title: 'Response Time',
      value: 'Within 24 hours',
      link: '#',
      color: 'orange',
      description: 'Fast support guaranteed'
    }
  ];

  const supportTypes = [
    {
      icon: Users,
      title: 'Customer Support',
      description: 'Help with bookings, payments, and general inquiries',
      color: 'blue'
    },
    {
      icon: Headphones,
      title: 'Service Provider Help',
      description: 'Registration, profile setup, and provider resources',
      color: 'green'
    },
    {
      icon: Shield,
      title: 'Trust & Safety',
      description: 'Report issues, disputes, and safety concerns',
      color: 'red'
    },
    {
      icon: Zap,
      title: 'Technical Support',
      description: 'App issues, bugs, and technical difficulties',
      color: 'yellow'
    }
  ];

  const faqs = [
    {
      category: 'general',
      question: 'How do I get started on the platform?',
      answer: 'Simply create an account, browse services in your area, and contact providers directly. For service providers, complete your profile verification to start receiving bookings.'
    },
    {
      category: 'general',
      question: 'Is the platform free to use?',
      answer: 'Browsing and contacting providers is completely free for customers. Service providers have access to basic listings at no cost, with premium features available.'
    },
    {
      category: 'providers',
      question: 'How do I create an attractive service profile?',
      answer: 'Use high-quality photos, write detailed service descriptions, set competitive pricing, highlight your experience and skills, and showcase any certifications or specializations you have.'
    },
    {
      category: 'providers',
      question: 'How do I get more bookings?',
      answer: 'Complete your profile, upload high-quality photos, maintain good ratings, respond quickly to inquiries, and keep your availability updated.'
    },
    {
      category: 'customers',
      question: 'How do I find the right service provider?',
      answer: 'Use filters for location, service type, ratings, and price range. Read reviews, check portfolios, and contact multiple providers to compare.'
    },
    {
      category: 'customers',
      question: 'What if I\'m not satisfied with a service?',
      answer: 'Contact our support team immediately. We have a resolution process and may offer refunds or credits depending on the situation.'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
      green: 'bg-green-100 text-green-600 hover:bg-green-200',
      purple: 'bg-purple-100 text-purple-600 hover:bg-purple-200',
      orange: 'bg-orange-100 text-orange-600 hover:bg-orange-200',
      red: 'bg-red-100 text-red-600 hover:bg-red-200',
      yellow: 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
    };
    return colors[color] || colors.blue;
  };

  const filteredFaqs = faqs.filter(faq => faq.category === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-x-auto">
      <div className="max-w-7xl w-full mx-auto py-8 px-2 sm:px-4 md:px-6 lg:px-8">
        
        {/* Header with floating animation */}
        <div className="text-center mb-10 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-3xl rounded-full transform -translate-y-8"></div>
          <div className="relative">
            <MessageCircle className="w-16 h-16 text-blue-600 mx-auto mb-4 drop-shadow-lg animate-pulse" />
            <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
              Let's Connect
            </h1>
            <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Whether you need support, want to join our marketplace, or have questions about our services, 
              we're here to help you succeed.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Contact Methods - Enhanced */}
          <div className="lg:col-span-1 mb-6 lg:mb-0">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-4 sm:p-8 h-fit sticky top-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Globe className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 text-blue-600" />
                Get in Touch
              </h2>
              <div className="space-y-4 md:space-y-6">
                {contactMethods.map((method, index) => {
                  const Icon = method.icon;
                  return (
                    <div 
                      key={index}
                      className="flex items-start space-x-3 md:space-x-4 p-3 md:p-4 rounded-xl hover:bg-gray-50 transition-all duration-300"
                    >
                      <div className={`p-2 md:p-3 rounded-full transition-all duration-300 ${getColorClasses(method.color)}`}>
                        <Icon className="w-5 h-5 md:w-6 md:h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1 text-sm md:text-base">
                          {method.title}
                        </h3>
                        {method.link.startsWith('mailto:') || method.link.startsWith('tel:') ? (
                          <a 
                            href={method.link} 
                            className="text-gray-700 hover:text-blue-600 transition-colors break-words block font-medium text-sm md:text-base"
                          >
                            {method.value}
                          </a>
                        ) : (
                          <span className="text-gray-700 break-words block font-medium text-sm md:text-base">
                            {method.value}
                          </span>
                        )}
                        <p className="text-xs text-gray-500 mt-1">{method.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Support Types */}
              <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4 md:mb-6 flex items-center text-base md:text-lg">
                  <Headphones className="w-4 h-4 md:w-5 md:h-5 mr-2 text-blue-600" />
                  Support Categories
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                  {supportTypes.map((support, index) => {
                    const Icon = support.icon;
                    return (
                      <div 
                        key={index}
                        className="group p-2 md:p-3 rounded-lg border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 cursor-pointer"
                      >
                        <Icon className={`w-4 h-4 md:w-5 md:h-5 mb-1 md:mb-2 ${getColorClasses(support.color).split(' ')[1]}`} />
                        <h4 className="font-medium text-xs md:text-sm text-gray-900 mb-1">{support.title}</h4>
                        <p className="text-xs text-gray-600 leading-tight">{support.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          {/* Contact Form - Single, Enhanced */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-4 sm:p-8">
              <div className="flex items-center mb-6 md:mb-8">
                <Send className="w-5 h-5 md:w-6 md:h-6 text-blue-600 mr-2 md:mr-3" />
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Send us a Message</h2>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 md:p-6 mb-4 md:mb-6">
                <div className="flex items-center text-blue-700 mb-1 md:mb-2">
                  <CheckCircle className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                  <span className="font-medium text-xs md:text-sm">Quick Response Guaranteed</span>
                </div>
                <p className="text-blue-600 text-xs md:text-sm">
                  We typically respond within 2-4 hours during business hours. For urgent matters, please call us directly.
                </p>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-inner border-2 border-gray-100">
                <div className="w-full" style={{ position: 'relative', paddingBottom: '150%', height: 0, overflow: 'hidden' }}>
                  <iframe 
                    src="https://docs.google.com/forms/d/e/1FAIpQLScNyas893acBcW77Si3mMNCZl-NUqO73dsiDuqDvydd9jsNvg/viewform?embedded=true" 
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    frameBorder="0" 
                    marginHeight="0" 
                    marginWidth="0" 
                    title="Contact Form"
                    className="w-full bg-white"
                  >
                    Loading…
                  </iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Enhanced FAQ Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-4 sm:p-8">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
              Find quick answers to common questions. Can't find what you're looking for? Contact us directly!
            </p>
          </div>
          {/* FAQ Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-6 md:mb-8">
            {[
              { id: 'general', label: 'General', icon: MessageCircle },
              { id: 'providers', label: 'For Providers', icon: Users },
              { id: 'customers', label: 'For Customers', icon: Star }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 md:px-6 py-2 md:py-3 rounded-full font-medium transition-all duration-300 text-xs md:text-base ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {filteredFaqs.map((faq, index) => (
              <div 
                key={index}
                className="group p-4 md:p-6 rounded-2xl border-2 border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
              >
                <h3 className="font-semibold text-gray-900 mb-2 md:mb-3 group-hover:text-blue-600 transition-colors text-base md:text-lg">
                  {faq.question}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;