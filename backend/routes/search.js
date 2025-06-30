const express = require('express');
const Provider = require('../models/Provider');

const router = express.Router();

// Search and filter providers
router.get('/providers', async (req, res) => {
  try {
    const {
      category,
      city,
      area,
      minPrice,
      maxPrice,
      minRating,
      sortBy = 'averageRating',
      sortOrder = 'desc',
      page = 1,
      limit = 12,
      search
    } = req.query;

    // Build filter query
    const filter = { isVerified: true };

    // Text search across name and services
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { servicesOffered: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Category filter
    if (category) {
      filter.servicesOffered = { $in: [new RegExp(category, 'i')] };
    }

    // Location filters
    if (city) {
      filter['location.city'] = new RegExp(city, 'i');
    }

    if (area) {
      filter['location.area'] = new RegExp(area, 'i');
    }

    // Rating filter
    if (minRating) {
      filter.averageRating = { $gte: parseFloat(minRating) };
    }

    // Price filtering - check if any pricing entry falls within range
    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) priceFilter.$gte = parseFloat(minPrice);
      if (maxPrice) priceFilter.$lte = parseFloat(maxPrice);
      filter['pricing.price'] = priceFilter;
    }

    // Build sort query
    const sort = {};
    const validSortFields = ['averageRating', 'totalReviews', 'createdAt', 'name'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'averageRating';
    sort[sortField] = sortOrder === 'asc' ? 1 : -1;

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

    // Get unique cities and areas for filter options
    const cities = await Provider.distinct('location.city', { isVerified: true });
    const areas = await Provider.distinct('location.area', { isVerified: true });
    const services = await Provider.distinct('servicesOffered', { isVerified: true });

    res.json({
      success: true,
      providers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      filters: {
        cities: cities.filter(city => city),
        areas: areas.filter(area => area),
        services: services.filter(service => service)
      }
    });

  } catch (error) {
    console.error('Search providers error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get service categories
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      'plumber',
      'electrician',
      'beautician',
      'mehndi designer',
      'watchman',
      'babysitter',
      'carpenter',
      'painter',
      'maid',
      'sweeper',
      'cook',
      'driver',
      'gardener',
      'tutor',
      'cleaner'
    ];

    res.json({
      success: true,
      categories
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;

