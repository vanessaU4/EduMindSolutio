"""
Integration Tests for EduMindSolutions Healthcare Platform
Tests the complete healthcare application flow including API endpoints, database operations, and healthcare business logic
"""

import json
import time
from django.test import TestCase, TransactionTestCase
from django.test.client import Client
from django.contrib.auth.models import User
from django.urls import reverse
from django.core.cache import cache
from django.db import transaction
from unittest.mock import patch, MagicMock
import pytest


class HealthCheckIntegrationTest(TestCase):
    """Test health check endpoints"""
    
    def setUp(self):
        self.client = Client()
    
    def test_basic_health_check(self):
        """Test basic health check endpoint"""
        response = self.client.get('/health/')
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertEqual(data['status'], 'healthy')
        self.assertIn('timestamp', data)
        self.assertIn('service', data)
    
    def test_detailed_health_check(self):
        """Test detailed health check endpoint"""
        response = self.client.get('/health/detailed/')
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertEqual(data['status'], 'healthy')
        self.assertIn('database', data)
        self.assertIn('cache', data)
        self.assertIn('timestamp', data)
        
        # Check database health
        self.assertIn('status', data['database'])
        self.assertIn('response_time', data['database'])
        
        # Check cache health
        self.assertIn('status', data['cache'])


class MonitoringIntegrationTest(TestCase):
    """Test monitoring endpoints"""
    
    def setUp(self):
        self.client = Client()
    
    def test_system_metrics_endpoint(self):
        """Test system metrics endpoint"""
        response = self.client.get('/monitoring/system/')
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertEqual(data['status'], 'success')
        self.assertIn('data', data)
        
        metrics = data['data']
        self.assertIn('timestamp', metrics)
        self.assertIn('cpu', metrics)
        self.assertIn('memory', metrics)
        self.assertIn('disk', metrics)
        self.assertIn('network', metrics)
    
    def test_application_metrics_endpoint(self):
        """Test application metrics endpoint"""
        response = self.client.get('/monitoring/application/')
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertEqual(data['status'], 'success')
        self.assertIn('data', data)
        
        metrics = data['data']
        self.assertIn('api', metrics)
        self.assertIn('database', metrics)
        self.assertIn('process', metrics)
    
    def test_health_metrics_endpoint(self):
        """Test health metrics endpoint"""
        response = self.client.get('/monitoring/health/')
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertEqual(data['status'], 'success')
        self.assertIn('data', data)
        
        health = data['data']
        self.assertIn('overall_status', health)
        self.assertIn('system', health)
        self.assertIn('database', health)
        self.assertIn('application', health)


class APIEndpointIntegrationTest(TestCase):
    """Test API endpoints integration"""
    
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_api_authentication_flow(self):
        """Test complete authentication flow"""
        # Test login
        login_data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        
        # Assuming you have a login endpoint
        response = self.client.post('/api/accounts/login/', login_data)
        
        # Check if login endpoint exists and works
        if response.status_code == 404:
            # Skip if endpoint doesn't exist yet
            self.skipTest("Login endpoint not implemented yet")
        
        if response.status_code == 200:
            data = response.json()
            self.assertIn('token', data)
    
    def test_cors_headers(self):
        """Test CORS headers are properly set"""
        response = self.client.options('/health/')
        
        # Check for CORS headers
        self.assertIn('Access-Control-Allow-Origin', response.headers)
    
    def test_security_headers(self):
        """Test security headers are present"""
        response = self.client.get('/health/')
        
        # Check for security headers
        headers = response.headers
        self.assertIn('X-Content-Type-Options', headers)
        self.assertIn('X-Frame-Options', headers)


class DatabaseIntegrationTest(TransactionTestCase):
    """Test database operations and transactions"""
    
    def setUp(self):
        self.client = Client()
    
    def test_database_connection(self):
        """Test database connectivity"""
        from django.db import connection
        
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            self.assertEqual(result[0], 1)
    
    def test_database_transaction_rollback(self):
        """Test database transaction rollback"""
        initial_user_count = User.objects.count()
        
        try:
            with transaction.atomic():
                User.objects.create_user(
                    username='testuser1',
                    email='test1@example.com',
                    password='testpass123'
                )
                # Force an error to trigger rollback
                raise Exception("Test rollback")
        except Exception:
            pass
        
        # User count should be unchanged due to rollback
        final_user_count = User.objects.count()
        self.assertEqual(initial_user_count, final_user_count)
    
    def test_database_performance(self):
        """Test database query performance"""
        start_time = time.time()
        
        # Perform a simple query
        list(User.objects.all())
        
        end_time = time.time()
        query_time = end_time - start_time
        
        # Query should complete within reasonable time (1 second)
        self.assertLess(query_time, 1.0)


