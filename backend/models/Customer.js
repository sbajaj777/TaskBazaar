const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
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
    default: 'Customer' 
  },
  name: { 
    type: String,
    trim: true
  },
  contactInfo: { 
    type: String,
    trim: true
  },
  location: {
    city: { 
      type: String,
      trim: true
    },
    area: { 
      type: String,
      trim: true
    }
  },
  favoriteProviders: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Provider' 
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Customer', customerSchema);

