import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import CryptoJS from 'crypto-js';
import { compliance, initializeConfig } from '@/utils/config';
import { healthcareLogger, logUserAction, logSecurityEvent, logDataAccess, logSystemEvent } from '@/utils/healthcareLogger';

interface ComplianceContextType {
  isHIPAACompliant: boolean;
  encryptData: (data: string) => string;
  decryptData: (encryptedData: string) => string;
  logAccess: (action: string, resource: string, metadata?: any) => void;
  auditTrail: AuditEntry[];
  sessionTimeout: number;
  lastActivity: Date;
  updateActivity: () => void;
}

interface AuditEntry {
  id: string;
  timestamp: Date;
  action: string;
  resource: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

const ComplianceContext = createContext<ComplianceContextType | undefined>(undefined);

interface ComplianceProviderProps {
  children: React.ReactNode;
}

const ComplianceProvider: React.FC<ComplianceProviderProps> = ({ children }) => {
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>([]);
  const [lastActivity, setLastActivity] = useState<Date>(new Date());

  // Initialize configuration on component mount
  React.useEffect(() => {
    initializeConfig();
  }, []);

  // Get session timeout from centralized config
  const [sessionTimeout] = useState<number>(compliance.sessionTimeoutMinutes * 60 * 1000);

  // HIPAA-compliant encryption key from centralized config
  const encryptionKey = React.useMemo(() => {
    return compliance.encryptionKey;
  }, []);

  // Define updateActivity before useEffect to avoid temporal dead zone
  const updateActivity = useCallback((): void => {
    setLastActivity(new Date());
    // Only log significant activity in production, suppress in dev to reduce console spam
    if (!import.meta.env.DEV) {
      logUserAction('USER_ACTIVITY', 'APPLICATION');
    }
  }, []);

  useEffect(() => {
    // Initialize compliance monitoring (suppress in dev)
    if (!import.meta.env.DEV) {
      logSystemEvent('SESSION_START', 'APPLICATION');
    }

    // Set up throttled activity monitoring - only track meaningful interactions
    const significantEvents = ['click', 'keydown', 'focus', 'blur'];
    let activityTimeout: NodeJS.Timeout;

    const updateActivityHandler = () => {
      // Throttle activity updates to prevent spam
      clearTimeout(activityTimeout);
      activityTimeout = setTimeout(() => {
        updateActivity();
      }, 1000); // Debounce for 1 second
    };

    significantEvents.forEach(event => {
      document.addEventListener(event, updateActivityHandler, true);
    });

    // Session timeout monitoring
    const timeoutInterval = setInterval(() => {
      const now = new Date();
      const timeSinceLastActivity = now.getTime() - lastActivity.getTime();

      if (timeSinceLastActivity > sessionTimeout) {
        if (!import.meta.env.DEV) {
          logSecurityEvent('SESSION_TIMEOUT', 'APPLICATION');
          healthcareLogger.warn('SECURITY', 'SESSION_TIMEOUT', 'APPLICATION', {
            timeSinceLastActivity: Math.round(timeSinceLastActivity / 1000),
            sessionTimeoutSeconds: Math.round(sessionTimeout / 1000)
          });
        }
      }
    }, 60000); // Check every minute

    return () => {
      clearTimeout(activityTimeout);
      significantEvents.forEach(event => {
        document.removeEventListener(event, updateActivityHandler, true);
      });
      clearInterval(timeoutInterval);
      // Suppress session end logs in dev
      if (!import.meta.env.DEV) {
        logSystemEvent('SESSION_END', 'APPLICATION');
        healthcareLogger.forceFlush(); // Ensure all logs are flushed on cleanup
      }
    };
  }, [lastActivity, sessionTimeout, updateActivity]);

  const encryptData = (data: string): string => {
    try {
      if (!data || typeof data !== 'string') {
        throw new Error('Invalid data provided for encryption');
      }

      const encrypted = CryptoJS.AES.encrypt(data, encryptionKey).toString();

      if (!encrypted) {
        throw new Error('Encryption resulted in empty string');
      }

      return encrypted;
    } catch (error) {
      healthcareLogger.error('DATA_PROTECTION', 'ENCRYPTION_ERROR', 'HEALTHCARE_DATA', {
        error: error instanceof Error ? error.message : 'Unknown encryption error',
        dataLength: data.length
      });

      // In production, this should trigger security alerts
      if (compliance.hipaaMode && !import.meta.env.DEV) {
        throw new Error('Healthcare data encryption failed - security protocol activated');
      }

      return data; // Development fallback only
    }
  };

  const decryptData = (encryptedData: string): string => {
    try {
      if (!encryptedData || typeof encryptedData !== 'string') {
        throw new Error('Invalid encrypted data provided for decryption');
      }

      const bytes = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);

      if (!decrypted) {
        throw new Error('Decryption resulted in empty string');
      }

      return decrypted;
    } catch (error) {
      healthcareLogger.error('DATA_PROTECTION', 'DECRYPTION_ERROR', 'HEALTHCARE_DATA', {
        error: error instanceof Error ? error.message : 'Unknown decryption error',
        encryptedDataLength: encryptedData.length
      });

      // In production, this should trigger security alerts
      if (compliance.hipaaMode && !import.meta.env.DEV) {
        throw new Error('Healthcare data decryption failed - security protocol activated');
      }

      return encryptedData; // Development fallback only
    }
  };

  const logAccess = useCallback((action: string, resource: string, metadata?: any): void => {
    const entry: AuditEntry = {
      id: CryptoJS.lib.WordArray.random(16).toString(),
      timestamp: new Date(),
      action,
      resource,
      userId: getCurrentUserId(),
      ipAddress: getClientIP(),
      userAgent: navigator.userAgent,
    };

    setAuditTrail(prev => {
      const newTrail = [...prev, entry];
      // Keep only last 1000 entries to prevent memory issues
      return newTrail.slice(-1000);
    });

    // Use healthcare logger in production only to prevent dev console spam
    if (!import.meta.env.DEV) {
      healthcareLogger.audit('COMPLIANCE', action, resource, {
        userId: entry.userId,
        ipAddress: entry.ipAddress,
        ...metadata
      });
    }
  }, []);

  const getCurrentUserId = (): string | undefined => {
    // Get user ID from Redux store or localStorage
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id;
      }
    } catch (error) {
      console.error('Error getting user ID:', error);
    }
    return undefined;
  };

  const getClientIP = (): string => {
    // In production, this would be obtained from the server
    return 'client-ip-not-available';
  };

  const contextValue: ComplianceContextType = {
    isHIPAACompliant: true,
    encryptData,
    decryptData,
    logAccess,
    auditTrail,
    sessionTimeout,
    lastActivity,
    updateActivity,
  };

  return (
    <ComplianceContext.Provider value={contextValue}>
      {children}
    </ComplianceContext.Provider>
  );
};

export const useCompliance = (): ComplianceContextType => {
  const context = useContext(ComplianceContext);
  if (context === undefined) {
    throw new Error('useCompliance must be used within a ComplianceProvider');
  }
  return context;
};

export default ComplianceProvider;
