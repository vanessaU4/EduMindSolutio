import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { RootState } from '@/app/store';
import HealthcareSidebar from './HealthcareSidebar';
import HealthcareTopBar from './HealthcareTopBar';
import HealthcareFooter from './HealthcareFooter';
import CrisisButton from './CrisisButton';

interface HealthcareLayoutProps {
  children: React.ReactNode;
}

const HealthcareLayout: React.FC<HealthcareLayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  // Check if current route is a dashboard page
  const isDashboardPage = location.pathname.startsWith('/dashboard') || 
                          location.pathname.startsWith('/guide') || 
                          location.pathname.startsWith('/admin') ||
                          location.pathname.startsWith('/community') ||
                          location.pathname.startsWith('/wellness') ||
                          location.pathname.startsWith('/assessments') ||
                          location.pathname.startsWith('/education') ||
                          location.pathname.startsWith('/resources') ||
                          location.pathname.startsWith('/mood') ||
                          location.pathname.startsWith('/profile') ||
                          location.pathname.startsWith('/settings') ||
                          location.pathname.startsWith('/progress') ||
                          location.pathname.startsWith('/crisis');

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        setIsSidebarCollapsed(true);
        setIsMobileMenuOpen(false);
      }
    };

    handleResize(); // Check initial size
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isMobileMenuOpen && !target.closest('aside') && !target.closest('[data-mobile-menu-trigger]')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-healthcare-bg">
      {/* Skip to main content for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-healthcare-primary text-white px-4 py-2 rounded-md z-50"
      >
        Skip to main content
      </a>

      {/* Desktop Sidebar */}
      {isAuthenticated && (
        <>
          <div className="hidden md:block">
            <HealthcareSidebar 
              isCollapsed={isSidebarCollapsed} 
              onToggleCollapse={toggleSidebarCollapse}
            />
          </div>

          {/* Mobile Sidebar Overlay */}
          <div className="md:hidden">
            {isMobileMenuOpen && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 bg-black bg-opacity-50 z-30"
                  onClick={() => setIsMobileMenuOpen(false)}
                />
                
                {/* Mobile Sidebar */}
                <div className="fixed left-0 top-0 z-40 h-screen">
                  <HealthcareSidebar 
                    isCollapsed={false} 
                    onToggleCollapse={() => setIsMobileMenuOpen(false)}
                  />
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* Top Bar for Mobile and Unauthenticated Users */}
      <HealthcareTopBar 
        onMobileMenuToggle={toggleMobileMenu}
        isMobileMenuOpen={isMobileMenuOpen}
        showMobileToggle={isAuthenticated}
      />

      {/* Main Content */}
      <main 
        id="main-content"
        className={`
          transition-all duration-300
          ${isAuthenticated 
            ? `md:ml-${isSidebarCollapsed ? '16' : '64'} pt-16 md:pt-0` 
            : 'pt-16'
          }
          ${isDashboardPage ? 'min-h-screen' : ''}
        `}
        style={{
          marginLeft: isAuthenticated && window.innerWidth >= 768 
            ? (isSidebarCollapsed ? '4rem' : '16rem') 
            : '0'
        }}
      >
        {isDashboardPage ? (
          // Dashboard pages - no footer, full height content
          <div className="min-h-screen">
            {children}
          </div>
        ) : (
          // Regular pages - with footer
          <div className="flex flex-col min-h-screen">
            <div className="flex-grow">
              {children}
            </div>
            <HealthcareFooter />
          </div>
        )}
      </main>

      {/* Crisis Button - Always Available */}
      <CrisisButton />
    </div>
  );
};

export default HealthcareLayout;
