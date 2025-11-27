import React, { createContext, useContext, useEffect, useState } from 'react';

interface AccessibilityContextType {
  isHighContrast: boolean;
  isReducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  isScreenReaderActive: boolean;
  focusVisible: boolean;
  toggleHighContrast: () => void;
  toggleReducedMotion: () => void;
  setFontSize: (size: 'small' | 'medium' | 'large' | 'extra-large') => void;
  announceToScreenReader: (message: string) => void;
  setFocusVisible: (visible: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);
  const [fontSize, setFontSizeState] = useState<'small' | 'medium' | 'large' | 'extra-large'>('medium');
  const [isScreenReaderActive, setIsScreenReaderActive] = useState<boolean>(false);
  const [focusVisible, setFocusVisible] = useState<boolean>(false);

  useEffect(() => {
    // Check for user preferences from system settings
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    setIsHighContrast(prefersHighContrast);
    setIsReducedMotion(prefersReducedMotion);

    // Load saved preferences from localStorage
    const savedPreferences = localStorage.getItem('accessibility-preferences');
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences);
        setIsHighContrast(preferences.isHighContrast ?? prefersHighContrast);
        setIsReducedMotion(preferences.isReducedMotion ?? prefersReducedMotion);
        setFontSizeState(preferences.fontSize ?? 'medium');
      } catch (error) {
        console.error('Error loading accessibility preferences:', error);
      }
    }

    // Detect screen reader usage
    const detectScreenReader = () => {
      // Check for common screen reader indicators
      const hasScreenReader = 
        navigator.userAgent.includes('NVDA') ||
        navigator.userAgent.includes('JAWS') ||
        navigator.userAgent.includes('VoiceOver') ||
        window.speechSynthesis !== undefined;
      
      setIsScreenReaderActive(hasScreenReader);
    };

    detectScreenReader();

    // Listen for system preference changes
    const contrastMediaQuery = window.matchMedia('(prefers-contrast: high)');
    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleContrastChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches);
    };

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };

    contrastMediaQuery.addEventListener('change', handleContrastChange);
    motionMediaQuery.addEventListener('change', handleMotionChange);

    // Focus management for keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setFocusVisible(true);
      }
    };

    const handleMouseDown = () => {
      setFocusVisible(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      contrastMediaQuery.removeEventListener('change', handleContrastChange);
      motionMediaQuery.removeEventListener('change', handleMotionChange);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  useEffect(() => {
    // Apply accessibility settings to document
    const root = document.documentElement;

    // High contrast mode
    if (isHighContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Reduced motion
    if (isReducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Font size
    root.classList.remove('font-small', 'font-medium', 'font-large', 'font-extra-large');
    root.classList.add(`font-${fontSize}`);

    // Focus visible
    if (focusVisible) {
      root.classList.add('focus-visible');
    } else {
      root.classList.remove('focus-visible');
    }

    // Save preferences to localStorage
    const preferences = {
      isHighContrast,
      isReducedMotion,
      fontSize,
    };
    localStorage.setItem('accessibility-preferences', JSON.stringify(preferences));

  }, [isHighContrast, isReducedMotion, fontSize, focusVisible]);

  const toggleHighContrast = (): void => {
    setIsHighContrast(prev => !prev);
    announceToScreenReader(
      isHighContrast ? 'High contrast mode disabled' : 'High contrast mode enabled'
    );
  };

  const toggleReducedMotion = (): void => {
    setIsReducedMotion(prev => !prev);
    announceToScreenReader(
      isReducedMotion ? 'Reduced motion disabled' : 'Reduced motion enabled'
    );
  };

  const setFontSize = (size: 'small' | 'medium' | 'large' | 'extra-large'): void => {
    setFontSizeState(size);
    announceToScreenReader(`Font size changed to ${size}`);
  };

  const announceToScreenReader = (message: string): void => {
    // Create a live region for screen reader announcements
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove the announcement after a short delay
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  const contextValue: AccessibilityContextType = {
    isHighContrast,
    isReducedMotion,
    fontSize,
    isScreenReaderActive,
    focusVisible,
    toggleHighContrast,
    toggleReducedMotion,
    setFontSize,
    announceToScreenReader,
    setFocusVisible,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

export default AccessibilityProvider;