class CacheIntegrationTest(TestCase):
    """Test cache operations"""
    
    def setUp(self):
        cache.clear()
    
    def tearDown(self):
        cache.clear()
    
    def test_cache_set_get(self):
        """Test basic cache operations"""
        cache.set('test_key', 'test_value', 60)
        value = cache.get('test_key')
        self.assertEqual(value, 'test_value')
    
    def test_cache_expiration(self):
        """Test cache expiration"""
        cache.set('expire_key', 'expire_value', 1)
        
        # Value should exist immediately
        value = cache.get('expire_key')
        self.assertEqual(value, 'expire_value')
        
        # Wait for expiration
        time.sleep(2)
        
        # Value should be expired
        value = cache.get('expire_key')
        self.assertIsNone(value)
    
    def test_cache_performance(self):
        """Test cache performance"""
        # Set a value
        cache.set('perf_key', 'perf_value', 60)
        
        start_time = time.time()
        
        # Perform multiple cache gets
        for _ in range(100):
            cache.get('perf_key')
        
        end_time = time.time()
        total_time = end_time - start_time
        
        # 100 cache operations should complete quickly
        self.assertLess(total_time, 0.1)


class MiddlewareIntegrationTest(TestCase):
    """Test middleware functionality"""
    
    def setUp(self):
        self.client = Client()
    
    def test_monitoring_middleware(self):
        """Test monitoring middleware adds headers"""
        response = self.client.get('/health/')
        
        # Check for monitoring headers
        self.assertIn('X-Response-Time', response.headers)
        self.assertIn('X-Request-ID', response.headers)
    
    def test_security_middleware(self):
        """Test security middleware functionality"""
        # Test with suspicious request pattern
        response = self.client.get('/health/?test=<script>alert("xss")</script>')
        
        # Should still return 200 but log the suspicious activity
        self.assertEqual(response.status_code, 200)
    
    def test_rate_limiting_middleware(self):
        """Test rate limiting functionality"""
        # Make multiple rapid requests
        responses = []
        for _ in range(10):
            response = self.client.get('/health/')
            responses.append(response.status_code)
        
        # All requests should succeed (rate limit is high for tests)
        self.assertTrue(all(status == 200 for status in responses))


class SecurityIntegrationTest(TestCase):
    """Test security features"""
    
    def setUp(self):
        self.client = Client()
    
    def test_sql_injection_protection(self):
        """Test SQL injection protection"""
        # Attempt SQL injection in query parameter
        malicious_query = "'; DROP TABLE auth_user; --"
        response = self.client.get(f'/health/?id={malicious_query}')
        
        # Should not cause server error
        self.assertNotEqual(response.status_code, 500)
        
        # Database should still be intact
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM auth_user")
            # Should not raise an exception
    
    def test_xss_protection(self):
        """Test XSS protection"""
        xss_payload = "<script>alert('xss')</script>"
        response = self.client.get(f'/health/?message={xss_payload}')
        
        # Should not return the script in response
        self.assertNotIn('<script>', response.content.decode())
    
    def test_csrf_protection(self):
        """Test CSRF protection"""
        # POST request without CSRF token should be rejected
        response = self.client.post('/api/accounts/login/', {
            'username': 'test',
            'password': 'test'
        })
        
        # Should return 403 or 404 (if endpoint doesn't exist)
        self.assertIn(response.status_code, [403, 404])


