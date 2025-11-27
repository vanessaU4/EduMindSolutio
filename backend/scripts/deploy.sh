#!/bin/bash

# Exit on any error
set -e

echo "🚀 Starting deployment script..."

# Wait for database to be ready
echo "⏳ Waiting for database connection..."
python manage.py wait_for_db || echo "Database connection check failed, continuing..."

# Run database migrations
echo "📊 Running database migrations..."
python manage.py migrate --noinput

# Seed initial data (roles, permissions, etc.)
echo "🌱 Seeding initial data..."
python manage.py seed_initial_data

# Create superuser if it doesn't exist
echo "👤 Creating admin user..."
python manage.py create_admin_user

# Activate any existing admin users that might be inactive
echo "🔧 Activating admin users..."
python manage.py activate_admin

# Show admin user information for login
echo "📋 Admin user information:"
python manage.py show_admin_info

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

# Load initial data/fixtures if they exist
if [ -f "fixtures/initial_data.json" ]; then
    echo "📋 Loading initial data..."
    python manage.py loaddata fixtures/initial_data.json
fi

echo "✅ Deployment script completed successfully!"

# Start the application
echo "🚀 Starting Gunicorn server..."
PORT=${PORT:-10000}
echo "📡 Binding to port: $PORT"
exec gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT --workers 3 --timeout 120 --keep-alive 2 --max-requests 1000 --max-requests-jitter 100
