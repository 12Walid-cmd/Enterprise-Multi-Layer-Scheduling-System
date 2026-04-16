# Use official Node.js 22 alpine image (lightweight)
FROM node:22-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package files first so Docker can cache this layer
# (if code changes but packages don't, this step won't re-run)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend code
COPY . .

# Expose the API port
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]