class PerformanceIntegrationTest(TestCase):
    """Test application performance"""
    
    def setUp(self):
        self.client = Client()
    
    def test_response_time_health_check(self):
        """Test health check response time"""
        start_time = time.time()
        response = self.client.get('/health/')
        end_time = time.time()
        
        response_time = end_time - start_time
        
        # Health check should respond quickly
        self.assertLess(response_time, 0.5)
        self.assertEqual(response.status_code, 200)
    
    def test_concurrent_requests(self):
        """Test handling of concurrent requests"""
        import threading
        import queue
        
        results = queue.Queue()
        
        def make_request():
            try:
                response = self.client.get('/health/')
                results.put(response.status_code)
            except Exception as e:
                results.put(str(e))
        
        # Create multiple threads
        threads = []
        for _ in range(10):
            thread = threading.Thread(target=make_request)
            threads.append(thread)
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        # Check results
        status_codes = []
        while not results.empty():
            status_codes.append(results.get())
        
        # All requests should succeed
        self.assertEqual(len(status_codes), 10)
        self.assertTrue(all(status == 200 for status in status_codes))
    
    def test_memory_usage(self):
        """Test memory usage during requests"""
        import psutil
        import os
        
        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss
        
        # Make multiple requests
        for _ in range(50):
            self.client.get('/health/')
        
        final_memory = process.memory_info().rss
        memory_increase = final_memory - initial_memory
        
        # Memory increase should be reasonable (less than 50MB)
        self.assertLess(memory_increase, 50 * 1024 * 1024)


@pytest.mark.integration
class AlertingIntegrationTest(TestCase):
    """Test alerting system integration"""
    
    def setUp(self):
        self.client = Client()
    
    @patch('backend.alerting.metrics_collector')
    def test_alert_webhook_endpoint(self, mock_collector):
        """Test alert webhook endpoint"""
        alert_data = {
            'alert_name': 'Test Alert',
            'severity': 'warning',
            'message': 'This is a test alert',
            'timestamp': time.time()
        }
        
        response = self.client.post(
            '/monitoring/alerts/webhook/',
            data=json.dumps(alert_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['status'], 'success')
    
    def test_metrics_collection(self):
        """Test metrics collection functionality"""
        from backend.alerting import metrics_collector
        
        # Collect metrics
        metrics = metrics_collector.collect_all_metrics()
        
        # Verify metrics structure
        self.assertIn('system', metrics)
        self.assertIn('application', metrics)
        self.assertIn('database', metrics)
        self.assertIn('security', metrics)


class EndToEndIntegrationTest(TestCase):
    """End-to-end integration tests"""
    
    def setUp(self):
        self.client = Client()
    
    def test_complete_application_flow(self):
        """Test complete application workflow"""
        # 1. Check application health
        health_response = self.client.get('/health/')
        self.assertEqual(health_response.status_code, 200)
        
        # 2. Check monitoring endpoints
        monitoring_response = self.client.get('/monitoring/system/')
        self.assertEqual(monitoring_response.status_code, 200)
        
        # 3. Verify database connectivity
        detailed_health = self.client.get('/health/detailed/')
        self.assertEqual(detailed_health.status_code, 200)
        
        health_data = detailed_health.json()
        self.assertEqual(health_data['database']['status'], 'connected')
        
        # 4. Test cache functionality
        cache.set('e2e_test', 'success', 60)
        cached_value = cache.get('e2e_test')
        self.assertEqual(cached_value, 'success')
        
        # 5. Verify security headers
        self.assertIn('X-Content-Type-Options', health_response.headers)
    
    def test_error_handling_flow(self):
        """Test error handling throughout the application"""
        # Test 404 handling
        response = self.client.get('/nonexistent-endpoint/')
        self.assertEqual(response.status_code, 404)
        
        # Test method not allowed
        response = self.client.post('/health/')
        self.assertEqual(response.status_code, 405)
    
    def test_monitoring_data_flow(self):
        """Test monitoring data collection and retrieval"""
        # Make some requests to generate metrics
        for _ in range(5):
            self.client.get('/health/')
        
        # Check if metrics are collected
        metrics_response = self.client.get('/monitoring/application/')
        self.assertEqual(metrics_response.status_code, 200)
        
        metrics_data = metrics_response.json()
        self.assertIn('api', metrics_data['data'])
        
        # API metrics should show some activity
        api_metrics = metrics_data['data']['api']
        self.assertGreaterEqual(api_metrics.get('total_requests', 0), 5)
