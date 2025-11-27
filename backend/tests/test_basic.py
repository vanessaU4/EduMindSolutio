"""Basic tests to ensure Django setup works correctly."""

from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse

User = get_user_model()


class BasicTestCase(TestCase):
    """Basic functionality tests."""

    def test_user_creation(self):
        """Test that users can be created."""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.email, 'test@example.com')
        self.assertTrue(user.check_password('testpass123'))

    def test_admin_user_creation(self):
        """Test that admin users can be created."""
        admin = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='adminpass123'
        )
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)

    def test_string_representation(self):
        """Test string representation of models."""
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com'
        )
        # User model returns email and role, not just username
        self.assertIn('test@example.com', str(user))


class HealthCheckTestCase(TestCase):
    """Health check endpoint tests."""

    def test_health_endpoint(self):
        """Test that health endpoint returns 200."""
        response = self.client.get('/health/')
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertEqual(data['status'], 'healthy')
        self.assertEqual(data['service'], 'edumindsolutions-api')
        self.assertIn('timestamp', data)