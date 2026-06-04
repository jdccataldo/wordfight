FROM node:20-alpine

WORKDIR /app

# Install dependencies (including devDeps — tsx is needed at runtime)
COPY package*.json ./
RUN npm ci

# Copy all source files
COPY . .

# Build the Next.js app
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Run the custom server (tsx handles TypeScript server files at runtime)
CMD ["npx", "tsx", "server.ts"]
