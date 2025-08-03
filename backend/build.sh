#!/bin/bash

echo "🚀 Building Mariela Job Platform for production..."

# Set production environment
export NODE_ENV=production
export PORT=8080

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Create database directory if it doesn't exist
mkdir -p database

# Copy database files if they exist in parent directory
if [ -d "../database" ]; then
    echo "🗄️ Copying database files..."
    cp -r ../database/* database/
fi

# Copy frontend files if they exist
if [ -d "../dist/demo" ]; then
    echo "📁 Copying frontend files..."
    mkdir -p public
    cp -r ../dist/demo/* public/
fi

echo "✅ Build complete!"
echo "📍 Server will start on port: $PORT"
echo "🌍 Environment: $NODE_ENV" 