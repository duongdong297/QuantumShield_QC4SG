# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets to Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy a basic nginx conf if needed (or just use default)
# We will use the default which serves index.html at 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
