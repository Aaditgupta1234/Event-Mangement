require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const logger = require('./utils/logger');

// Models
const User = require('./models/User');
const Event = require('./models/Event');
const Zone = require('./models/Zone');
const Reward = require('./models/Reward');
const BuddyResponse = require('./models/BuddyResponse');
const Announcement = require('./models/Announcement');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/festifyxr';

async function seedDatabase() {
    try {
        await mongoose.connect(MONGO_URI);
        logger.info('Connected to MongoDB');

        // Clear existing data
        await Promise.all([
            User.deleteMany({}),
            Event.deleteMany({}),
            Zone.deleteMany({}),
            Reward.deleteMany({}),
            BuddyResponse.deleteMany({}),
            Announcement.deleteMany({})
        ]);
        logger.info('Cleared existing data');

        // Seed Users
        const users = await User.insertMany([
            {
                name: 'Admin User',
                email: 'admin@festifyxr.com',
                password: await bcrypt.hash('FestifyAdmin2026!', 12),
                role: 'admin',
                xp: 1000,
                level: 10
            },
            {
                name: 'Test User',
                email: 'user@festifyxr.com',
                password: await bcrypt.hash('user123', 12),
                role: 'participant',
                xp: 250,
                level: 3
            },
            {
                name: 'Demo User',
                email: 'alex@example.com',
                password: await bcrypt.hash('demo123', 12),
                role: 'participant',
                xp: 500,
                level: 5
            }
        ]);
        logger.info(`Created ${users.length} users`);

        // Seed Events
        const events = await Event.insertMany([
            {
                title: 'Opening Ceremony',
                desc: 'Welcome to the festival! Join us for an amazing opening ceremony with performances and festivities.',
                time: '10:00 AM - 11:30 AM',
                venue: 'Main Stage',
                points: 50,
                tag: 'Music'
            },
            {
                title: 'Tech Workshop',
                desc: 'Learn the latest technologies and innovations in a hands-on workshop format.',
                time: '12:00 PM - 2:00 PM',
                venue: 'Lab 3',
                points: 30,
                tag: 'Tech'
            },
            {
                title: 'DJ Night',
                desc: 'Dance the night away with incredible DJ performances and light shows.',
                time: '8:00 PM - 12:00 AM',
                venue: 'Main Stage',
                points: 40,
                tag: 'Music'
            },
            {
                title: 'Food Festival',
                desc: 'Taste delicious cuisines from around the world at our food festival.',
                time: '11:00 AM - 3:00 PM',
                venue: 'Food Court',
                points: 25,
                tag: 'Food'
            },
            {
                title: 'Art Exhibition',
                desc: 'Explore stunning artworks from talented local and international artists.',
                time: '2:00 PM - 6:00 PM',
                venue: 'Art Gallery',
                points: 20,
                tag: 'Art'
            },
            {
                title: 'Sports Tournament',
                desc: 'Compete in exciting sports events and showcase your athletic skills.',
                time: '3:00 PM - 5:00 PM',
                venue: 'Sports Ground',
                points: 35,
                tag: 'Sports'
            }
        ]);
        logger.info(`Created ${events.length} events`);

        // Seed Zones
        const zones = await Zone.insertMany([
            {
                name: 'Main Stage',
                description: 'Primary performance venue for major acts and celebrations',
                icon: '🎪',
                x: 50,
                y: 20
            },
            {
                name: 'Food Court',
                description: 'Culinary hub with restaurants and food stalls',
                icon: '🍽️',
                x: 30,
                y: 50
            },
            {
                name: 'Tech Zone',
                description: 'Innovation and technology showcase area',
                icon: '💻',
                x: 70,
                y: 40
            },
            {
                name: 'Art Gallery',
                description: 'Exhibition space for creative works',
                icon: '🎨',
                x: 25,
                y: 75
            },
            {
                name: 'Sports Ground',
                description: 'Athletic competitions and games area',
                icon: '⚽',
                x: 75,
                y: 75
            },
            {
                name: 'VIP Lounge',
                description: 'Exclusive relaxation area for VIP guests',
                icon: '👑',
                x: 50,
                y: 80
            }
        ]);
        logger.info(`Created ${zones.length} zones`);

        // Seed Rewards
        const rewards = await Reward.insertMany([
            {
                title: 'Festival T-Shirt',
                cost: 100
            },
            {
                title: 'Food Voucher ($25)',
                cost: 150
            },
            {
                title: 'Merchandise Pack',
                cost: 200
            },
            {
                title: 'VIP Pass for Next Event',
                cost: 300
            },
            {
                title: 'Premium Merchandise',
                cost: 250
            },
            {
                title: 'Festival Hat',
                cost: 75
            }
        ]);
        logger.info(`Created ${rewards.length} rewards`);

        // Seed Buddy AI Responses
        const buddyResponses = await BuddyResponse.insertMany([
            {
                keyword: 'event',
                trigger: 'events',
                response: '🎪 You can check all upcoming events in the Events tab! We have DJ nights, tech workshops, food festivals, and much more. Browse through all events to find what interests you most!'
            },
            {
                keyword: 'xp',
                trigger: 'xp',
                response: '⭐ You can earn XP by:\n\n• Attending events (20-50 XP each)\n• Checking into zones (10 XP)\n• Completing challenges\n• Participating in activities\n\nYou currently have 0 XP at Level 1!'
            },
            {
                keyword: 'map',
                trigger: 'map',
                response: '🗺️ You can view the interactive campus map in the Map tab. It shows all zones and event locations. Just tap on any zone to see details and navigation!'
            },
            {
                keyword: 'reward',
                trigger: 'rewards',
                response: '🎁 Check out the Rewards page to see what you can redeem with your XP! We have merchandise, food vouchers, and VIP passes available!'
            },
            {
                keyword: 'help',
                trigger: 'general',
                response: 'I\'m here to help! Try asking me about:\n\n• Events and schedules 🎪\n• Earning XP and leveling up ⭐\n• Campus navigation 🗺️\n• Rewards and redemption 🎁\n\nWhat would you like to know?'
            }
        ]);
        logger.info(`Created ${buddyResponses.length} buddy responses`);

        // Seed Announcements
        const announcements = await Announcement.insertMany([
            {
                title: 'Food Court Happy Hour',
                content: '🍽️ Food Court happy hour 4–5 PM (double XP on scans!)',
                icon: '🍽️',
                priority: 'high',
                active: true
            },
            {
                title: 'Drone Show Rehearsal',
                content: '🚁 Drone Show rehearsal at 6 PM near Football Ground.',
                icon: '🚁',
                priority: 'medium',
                active: true
            },
            {
                title: 'Bonus Code Available',
                content: '🎟️ Use SAT-BONUS-25 once per user to get bonus XP!',
                icon: '🎟️',
                priority: 'high',
                active: true
            },
            {
                title: 'Check the Leaderboard',
                content: '🏆 Check out the Leaderboard to see top performers and compete with other users!',
                icon: '🏆',
                priority: 'low',
                active: true
            },
            {
                title: 'New Features Available',
                content: '✨ Explore Memory Reel to capture and share your festival moments!',
                icon: '✨',
                priority: 'medium',
                active: true
            }
        ]);
        logger.info(`Created ${announcements.length} announcements`);

        logger.info('✅ Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        logger.error('Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();
