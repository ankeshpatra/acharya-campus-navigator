const mongoose = require('mongoose');

const nodeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['gate', 'block', 'junction'],
    required: true,
  },
  coordinates: {
    type: [Number],
    required: true,
    validate: {
      validator: (v) => v.length === 2,
      message: 'Coordinates must have exactly 2 values [lat, lng]',
    },
  },
  description: {
    type: String,
    default: '',
  },
}, { timestamps: true });

// Text index for search
nodeSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Node', nodeSchema);
