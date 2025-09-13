FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S govwin -u 1001

# Set ownership
RUN chown -R govwin:nodejs /app
USER govwin

EXPOSE 3000

CMD ["npm", "start"]
