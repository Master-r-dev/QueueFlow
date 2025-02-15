# Use the official Node.js image as the base image
FROM node:23-slim

# Create app directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./

# Install dependencies
RUN npm i --omit=dev

# Use non-root user
USER node

# Copy the rest of the application code into the working directory
COPY --chown=node:node ./ ./

# Make the start script executable
RUN chmod +x start.sh

# Expose the API port
EXPOSE 4000

# Run the startup script
CMD ["sh", "./start.sh"]