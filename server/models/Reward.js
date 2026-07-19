const mongoose = require('mongoose');
const crypto = require('crypto');

const RewardSchema = new mongoose.Schema({
  title: String,
  cost: Number,
  qrCode: {
    type: String,
    unique: true,
    default: () => crypto.randomBytes(16).toString('hex')
  },
  redeemed: {
    type: Boolean,
    default: false
  },
  redeemedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  redeemedAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Add indexes for improved query performance
RewardSchema.index({ qrCode: 1 });
RewardSchema.index({ redeemed: 1 });
RewardSchema.index({ redeemedBy: 1 });
RewardSchema.index({ createdBy: 1 });
RewardSchema.index({ cost: 1 });

module.exports = mongoose.model('Reward', RewardSchema);
