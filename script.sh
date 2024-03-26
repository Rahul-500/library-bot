#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Pull latest changes from GitHub repository
git pull origin main

# Build Docker image
docker build -t library-bot .

# Stop and remove the existing container
docker stop library-bot || true
docker rm library-bot || true

# Run the new container
docker run -d --name library-bot -p 4000:4000 library-bot

# Check if the container is running
if docker ps | grep -q library-bot; then
    echo "Docker container library-bot successfully started."
else
    echo "Error: Failed to start Docker container library-bot."
    exit 1
fi
