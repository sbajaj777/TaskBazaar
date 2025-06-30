const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const Review = require('../models/Review');
const Provider = require('../models/Provider');
const Booking = require('../models/Booking');

const router = express.Router();

// Submit a review and rating
router.post('/', authenticateToken, requireRole(['Customer']), async (req, res) => {
  try {
    const customerId = req.user._id;
    const { providerId, rating, comment } = req.body;

    // Validate input
    if (!providerId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Provider ID and rating are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if provider exists
    const provider = await Provider.findById(providerId);
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found'
      });
    }

    // Check if customer has completed booking with this provider
    const completedBooking = await Booking.findOne({
      customerId,
      providerId,
      status: 'completed',
    });
    if (!completedBooking) {
      return res.status(400).json({
        success: false,
        message: 'You can only review providers you have completed a booking with'
      });
    }

    // Check if customer has already reviewed this provider
    const existingReview = await Review.findOne({ customerId, providerId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this provider'
      });
    }

    // Create review
    const review = new Review({
      customerId,
      providerId,
      rating,
      comment
    });

    await review.save();

    // Update provider's average rating
    await updateProviderRating(providerId);

    // Populate review with customer details
    const populatedReview = await Review.findById(review._id)
      .populate('customerId', 'name');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review: populatedReview
    });

  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all reviews for a specific provider
router.get('/:providerId', async (req, res) => {
  try {
    const providerId = req.params.providerId;
    const { page = 1, limit = 10 } = req.query;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get reviews
    const reviews = await Review.find({ providerId })
      .populate('customerId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Review.countDocuments({ providerId });

    res.json({
      success: true,
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update a review (only by the customer who wrote it)
router.put('/:reviewId', authenticateToken, requireRole(['Customer']), async (req, res) => {
  try {
    const customerId = req.user._id;
    const reviewId = req.params.reviewId;
    const { rating, comment } = req.body;

    // Validate rating
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Find and update review
    const review = await Review.findOneAndUpdate(
      { _id: reviewId, customerId },
      { rating, comment },
      { new: true, runValidators: true }
    ).populate('customerId', 'name');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or you are not authorized to update it'
      });
    }

    // Update provider's average rating
    await updateProviderRating(review.providerId);

    res.json({
      success: true,
      message: 'Review updated successfully',
      review
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete a review (only by the customer who wrote it)
router.delete('/:reviewId', authenticateToken, requireRole(['Customer']), async (req, res) => {
  try {
    const customerId = req.user._id;
    const reviewId = req.params.reviewId;

    // Find and delete review
    const review = await Review.findOneAndDelete({ _id: reviewId, customerId });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or you are not authorized to delete it'
      });
    }

    // Update provider's average rating
    await updateProviderRating(review.providerId);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Helper function to update provider's average rating
async function updateProviderRating(providerId) {
  try {
    const reviews = await Review.find({ providerId });
    
    if (reviews.length === 0) {
      await Provider.findByIdAndUpdate(providerId, {
        averageRating: 0,
        totalReviews: 0
      });
    } else {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;
      
      await Provider.findByIdAndUpdate(providerId, {
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        totalReviews: reviews.length
      });
    }
  } catch (error) {
    console.error('Error updating provider rating:', error);
  }
}

module.exports = router;

