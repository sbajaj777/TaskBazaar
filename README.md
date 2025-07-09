# Local Services Marketplace

A complete full-stack web application that connects customers with local service providers. Built with React (frontend), Node.js/Express (backend), and MongoDB (database).

<p align="center">
  🔗 <a href="https://taskbazaar-1.onrender.com/" target="_blank"><strong>Live Demo</strong></a>
</p>


## 🚀 Features

### For Customers
- **User Registration & Authentication**: Email-based signup/login with OTP verification
- **Service Search & Filtering**: Find providers by service type, location, rating, and price
- **Provider Profiles**: View detailed provider information, ratings, reviews, and work samples
- **Real-time Chat**: Direct messaging with service providers
- **Booking Management**: Track past and active service bookings
- **Reviews & Ratings**: Leave feedback for completed services
- **Favorites**: Save preferred service providers

### For Service Providers
- **Provider Dashboard**: Comprehensive dashboard to manage business
- **Profile Management**: Upload photos, set service rates, manage availability
- **Booking Management**: Accept/decline bookings, track earnings
- **Real-time Chat**: Communicate with customers
- **Subscription Management**: Monthly subscription plans with multiple payment options
- **Performance Analytics**: View ratings, reviews, and business metrics

### Payment Integration
- **Multiple Payment Gateways**: Razorpay (India), Stripe (International), PayPal
- **Subscription Management**: Automated monthly billing for providers
- **Secure Transactions**: PCI-compliant payment processing

### Technical Features
- **Real-time Communication**: Socket.IO for instant messaging
- **Responsive Design**: Mobile-first design that works on all devices
- **Email Notifications**: Automated email notifications for bookings and updates
- **File Upload**: Support for profile pictures and work sample uploads
- **Search & Filter**: Advanced search with multiple filter options
- **Role-based Access**: Separate interfaces for customers and providers

## 🛠 Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **React Router** for navigation
- **Axios** for API calls
- **Socket.IO Client** for real-time features

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Socket.IO** for real-time communication
- **Multer** for file uploads
- **Nodemailer** for email notifications
- **bcryptjs** for password hashing

### Payment Gateways
- **Razorpay** (Indian market)
- **Stripe** (International)
- **PayPal** (Alternative international option)

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **MongoDB** (v7.0 or higher)
- **npm** or **pnpm** package manager
- **Git** for version control

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd local-services-marketplace
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your configuration
nano .env
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend/local-services-frontend

# Install dependencies
pnpm install

# Create environment file
cp .env.example .env

# Edit .env file with your configuration
nano .env
```

### 4. Database Setup

```bash
# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify MongoDB is running
sudo systemctl status mongod
```

### 5. Start the Application

```bash
# Terminal 1: Start Backend Server
cd backend
npm start

# Terminal 2: Start Frontend Development Server
cd frontend/local-services-frontend
pnpm run dev
```

### 6. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## ⚙️ Environment Configuration

### Backend Environment Variables (.env)

```env
# Database
MONGODB_URI=mongodb://localhost:27017/local-services-marketplace

# JWT
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production

# Email Configuration (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Payment Gateway Keys (Use test keys for development)
# Razorpay
RAZORPAY_KEY_ID=rzp_test_1234567890
RAZORPAY_KEY_SECRET=test_secret_key_here

# Stripe
STRIPE_SECRET_KEY=sk_test_1234567890
STRIPE_PUBLISHABLE_KEY=pk_test_1234567890

# PayPal
PAYPAL_CLIENT_ID=test_client_id
PAYPAL_CLIENT_SECRET=test_client_secret
PAYPAL_MODE=sandbox

