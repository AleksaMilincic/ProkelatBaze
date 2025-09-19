const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  formId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Form'
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous submissions
  },
  submittedByEmail: {
    type: String,
    required: false // For anonymous submissions
  },
  answers: [{
    fieldName: {
      type: String,
      required: true
    },
    fieldLabel: {
      type: String,
      required: true
    },
    fieldType: {
      type: String,
      required: true
    },
    value: mongoose.Schema.Types.Mixed, // Can store any type of value
    files: [{ // For file uploads
      filename: String,
      originalName: String,
      mimeType: String,
      size: Number,
      url: String
    }]
  }],
  submissionData: {
    ipAddress: String,
    userAgent: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  status: {
    type: String,
    enum: ['submitted', 'reviewed', 'flagged', 'archived'],
    default: 'submitted'
  },
  review: {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    notes: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
responseSchema.index({ formId: 1, createdAt: -1 });
responseSchema.index({ submittedBy: 1 });
responseSchema.index({ submittedByEmail: 1 });
responseSchema.index({ status: 1 });

module.exports = mongoose.model('Response', responseSchema);