const mongoose = require('mongoose');

const BuddyResponseSchema = new mongoose.Schema({
    keyword: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    trigger: {
        type: String,
        enum: ['events', 'xp', 'map', 'rewards', 'general'],
        default: 'general'
    },
    response: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('BuddyResponse', BuddyResponseSchema);
