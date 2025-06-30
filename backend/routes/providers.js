const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const Provider = require('../models/Provider');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const router = express.Router();

console.log('Razorpay Key ID:', process.env.RAZORPAY_KEY_ID);
console.log('Razorpay Key Secret:', process.env.RAZORPAY_KEY_SECRET ? 'Loaded' : 'Missing');

// Create or update provider profile
router.post('/profile', 
  authenticateToken, 
  requireRole(['Provider']),
  upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'sampleWorkPhotos', maxCount: 10 }
  ]),
  async (req, res) => {
    try {
      const providerId = req.user._id;
      const { 
        name, 
        contactInfo, 
        location, 
        servicesOffered, 
        pricing 
      } = req.body;

      // Prepare update data
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (contactInfo !== undefined) updateData.contactInfo = contactInfo;
      // Handle city/area fields for location
      if (req.body.city !== undefined || req.body.area !== undefined) {
        updateData.location = {
          city: req.body.city || '',
          area: req.body.area || ''
        };
      } else if (location !== undefined) {
        updateData.location = location;
      }
      if (servicesOffered !== undefined) {
        updateData.servicesOffered = Array.isArray(servicesOffered) 
          ? servicesOffered 
          : [servicesOffered];
      }
      if (pricing !== undefined) {
        let parsedPricing = typeof pricing === 'string' 
          ? JSON.parse(pricing) 
          : pricing;
        // Ensure each pricing item has a currency property
        parsedPricing = parsedPricing.map(item => ({
          ...item,
          currency: item.currency || 'USD'
        }));
        updateData.pricing = parsedPricing;
      }

      // Debug log: print pricing before saving
      console.log('Received pricing:', pricing);

      // Handle file uploads and descriptions
      let existingSampleWorkPhotos = [];
      if (req.body.existingSampleWorkPhotos) {
        // Parse existing photos sent as JSON strings
        if (Array.isArray(req.body.existingSampleWorkPhotos)) {
          existingSampleWorkPhotos = req.body.existingSampleWorkPhotos.map(item =>
            typeof item === 'string' ? JSON.parse(item) : item
          );
        } else if (typeof req.body.existingSampleWorkPhotos === 'string') {
          existingSampleWorkPhotos = [JSON.parse(req.body.existingSampleWorkPhotos)];
        }
      }
      if (req.files) {
        if (req.files.profilePicture) {
          updateData.profilePicture = req.files.profilePicture[0].filename;
        }
        if (req.files.sampleWorkPhotos) {
          let descriptions = req.body.sampleWorkPhotoDescriptions || [];
          if (typeof descriptions === 'string') {
            descriptions = [descriptions];
          }
          const newPhotos = req.files.sampleWorkPhotos.map((file, idx) => ({
            filename: file.filename,
            description: descriptions[idx] || ''
          }));
          updateData.sampleWorkPhotos = [...existingSampleWorkPhotos, ...newPhotos];
        } else {
          updateData.sampleWorkPhotos = existingSampleWorkPhotos;
        }
      } else {
        updateData.sampleWorkPhotos = existingSampleWorkPhotos;
      }

      // Update provider
      const updatedProvider = await Provider.findByIdAndUpdate(
        providerId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedProvider) {
        return res.status(404).json({
          success: false,
          message: 'Provider not found'
        });
      }

      // Return updated provider data without password
      const providerData = {
        id: updatedProvider._id,
        email: updatedProvider.email,
        role: updatedProvider.role,
        name: updatedProvider.name,
        contactInfo: updatedProvider.contactInfo,
        location: updatedProvider.location,
        servicesOffered: updatedProvider.servicesOffered,
        pricing: updatedProvider.pricing,
        profilePicture: updatedProvider.profilePicture,
        sampleWorkPhotos: updatedProvider.sampleWorkPhotos,
        averageRating: updatedProvider.averageRating,
        totalReviews: updatedProvider.totalReviews,
        isSubscribed: updatedProvider.isSubscribed,
        subscriptionEndDate: updatedProvider.subscriptionEndDate,
        updatedAt: updatedProvider.updatedAt
      };

      res.json({
        success: true,
        message: 'Provider profile updated successfully',
        provider: providerData
      });

    } catch (error) {
      console.error('Provider profile update error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

// Get current provider's profile
router.get('/profile', authenticateToken, requireRole(['Provider']), async (req, res) => {
  try {
    const provider = await Provider.findById(req.user._id).select('-password -otp -otpExpires');
    if (!provider) {
      return res.status(404).json({ success: false, message: 'Provider not found' });
    }
    res.json({ success: true, provider });
  } catch (error) {
    console.error('Get provider profile error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get current provider's BidCoin balance
router.get('/bidcoins', authenticateToken, requireRole(['Provider']), async (req, res) => {
  try {
    console.log('BidCoins route user:', req.user); // Debug log
    const provider = await Provider.findById(req.user._id);
    if (!provider) return res.status(404).json({ error: 'Provider not found.' });
    res.json({ bidCoins: provider.bidCoins });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch BidCoin balance.' });
  }
});

// Buy BidCoins (add to balance)
router.post('/bidcoins/buy', authenticateToken, requireRole(['Provider']), async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount < 1) return res.status(400).json({ error: 'Invalid amount.' });
    const provider = await Provider.findById(req.user._id);
    if (!provider) return res.status(404).json({ error: 'Provider not found.' });
    provider.bidCoins += amount;
    await provider.save();
    res.json({ bidCoins: provider.bidCoins });
  } catch (error) {
    res.status(500).json({ error: 'Failed to buy BidCoins.' });
  }
});

// Create Razorpay order for BidCoin purchase
router.post('/bidcoins/create-order', authenticateToken, requireRole(['Provider']), async (req, res) => {
  const { price } = req.body; // price in INR
  console.log('Received price for order:', price);
  // Use environment variables for Razorpay keys
  const Razorpay = require('razorpay');
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  try {
    const order = await razorpay.orders.create({
      amount: price * 100, // paise
      currency: 'INR',
      receipt: `bc_${Date.now()}`,
      payment_capture: 1,
    });
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (error) {
    console.error('Razorpay order error:', error);
    res.status(500).json({ error: 'Failed to create Razorpay order' });
  }
});

// Verify Razorpay payment and credit BidCoins
router.post('/bidcoins/verify-payment', authenticateToken, requireRole(['Provider']), async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bidCoins } = req.body;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  try {
    const generated_signature = crypto
      .createHmac('sha256', key_secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');
    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }
    const provider = await Provider.findById(req.user._id);
    provider.bidCoins += bidCoins;
    await provider.save();
    res.json({ success: true, bidCoins: provider.bidCoins });
  } catch (error) {
    console.error('Razorpay verify error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// Get specific provider's public profile
router.get('/:id', async (req, res) => {
  try {
    const providerId = req.params.id;

    const provider = await Provider.findById(providerId).select('-password -otp -otpExpires');

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    res.json({
      success: true,
      provider
    });

  } catch (error) {
    console.error('Get provider error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all providers (for search/filter)
router.get('/', async (req, res) => {
  try {
    const {
      category,
      city,
      area,
      minPrice,
      maxPrice,
      minRating,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    // Build filter query
    const filter = { isVerified: true };

    if (category) {
      filter.servicesOffered = { $in: [category] };
    }

    if (city) {
      filter['location.city'] = new RegExp(city, 'i');
    }

    if (area) {
      filter['location.area'] = new RegExp(area, 'i');
    }

    if (minRating) {
      filter.averageRating = { $gte: parseFloat(minRating) };
    }

    // Price filtering (check if any pricing entry falls within range)
    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) priceFilter.$gte = parseFloat(minPrice);
      if (maxPrice) priceFilter.$lte = parseFloat(maxPrice);
      filter['pricing.price'] = priceFilter;
    }

    // Build sort query
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const providers = await Provider.find(filter)
      .select('-password -otp -otpExpires')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Provider.countDocuments(filter);

    res.json({
      success: true,
      providers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get providers error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;

