#!/bin/bash

# NeuroGeneration Website Deployment Script
# Usage: ./deploy.sh

echo "🚀 Starting deployment..."

# Pull latest changes
echo "📥 Pulling latest changes from git..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
yarn install

# Build the application
echo "🔨 Building application..."
yarn build

# Copy environment variables
echo "🔐 Setting up environment..."
if [ ! -f .env.production ]; then
    echo "⚠️  .env.production not found! Please create it from .env.production.example"
    exit 1
fi

# Restart application with PM2
echo "🔄 Restarting application..."
pm2 reload ecosystem.config.js --env production

echo "✅ Deployment complete!"
echo "🌐 Your site should be running at http://localhost:3000"
