# Use the official Node.js 21 image
FROM node:21

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available) and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application files
COPY . .

# Set environment variables
ENV PORT=8080

# Expose the port the app runs on
EXPOSE $PORT

# Compile TypeScript to JavaScript
RUN npm run build

# Start the application
CMD ["npm", "start"]
