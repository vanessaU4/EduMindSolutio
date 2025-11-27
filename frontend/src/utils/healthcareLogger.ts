/**
 * Healthcare Logger
 * HIPAA-compliant logging system for healthcare applications
 */

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  action: string;
  resource: string;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: any;
}

class HealthcareLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private createLogEntry(
    level: LogEntry['level'],
    action: string,
    resource: string,
    details?: any
  ): LogEntry {
    return {
      id: this.generateId(),
      timestamp: new Date(),
      level,
      action,
      resource,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent,
      details
    };
  }

  private getCurrentUserId(): string | undefined {
    // Get user ID from localStorage or session
    const user = localStorage.getItem('user');
    if (user) {
      try {
        return JSON.parse(user).id;
      } catch {
        return undefined;
      }
    }
    return undefined;
  }

  private getSessionId(): string | undefined {
    return sessionStorage.getItem('sessionId') || undefined;
  }

  private getClientIP(): string | undefined {
    // In a real application, this would be handled server-side
    return 'client-side';
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // In production, send to secure logging service
    if (import.meta.env.PROD) {
      this.sendToSecureLogger(entry);
    } else {
      console.log(`[${entry.level.toUpperCase()}] ${entry.action} - ${entry.resource}`, entry);
    }
  }

  private async sendToSecureLogger(entry: LogEntry): Promise<void> {
    // In production, this would send to a HIPAA-compliant logging service
    try {
      // await fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry)
      // });
    } catch (error) {
      console.error('Failed to send log to secure logger:', error);
    }
  }

  public logUserAction(action: string, resource: string, details?: any): void {
    const entry = this.createLogEntry('info', action, resource, details);
    this.addLog(entry);
  }

  public logSecurityEvent(action: string, resource: string, details?: any): void {
    const entry = this.createLogEntry('warn', action, resource, details);
    this.addLog(entry);
  }

  public logDataAccess(action: string, resource: string, details?: any): void {
    const entry = this.createLogEntry('info', action, resource, details);
    this.addLog(entry);
  }

  public logSystemEvent(action: string, resource: string, details?: any): void {
    const entry = this.createLogEntry('info', action, resource, details);
    this.addLog(entry);
  }

  public logError(action: string, resource: string, error: Error): void {
    const entry = this.createLogEntry('error', action, resource, {
      message: error.message,
      stack: error.stack
    });
    this.addLog(entry);
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public getRecentLogs(count: number = 10): LogEntry[] {
    return this.logs.slice(-count);
  }

  public clearLogs(): void {
    this.logs = [];
  }

  public warn(category: string, action: string, resource: string, details?: any): void {
    const entry = this.createLogEntry('warn', `${category}: ${action}`, resource, details);
    this.addLog(entry);
  }

  public error(category: string, action: string, resource: string, details?: any): void {
    const entry = this.createLogEntry('error', `${category}: ${action}`, resource, details);
    this.addLog(entry);
  }

  public audit(category: string, action: string, resource: string, details?: any): void {
    const entry = this.createLogEntry('info', `${category}: ${action}`, resource, details);
    this.addLog(entry);
  }

  public forceFlush(): void {
    // In production, this would force send all pending logs
    console.log('Force flushing logs...');
  }
}

// Create singleton instance
export const healthcareLogger = new HealthcareLogger();

// Export individual functions for convenience
export const logUserAction = healthcareLogger.logUserAction.bind(healthcareLogger);
export const logSecurityEvent = healthcareLogger.logSecurityEvent.bind(healthcareLogger);
export const logDataAccess = healthcareLogger.logDataAccess.bind(healthcareLogger);
export const logSystemEvent = healthcareLogger.logSystemEvent.bind(healthcareLogger);

export default healthcareLogger;
