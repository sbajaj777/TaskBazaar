const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const Booking = require('../models/Booking');
const Provider = require('../models/Provider');
const Customer = require('../models/Customer');
const { sendEmail } = require('../utils/email');

const router = express.Router();

// Create a new booking
router.post('/', authenticateToken, requireRole(['Customer']), async (req, res) => {
  try {
    const customerId = req.user._id;
    const { providerId, service, bookingDate, price, description } = req.body;

    // Validate input
    if (!providerId || !service || !bookingDate) {
      return res.status(400).json({
        success: false,
        message: 'Provider ID, service, and booking date are required'
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

    // Create booking
    const booking = new Booking({
      customerId,
      providerId,
      service,
      bookingDate: new Date(bookingDate),
      price,
      description
    });

    await booking.save();

    // Populate booking with customer and provider details
    const populatedBooking = await Booking.findById(booking._id)
      .populate('customerId', 'name email contactInfo')
      .populate('providerId', 'name email contactInfo location');

    // Send notification emails
    try {
      // Email to provider
      await sendEmail(
        provider.email,
        'New Booking Request',
        `
        <h2>New Booking Request</h2>
        <p>You have received a new booking request:</p>
        <ul>
          <li><strong>Customer:</strong> ${req.user.name || req.user.email}</li>
          <li><strong>Service:</strong> ${service}</li>
          <li><strong>Date:</strong> ${new Date(bookingDate).toLocaleDateString()}</li>
          <li><strong>Price:</strong> ${price ? `₹${price}` : 'To be discussed'}</li>
          ${description ? `<li><strong>Description:</strong> ${description}</li>` : ''}
        </ul>
        <p>Please log in to your account to manage this booking.</p>
        `
      );

      // Email to customer
      await sendEmail(
        req.user.email,
        'Booking Confirmation',
        `
        <h2>Booking Confirmation</h2>
        <p>Your booking request has been submitted successfully:</p>
        <ul>
          <li><strong>Provider:</strong> ${provider.name}</li>
          <li><strong>Service:</strong> ${service}</li>
          <li><strong>Date:</strong> ${new Date(bookingDate).toLocaleDateString()}</li>
          <li><strong>Status:</strong> Pending confirmation</li>
        </ul>
        <p>The provider will contact you soon to confirm the booking.</p>
        `
      );
    } catch (emailError) {
      console.error('Error sending booking emails:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: populatedBooking
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get customer's active bookings
router.get('/active', authenticateToken, requireRole(['Customer']), async (req, res) => {
  try {
    const customerId = req.user._id;

    const bookings = await Booking.find({
      customerId,
      status: { $in: ['pending', 'confirmed'] }
    })
    .populate('providerId', 'name email contactInfo location averageRating')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      bookings
    });

  } catch (error) {
    console.error('Get active bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get customer's past bookings
router.get('/past', authenticateToken, requireRole(['Customer']), async (req, res) => {
  try {
    const customerId = req.user._id;

    const bookings = await Booking.find({
      customerId,
      status: { $in: ['completed', 'cancelled'] }
    })
    .populate('providerId', 'name email contactInfo location averageRating')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      bookings
    });

  } catch (error) {
    console.error('Get past bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get provider's bookings
router.get('/provider', authenticateToken, requireRole(['Provider']), async (req, res) => {
  try {
    const providerId = req.user._id;
    const { status } = req.query;

    const filter = { providerId };
    if (status) {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate('customerId', 'name email contactInfo location')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      bookings
    });

  } catch (error) {
    console.error('Get provider bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update booking status (for providers)
router.put('/:id/status', authenticateToken, requireRole(['Provider']), async (req, res) => {
  try {
    const bookingId = req.params.id;
    const providerId = req.user._id;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Find and update booking
    const booking = await Booking.findOneAndUpdate(
      { _id: bookingId, providerId },
      { status },
      { new: true }
    ).populate('customerId', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Send notification email to customer
    try {
      const statusMessages = {
        confirmed: 'Your booking has been confirmed!',
        completed: 'Your booking has been marked as completed.',
        cancelled: 'Your booking has been cancelled.'
      };

      if (statusMessages[status]) {
        await sendEmail(
          booking.customerId.email,
          'Booking Status Update',
          `
          <h2>Booking Status Update</h2>
          <p>${statusMessages[status]}</p>
          <ul>
            <li><strong>Service:</strong> ${booking.service}</li>
            <li><strong>Date:</strong> ${booking.bookingDate.toLocaleDateString()}</li>
            <li><strong>Status:</strong> ${status.charAt(0).toUpperCase() + status.slice(1)}</li>
          </ul>
          `
        );
      }
    } catch (emailError) {
      console.error('Error sending status update email:', emailError);
    }

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      booking
    });

  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router; 