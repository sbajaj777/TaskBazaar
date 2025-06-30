const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participants: [{
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      required: true 
    },
    userType: { 
      type: String, 
      required: true, 
      enum: ['Customer', 'Provider'] 
    }
  }],
  messages: [{
    sender: { 
      type: mongoose.Schema.Types.ObjectId, 
      required: true 
    },
    senderType: { 
      type: String, 
      required: true, 
      enum: ['Customer', 'Provider'] 
    },
    content: { 
      type: String,
      required: true,
      trim: true
    },
    timestamp: { 
      type: Date, 
      default: Date.now 
    }
  }],
  lastMessage: {
    content: String,
    timestamp: Date,
    sender: mongoose.Schema.Types.ObjectId
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Chat', chatSchema);

