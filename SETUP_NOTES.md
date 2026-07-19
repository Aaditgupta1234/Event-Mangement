# 🚨 IMPORTANT SETUP NOTES

## MongoDB Setup Required

MongoDB is NOT currently installed on this system. You have two options:

### Option 1: Install MongoDB Locally (Recommended for Development)

1. **Download MongoDB Community Server**: https://www.mongodb.com/try/download/community
2. **Install** following the installation wizard
3. **Start MongoDB**:
   ```powershell
   # MongoDB should start automatically as a service
   # Or manually start it:
   net start MongoDB
   ```
4. **Run the seed script**:
   ```powershell
   cd server
   npm run seed
   ```

### Option 2: Use MongoDB Atlas (Cloud)

1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get your connection string
4. Update `server/.env`:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/festifyxr
   ```
5. Run the seed script

## Quick Start (After MongoDB Setup)

```powershell
# 1. Seed the database
cd server
npm run seed

# 2. Start backend (in one terminal)
cd server
npm run dev

# 3. Install frontend dependencies and start (in another terminal)
cd client
npm install
npm run dev
```

## Current Configuration

- **Backend**: Configured and ready (dependencies installed)
- **Frontend**: Ready to install and run
- **Database**: ❌ MongoDB needs to be installed

## Testing Without Full Setup

If you want to test the backend structure without MongoDB:

1. The server will start but database operations will fail
2. Review code structure and API routes
3. Run tests (mock database not yet configured)

## Login Credentials (After Seeding)

- **Admin**: admin@festifyxr.com / admin123
- **User**: user@festifyxr.com / user123
- **Demo**: alex@example.com / demo123
