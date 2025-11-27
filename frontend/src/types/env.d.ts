/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Healthcare Platform Configuration
  readonly VITE_ENCRYPTION_KEY: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_DJANGO_BASE_URL: string;
  
  // Compliance Settings
  readonly VITE_HIPAA_COMPLIANCE_MODE: string;
  readonly VITE_AUDIT_LOGGING_ENABLED: string;
  readonly VITE_SESSION_TIMEOUT_MINUTES: string;
  
  // Crisis Support Configuration
  readonly VITE_CRISIS_HOTLINE_PRIMARY: string;
  readonly VITE_CRISIS_TEXT_LINE: string;
  readonly VITE_EMERGENCY_NUMBER: string;
  
  // Platform Configuration
  readonly VITE_PLATFORM_NAME: string;
  readonly VITE_PLATFORM_VERSION: string;
  readonly VITE_TARGET_AGE_MIN: string;
  readonly VITE_TARGET_AGE_MAX: string;
  
  // Development Settings
  readonly VITE_DEV_MODE: string;
  readonly VITE_ENABLE_REACT_DEVTOOLS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
