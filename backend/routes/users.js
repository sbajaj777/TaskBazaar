const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const Customer = require('../models/Customer');
const Provider = require('../models/Provider');

const router = express.Router();

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    // Return user data without password and OTP
    const userData = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      contactInfo: user.contactInfo,
      location: user.location,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    // Add role-specific fields
    if (user.role === 'Customer') {
      userData.favoriteProviders = user.favoriteProviders;
    } else if (user.role === 'Provider') {
      userData.servicesOffered = user.servicesOffered;
      userData.pricing = user.pricing;
      userData.profilePicture = user.profilePicture;
      userData.sampleWorkPhotos = user.sampleWorkPhotos;
      userData.averageRating = user.averageRating;
      userData.totalReviews = user.totalReviews;
      userData.isSubscribed = user.isSubscribed;
      userData.subscriptionEndDate = user.subscriptionEndDate;
    }

    res.json({
      success: true,
      user: userData
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update current user profile
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, contactInfo, location } = req.body;

    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (contactInfo !== undefined) updateData.contactInfo = contactInfo;
    if (location !== undefined) updateData.location = location;

    // Find and update user in appropriate collection
    let updatedUser;
    if (req.user.role === 'Customer') {
      updatedUser = await Customer.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      );
    } else if (req.user.role === 'Provider') {
      updatedUser = await Provider.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      );
    }

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return updated user data without password
    const userData = {
      id: updatedUser._id,
      email: updatedUser.email,
      role: updatedUser.role,
      name: updatedUser.name,
      contactInfo: updatedUser.contactInfo,
      location: updatedUser.location,
      isVerified: updatedUser.isVerified,
      updatedAt: updatedUser.updatedAt
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: userData
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;

