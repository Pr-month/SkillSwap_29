#!/bin/bash

# Script to reset the database and re-seed it
# Usage: ./reset-db.sh

echo "Resetting SkillSwap database..."

# Stop the docker containers
echo "Stopping docker containers..."
docker compose down

# Remove the database volume
echo "Removing database volume..."
docker volume rm skillswap_pg_data

# Start the containers again
echo "Starting containers..."
docker compose up -d

echo "Database reset complete! The seed scripts will run automatically when the database starts."