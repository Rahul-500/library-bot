#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Pull latest changes from GitHub repository
git pull origin main

# Install dependencies
npm install

# Restart PM2 process
if pm2 restart botscript.js; then
    echo "Botscript successfully restarted."
else
    # If botscript failed to restart, attempt to start it instead
    if pm2 start botscript.js; then
        echo "Botscript successfully started."
    else
        echo "Error: Failed to start or restart botscript."
        exit 1
    fi
fi

# Save the current PM2 process list
pm2 save