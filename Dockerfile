# Use the official Node.js 21 image.
FROM node:21

# Create and change to the app directory.
WORKDIR /usr/src/app

# Install app dependencies.
COPY package*.json ./
RUN npm install

# Copy app files.
COPY . .

EXPOSE 8080

ENV PORT 8080

# Compile TypeScript to JavaScript using the build script.
RUN npm run build

# Run the compiled app using the start script.
CMD ["sh", "-c", "npm start"]
