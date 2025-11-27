"""Simple tests that will always pass."""

from django.test import TestCase


class SimpleTestCase(TestCase):
    """Simple tests to ensure test runner works."""

    def test_basic_math(self):
        """Test basic math operations."""
        self.assertEqual(2 + 2, 4)
        self.assertEqual(10 - 5, 5)
        self.assertEqual(3 * 4, 12)

    def test_string_operations(self):
        """Test string operations."""
        self.assertEqual('hello'.upper(), 'HELLO')
        self.assertEqual('WORLD'.lower(), 'world')
        self.assertTrue('test' in 'testing')

    def test_list_operations(self):
        """Test list operations."""
        test_list = [1, 2, 3, 4, 5]
        self.assertEqual(len(test_list), 5)
        self.assertIn(3, test_list)
        self.assertEqual(test_list[0], 1)

    def test_boolean_logic(self):
        """Test boolean operations."""
        self.assertTrue(True)
        self.assertFalse(False)
        self.assertTrue(1 == 1)
        self.assertFalse(1 == 2)