FROM node:20-alpine AS builder
WORKDIR /app
# Outils nécessaires pour compiler les modules natifs (better-sqlite3)
RUN apk add --no-cache python3 make g++
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
# Supprime les devDependencies avant de copier node_modules dans le runner
RUN npm prune --omit=dev

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build       ./build
COPY --from=builder /app/package.json ./
ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "build/index.js"]
