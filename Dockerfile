# Dockerfile

# Use an official Node.js runtime as the base image
FROM node:14-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install project dependencies
RUN npm install --force

# Copy the entire project to the working directory
COPY . .

# Expose the container port (default for Express.js is 3000)
EXPOSE 3000

# Define the command to run your application
CMD ["npm", "start"]
