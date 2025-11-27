import time
from django.core.management.base import BaseCommand
from django.db import connections
from django.db.utils import OperationalError

class Command(BaseCommand):
    help = 'Wait for database to be available'

    def add_arguments(self, parser):
        parser.add_argument(
            '--timeout',
            type=int,
            default=30,
            help='Maximum time to wait for database (seconds)'
        )

    def handle(self, *args, **options):
        timeout = options['timeout']
        self.stdout.write('⏳ Waiting for database connection...')
        
        db_conn = None
        start_time = time.time()
        
        while not db_conn:
            try:
                # Get the default database connection
                db_conn = connections['default']
                # Try to execute a simple query
                db_conn.cursor()
                
            except OperationalError:
                elapsed_time = time.time() - start_time
                if elapsed_time >= timeout:
                    self.stdout.write(
                        self.style.ERROR(f'❌ Database unavailable after {timeout} seconds')
                    )
                    raise
                
                self.stdout.write('⏳ Database unavailable, waiting 1 second...')
                time.sleep(1)

        self.stdout.write(
            self.style.SUCCESS('✅ Database connection established!')
        )
