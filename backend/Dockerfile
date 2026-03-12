# Build stage
    FROM node:20-alpine

    WORKDIR /app

    COPY package*.json ./
    # RUN npm install --omit=dev
    RUN npm install
    
    # Copy source
    COPY . .
    
    # Use non-root user for security
    RUN addgroup -S appgroup && adduser -S appuser -G appgroup
    USER appuser
    
    CMD ["node", "src/server.js"]