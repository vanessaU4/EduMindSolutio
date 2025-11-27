"""
Alerting System
Monitors system metrics and triggers alerts based on thresholds
"""

import time
import logging
import json
from typing import Dict, List, Any, Optional
from django.core.cache import cache
from django.conf import settings
from django.core.mail import send_mail
import psutil
import threading

# Logger
alert_logger = logging.getLogger('performance')

class AlertManager:
    """
    Manages alert rules, thresholds, and notifications
    """
    
    def __init__(self):
        self.alert_rules = self._load_alert_rules()
        self.active_alerts = {}
        self.notification_channels = self._setup_notification_channels()
    
    def _load_alert_rules(self) -> Dict[str, Dict]:
        """Load alert rules configuration"""
        return {
            'high_cpu_usage': {
                'name': 'High CPU Usage',
                'description': 'CPU usage is above threshold',
                'metric': 'cpu_percent',
                'threshold': 80.0,
                'operator': '>',
                'duration': 300,  # 5 minutes
                'severity': 'warning',
                'enabled': True,
            },
            'critical_cpu_usage': {
                'name': 'Critical CPU Usage',
                'description': 'CPU usage is critically high',
                'metric': 'cpu_percent',
                'threshold': 95.0,
                'operator': '>',
                'duration': 60,  # 1 minute
                'severity': 'critical',
                'enabled': True,
            },
            'high_memory_usage': {
                'name': 'High Memory Usage',
                'description': 'Memory usage is above threshold',
                'metric': 'memory_percent',
                'threshold': 85.0,
                'operator': '>',
                'duration': 300,
                'severity': 'warning',
                'enabled': True,
            },
            'critical_memory_usage': {
                'name': 'Critical Memory Usage',
                'description': 'Memory usage is critically high',
                'metric': 'memory_percent',
                'threshold': 95.0,
                'operator': '>',
                'duration': 60,
                'severity': 'critical',
                'enabled': True,
            },
            'high_disk_usage': {
                'name': 'High Disk Usage',
                'description': 'Disk usage is above threshold',
                'metric': 'disk_percent',
                'threshold': 90.0,
                'operator': '>',
                'duration': 600,  # 10 minutes
                'severity': 'warning',
                'enabled': True,
            },
            'slow_response_time': {
                'name': 'Slow Response Time',
                'description': 'Average response time is too high',
                'metric': 'avg_response_time',
                'threshold': 2.0,
                'operator': '>',
                'duration': 300,
                'severity': 'warning',
                'enabled': True,
            },
            'high_error_rate': {
                'name': 'High Error Rate',
                'description': 'Error rate is above threshold',
                'metric': 'error_rate',
                'threshold': 5.0,  # 5%
                'operator': '>',
                'duration': 180,
                'severity': 'critical',
                'enabled': True,
            },
            'database_connection_failure': {
                'name': 'Database Connection Failure',
                'description': 'Database is not responding',
                'metric': 'database_healthy',
                'threshold': False,
                'operator': '==',
                'duration': 30,
                'severity': 'critical',
                'enabled': True,
            },
            'security_threat_detected': {
                'name': 'Security Threat Detected',
                'description': 'Suspicious activity detected',
                'metric': 'suspicious_requests',
                'threshold': 10,
                'operator': '>',
                'duration': 60,
                'severity': 'critical',
                'enabled': True,
            },
        }
    
    def _setup_notification_channels(self) -> Dict[str, Dict]:
        """Setup notification channels"""
        return {
            'email': {
                'enabled': True,
                'recipients': ['admin@example.com', 'devops@example.com'],
                'severity_filter': ['warning', 'critical'],
            },
            'slack': {
                'enabled': False,  # Would need Slack webhook URL
                'webhook_url': '',
                'channel': '#alerts',
                'severity_filter': ['critical'],
            },
            'webhook': {
                'enabled': True,
                'url': '/monitoring/alerts/webhook/',
                'severity_filter': ['warning', 'critical'],
            },
        }
    
    def check_alerts(self, metrics: Dict[str, Any]) -> List[Dict]:
        """Check all alert rules against current metrics"""
        triggered_alerts = []
        
        for rule_id, rule in self.alert_rules.items():
            if not rule['enabled']:
                continue
            
            if self._evaluate_rule(rule, metrics):
                alert = self._create_alert(rule_id, rule, metrics)
                if self._should_trigger_alert(rule_id, alert):
                    triggered_alerts.append(alert)
                    self._send_notifications(alert)
        
        return triggered_alerts
    
    def _evaluate_rule(self, rule: Dict, metrics: Dict[str, Any]) -> bool:
        """Evaluate a single alert rule"""
        metric_name = rule['metric']
        threshold = rule['threshold']
        operator = rule['operator']
        
        # Get metric value from nested metrics structure
        metric_value = self._get_metric_value(metrics, metric_name)
        
        if metric_value is None:
            return False
        
        # Evaluate condition
        if operator == '>':
            return metric_value > threshold
        elif operator == '<':
            return metric_value < threshold
        elif operator == '>=':
            return metric_value >= threshold
        elif operator == '<=':
            return metric_value <= threshold
        elif operator == '==':
            return metric_value == threshold
        elif operator == '!=':
            return metric_value != threshold
        
        return False
    
    def _get_metric_value(self, metrics: Dict[str, Any], metric_name: str) -> Optional[float]:
        """Extract metric value from metrics dictionary"""
        # Handle nested metric paths
        if metric_name == 'cpu_percent':
            return metrics.get('system', {}).get('cpu_percent')
        elif metric_name == 'memory_percent':
            return metrics.get('system', {}).get('memory_percent')
        elif metric_name == 'disk_percent':
            return metrics.get('system', {}).get('disk_percent')
        elif metric_name == 'avg_response_time':
            return metrics.get('application', {}).get('api', {}).get('avg_response_time')
        elif metric_name == 'database_healthy':
            return metrics.get('database', {}).get('healthy')
        elif metric_name == 'error_rate':
            # Calculate error rate from status codes
            status_codes = metrics.get('application', {}).get('api', {}).get('status_codes', {})
            total_requests = sum(status_codes.values())
            error_requests = sum(int(count) for code, count in status_codes.items() if code.startswith(('4', '5')))
            return (error_requests / total_requests * 100) if total_requests > 0 else 0
        elif metric_name == 'suspicious_requests':
            return metrics.get('security', {}).get('suspicious_requests', 0)
        
        return None
    
    def _create_alert(self, rule_id: str, rule: Dict, metrics: Dict[str, Any]) -> Dict:
        """Create alert object"""
        return {
            'id': f"{rule_id}_{int(time.time())}",
            'rule_id': rule_id,
            'name': rule['name'],
            'description': rule['description'],
            'severity': rule['severity'],
            'metric': rule['metric'],
            'threshold': rule['threshold'],
            'current_value': self._get_metric_value(metrics, rule['metric']),
            'timestamp': time.time(),
            'status': 'active',
        }
    
    def _should_trigger_alert(self, rule_id: str, alert: Dict) -> bool:
        """Check if alert should be triggered based on duration"""
        rule = self.alert_rules[rule_id]
        duration = rule['duration']
        
        # Check if this alert is already active
        if rule_id in self.active_alerts:
            # Check if enough time has passed since first detection
            first_detected = self.active_alerts[rule_id]['first_detected']
            if time.time() - first_detected >= duration:
                return True
        else:
            # First time detecting this condition
            self.active_alerts[rule_id] = {
                'first_detected': time.time(),
                'last_triggered': 0,
            }
        
        return False
    
    def _send_notifications(self, alert: Dict):
        """Send alert notifications through configured channels"""
        severity = alert['severity']
        
        for channel_name, channel_config in self.notification_channels.items():
            if not channel_config['enabled']:
                continue
            
            if severity not in channel_config['severity_filter']:
                continue
            
            try:
                if channel_name == 'email':
                    self._send_email_notification(alert, channel_config)
                elif channel_name == 'slack':
                    self._send_slack_notification(alert, channel_config)
                elif channel_name == 'webhook':
                    self._send_webhook_notification(alert, channel_config)
            except Exception as e:
                alert_logger.error(f"Failed to send {channel_name} notification: {e}")
    
    def _send_email_notification(self, alert: Dict, config: Dict):
        """Send email notification"""
        subject = f"[{alert['severity'].upper()}] {alert['name']}"
        message = f"""
Alert: {alert['name']}
Severity: {alert['severity']}
Description: {alert['description']}
Current Value: {alert['current_value']}
Threshold: {alert['threshold']}
Time: {time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(alert['timestamp']))}

Please investigate and take appropriate action.
        """
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=config['recipients'],
            fail_silently=False,
        )
        
        alert_logger.info(f"Email alert sent: {alert['name']}")
    
    def _send_slack_notification(self, alert: Dict, config: Dict):
        """Send Slack notification"""
        # Implementation would use Slack webhook
        # This is a placeholder for the actual implementation
        alert_logger.info(f"Slack alert would be sent: {alert['name']}")
    
    def _send_webhook_notification(self, alert: Dict, config: Dict):
        """Send webhook notification"""
        # Implementation would make HTTP POST to webhook URL
        # This is a placeholder for the actual implementation
        alert_logger.info(f"Webhook alert would be sent: {alert['name']}")
    
    def resolve_alert(self, rule_id: str):
        """Mark alert as resolved"""
        if rule_id in self.active_alerts:
            del self.active_alerts[rule_id]
            alert_logger.info(f"Alert resolved: {rule_id}")
    
    def get_active_alerts(self) -> List[Dict]:
        """Get list of currently active alerts"""
        return [
            {
                'rule_id': rule_id,
                'name': self.alert_rules[rule_id]['name'],
                'severity': self.alert_rules[rule_id]['severity'],
                'first_detected': data['first_detected'],
                'duration': time.time() - data['first_detected'],
            }
            for rule_id, data in self.active_alerts.items()
        ]


