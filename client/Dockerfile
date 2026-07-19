# Use official Node.js LTS image as base
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port
EXPOSE 5173

# Set environment to production for frontend builds
ENV NODE_ENV=production

# Build the application
RUN npm run build

# Start the application
CMD ["npm", "run", "preview"]
