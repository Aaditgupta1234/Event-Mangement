const mongoose = require('mongoose');
const ScanSchema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
  code: String,
  points: Number,
  time: {type: Date, default: Date.now}
});

// Add indexes for improved query performance
ScanSchema.index({ user: 1 });
ScanSchema.index({ code: 1 });
ScanSchema.index({ time: -1 });
ScanSchema.index({ user: 1, time: -1 });

module.exports = mongoose.model('Scan', ScanSchema);
