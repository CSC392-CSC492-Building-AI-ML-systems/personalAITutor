#!/bin/sh

cd /app || exit

# Run database migrations
flask db upgrade

# Run the application with Gunicorn
gunicorn -w 4 -b 0.0.0.0:7001 api_service.app:app