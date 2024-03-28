# Use Node.js 20 LTS as base image
FROM node:20

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose any ports your application needs
EXPOSE 8000

# Command to run the migrate up before starting the application
CMD ["sh", "-c", "npm run db-migrate && node botscript.js"]
