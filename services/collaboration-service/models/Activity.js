const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  formId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Form'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  action: {
    type: String,
    required: true,
    enum: [
      'form_created',
      'form_updated',
      'form_deleted',
      'form_published',
      'form_unpublished',
      'collaborator_added',
      'collaborator_removed',
      'comment_added',
      'comment_resolved',
      'response_received',
      'response_reviewed'
    ]
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  metadata: {
    ipAddress: String,
    userAgent: String
  }
}, {
  timestamps: true
});

// Index for better query performance
activitySchema.index({ formId: 1, createdAt: -1 });
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ action: 1 });

module.exports = mongoose.model('Activity', activitySchema);