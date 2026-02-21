FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first to cache dependencies
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Build the Next.js application
RUN npm run build

# Expose port (ensure it matches your Next.js config)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
