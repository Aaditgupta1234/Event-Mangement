const mongoose = require('mongoose');
const EventSchema = new mongoose.Schema({
  title: String,
  time: String,
  venue: String,
  tag: String,
  points: Number,
  desc: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Add indexes for improved query performance
EventSchema.index({ tag: 1 });
EventSchema.index({ createdBy: 1 });
EventSchema.index({ createdAt: -1 });
EventSchema.index({ title: 'text', desc: 'text' });

module.exports = mongoose.model('Event', EventSchema);
