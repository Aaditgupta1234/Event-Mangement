require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Event = require('../models/Event');
const Zone = require('../models/Zone');
const Reward = require('../models/Reward');
const User = require('../models/User');
const logger = require('../utils/logger');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/festifyxr';

// Sample data
const events = [
    {
        title: 'EDM Night',
        time: 'Today 8:00 PM',
        venue: 'Main Stage',
        tag: 'music',
        points: 15,
        desc: 'High-energy set with guest DJ featuring top electronic music artists.'
    },
    {
        title: 'Robo Wars',
        time: 'Today 2:00 PM',
        venue: 'LT-2 Arena',
        tag: 'tech',
        points: 20,
        desc: 'Robots battle in the arena with fierce competition.'
    },
    {
        title: 'Hackathon Finals',
        time: 'Tomorrow 11:00 AM',
        venue: 'Auditorium',
        tag: 'tech',
        points: 25,
        desc: 'Top teams pitch their innovative solutions to expert judges.'
    },
    {
        title: 'Comedy Night',
        time: 'Tomorrow 7:30 PM',
        venue: 'Open Air Theatre',
        tag: 'fun',
        points: 10,
        desc: 'Standup comedy acts from talented campus comedians.'
    },
    {
        title: 'Food Fest',
        time: 'Today 12:00 PM',
        venue: 'Food Court',
        tag: 'food',
        points: 8,
        desc: 'Delicious food stalls from around the city offering diverse cuisines.'
    },
    {
        title: 'Drone Show',
        time: 'Tomorrow 8:45 PM',
        venue: 'Football Ground',
        tag: 'show',
        points: 18,
        desc: 'Spectacular light formations in the sky with synchronized drones.'
    },
    {
        title: 'Fashion Show',
        time: 'Tomorrow 6:00 PM',
        venue: 'Main Stage',
        tag: 'entertainment',
        points: 12,
        desc: 'Student designers showcase their creative collections.'
    },
    {
        title: 'Battle of Bands',
        time: 'Today 5:00 PM',
        venue: 'Main Stage',
        tag: 'music',
        points: 15,
        desc: 'Rock bands compete for the ultimate music championship.'
    }
];

const zones = [
    {
        name: 'Main Stage',
        x: 18,
        y: 18,
        description: 'The main performance area with capacity for 5000+ people',
        icon: '🎵',
        mapQuery: 'Main Stage Thapar University'
    },
    {
        name: 'Food Court',
        x: 58,
        y: 24,
        description: 'Multiple food stalls offering various cuisines',
        icon: '🍔',
        mapQuery: 'Food Court Thapar University'
    },
    {
        name: 'LT-2 Arena',
        x: 14,
        y: 62,
        description: 'Technical competition venue with modern facilities',
        icon: '🤖',
        mapQuery: 'LT-2 Arena Thapar University'
    },
    {
        name: 'Auditorium',
        x: 53,
        y: 66,
        description: 'Indoor venue for presentations and talks',
        icon: '🎤',
        mapQuery: 'Auditorium Thapar University'
    },
    {
        name: 'Open Air Theatre',
        x: 78,
        y: 44,
        description: 'Open Air Theatre for cultural performances',
        icon: '🎭',
        mapQuery: 'Open Air Theatre Thapar University'
    },
    {
        name: 'Football Ground',
        x: 85,
        y: 75,
        description: 'Large outdoor space for sports and mega events',
        icon: '⚽',
        mapQuery: 'Football Ground Thapar University'
    }
];

const rewards = [
    { title: 'Free Coffee', cost: 30 },
    { title: 'Festival T-Shirt', cost: 50 },
    { title: 'Merch ₹100 Off', cost: 60 },
    { title: 'VIP Lounge Access', cost: 80 },
    { title: 'Backstage Pass', cost: 120 },
    { title: 'Meet & Greet with Artist', cost: 150 },
    { title: 'Festival Hoodie', cost: 100 },
    { title: 'Premium Food Voucher', cost: 40 }
];

const users = [
    {
        name: 'Admin User',
        email: 'admin@festifyxr.com',
        password: 'FestifyAdmin2026!',
        role: 'admin'
    },
    {
        name: 'Test Participant',
        email: 'user@festifyxr.com',
        password: 'user123',
        role: 'participant',
        xp: 150,
        level: 2
    },
    {
        name: 'Alex Chen',
        email: 'alex@example.com',
        password: 'demo123',
        role: 'participant',
        xp: 250,
        level: 3
    },
    {
        name: 'Priya Sharma',
        email: 'priya@example.com',
        password: 'demo123',
        role: 'participant',
        xp: 180,
        level: 2
    },
    {
        name: 'Mike Johnson',
        email: 'mike@example.com',
        password: 'demo123',
        role: 'participant',
        xp: 320,
        level: 4
    }
];

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGO_URI);
        logger.info('Connected to MongoDB for seeding');

        // Clear existing data
        await Event.deleteMany({});
        await Zone.deleteMany({});
        await Reward.deleteMany({});
        await User.deleteMany({});
        logger.info('Cleared existing data');

        // Insert events
        const createdEvents = await Event.insertMany(events);
        logger.info(`Created ${createdEvents.length} events`);

        // Insert zones
        const createdZones = await Zone.insertMany(zones);
        logger.info(`Created ${createdZones.length} zones`);

        // Insert rewards
        const createdRewards = await Reward.insertMany(rewards);
        logger.info(`Created ${createdRewards.length} rewards`);

        // Insert users with hashed passwords
        const usersWithHashedPasswords = await Promise.all(
            users.map(async (user) => ({
                ...user,
                password: await bcrypt.hash(user.password, 12)
            }))
        );
        const createdUsers = await User.insertMany(usersWithHashedPasswords);
        logger.info(`Created ${createdUsers.length} users`);

        logger.info('Database seeded successfully!');
        logger.info('='.repeat(50));
        logger.info('Test Accounts:');
        logger.info('Admin - email: admin@festifyxr.com, password: FestifyAdmin2026!');
        logger.info('User - email: user@festifyxr.com, password: user123');
        logger.info('Demo - email: alex@example.com, password: demo123');
        logger.info('='.repeat(50));

        process.exit(0);
    } catch (error) {
        logger.error('Error seeding database', { error: error.message, stack: error.stack });
        process.exit(1);
    }
}

seedDatabase();
