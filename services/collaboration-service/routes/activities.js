const express = require('express');
const Activity = require('../models/Activity');
const { authMiddleware } = require('../../../shared');

const router = express.Router();

// Authentication middleware
const authCheck = authMiddleware(process.env.JWT_SECRET || 'fallback_secret');

// @route GET /api/activities/form/:formId
// @desc Get activity feed for a form
// @access Private
router.get('/form/:formId', authCheck, async (req, res) => {
  try {
    const { formId } = req.params;
    const { page = 1, limit = 20, action } = req.query;

    const query = { formId };
    
    if (action) {
      query.action = action;
    }

    const activities = await Activity.find(query)
      .populate('user', 'username firstName lastName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Activity.countDocuments(query);

    res.json({
      activities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ message: 'Server error fetching activities' });
  }
});

module.exports = router;