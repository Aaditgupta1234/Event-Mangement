const mongoose = require('mongoose');
const ZoneSchema = new mongoose.Schema({
  name: String,
  x: Number,
  y: Number,
  description: String,
  icon: String,
  mapQuery: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Add indexes for improved query performance
ZoneSchema.index({ createdBy: 1 });
ZoneSchema.index({ name: 'text', description: 'text' });
ZoneSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Zone', ZoneSchema);
