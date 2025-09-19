const express = require('express');
const Joi = require('joi');
const Comment = require('../models/Comment');
const Activity = require('../models/Activity');
const { authMiddleware } = require('../../../shared');

const router = express.Router();

// Authentication middleware
const authCheck = authMiddleware(process.env.JWT_SECRET || 'fallback_secret');

// Validation schemas
const commentSchema = Joi.object({
  formId: Joi.string().required(),
  content: Joi.string().required(),
  mentions: Joi.array().items(Joi.object({
    userId: Joi.string(),
    username: Joi.string()
  })),
  parentComment: Joi.string().optional(),
  fieldReference: Joi.object({
    fieldName: Joi.string(),
    fieldLabel: Joi.string()
  }).optional()
});

// @route POST /api/comments
// @desc Add a new comment
// @access Private
router.post('/', authCheck, async (req, res) => {
  try {
    const { error } = commentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const comment = new Comment({
      ...req.body,
      author: req.user.userId
    });

    await comment.save();

    // Log activity
    const activity = new Activity({
      formId: req.body.formId,
      user: req.user.userId,
      action: 'comment_added',
      details: {
        commentId: comment._id,
        content: req.body.content.substring(0, 100) + (req.body.content.length > 100 ? '...' : '')
      },
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    await activity.save();

    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'username firstName lastName')
      .populate('mentions.userId', 'username firstName lastName');

    // Emit real-time event
    if (req.app.get('io')) {
      req.app.get('io').to(`form_${req.body.formId}`).emit('new_comment', populatedComment);
    }

    res.status(201).json({
      message: 'Comment added successfully',
      comment: populatedComment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error adding comment' });
  }
});

// @route GET /api/comments/form/:formId
// @desc Get all comments for a form
// @access Private
router.get('/form/:formId', authCheck, async (req, res) => {
  try {
    const { formId } = req.params;
    const { page = 1, limit = 20, resolved } = req.query;

    const query = { formId, parentComment: { $exists: false } };
    
    if (resolved !== undefined) {
      query.isResolved = resolved === 'true';
    }

    const comments = await Comment.find(query)
      .populate('author', 'username firstName lastName')
      .populate('mentions.userId', 'username firstName lastName')
      .populate('resolvedBy', 'username firstName lastName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentComment: comment._id })
          .populate('author', 'username firstName lastName')
          .populate('mentions.userId', 'username firstName lastName')
          .sort({ createdAt: 1 });
        
        return {
          ...comment.toObject(),
          replies
        };
      })
    );

    const total = await Comment.countDocuments(query);

    res.json({
      comments: commentsWithReplies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error fetching comments' });
  }
});

module.exports = router;