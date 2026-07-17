FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

# Force development mode to ensure devDependencies are installed
ENV NODE_ENV=development

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client and build
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl

# Copy necessary files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Expose port
EXPOSE 3001

# Command to run migrations and start the server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]
