const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    incidentDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'assigned', 'in_progress', 'resolved', 'rejected'],
      default: 'submitted'
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    adminNotes: {
      type: String,
      default: ''
    },
    personnelNotes: {
      type: String,
      default: ''
    },
    residentNotes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Incident', incidentSchema);
