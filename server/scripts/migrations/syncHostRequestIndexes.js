require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('../../utils/logger');
const HostRequest = require('../../models/HostRequest');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/festifyxr';

async function run() {
    try {
        await mongoose.connect(MONGO_URI, {
            maxPoolSize: 10,
        });

        logger.info('Connected to MongoDB for HostRequest index migration');

        await HostRequest.syncIndexes();

        const indexes = await HostRequest.collection.indexes();
        logger.info('HostRequest indexes synced', { indexes });

        await mongoose.connection.close();
        logger.info('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        logger.error('HostRequest index migration failed', { error: error.message, stack: error.stack });
        try {
            await mongoose.connection.close();
        } catch (closeError) {
            logger.warn('Failed to close MongoDB connection cleanly', { error: closeError.message });
        }
        process.exit(1);
    }
}

run();