const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const Customer = require('../models/Customer');
const Provider = require('../models/Provider');

const router = express.Router();

// Add provider to favorites
router.post('/favorites', authenticateToken, requireRole(['Customer']), async (req, res) => {
  try {
    const customerId = req.user._id;
    const { providerId } = req.body;
    if (!providerId) {
      return res.status(400).json({ success: false, message: 'Provider ID is required' });
    }
    const customer = await Customer.findByIdAndUpdate(
      customerId,
      { $addToSet: { favoriteProviders: providerId } },
      { new: true }
    );
    res.json({ success: true, favorites: customer.favoriteProviders });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Remove provider from favorites
router.delete('/favorites/:providerId', authenticateToken, requireRole(['Customer']), async (req, res) => {
  try {
    const customerId = req.user._id;
    const { providerId } = req.params;
    const customer = await Customer.findByIdAndUpdate(
      customerId,
      { $pull: { favoriteProviders: providerId } },
      { new: true }
    );
    res.json({ success: true, favorites: customer.favoriteProviders });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get customer's favorite providers
router.get('/favorites', authenticateToken, requireRole(['Customer']), async (req, res) => {
  try {
    const customerId = req.user._id;
    console.log('Getting favorites for customer:', customerId);

    const customer = await Customer.findById(customerId)
      .populate({
        path: 'favoriteProviders',
        select: '-password -otp -otpExpires'
      });

    console.log('Customer found:', customer ? 'Yes' : 'No');
    console.log('Favorite providers count:', customer?.favoriteProviders?.length || 0);
    console.log('Favorite providers:', customer?.favoriteProviders || []);

    res.json({
      success: true,
      favorites: customer.favoriteProviders || []
    });

  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;

