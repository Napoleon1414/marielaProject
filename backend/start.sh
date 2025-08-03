#!/bin/bash

echo "🚀 Starting Mariela Job Platform..."

# Set environment variables
export NODE_ENV=production
export PORT=8080

# Ensure database directory exists
mkdir -p database

# Ensure public directory exists
mkdir -p public

# Copy database files if they don't exist
if [ ! -f "database/schema.sql" ] && [ -d "../database" ]; then
    echo "🗄️ Copying database files..."
    cp -r ../database/* database/
fi

# Copy frontend files if they don't exist
if [ ! -d "public" ] || [ -z "$(ls -A public 2>/dev/null)" ]; then
    if [ -d "../dist/demo" ]; then
        echo "📁 Copying frontend files..."
        cp -r ../dist/demo/* public/
    fi
fi

# Start the server
echo "🌐 Starting server on port $PORT..."
node server.js 