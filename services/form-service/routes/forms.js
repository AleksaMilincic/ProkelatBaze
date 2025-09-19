const express = require('express');
const Joi = require('joi');
const Form = require('../models/Form');
const { authMiddleware } = require('../../../shared');

const router = express.Router();

// Authentication middleware for this service
const authCheck = authMiddleware(process.env.JWT_SECRET || 'fallback_secret');

// Validation schemas
const formSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow(''),
  fields: Joi.array().items(Joi.object({
    type: Joi.string().valid('text', 'textarea', 'select', 'checkbox', 'radio', 'number', 'email', 'date', 'file').required(),
    label: Joi.string().required(),
    name: Joi.string().required(),
    placeholder: Joi.string().allow(''),
    required: Joi.boolean(),
    options: Joi.array().items(Joi.object({
      value: Joi.string(),
      label: Joi.string()
    })),
    validation: Joi.object({
      min: Joi.number(),
      max: Joi.number(),
      pattern: Joi.string(),
      message: Joi.string()
    }),
    order: Joi.number()
  })),
  settings: Joi.object({
    isPublic: Joi.boolean(),
    allowAnonymous: Joi.boolean(),
    collectResponses: Joi.boolean(),
    showResponseSummary: Joi.boolean(),
    closeAt: Joi.date(),
    maxResponses: Joi.number()
  })
});

// @route GET /api/forms
// @desc Get all forms for the authenticated user
// @access Private
router.get('/', authCheck, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const query = {
      $or: [
        { creator: req.user.userId },
        { 'collaborators.userId': req.user.userId }
      ]
    };

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      });
    }

    const forms = await Form.find(query)
      .populate('creator', 'username firstName lastName')
      .populate('collaborators.userId', 'username firstName lastName')
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Form.countDocuments(query);

    res.json({
      forms,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get forms error:', error);
    res.status(500).json({ message: 'Server error fetching forms' });
  }
});

// @route GET /api/forms/:id
// @desc Get a specific form
// @access Private/Public (based on form settings)
router.get('/:id', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id)
      .populate('creator', 'username firstName lastName')
      .populate('collaborators.userId', 'username firstName lastName');

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Check permissions
    const authHeader = req.header('Authorization');
    if (!form.settings.isPublic && !authHeader) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const { verifyToken } = require('../../../shared');
        const decoded = verifyToken(token, process.env.JWT_SECRET || 'fallback_secret');
        
        const hasAccess = form.creator.toString() === decoded.userId ||
          form.collaborators.some(collab => collab.userId.toString() === decoded.userId);
        
        if (!form.settings.isPublic && !hasAccess) {
          return res.status(403).json({ message: 'Access denied' });
        }
      } catch (error) {
        if (!form.settings.isPublic) {
          return res.status(401).json({ message: 'Invalid token' });
        }
      }
    }

    res.json({ form });
  } catch (error) {
    console.error('Get form error:', error);
    res.status(500).json({ message: 'Server error fetching form' });
  }
});

// @route POST /api/forms
// @desc Create a new form
// @access Private
router.post('/', authCheck, async (req, res) => {
  try {
    const { error } = formSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const form = new Form({
      ...req.body,
      creator: req.user.userId
    });

    await form.save();

    const populatedForm = await Form.findById(form._id)
      .populate('creator', 'username firstName lastName');

    res.status(201).json({
      message: 'Form created successfully',
      form: populatedForm
    });
  } catch (error) {
    console.error('Create form error:', error);
    res.status(500).json({ message: 'Server error creating form' });
  }
});

// @route PUT /api/forms/:id
// @desc Update a form
// @access Private
router.put('/:id', authCheck, async (req, res) => {
  try {
    const { error } = formSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Check permissions
    const isCreator = form.creator.toString() === req.user.userId;
    const isEditor = form.collaborators.some(
      collab => collab.userId.toString() === req.user.userId && 
      ['editor', 'admin'].includes(collab.role)
    );

    if (!isCreator && !isEditor) {
      return res.status(403).json({ message: 'Access denied' });
    }

    Object.assign(form, req.body);
    await form.save();

    const updatedForm = await Form.findById(form._id)
      .populate('creator', 'username firstName lastName')
      .populate('collaborators.userId', 'username firstName lastName');

    res.json({
      message: 'Form updated successfully',
      form: updatedForm
    });
  } catch (error) {
    console.error('Update form error:', error);
    res.status(500).json({ message: 'Server error updating form' });
  }
});

// @route DELETE /api/forms/:id
// @desc Delete a form
// @access Private
router.delete('/:id', authCheck, async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Only creator can delete
    if (form.creator.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the creator can delete this form' });
    }

    await Form.findByIdAndDelete(req.params.id);

    res.json({ message: 'Form deleted successfully' });
  } catch (error) {
    console.error('Delete form error:', error);
    res.status(500).json({ message: 'Server error deleting form' });
  }
});

// @route POST /api/forms/:id/collaborators
// @desc Add collaborator to form
// @access Private
router.post('/:id/collaborators', authCheck, async (req, res) => {
  try {
    const { userId, role = 'viewer' } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const form = await Form.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Only creator or admin collaborators can add new collaborators
    const isCreator = form.creator.toString() === req.user.userId;
    const isAdmin = form.collaborators.some(
      collab => collab.userId.toString() === req.user.userId && collab.role === 'admin'
    );

    if (!isCreator && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if user is already a collaborator
    const existingCollab = form.collaborators.find(
      collab => collab.userId.toString() === userId
    );

    if (existingCollab) {
      return res.status(400).json({ message: 'User is already a collaborator' });
    }

    form.collaborators.push({ userId, role });
    await form.save();

    const updatedForm = await Form.findById(form._id)
      .populate('creator', 'username firstName lastName')
      .populate('collaborators.userId', 'username firstName lastName');

    res.json({
      message: 'Collaborator added successfully',
      form: updatedForm
    });
  } catch (error) {
    console.error('Add collaborator error:', error);
    res.status(500).json({ message: 'Server error adding collaborator' });
  }
});

module.exports = router;