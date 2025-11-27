"""
Monitoring and Observability Middleware
Provides comprehensive monitoring, logging, and metrics collection
"""

import time
import logging
import json
from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
from django.conf import settings
from django.core.cache import cache
from django.db import connection
import threading
import psutil
import os

# Loggers
access_logger = logging.getLogger('access')
performance_logger = logging.getLogger('performance')
security_logger = logging.getLogger('django.security')

# Thread-local storage for request metrics
_local = threading.local()


class MonitoringMiddleware(MiddlewareMixin):
    """
    Comprehensive monitoring middleware that tracks:
    - Request/response metrics
    - Performance data
    - Security events
    - System metrics
    """
    
    def process_request(self, request):
        """Process incoming request and start monitoring"""
        _local.start_time = time.time()
        _local.request = request
        
        # Log access
        self.log_access_start(request)
        
        # Track concurrent requests
        self.track_concurrent_requests(1)
        
        return None
    
    def process_response(self, request, response):
        """Process response and log metrics"""
        if not hasattr(_local, 'start_time'):
            return response
        
        end_time = time.time()
        response_time = end_time - _local.start_time
        
        # Log access completion
        self.log_access_complete(request, response, response_time)
        
        # Log performance metrics
        self.log_performance_metrics(request, response, response_time)
        
        # Track security events
        self.track_security_events(request, response)
        
        # Update system metrics
        self.update_system_metrics()
        
        # Track concurrent requests
        self.track_concurrent_requests(-1)
        
        # Add monitoring headers
        response['X-Response-Time'] = f"{response_time:.3f}s"
        response['X-Request-ID'] = getattr(request, 'request_id', 'unknown')
        
        return response
    
    def process_exception(self, request, exception):
        """Process exceptions and log errors"""
        if hasattr(_local, 'start_time'):
            response_time = time.time() - _local.start_time
            
            # Log exception
            performance_logger.error(
                "Request exception",
                extra={
                    'path': request.path,
                    'method': request.method,
                    'response_time': response_time,
                    'exception': str(exception),
                    'exception_type': type(exception).__name__,
                    'user': str(request.user) if hasattr(request, 'user') else 'anonymous',
                    'ip': self.get_client_ip(request),
                }
            )
        
        return None
    
    def log_access_start(self, request):
        """Log request start"""
        # Generate request ID
        request.request_id = f"{int(time.time())}-{threading.get_ident()}"

        # Use performance logger instead of access logger for start events
        performance_logger.info(
            "Request started",
            extra={
                'request_id': request.request_id,
                'method': request.method,
                'path': request.path,
                'user': str(request.user) if hasattr(request, 'user') else 'anonymous',
                'ip': self.get_client_ip(request),
                'user_agent': request.META.get('HTTP_USER_AGENT', ''),
            }
        )
    
    def log_access_complete(self, request, response, response_time):
        """Log request completion"""
        try:
            # Use a simple string format to avoid formatter issues
            log_message = (
                f"Request completed - {request.method} {request.path} - "
                f"Status: {response.status_code} - Time: {response_time:.3f}s - "
                f"User: {str(request.user) if hasattr(request, 'user') else 'anonymous'} - "
                f"IP: {self.get_client_ip(request)}"
            )
            access_logger.info(log_message)
        except Exception as e:
            # Fallback to performance logger if access logger fails
            performance_logger.info(f"Request completed: {request.method} {request.path} - Status: {response.status_code}")
    
    def log_performance_metrics(self, request, response, response_time):
        """Log detailed performance metrics"""
        # Database query metrics
        db_queries = len(connection.queries) if settings.DEBUG else 0
        db_time = sum(float(q['time']) for q in connection.queries) if settings.DEBUG else 0
        
        # Memory usage
        process = psutil.Process()
        memory_info = process.memory_info()
        
        performance_logger.info(
            "Performance metrics",
            extra={
                'request_id': getattr(request, 'request_id', 'unknown'),
                'path': request.path,
                'method': request.method,
                'status': response.status_code,
                'response_time': response_time,
                'db_queries': db_queries,
                'db_time': db_time,
                'memory_rss': memory_info.rss,
                'memory_vms': memory_info.vms,
                'cpu_percent': process.cpu_percent(),
            }
        )
    
    def track_security_events(self, request, response):
        """Track security-related events"""
        # Failed authentication attempts
        if response.status_code == 401:
            security_logger.warning(
                "Authentication failed",
                extra={
                    'path': request.path,
                    'method': request.method,
                    'ip': self.get_client_ip(request),
                    'user_agent': request.META.get('HTTP_USER_AGENT', ''),
                }
            )
        
        # Forbidden access attempts
        if response.status_code == 403:
            security_logger.warning(
                "Forbidden access attempt",
                extra={
                    'path': request.path,
                    'method': request.method,
                    'user': str(request.user) if hasattr(request, 'user') else 'anonymous',
                    'ip': self.get_client_ip(request),
                }
            )
        
        # Suspicious request patterns
        if self.is_suspicious_request(request):
            security_logger.warning(
                "Suspicious request detected",
                extra={
                    'path': request.path,
                    'method': request.method,
                    'ip': self.get_client_ip(request),
                    'reason': self.get_suspicious_reason(request),
                }
            )
    
    def update_system_metrics(self):
        """Update system-level metrics in cache"""
        try:
            # CPU and memory metrics
            cpu_percent = psutil.cpu_percent()
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            # Network metrics
            network = psutil.net_io_counters()
            
            metrics = {
                'timestamp': time.time(),
                'cpu_percent': cpu_percent,
                'memory_percent': memory.percent,
                'memory_available': memory.available,
                'disk_percent': disk.percent,
                'disk_free': disk.free,
                'network_bytes_sent': network.bytes_sent,
                'network_bytes_recv': network.bytes_recv,
            }
            
            # Store in cache for dashboard
            cache.set('system_metrics', metrics, timeout=60)
            
        except Exception as e:
            performance_logger.error(f"Failed to update system metrics: {e}")
    
    def track_concurrent_requests(self, delta):
        """Track concurrent request count"""
        try:
            current = cache.get('concurrent_requests', 0)
            new_count = max(0, current + delta)
            cache.set('concurrent_requests', new_count, timeout=300)
        except Exception:
            pass
    
    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def is_suspicious_request(self, request):
        """Detect suspicious request patterns"""
        # Check for common attack patterns
        suspicious_patterns = [
            'script', 'javascript:', 'vbscript:', 'onload', 'onerror',
            '../', '..\\', '/etc/passwd', '/proc/', 'cmd.exe',
            'union select', 'drop table', 'insert into', 'delete from',
        ]
        
        # Check path and query parameters
        full_path = request.get_full_path().lower()
        for pattern in suspicious_patterns:
            if pattern in full_path:
                return True
        
        # Check for excessive request rate from same IP
        ip = self.get_client_ip(request)
        cache_key = f"request_rate_{ip}"
        current_count = cache.get(cache_key, 0)
        
        if current_count > 100:  # More than 100 requests per minute
            return True
        
        cache.set(cache_key, current_count + 1, timeout=60)
        return False
    
    def get_suspicious_reason(self, request):
        """Get reason for suspicious request classification"""
        # This is a simplified version - in production, you'd want more sophisticated detection
        full_path = request.get_full_path().lower()
        
        if any(pattern in full_path for pattern in ['script', 'javascript:', 'onload']):
            return "XSS attempt detected"
        elif any(pattern in full_path for pattern in ['union select', 'drop table']):
            return "SQL injection attempt detected"
        elif any(pattern in full_path for pattern in ['../', '/etc/passwd']):
            return "Path traversal attempt detected"
        else:
            return "High request rate detected"


