"""
Health check views for monitoring system status
"""
from django.http import JsonResponse
from django.db import connection
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def health_check(request):
    """
    Basic health check endpoint
    Returns system status and basic metrics
    """
    try:
        # Check database connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            db_status = "healthy"
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        db_status = "unhealthy"
    
    # Check basic system info
    health_data = {
        "status": "healthy" if db_status == "healthy" else "unhealthy",
        "database": db_status,
        "debug_mode": settings.DEBUG,
        "version": "1.0.0",
        "services": {
            "accounts": "active",
            "assessments": "active", 
            "wellness": "active",
            "community": "active"
        }
    }
    
    status_code = 200 if health_data["status"] == "healthy" else 503
    return JsonResponse(health_data, status=status_code)

def detailed_health_check(request):
    """
    Detailed health check with database metrics
    """
    try:
        from assessments.models import Review
        from accounts.models import User
        from wellness.models import Activity
        
        # Get basic counts
        review_count = Review.objects.count()
        user_count = User.objects.count()
        product_count = Product.objects.count()
        
        # Database connection check
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            db_status = "healthy"
            
        health_data = {
            "status": "healthy",
            "database": {
                "status": db_status,
                "connection": "active"
            },
            "metrics": {
                "total_reviews": review_count,
                "total_users": user_count,
                "total_products": product_count
            },
            "system": {
                "debug_mode": settings.DEBUG,
                "version": "1.0.0",
                "database_engine": settings.DATABASES['default']['ENGINE']
            },
            "services": {
                "accounts": "active",
                "assessments": "active",
                "store": "active", 
                "carts": "active",
                "orders": "partial"
            }
        }
        
        return JsonResponse(health_data, status=200)
        
    except Exception as e:
        logger.error(f"Detailed health check failed: {str(e)}")
        return JsonResponse({
            "status": "unhealthy",
            "error": str(e)
        }, status=503)
