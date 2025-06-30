const mongoose = require('mongoose');

const providerSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  },
  otp: { 
    type: String 
  },
  otpExpires: { 
    type: Date 
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  role: { 
    type: String, 
    default: 'Provider' 
  },
  name: { 
    type: String,
    trim: true // ✅ made optional
  },
  contactInfo: { 
    type: String,
    trim: true
  },
  location: {
    city: { 
      type: String,
      trim: true // ✅ made optional
    },
    area: { 
      type: String,
      trim: true // ✅ made optional
    }
  },
  servicesOffered: [{ 
    type: String,
    trim: true
  }],
  pricing: [{
    service: { 
      type: String,
      trim: true
    },
    price: { 
      type: Number,
      min: 0
    },
    description: { 
      type: String,
      trim: true
    },
    currency: {
      type: String,
      trim: true,
      default: 'USD'
    }
  }],
  profilePicture: { 
    type: String 
  },
  sampleWorkPhotos: [{ 
    filename: { type: String },
    description: { type: String, trim: true }
  }],
  averageRating: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: { 
    type: Number, 
    default: 0,
    min: 0
  },
  isSubscribed: { 
    type: Boolean, 
    default: false 
  },
  subscriptionEndDate: { 
    type: Date 
  },
  bidCoins: {
    type: Number,
    default: 10,
    min: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Provider', providerSchema);
