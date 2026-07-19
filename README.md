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

### 2. Configure Environment Variables

**Backend** (`server/.env`):

```env
PORT=4000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/festifyxr
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
CORS_ORIGIN=http://localhost:5173
LOG_LEVEL=info
```

**Frontend** (`client/.env`):

```env
VITE_API_URL=http://localhost:4000/api
```

### 3. Seed the Database

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

## 🚀 Production Deployment

### MongoDB Atlas

1. Create a MongoDB Atlas cluster.
2. Create a database user with least-privilege access.
3. Add the Render outbound IPs or allow temporary access during setup.
4. Use a connection string in this format:

```env
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/festifyxr?retryWrites=true&w=majority&tls=true
```

5. Set the Atlas connection string as `MONGO_URI` in Render.

### Render Backend

1. Create a new Web Service from the repository root.
2. Set the root directory to `server`.
3. Use these commands:

- Build: `npm ci`
- Pre-deploy migration: `npm run migrate:host-request-indexes`
- Start: `npm start`

4. Set environment variables:

- `MONGO_URI`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `CORS_ORIGIN`
- `LOG_LEVEL`

5. Set the health check path to `/health`.

### Vercel Frontend

1. Import the repository into Vercel.
2. Set the root directory to `client`.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Set environment variable:

- `VITE_API_URL` to your Render backend URL, for example `https://festifyxr-api.onrender.com/api`

6. Keep the SPA rewrite in [client/vercel.json](client/vercel.json) so React Router refreshes work.

### Deployment Checklist

- MongoDB Atlas connection string is set in Render.
- Render health check returns healthy.
- Render pre-deploy migration completes successfully.
- Vercel build succeeds.
- React Router refreshes work on deployed routes.
- `VITE_API_URL` points to the Render API.
- `CORS_ORIGIN` matches the Vercel frontend URL.
- `JWT_SECRET` and `JWT_REFRESH_SECRET` are set and strong.

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

- Ensure the Atlas or local MongoDB connection string is valid
- Check `MONGO_URI` in `server/.env`

### CORS Errors

- Verify `CORS_ORIGIN` in server `.env` matches your frontend URL

### JWT Errors

- Ensure `JWT_SECRET` and `JWT_REFRESH_SECRET` are set in `server/.env`

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
