/**
 * Application Configuration
 * Contains platform settings, compliance configuration, and crisis support information
 */

export const config = {
  platform: {
    name: "EduMind Solutions",
    version: "1.0.0",
    targetAgeMin: 13,
    targetAgeMax: 23,
    description: "Professional mental health platform for youth aged 13-23"
  },
  
  development: {
    isDev: import.meta.env.DEV,
    apiUrl: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000/api' : 'https://edumindsolutions.onrender.com/api'),
    debugMode: import.meta.env.DEV
  },
  
  compliance: {
    auditLogging: true,
    dataEncryption: true,
    hipaaCompliant: true,
    gdprCompliant: true,
    sessionTimeout: 30, // minutes
    sessionTimeoutMinutes: 30, // Legacy compatibility
    hipaaMode: true,
    encryptionKey: import.meta.env.VITE_ENCRYPTION_KEY || 'default-dev-key-change-in-production',
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true
    }
  },
  
  crisis: {
    primaryHotline: "988 Suicide & Crisis Lifeline",
    textLine: "741741",
    emergency: "911",
    resources: [
      {
        name: "National Suicide Prevention Lifeline",
        phone: "988",
        available: "24/7"
      },
      {
        name: "Crisis Text Line",
        text: "HOME to 741741",
        available: "24/7"
      },
      {
        name: "SAMHSA National Helpline",
        phone: "1-800-662-4357",
        available: "24/7"
      }
    ]
  },
  
  security: {
    encryptionAlgorithm: "AES-256-GCM",
    tokenExpiry: 30, // minutes
    refreshTokenExpiry: 24, // hours
    maxLoginAttempts: 5,
    lockoutDuration: 15 // minutes
  },
  
  accessibility: {
    highContrastMode: false,
    screenReaderSupport: true,
    keyboardNavigation: true,
    fontSize: {
      small: "14px",
      medium: "16px",
      large: "18px",
      extraLarge: "20px"
    }
  },
  
  features: {
    assessments: true,
    community: true,
    wellness: true,
    crisis: true,
    guide: true,
    realTimeChat: true,
    videoSessions: false, // Future feature
    aiAssistant: false // Future feature
  }
};

// Legacy exports for backward compatibility
export const compliance = config.compliance;
export const crisis = config.crisis;
export const apiConfig = {
  baseUrl: config.development.apiUrl,
  timeout: 10000,
  retries: 3
};

// Initialize function for compatibility
export const initializeConfig = () => {
  console.log('Config initialized:', config.platform.name);
  return config;
};

export default config;
