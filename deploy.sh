#!/bin/bash

echo "🚀 Starting deployment process..."

# Build the Angular frontend
echo "📦 Building Angular frontend..."
npm run build

# Copy built frontend to backend public directory
echo "📁 Copying frontend to backend..."
mkdir -p backend/public
cp -r dist/demo/* backend/public/

# Copy database files to backend
echo "🗄️ Copying database files..."
cp -r database/* backend/database/

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install --production

# Create production environment file
echo "⚙️ Creating production environment..."
cat > .env << EOF
NODE_ENV=production
PORT=8080
JWT_SECRET=your-super-secret-jwt-key-change-in-production
EOF

echo "✅ Deployment preparation complete!"
echo "📋 Next steps:"
echo "1. Deploy the backend/ directory to your cloud platform"
echo "2. Set the following environment variables:"
echo "   - NODE_ENV=production"
echo "   - PORT=8080"
echo "   - JWT_SECRET=your-secure-jwt-secret"
echo "3. Configure your domain in the CORS settings" 