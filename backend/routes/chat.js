const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const Chat = require('../models/Chat');
const Customer = require('../models/Customer');
const Provider = require('../models/Provider');

const router = express.Router();

// Get or create a conversation between customer and provider
router.post('/conversations', authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const currentUserType = req.user.role;
    const { otherUserId } = req.body;

    if (!otherUserId) {
      return res.status(400).json({
        success: false,
        message: 'Other user ID is required'
      });
    }

    // Determine other user type
    let otherUserType;
    if (currentUserType === 'Customer') {
      otherUserType = 'Provider';
      // Verify other user exists as provider
      const provider = await Provider.findById(otherUserId);
      if (!provider) {
        return res.status(404).json({
          success: false,
          message: 'Provider not found'
        });
      }
    } else {
      otherUserType = 'Customer';
      // Verify other user exists as customer
      const customer = await Customer.findById(otherUserId);
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }
    }

    // Check if conversation already exists
    let chat = await Chat.findOne({
      'participants.userId': { $all: [currentUserId, otherUserId] }
    });

    if (!chat) {
      // Create new conversation
      chat = new Chat({
        participants: [
          { userId: currentUserId, userType: currentUserType },
          { userId: otherUserId, userType: otherUserType }
        ],
        messages: []
      });
      await chat.save();
    }

    res.json({
      success: true,
      conversationId: chat._id
    });

  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get list of conversations for the authenticated user
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Chat.find({
      'participants.userId': userId
    }).sort({ updatedAt: -1 });

    // Format conversations with participant details
    const formattedConversations = await Promise.all(
      conversations.map(async (chat) => {
        // Find the other participant
        const otherParticipant = chat.participants.find(
          p => p.userId.toString() !== userId.toString()
        );

        let otherUserDetails = null;
        if (otherParticipant) {
          if (otherParticipant.userType === 'Customer') {
            otherUserDetails = await Customer.findById(otherParticipant.userId)
              .select('name email profilePicture');
          } else {
            otherUserDetails = await Provider.findById(otherParticipant.userId)
              .select('name email profilePicture');
          }
        }

        return {
          conversationId: chat._id,
          otherUser: otherUserDetails,
          lastMessage: chat.lastMessage,
          updatedAt: chat.updatedAt
        };
      })
    );

    res.json({
      success: true,
      conversations: formattedConversations
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get messages for a specific conversation
router.get('/conversations/:conversationId/messages', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const conversationId = req.params.conversationId;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is part of this conversation
    const chat = await Chat.findOne({
      _id: conversationId,
      'participants.userId': userId
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or access denied'
      });
    }

    // Calculate pagination for messages (newest first)
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalMessages = chat.messages.length;
    
    // Get paginated messages (reverse order for newest first)
    const messages = chat.messages
      .slice(Math.max(0, totalMessages - skip - parseInt(limit)), totalMessages - skip)
      .reverse();

    res.json({
      success: true,
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalMessages,
        pages: Math.ceil(totalMessages / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Send a message in a conversation
router.post('/conversations/:conversationId/messages', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const userType = req.user.role;
    const conversationId = req.params.conversationId;
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    // Verify user is part of this conversation
    const chat = await Chat.findOne({
      _id: conversationId,
      'participants.userId': userId
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or access denied'
      });
    }

    // Create message
    const message = {
      sender: userId,
      senderType: userType,
      content: content.trim(),
      timestamp: new Date()
    };

    // Add message to chat and update last message
    chat.messages.push(message);
    chat.lastMessage = {
      content: content.trim(),
      timestamp: message.timestamp,
      sender: userId
    };

    await chat.save();

    res.status(201).json({
      success: true,
      message: message
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;

