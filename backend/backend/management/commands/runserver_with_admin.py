"""
Custom runserver command that seeds admin user on startup
"""

from django.core.management.commands.runserver import Command as RunserverCommand
from django.core.management import call_command


class Command(RunserverCommand):
    help = 'Start development server and seed admin user'

    def handle(self, *args, **options):
        # Seed admin user before starting server
        self.stdout.write('Seeding admin user...')
        call_command('seed_admin')
        
        # Start the development server
        super().handle(*args, **options)
