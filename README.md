# FestifyXR - Festival Companion Application

A modern festival management platform with gamification features, built with React and Node.js.

## 🚀 Features

- **User Authentication**: Secure signup/login with JWT tokens
- **Event Management**: Browse and manage festival events
- **Interactive Campus Map**: Navigate festival zones
- **Gamification**: Earn XP points and level up
- **QR Code Scanning**: Check-in at events and locations
- **Leaderboard**: Compete with other participants
- **Rewards System**: Redeem points for prizes
- **Admin Dashboard**: Manage events, zones, and rewards
- **Real-time Logging**: Comprehensive server-side logging

## 📋 Prerequisites

- Node.js 16+ and npm
- MongoDB (local or remote)
- Windows PowerShell (for Windows users)

## 🛠️ Installation

### 1. Clone and Install Dependencies

```powershell
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Setup MongoDB

Make sure MongoDB is running locally on `mongodb://localhost:27017` or update the connection string in server/.env

### 3. Configure Environment Variables

**Backend** (`server/.env`):

```env
PORT=4000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/festifyxr
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=info
```

**Frontend** (`client/.env`):

```env
VITE_API_URL=http://localhost:4000/api
```

### 4. Seed the Database

```powershell
cd server
npm run seed
```

This will create:

- Sample events, zones, and rewards
- Demo accounts:
  - Admin: `admin@festifyxr.com` / `admin123`
  - User: `user@festifyxr.com` / `user123`
  - Demo: `alex@example.com` / `demo123`

## 🏃‍♂️ Running the Application

### Start Backend Server

```powershell
cd server
npm run dev
```

Server will run on http://localhost:4000

### Start Frontend

```powershell
cd client
npm run dev
```

Frontend will run on http://localhost:5173

## 🧪 Testing

### Run Backend Tests

```powershell
cd server
npm test
```

## 📁 Project Structure

```
festifyxr/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api.js         # API client with axios
│   │   ├── App-new.jsx    # Main app component with routing
│   │   ├── main.jsx       # Entry point
│   │   ├── context/       # React context (Auth)
│   │   ├── pages/         # Page components
│   │   └── components/    # Reusable components
│   ├── index-new.html     # HTML template
│   └── vite.config.js     # Vite configuration
│
└── server/                # Node.js backend
    ├── models/            # Mongoose schemas
    ├── routes/            # API routes
    ├── utils/             # Utilities (logger, validators, error handlers)
    ├── scripts/           # Database seed scripts
    ├── __tests__/         # Jest tests
    ├── logs/              # Application logs (auto-generated)
    └── server.js          # Express server

```

## 🔑 API Endpoints

### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Events

- `GET /api/events` - Get all events
- `POST /api/events` - Create event (admin only)
- `PUT /api/events/:id` - Update event (admin only)
- `DELETE /api/events/:id` - Delete event (admin only)

### Zones

- `GET /api/zones` - Get all zones
- `POST /api/zones` - Create zone (admin only)

### Rewards

- `GET /api/rewards` - Get all rewards
- `POST /api/rewards` - Create reward (admin only)

### Scans

- `POST /api/scans` - Record QR code scan (authenticated)
- `GET /api/scans/user/:id` - Get user's scans
- `GET /api/scans/my-scans` - Get my scans (authenticated)

### Health

- `GET /health` - Health check endpoint

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt (12 rounds)
- Rate limiting on all API routes
- Stricter rate limiting on auth routes
- Input validation on all routes
- CORS configuration
- SQL injection protection via Mongoose
- XSS protection

## 📊 Logging

Logs are stored in `server/logs/`:

- `application-DATE.log` - All logs
- `error-DATE.log` - Error logs only
- Logs rotate daily
- Retention: 14 days (application), 30 days (errors)

## 🚧 Switching to New React Implementation

The project has been refactored with proper React architecture. To use the new implementation:

1. **Rename files**:

```powershell
# In client directory
mv index.html index-old.html
mv index-new.html index.html

mv src/App.js src/App-old.js
mv src/App-new.jsx src/App.jsx

mv src/index.css src/index-old.css
mv src/index-new.css src/index.css

mv src/components/Navbar.jsx src/components/Navbar-old.jsx
mv src/components/Navbar-new.jsx src/components/Navbar.jsx
```

2. **Restart the development server**

## 👥 User Roles

- **Participant**: Can view events, scan QR codes, earn points, view leaderboard
- **Admin**: All participant features + manage events, zones, rewards, and users

## 🎯 Gamification System

- Earn XP by attending events and scanning QR codes
- Level up automatically (1 level per 100 XP)
- Redeem XP for rewards
- Compete on the leaderboard

## 🐛 Troubleshooting

### MongoDB Connection Error

- Ensure MongoDB is running
- Check connection string in `.env`

### CORS Errors

- Verify `CORS_ORIGIN` in server `.env` matches your frontend URL

### JWT Errors

- Ensure `JWT_SECRET` is set in server `.env`

## 📝 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

Built with ❤️ for festival enthusiasts