class MetricsCollector:
    """
    Collects metrics from various sources for alerting
    """
    
    def __init__(self):
        self.alert_manager = AlertManager()
    
    def collect_all_metrics(self) -> Dict[str, Any]:
        """Collect all metrics for alerting"""
        return {
            'system': self._collect_system_metrics(),
            'application': self._collect_application_metrics(),
            'database': self._collect_database_metrics(),
            'security': self._collect_security_metrics(),
        }
    
    def _collect_system_metrics(self) -> Dict[str, float]:
        """Collect system metrics"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            return {
                'cpu_percent': cpu_percent,
                'memory_percent': memory.percent,
                'disk_percent': disk.percent,
            }
        except Exception as e:
            alert_logger.error(f"Failed to collect system metrics: {e}")
            return {}
    
    def _collect_application_metrics(self) -> Dict[str, Any]:
        """Collect application metrics"""
        try:
            api_metrics = cache.get('api_metrics', {})
            return {
                'api': api_metrics
            }
        except Exception as e:
            alert_logger.error(f"Failed to collect application metrics: {e}")
            return {}
    
    def _collect_database_metrics(self) -> Dict[str, Any]:
        """Collect database metrics"""
        try:
            from django.db import connection
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                return {'healthy': True}
        except Exception as e:
            alert_logger.error(f"Database health check failed: {e}")
            return {'healthy': False}
    
    def _collect_security_metrics(self) -> Dict[str, int]:
        """Collect security metrics"""
        try:
            return {
                'suspicious_requests': cache.get('suspicious_requests_count', 0),
                'failed_auth_attempts': cache.get('failed_auth_count', 0),
            }
        except Exception as e:
            alert_logger.error(f"Failed to collect security metrics: {e}")
            return {}
    
    def run_alert_check(self):
        """Run complete alert check cycle"""
        try:
            metrics = self.collect_all_metrics()
            triggered_alerts = self.alert_manager.check_alerts(metrics)
            
            if triggered_alerts:
                alert_logger.warning(f"Triggered {len(triggered_alerts)} alerts")
            
            return triggered_alerts
        except Exception as e:
            alert_logger.error(f"Alert check failed: {e}")
            return []


# Global metrics collector instance
metrics_collector = MetricsCollector()


def run_periodic_alert_check():
    """Run periodic alert checks in background thread"""
    def alert_check_loop():
        while True:
            try:
                metrics_collector.run_alert_check()
                time.sleep(60)  # Check every minute
            except Exception as e:
                alert_logger.error(f"Alert check loop error: {e}")
                time.sleep(60)
    
    # Start background thread for alert checking
    alert_thread = threading.Thread(target=alert_check_loop, daemon=True)
    alert_thread.start()
    alert_logger.info("Started periodic alert checking")


# Auto-start alert checking when module is imported
if getattr(settings, 'ENABLE_ALERTING', True):
    run_periodic_alert_check()
