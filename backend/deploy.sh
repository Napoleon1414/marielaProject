#!/bin/bash

echo "🚀 Deploying Mariela Job Platform..."

# Set environment variables
export NODE_ENV=production
export PORT=8080

# Clean install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Rebuild sqlite3 for the current platform
echo "🔧 Rebuilding sqlite3 for deployment platform..."
npm rebuild sqlite3

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p database
mkdir -p public

# Copy database files if they exist in parent directory
if [ -d "../database" ]; then
    echo "🗄️ Copying database files..."
    cp -r ../database/* database/
fi

# Copy frontend files if they exist
if [ -d "../dist/demo" ]; then
    echo "📁 Copying frontend files..."
    cp -r ../dist/demo/* public/
fi

echo "✅ Deployment preparation complete!"
echo "📍 Server will start on port: $PORT"
echo "🌍 Environment: $NODE_ENV" 