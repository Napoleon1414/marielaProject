#!/bin/bash

echo "🧪 Testing deployment configuration..."

# Test 1: Build the application
echo "📦 Building Angular application..."
npm run build

# Test 2: Prepare for deployment
echo "🔧 Preparing for deployment..."
npm run deploy:prepare

# Test 3: Start the production server
echo "🚀 Starting production server..."
cd backend
NODE_ENV=production PORT=8080 npm start &
SERVER_PID=$!

# Wait for server to start
sleep 5

# Test 4: Check health endpoint
echo "🏥 Testing health endpoint..."
curl -s http://localhost:8080/health

# Test 5: Check API endpoint
echo "🔌 Testing API endpoint..."
curl -s http://localhost:8080/api/skills

# Test 6: Check frontend
echo "🌐 Testing frontend..."
curl -s -I http://localhost:8080/ | head -1

# Cleanup
echo "🧹 Cleaning up..."
kill $SERVER_PID

echo "✅ Deployment test complete!" 