# Firebase (for push notifications)
FIREBASE_SERVER_KEY=your-firebase-server-key

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend Environment Variables (.env)

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Socket.IO Configuration
VITE_SOCKET_URL=http://localhost:5000
```

## 📁 Project Structure

```
local-services-marketplace/
├── backend/                    # Node.js/Express backend
│   ├── models/                # MongoDB models
│   ├── routes/                # API routes
│   ├── middleware/            # Custom middleware
│   ├── utils/                 # Utility functions
│   ├── uploads/               # File upload directory
│   ├── server.js              # Main server file
│   ├── package.json           # Backend dependencies
│   └── .env.example           # Environment template
├── frontend/                  # React frontend
│   └── local-services-frontend/
│       ├── src/
│       │   ├── components/    # React components
│       │   ├── pages/         # Page components
│       │   ├── contexts/      # React contexts
│       │   ├── lib/           # Utility libraries
│       │   └── App.jsx        # Main app component
│       ├── package.json       # Frontend dependencies
│       └── .env.example       # Environment template
├── architecture_design.md     # System architecture documentation
├── README.md                  # This file
└── DEPLOYMENT.md              # Deployment instructions
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/verify-otp` - OTP verification
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Providers
- `GET /api/providers` - Get all providers
- `GET /api/providers/:id` - Get provider by ID
- `PUT /api/providers/profile` - Update provider profile
- `POST /api/providers/upload` - Upload files

### Search
- `GET /api/search/providers` - Search providers with filters
- `GET /api/search/categories` - Get service categories

### Bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings` - Get user bookings
- `PUT /api/bookings/:id` - Update booking status

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/:providerId` - Get provider reviews

### Chat
- `GET /api/chat/conversations` - Get user conversations
- `POST /api/chat/conversations` - Create conversation
- `GET /api/chat/:chatId/messages` - Get chat messages
- `POST /api/chat/:chatId/messages` - Send message

### Payments
- `POST /api/payments/create-order` - Create payment order
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/subscription` - Get subscription status

## 🧪 Testing

### Backend Testing

```bash
# Test API health
curl -X GET http://localhost:5000/api/health

# Test user registration
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "Customer"
  }'
```

### Frontend Testing

1. Open http://localhost:5173
2. Test user registration and login
3. Test search functionality
4. Test provider profiles
5. Test real-time chat

## 🚀 Production Deployment

### Using Docker (Recommended)

```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Manual Deployment

1. **Prepare Production Environment**
   - Set up MongoDB on production server
   - Configure environment variables for production
   - Set up SSL certificates
   - Configure domain and DNS

2. **Build Frontend**
   ```bash
   cd frontend/local-services-frontend
   pnpm run build
   ```

3. **Deploy Backend**
   ```bash
   cd backend
   npm install --production
   pm2 start server.js --name "local-services-api"
   ```

4. **Serve Frontend**
   - Use Nginx or Apache to serve built frontend files
   - Configure reverse proxy for API calls

## 🔒 Security Considerations

- **Environment Variables**: Never commit .env files to version control
- **JWT Secrets**: Use strong, unique secrets in production
- **Database**: Enable MongoDB authentication in production
- **HTTPS**: Always use HTTPS in production
- **CORS**: Configure CORS properly for production domains
- **Rate Limiting**: Implement rate limiting for API endpoints
- **Input Validation**: All user inputs are validated and sanitized

## 📝 Service Categories

The application supports the following service categories:

- **Home Services**: Plumber, Electrician, Carpenter, Painter, Cleaner
- **Personal Services**: Beautician, Mehndi Designer, Massage Therapist
- **Care Services**: Babysitter, Elder Care, Pet Care
- **Security**: Watchman, Security Guard
- **Maintenance**: AC Repair, Appliance Repair, Gardener

## 💳 Payment Gateway Setup

### Razorpay (India)
1. Create account at https://razorpay.com
2. Get API keys from dashboard
3. Configure webhook URLs for payment verification

### Stripe (International)
1. Create account at https://stripe.com
2. Get API keys from dashboard
3. Configure webhook endpoints

### PayPal
1. Create developer account at https://developer.paypal.com
2. Create application and get client credentials
3. Configure IPN (Instant Payment Notification)

## 📧 Email Configuration

The application uses Nodemailer for sending emails. Configure SMTP settings:

### Gmail Setup
1. Enable 2-factor authentication
2. Generate app-specific password
3. Use app password in EMAIL_PASS environment variable

### Other Email Providers
Configure SMTP settings according to your email provider's documentation.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information
4. Contact the development team

## 🔄 Version History

- **v1.0.0** - Initial release with core features
  - User authentication and authorization
  - Provider search and filtering
  - Real-time chat functionality
  - Payment gateway integration
  - Responsive web design

## 🎯 Future Enhancements

- Mobile app development (React Native)
- Advanced analytics dashboard
- Multi-language support
- Video calling integration
- AI-powered service recommendations
- Advanced booking calendar
- Service provider verification system
- Customer loyalty programs

