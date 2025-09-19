const express = require('express');
const Joi = require('joi');
const axios = require('axios');
const Response = require('../models/Response');
const { authMiddleware } = require('../../../shared');

const router = express.Router();

// Optional auth middleware - allows both authenticated and anonymous users
const optionalAuth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  
  if (authHeader) {
    try {
      const token = authHeader.replace('Bearer ', '');
      const { verifyToken } = require('../../../shared');
      const decoded = verifyToken(token, process.env.JWT_SECRET || 'fallback_secret');
      req.user = decoded;
    } catch (error) {
      // Invalid token, but continue as anonymous
      req.user = null;
    }
  }
  
  next();
};

// Required auth middleware
const authCheck = authMiddleware(process.env.JWT_SECRET || 'fallback_secret');

// Validation schema
const responseSchema = Joi.object({
  formId: Joi.string().required(),
  submittedByEmail: Joi.string().email().when('$user', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required()
  }),
  answers: Joi.array().items(Joi.object({
    fieldName: Joi.string().required(),
    fieldLabel: Joi.string().required(),
    fieldType: Joi.string().required(),
    value: Joi.alternatives().try(
      Joi.string(),
      Joi.number(),
      Joi.boolean(),
      Joi.array(),
      Joi.object()
    ),
    files: Joi.array().items(Joi.object({
      filename: Joi.string(),
      originalName: Joi.string(),
      mimeType: Joi.string(),
      size: Joi.number(),
      url: Joi.string()
    }))
  })).required()
});

// Helper function to verify form exists and is accessible
const verifyFormAccess = async (formId) => {
  try {
    const formResponse = await axios.get(`${process.env.FORM_SERVICE_URL}/api/forms/${formId}`);
    return formResponse.data.form;
  } catch (error) {
    throw new Error('Form not found or inaccessible');
  }
};

// @route POST /api/responses
// @desc Submit a new response
// @access Public/Private
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { error } = responseSchema.validate(req.body, { context: { user: req.user } });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { formId, submittedByEmail, answers } = req.body;

    // Verify form exists and is accessible
    let form;
    try {
      form = await verifyFormAccess(formId);
    } catch (error) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Check if form is still accepting responses
    if (form.status !== 'active') {
      return res.status(400).json({ message: 'Form is not accepting responses' });
    }

    if (form.settings.closeAt && new Date() > new Date(form.settings.closeAt)) {
      return res.status(400).json({ message: 'Form submission deadline has passed' });
    }

    if (form.settings.maxResponses && form.responseCount >= form.settings.maxResponses) {
      return res.status(400).json({ message: 'Form has reached maximum responses' });
    }

    // Check if anonymous submissions are allowed
    if (!req.user && !form.settings.allowAnonymous) {
      return res.status(401).json({ message: 'Authentication required for this form' });
    }

    // Create response object
    const responseData = {
      formId,
      answers,
      submissionData: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date()
      }
    };

    if (req.user) {
      responseData.submittedBy = req.user.userId;
    } else {
      responseData.submittedByEmail = submittedByEmail;
    }

    const response = new Response(responseData);
    await response.save();

    res.status(201).json({
      message: 'Response submitted successfully',
      responseId: response._id
    });
  } catch (error) {
    console.error('Submit response error:', error);
    res.status(500).json({ message: 'Server error submitting response' });
  }
});

// @route GET /api/responses/form/:formId
// @desc Get all responses for a form
// @access Private
router.get('/form/:formId', authCheck, async (req, res) => {
  try {
    const { formId } = req.params;
    const { page = 1, limit = 10, status, search } = req.query;

    const query = { formId };
    
    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { submittedByEmail: { $regex: search, $options: 'i' } },
        { 'answers.value': { $regex: search, $options: 'i' } }
      ];
    }

    const responses = await Response.find(query)
      .populate('submittedBy', 'username firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Response.countDocuments(query);

    res.json({
      responses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get responses error:', error);
    res.status(500).json({ message: 'Server error fetching responses' });
  }
});

module.exports = router;