class MetricsMiddleware(MiddlewareMixin):
    """
    Lightweight metrics collection middleware
    """
    
    def process_request(self, request):
        """Start request timing"""
        request._monitoring_start_time = time.time()
        return None
    
    def process_response(self, request, response):
        """Collect response metrics"""
        if hasattr(request, '_monitoring_start_time'):
            response_time = time.time() - request._monitoring_start_time
            
            # Update metrics in cache
            self.update_metrics(request, response, response_time)
        
        return response
    
    def update_metrics(self, request, response, response_time):
        """Update aggregated metrics"""
        try:
            # Get current metrics
            metrics = cache.get('api_metrics', {
                'total_requests': 0,
                'total_response_time': 0,
                'status_codes': {},
                'endpoints': {},
                'last_updated': time.time(),
            })
            
            # Update counters
            metrics['total_requests'] += 1
            metrics['total_response_time'] += response_time
            metrics['last_updated'] = time.time()
            
            # Track status codes
            status_code = str(response.status_code)
            metrics['status_codes'][status_code] = metrics['status_codes'].get(status_code, 0) + 1
            
            # Track endpoints
            endpoint = f"{request.method} {request.path}"
            if endpoint not in metrics['endpoints']:
                metrics['endpoints'][endpoint] = {
                    'count': 0,
                    'total_time': 0,
                    'avg_time': 0,
                }
            
            endpoint_metrics = metrics['endpoints'][endpoint]
            endpoint_metrics['count'] += 1
            endpoint_metrics['total_time'] += response_time
            endpoint_metrics['avg_time'] = endpoint_metrics['total_time'] / endpoint_metrics['count']
            
            # Store updated metrics
            cache.set('api_metrics', metrics, timeout=3600)
            
        except Exception as e:
            performance_logger.error(f"Failed to update metrics: {e}")


class HealthCheckMiddleware(MiddlewareMixin):
    """
    Health check middleware for load balancer probes
    """
    
    def process_request(self, request):
        """Handle health check requests"""
        if request.path in ['/health/', '/health/quick/', '/ping/']:
            return JsonResponse({
                'status': 'healthy',
                'timestamp': time.time(),
                'service': 'edumindsolutions-api'
            })
        
        return None
