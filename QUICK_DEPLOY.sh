#!/bin/bash

# Quick Deployment Script for Retro Blog Site
# Run this script on your server after SSH connection

echo "🚀 Starting deployment..."

# Navigate to project directory (adjust path if needed)
cd /path/to/retro-blog-site || exit 1

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# If using Docker Compose
if [ -f "docker-compose.yml" ]; then
    echo "🐳 Using Docker Compose..."
    
    # Run migrations
    echo "📊 Running migrations..."
    docker-compose exec -T backend python manage.py migrate blog
    
    # Collect static files
    echo "📦 Collecting static files..."
    docker-compose exec -T backend python manage.py collectstatic --noinput
    
    # Rebuild frontend (if needed)
    echo "🔨 Rebuilding frontend..."
    docker-compose build frontend
    
    # Restart services
    echo "🔄 Restarting services..."
    docker-compose restart backend frontend
    
    echo "✅ Deployment complete!"
    echo "📋 Check logs with: docker-compose logs -f"
else
    # If not using Docker
    echo "🐍 Using Python virtual environment..."
    
    cd backend
    source venv/bin/activate
    
    # Run migrations
    echo "📊 Running migrations..."
    python manage.py migrate blog
    
    # Collect static files
    echo "📦 Collecting static files..."
    python manage.py collectstatic --noinput
    
    # Restart services (adjust service names)
    echo "🔄 Restarting services..."
    sudo systemctl restart gunicorn
    sudo systemctl restart nginx
    
    echo "✅ Deployment complete!"
fi

echo "🧪 Testing endpoints..."
curl -s http://localhost/api/blog/posts/ | head -c 100
echo ""
echo "✅ Done!"
