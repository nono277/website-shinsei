FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
# Outils pour compiler better-sqlite3 (module natif) dans l'environnement cible
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/build ./build
ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "build/index.js"]
