const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: String,
  role: { type: String, enum: ['participant', 'host', 'admin'], default: 'participant' },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  plan: [{ type: String }],
  scans: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Scan' }],
  zoneCounts: { type: Map, of: Number, default: {} },
  reels: [{ type: String }]
}, { timestamps: true });

// Add indexes for improved query performance
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ xp: -1 });
UserSchema.index({ level: -1 });

module.exports = mongoose.model('User', UserSchema);
