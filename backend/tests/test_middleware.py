"""Unit tests for backend.backend.middleware module.

These tests focus on middleware-specific behaviors (headers, caching, and
suspicious request detection) using Django's TestCase and request factory.
"""

import time
from unittest.mock import patch

from django.test import TestCase, RequestFactory
from django.http import HttpResponse
from django.core.cache import cache

from backend.middleware import (
    MonitoringMiddleware,
    MetricsMiddleware,
    HealthCheckMiddleware,
)


class MonitoringMiddlewareUnitTest(TestCase):
    """Unit tests for MonitoringMiddleware behaviors."""

    def setUp(self):
        self.factory = RequestFactory()
        self.middleware = MonitoringMiddleware(get_response=lambda r: HttpResponse("OK"))
        cache.clear()

    def tearDown(self):
        cache.clear()

    def test_adds_monitoring_headers_on_successful_response(self):
        """Should add X-Response-Time and X-Request-ID headers on a normal request."""
        request = self.factory.get("/health/")
        self.middleware.process_request(request)
        response = self.middleware.process_response(request, HttpResponse("OK"))

        self.assertIn("X-Response-Time", response.headers)
        self.assertIn("X-Request-ID", response.headers)
        # Response time should be a formatted string ending with 's'
        self.assertTrue(str(response["X-Response-Time"]).endswith("s"))
        self.assertNotEqual(response["X-Request-ID"], "unknown")

    def test_concurrent_requests_counter_increments_and_decrements(self):
        """Should increment concurrent_requests on start and decrement on completion."""
        request = self.factory.get("/some-endpoint/")
        self.assertIsNone(cache.get("concurrent_requests"))

        # Start request: increments by 1
        self.middleware.process_request(request)
        in_flight = cache.get("concurrent_requests", 0)
        self.assertEqual(in_flight, 1)

        # End request: decrements back to 0 (not negative)
        response = self.middleware.process_response(request, HttpResponse("OK"))
        self.assertEqual(response.status_code, 200)
        in_flight_after = cache.get("concurrent_requests", 0)
        self.assertEqual(in_flight_after, 0)

    @patch("backend.backend.middleware.psutil.virtual_memory")
    @patch("backend.backend.middleware.psutil.cpu_percent")
    @patch("backend.backend.middleware.psutil.disk_usage")
    @patch("backend.backend.middleware.psutil.net_io_counters")
    def test_system_metrics_cached_with_expected_fields(
        self, mock_net, mock_disk, mock_cpu, mock_mem
    ):
        """Should cache system_metrics with CPU, memory, disk, and network data."""
        # Configure fake psutil responses
        mock_cpu.return_value = 12.5

        class MemInfo:
            percent = 50.0
            available = 123456

        class DiskInfo:
            percent = 70.0
            free = 987654

        class NetInfo:
            bytes_sent = 111
            bytes_recv = 222

        mock_mem.return_value = MemInfo()
        mock_disk.return_value = DiskInfo()
        mock_net.return_value = NetInfo()

        # Call update_system_metrics directly
        self.middleware.update_system_metrics()
        metrics = cache.get("system_metrics")

        self.assertIsNotNone(metrics)
        self.assertIn("timestamp", metrics)
        self.assertEqual(metrics["cpu_percent"], 12.5)
        self.assertEqual(metrics["memory_percent"], 50.0)
        self.assertEqual(metrics["memory_available"], 123456)
        self.assertEqual(metrics["disk_percent"], 70.0)
        self.assertEqual(metrics["disk_free"], 987654)
        self.assertEqual(metrics["network_bytes_sent"], 111)
        self.assertEqual(metrics["network_bytes_recv"], 222)

    def test_suspicious_request_flagged_and_reason_explained(self):
        """Should flag suspicious XSS-like query and provide appropriate reason."""
        request = self.factory.get("/health/?q=<script>alert('x')</script>")
        # Ensure request rate counter does not block the first request
        is_suspicious = self.middleware.is_suspicious_request(request)
        self.assertTrue(is_suspicious)

        reason = self.middleware.get_suspicious_reason(request)
        self.assertEqual(reason, "XSS attempt detected")

    def test_high_request_rate_is_marked_as_suspicious(self):
        """Should mark high-frequency requests from same IP as suspicious."""
        # Use a fixed META so the same IP is seen
        base_request = self.factory.get("/api/resource/", REMOTE_ADDR="1.2.3.4")

        # Simulate many requests from same IP within a minute
        for _ in range(101):
            _ = self.middleware.is_suspicious_request(base_request)

        # Next check should be flagged as suspicious due to rate
        suspicious = self.middleware.is_suspicious_request(base_request)
        self.assertTrue(suspicious)
        self.assertEqual(self.middleware.get_suspicious_reason(base_request), "High request rate detected")


