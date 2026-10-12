# Build and runtime stage
FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production || npm install --omit=dev

# Copy compiled files and source
COPY . .

# Build typescript
RUN npm install typescript -g && npm run build

# Expose port
EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "dist/server.js"]
