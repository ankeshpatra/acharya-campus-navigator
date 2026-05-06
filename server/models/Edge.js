const mongoose = require('mongoose');

const edgeSchema = new mongoose.Schema({
  from: {
    type: String,
    required: true,
    index: true,
  },
  to: {
    type: String,
    required: true,
    index: true,
  },
  distance: {
    type: Number,
    required: true,
    min: 0,
  },
}, { timestamps: true });

// Compound index for efficient lookups
edgeSchema.index({ from: 1, to: 1 }, { unique: true });

module.exports = mongoose.model('Edge', edgeSchema);
