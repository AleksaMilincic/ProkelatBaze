const mongoose = require('mongoose');

const formFieldSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['text', 'textarea', 'select', 'checkbox', 'radio', 'number', 'email', 'date', 'file']
  },
  label: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  placeholder: String,
  required: {
    type: Boolean,
    default: false
  },
  options: [{
    value: String,
    label: String
  }],
  validation: {
    min: Number,
    max: Number,
    pattern: String,
    message: String
  },
  order: {
    type: Number,
    default: 0
  }
});

const formSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  fields: [formFieldSchema],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  collaborators: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['viewer', 'editor', 'admin'],
      default: 'viewer'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  settings: {
    isPublic: {
      type: Boolean,
      default: false
    },
    allowAnonymous: {
      type: Boolean,
      default: true
    },
    collectResponses: {
      type: Boolean,
      default: true
    },
    showResponseSummary: {
      type: Boolean,
      default: false
    },
    closeAt: Date,
    maxResponses: Number
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'closed', 'archived'],
    default: 'draft'
  },
  responseCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
formSchema.index({ creator: 1, status: 1 });
formSchema.index({ 'collaborators.userId': 1 });
formSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Form', formSchema);