const mongoose = require('mongoose');

const HostRequestSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    rejectionReason: String,
    requestedAt: { type: Date, default: Date.now },
    reviewedAt: Date,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

HostRequestSchema.index({ email: 1, status: 1 });
HostRequestSchema.index(
    { email: 1 },
    { unique: true, partialFilterExpression: { status: 'pending' } }
);

module.exports = mongoose.model('HostRequest', HostRequestSchema);
