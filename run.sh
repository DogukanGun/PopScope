#!/bin/bash

# Ensure the script fails if any command fails
set -e

# Pull the latest changes from the repository
echo "Pulling latest changes..."
git pull

# Build the Docker images
echo "Building Docker images..."
docker-compose build

# Stop and remove existing containers
echo "Stopping existing containers..."
docker-compose down

# Start the services in detached mode
echo "Starting services..."
docker-compose up -d

# Optional: Prune old, unused images to save disk space
echo "Cleaning up old images..."
docker image prune -f

echo "Application deployed successfully!" 