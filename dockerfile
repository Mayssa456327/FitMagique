# Use the official Node.js image as a base image
FROM node:22-bullseye

# Set the working directory inside the container
WORKDIR /app

# Copy only package files first to leverage Docker caching
COPY package*.json ./

# Install dependencies, using npm ci for faster and consistent builds
RUN npm ci --only=production

# Copy the application source code
COPY . .

# Set environment variables for better control
ENV NODE_ENV=production

# Expose the application port
EXPOSE 5000



# Start the application
CMD ["node", "gateway"]
