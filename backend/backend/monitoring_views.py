"""
Monitoring and Observability API Views
Provides endpoints for monitoring dashboards and alerting systems
"""

import time
import json
import logging
from datetime import datetime, timedelta
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.core.cache import cache
from django.db import connection
from django.conf import settings
import psutil
import os

# Loggers
performance_logger = logging.getLogger('performance')


@require_http_methods(["GET"])
def system_metrics(request):
    """Get current system metrics"""
    try:
        # Get cached metrics or generate new ones
        metrics = cache.get('system_metrics')
        
        if not metrics:
            # Generate fresh metrics
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            network = psutil.net_io_counters()
            
            metrics = {
                'timestamp': time.time(),
                'cpu': {
                    'percent': cpu_percent,
                    'count': psutil.cpu_count(),
                },
                'memory': {
                    'percent': memory.percent,
                    'total': memory.total,
                    'available': memory.available,
                    'used': memory.used,
                },
                'disk': {
                    'percent': disk.percent,
                    'total': disk.total,
                    'free': disk.free,
                    'used': disk.used,
                },
                'network': {
                    'bytes_sent': network.bytes_sent,
                    'bytes_recv': network.bytes_recv,
                    'packets_sent': network.packets_sent,
                    'packets_recv': network.packets_recv,
                },
            }
            
            cache.set('system_metrics', metrics, timeout=30)
        
        return JsonResponse({
            'status': 'success',
            'data': metrics
        })
        
    except Exception as e:
        performance_logger.error(f"Failed to get system metrics: {e}")
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)


@require_http_methods(["GET"])
def application_metrics(request):
    """Get application-specific metrics"""
    try:
        # Get API metrics from cache
        api_metrics = cache.get('api_metrics', {
            'total_requests': 0,
            'total_response_time': 0,
            'status_codes': {},
            'endpoints': {},
            'last_updated': time.time(),
        })
        
        # Calculate derived metrics
        avg_response_time = 0
        if api_metrics['total_requests'] > 0:
            avg_response_time = api_metrics['total_response_time'] / api_metrics['total_requests']
        
        # Get concurrent requests
        concurrent_requests = cache.get('concurrent_requests', 0)
        
        # Database metrics
        db_metrics = get_database_metrics()
        
        # Process metrics
        process_metrics = get_process_metrics()
        
        return JsonResponse({
            'status': 'success',
            'data': {
                'api': {
                    'total_requests': api_metrics['total_requests'],
                    'avg_response_time': round(avg_response_time, 3),
                    'concurrent_requests': concurrent_requests,
                    'status_codes': api_metrics['status_codes'],
                    'top_endpoints': get_top_endpoints(api_metrics['endpoints']),
                    'last_updated': api_metrics['last_updated'],
                },
                'database': db_metrics,
                'process': process_metrics,
            }
        })
        
    except Exception as e:
        performance_logger.error(f"Failed to get application metrics: {e}")
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)


@require_http_methods(["GET"])
def health_metrics(request):
    """Get comprehensive health metrics"""
    try:
        # System health
        system_health = check_system_health()
        
        # Database health
        db_health = check_database_health()
        
        # Application health
        app_health = check_application_health()
        
        # Overall health status
        overall_status = 'healthy'
        if not all([system_health['healthy'], db_health['healthy'], app_health['healthy']]):
            overall_status = 'degraded'
        
        # Check for critical issues
        if (system_health.get('cpu_percent', 0) > 90 or 
            system_health.get('memory_percent', 0) > 90 or
            not db_health['healthy']):
            overall_status = 'unhealthy'
        
        return JsonResponse({
            'status': 'success',
            'data': {
                'overall_status': overall_status,
                'timestamp': time.time(),
                'system': system_health,
                'database': db_health,
                'application': app_health,
            }
        })
        
    except Exception as e:
        performance_logger.error(f"Failed to get health metrics: {e}")
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)


@require_http_methods(["GET"])
def security_metrics(request):
    """Get security-related metrics"""
    try:
        # Get security events from cache (simplified - in production, use proper storage)
        security_events = cache.get('security_events', {
            'failed_auth_attempts': 0,
            'forbidden_access_attempts': 0,
            'suspicious_requests': 0,
            'last_24h_events': [],
        })
        
        # Rate limiting metrics
        rate_limit_metrics = get_rate_limit_metrics()
        
        # SSL/TLS metrics
        ssl_metrics = get_ssl_metrics()
        
        return JsonResponse({
            'status': 'success',
            'data': {
                'security_events': security_events,
                'rate_limiting': rate_limit_metrics,
                'ssl_tls': ssl_metrics,
                'timestamp': time.time(),
            }
        })
        
    except Exception as e:
        performance_logger.error(f"Failed to get security metrics: {e}")
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)


@require_http_methods(["GET"])
def performance_trends(request):
    """Get performance trends over time"""
    try:
        # Get time range from query parameters
        hours = int(request.GET.get('hours', 24))
        
        # Get performance data from cache/storage
        # In production, this would come from a time-series database
        trends = cache.get(f'performance_trends_{hours}h', {
            'response_times': [],
            'request_rates': [],
            'error_rates': [],
            'cpu_usage': [],
            'memory_usage': [],
            'timestamps': [],
        })
        
        return JsonResponse({
            'status': 'success',
            'data': trends
        })
        
    except Exception as e:
        performance_logger.error(f"Failed to get performance trends: {e}")
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)