class MetricsMiddlewareUnitTest(TestCase):
    """Unit tests for MetricsMiddleware aggregated metrics behavior."""

    def setUp(self):
        self.factory = RequestFactory()
        self.middleware = MetricsMiddleware(get_response=lambda r: HttpResponse("OK"))
        cache.clear()

    def tearDown(self):
        cache.clear()

    def test_aggregates_endpoint_metrics_and_status_codes(self):
        """Should aggregate per-endpoint counts, times, and status code tallies."""
        request = self.factory.get("/api/test-endpoint/")
        request._monitoring_start_time = time.time() - 0.05  # simulate 50ms work

        response = HttpResponse("OK", status=201)
        self.middleware.update_metrics(request, response, 0.05)

        metrics = cache.get("api_metrics")
        self.assertIsNotNone(metrics)
        self.assertEqual(metrics["total_requests"], 1)
        self.assertAlmostEqual(metrics["total_response_time"], 0.05, places=3)
        self.assertIn("201", metrics["status_codes"])
        self.assertEqual(metrics["status_codes"]["201"], 1)

        endpoint_key = "GET /api/test-endpoint/"
        self.assertIn(endpoint_key, metrics["endpoints"])
        endpoint_metrics = metrics["endpoints"][endpoint_key]
        self.assertEqual(endpoint_metrics["count"], 1)
        self.assertAlmostEqual(endpoint_metrics["total_time"], 0.05, places=3)
        self.assertAlmostEqual(endpoint_metrics["avg_time"], 0.05, places=3)

    def test_update_metrics_handles_multiple_calls_for_same_endpoint(self):
        """Should correctly update counts and recompute average time over multiple calls."""
        request = self.factory.get("/api/multi-endpoint/")

        # First request ~10ms
        self.middleware.update_metrics(request, HttpResponse("OK"), 0.01)
        # Second request ~30ms
        self.middleware.update_metrics(request, HttpResponse("OK"), 0.03)

        metrics = cache.get("api_metrics")
        endpoint_key = "GET /api/multi-endpoint/"
        endpoint_metrics = metrics["endpoints"][endpoint_key]

        self.assertEqual(endpoint_metrics["count"], 2)
        self.assertAlmostEqual(endpoint_metrics["total_time"], 0.04, places=3)
        # Average should be 0.02 seconds
        self.assertAlmostEqual(endpoint_metrics["avg_time"], 0.02, places=3)


class HealthCheckMiddlewareUnitTest(TestCase):
    """Unit tests for HealthCheckMiddleware quick responses."""

    def setUp(self):
        self.factory = RequestFactory()
        self.middleware = HealthCheckMiddleware(get_response=lambda r: HttpResponse("NOT USED"))

    def test_returns_json_for_health_path(self):
        """Should short-circuit /health/ with healthy JSON payload."""
        request = self.factory.get("/health/")
        response = self.middleware.process_request(request)

        self.assertIsNotNone(response)
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["service"], "edumindsolutions-api")
        self.assertIn("timestamp", data)

    def test_returns_none_for_non_health_paths(self):
        """Should not intercept non-health paths, returning None."""
        request = self.factory.get("/other/")
        response = self.middleware.process_request(request)
        self.assertIsNone(response)

    def test_supports_all_configured_health_paths(self):
        """Should respond for /health/, /health/quick/, and /ping/ paths."""
        for path in ["/health/", "/health/quick/", "/ping/"]:
            request = self.factory.get(path)
            response = self.middleware.process_request(request)
            self.assertIsNotNone(response, msg=f"Expected response for path {path}")
            self.assertEqual(response.status_code, 200)
