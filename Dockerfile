# Use the official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080
ENV NEXT_TELEMETRY_DISABLED=1
ENV GEMINI_API_KEY=dummy-key-for-build

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose the port
EXPOSE 8080

# Set the correct port for Cloud Run
ENV PORT=8080

# Start the application using standalone server
CMD ["node", ".next/standalone/server.js"]