@require_http_methods(["POST"])
@csrf_exempt
def alert_webhook(request):
    """Webhook endpoint for receiving alerts"""
    try:
        data = json.loads(request.body)
        
        # Log the alert
        performance_logger.warning(
            f"Alert received: {data.get('alert_name', 'Unknown')}",
            extra={
                'alert_data': data,
                'source': request.META.get('HTTP_USER_AGENT', 'Unknown'),
                'ip': get_client_ip(request),
            }
        )
        
        # Process alert (send notifications, update status, etc.)
        process_alert(data)
        
        return JsonResponse({
            'status': 'success',
            'message': 'Alert received and processed'
        })
        
    except Exception as e:
        performance_logger.error(f"Failed to process alert webhook: {e}")
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)


# Helper functions

def get_database_metrics():
    """Get database performance metrics"""
    try:
        with connection.cursor() as cursor:
            # Check database connectivity
            cursor.execute("SELECT 1")
            
            # Get database size (PostgreSQL specific)
            cursor.execute("""
                SELECT pg_size_pretty(pg_database_size(current_database())) as size,
                       pg_database_size(current_database()) as size_bytes
            """)
            size_info = cursor.fetchone()
            
            # Get connection count
            cursor.execute("SELECT count(*) FROM pg_stat_activity")
            connection_count = cursor.fetchone()[0]
            
            return {
                'healthy': True,
                'size': size_info[0] if size_info else 'Unknown',
                'size_bytes': size_info[1] if size_info else 0,
                'connections': connection_count,
                'response_time': 'Fast',
            }
            
    except Exception as e:
        return {
            'healthy': False,
            'error': str(e),
            'size': 'Unknown',
            'connections': 0,
            'response_time': 'Slow',
        }


def get_process_metrics():
    """Get current process metrics"""
    try:
        process = psutil.Process()
        
        return {
            'pid': process.pid,
            'cpu_percent': process.cpu_percent(),
            'memory_info': {
                'rss': process.memory_info().rss,
                'vms': process.memory_info().vms,
            },
            'memory_percent': process.memory_percent(),
            'num_threads': process.num_threads(),
            'create_time': process.create_time(),
            'status': process.status(),
        }
        
    except Exception as e:
        return {
            'error': str(e)
        }


def check_system_health():
    """Check overall system health"""
    try:
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # Health thresholds
        cpu_healthy = cpu_percent < 80
        memory_healthy = memory.percent < 85
        disk_healthy = disk.percent < 90
        
        return {
            'healthy': cpu_healthy and memory_healthy and disk_healthy,
            'cpu_percent': cpu_percent,
            'cpu_healthy': cpu_healthy,
            'memory_percent': memory.percent,
            'memory_healthy': memory_healthy,
            'disk_percent': disk.percent,
            'disk_healthy': disk_healthy,
        }
        
    except Exception as e:
        return {
            'healthy': False,
            'error': str(e)
        }


def check_database_health():
    """Check database health"""
    try:
        start_time = time.time()
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        response_time = time.time() - start_time
        
        return {
            'healthy': response_time < 1.0,  # Less than 1 second
            'response_time': response_time,
            'status': 'connected',
        }
        
    except Exception as e:
        return {
            'healthy': False,
            'error': str(e),
            'status': 'disconnected',
        }


def check_application_health():
    """Check application-specific health"""
    try:
        # Check if critical services are running
        api_metrics = cache.get('api_metrics', {})
        last_request = api_metrics.get('last_updated', 0)
        
        # Consider app healthy if it received requests in the last 5 minutes
        app_active = (time.time() - last_request) < 300
        
        return {
            'healthy': app_active,
            'last_request': last_request,
            'active': app_active,
        }
        
    except Exception as e:
        return {
            'healthy': False,
            'error': str(e)
        }


def get_top_endpoints(endpoints):
    """Get top endpoints by request count"""
    if not endpoints:
        return []
    
    # Sort by request count and return top 10
    sorted_endpoints = sorted(
        endpoints.items(),
        key=lambda x: x[1]['count'],
        reverse=True
    )
    
    return [
        {
            'endpoint': endpoint,
            'count': data['count'],
            'avg_time': round(data['avg_time'], 3),
        }
        for endpoint, data in sorted_endpoints[:10]
    ]


def get_rate_limit_metrics():
    """Get rate limiting metrics"""
    # Simplified implementation
    return {
        'enabled': True,
        'blocked_requests': cache.get('blocked_requests', 0),
        'rate_limited_ips': cache.get('rate_limited_ips', []),
    }


def get_ssl_metrics():
    """Get SSL/TLS metrics"""
    # Simplified implementation
    return {
        'enabled': True,
        'certificate_valid': True,
        'expires_in_days': 90,  # Placeholder
    }


def process_alert(alert_data):
    """Process incoming alert"""
    # In production, this would:
    # 1. Send notifications (email, Slack, etc.)
    # 2. Update monitoring dashboard
    # 3. Trigger automated responses
    # 4. Log to incident management system
    
    alert_name = alert_data.get('alert_name', 'Unknown Alert')
    severity = alert_data.get('severity', 'medium')
    
    performance_logger.warning(
        f"Processing alert: {alert_name} (severity: {severity})",
        extra={'alert_data': alert_data}
    )


def get_client_ip(request):
    """Get client IP address"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip
