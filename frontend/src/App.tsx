import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "./app/store";
import { useAppDispatch } from "./app/hooks";
import { loadUserFromStorage } from "./features/auth/authSlice";
import { useAuthInit } from "./hooks/useAuthInit";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Healthcare Platform Components
import HealthcareLayout from "./components/Healthcare/HealthcareLayout";

// Authentication & Onboarding
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import RoleSelection from "./pages/Auth/RoleSelection";

// Main Platform Pages
import Dashboard from "./pages/Dashboard/Dashboard";
import UserDashboard from "./pages/Dashboard/UserDashboard";
import GuideDashboard from "./pages/Dashboard/GuideDashboard";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";

// Assessment System
import AssessmentCenter from "./pages/Assessment/AssessmentCenter";
import TakeAssessment from "./pages/Assessment/TakeAssessment";
import AssessmentResults from "./pages/Assessment/AssessmentResults";
import AssessmentHistory from "./pages/Assessment/AssessmentHistory";
import QuestionManager from './pages/Assessment/QuestionManager';
import QuestionAnalytics from './pages/Assessment/QuestionAnalytics';
import AssignAssessments from './pages/Assessment/AssignAssessments';
import CreateAssessment from './pages/Assessment/CreateAssessment';

// Education Pages
import Articles from './pages/Education/Articles';
import Videos from './pages/Education/Videos';
import AudioContent from './pages/Education/AudioContent';
import EducationResourceDirectory from './pages/Education/ResourceDirectory';

// Crisis Support Pages
import CrisisHotlines from '@/pages/Crisis/CrisisHotlines';
import CrisisAlertsPage from '@/pages/Crisis/CrisisAlertsPage';
import GroundingTechniques from '@/pages/Crisis/GroundingTechniques';
import { GuideAssessmentDashboard, AdminAssessmentDashboard } from "./components/Assessments";

// Content Management
import { ContentManagementDashboard } from "./components/Content";

// Community Features
import CommunityHub from "./pages/Community/CommunityHub";
import CommunityForums from "./pages/Community/CommunityForums";
import Forums from "./pages/Community/Forums";
import PeerSupport from "./pages/Community/PeerSupport";
import ChatRooms from "./pages/Community/ChatRooms";

// Wellness & Self-Care
import WellnessCenter from "./pages/Wellness/WellnessCenter";
import WellnessDashboard from "./pages/Wellness/WellnessDashboard";
import MoodTracker from "./pages/Wellness/MoodTracker";
import DailyChallenges from "./pages/Wellness/DailyChallenges";
import Achievements from "./pages/Wellness/Achievements";

// New Mood Tracking System
import { MoodTracker as NewMoodTracker, MoodDashboard } from "./pages/MoodTracker";

// Content & Resources
import EducationCenter from "./pages/Education/EducationCenter";
import ResourceDirectory from "./pages/Resources/ResourceDirectory";
import CrisisResources from "./pages/Crisis/CrisisResources";
import SafetyPlanning from "./pages/Crisis/SafetyPlanning";

// Professional/Guide Features
import GuideLayout from "./layouts/GuideLayout";
import GuideVerification from "./pages/Guide/GuideVerification";
import GuideVerificationPending from "./pages/Guide/GuideVerificationPending";
import GuideAnalytics from "./pages/Guide/Analytics";
import ClientManagement from "./pages/Guide/ClientManagement";
import ClientsPage from "./pages/Clients/ClientsPage";
import CrisisAlerts from "./pages/Guide/CrisisAlerts";
import GuidePeerSupportManagement from "./pages/Guide/PeerSupportManagement";
import ContentModeration from "./pages/Guide/ContentModeration";
import Analytics from "./pages/Guide/Analytics";

// Admin Features
import AdminLayout from "./layouts/AdminLayout";
import SystemAdmin from "./pages/Admin/SystemAdmin";
import UserManagement from "./pages/Admin/UserManagement";
import UserRolesInfo from "./pages/Admin/UserRolesInfo";
import ComplianceReports from "./pages/Admin/ComplianceReports";
import ContentManagement from "./pages/Admin/ContentManagement";
import AssessmentManagement from "./pages/Admin/AssessmentManagement";
import CommunityManagement from "./pages/Admin/CommunityManagement";
import PeerSupportManagement from "./pages/Admin/PeerSupportManagement";
import WellnessManagement from "./pages/Admin/WellnessManagement";
import AdminSettings from "./pages/Admin/Settings";
import AdminMoodTracker from "./pages/Admin/MoodTracker";

import ProtectedRoute from "./components/ProtectedRoute";
import DashboardRouter from "./components/DashboardRouter";
import NotFound from "./pages/NotFound";
import UserProfile from "./pages/Profile/UserProfile";
import Settings from "./pages/Settings/Settings";
import Notifications from "./pages/Notifications/Notifications";
import ProgressTracker from "./pages/Progress/ProgressTracker";
import PrivacyPolicy from "./components/Legal/PrivacyPolicy";
import TermsOfService from "./components/Legal/TermsOfService";
import PrivacyTerms from "./components/Legal/PrivacyTerms";
import MedicalDisclaimer from "./pages/Legal/MedicalDisclaimer";

// UI Components
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Healthcare Compliance
import ComplianceProvider from "./providers/ComplianceProvider";
import AccessibilityProvider from "./providers/AccessibilityProvider";

// Development Testing
import HealthcareTest from "./components/HealthcareTest";
import VideoCallDemo from "./pages/VideoCallDemo";
import TestNotifications from "./pages/TestNotifications";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isInitialized, isAuthenticated } = useAuthInit();

  // Show loading spinner while authentication is being initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Initializing application...</p>
        </div>
      </div>
    );
  }

  return (
    <HealthcareLayout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/role-selection" element={<RoleSelection />} />

        {/* Legal & Compliance */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/medical-disclaimer" element={<MedicalDisclaimer />} />

        {/* Development Testing Route */}
        {import.meta.env.DEV && (
          <Route path="/test" element={<HealthcareTest />} />
        )}
        
        {/* Notifications Test Route */}
        <Route path="/test-notifications" element={
          <ProtectedRoute requireAuth={true}>
            <TestNotifications />
          </ProtectedRoute>
        } />
        
        {/* Video Call Demo */}
        <Route path="/video-call-demo" element={<VideoCallDemo />} />

        {/* Smart Dashboard Router */}
        <Route path="/dashboard-router" element={<DashboardRouter />} />

        {/* Protected User Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requireAuth={true} requireRole="user">
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute requireAuth={true}>
              <UserProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute requireAuth={true}>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute requireAuth={true}>
              <Notifications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/progress"
          element={
            <ProtectedRoute requireAuth={true}>
              <ProgressTracker />
            </ProtectedRoute>
          }
        />

        {/* Assessment System */}
        <Route
          path="/assessments"
          element={
            <ProtectedRoute requireAuth={true}>
              <AssessmentCenter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessments/take/:type"
          element={
            <ProtectedRoute requireAuth={true}>
              <TakeAssessment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessments/results/:id"
          element={
            <ProtectedRoute requireAuth={true}>
              <AssessmentResults />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessments/history"
          element={
            <ProtectedRoute requireAuth={true}>
              <AssessmentHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessments/questions"
          element={
            <ProtectedRoute requireAuth={true}>
              <QuestionManager />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessments/analytics"
          element={
            <ProtectedRoute requireAuth={true}>
              <QuestionAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessments/assign"
          element={
            <ProtectedRoute requireAuth={true}>
              <AssignAssessments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessments/create"
          element={
            <ProtectedRoute requireAuth={true}>
              <CreateAssessment />
            </ProtectedRoute>
          }
        />
        
        {/* Role-based Assessment Management */}
        <Route
          path="/assessments/guide"
          element={
            <ProtectedRoute requireAuth={true}>
              <GuideAssessmentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessments/admin"
          element={
            <ProtectedRoute requireAuth={true}>
              <AdminAssessmentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Content Management */}
        <Route
          path="/content/manage"
          element={
            <ProtectedRoute requireAuth={true}>
              <ContentManagementDashboard />
            </ProtectedRoute>
          }
        />

        {/* Community Features */}
        <Route
          path="/community"
          element={
            <ProtectedRoute requireAuth={true}>
              <CommunityHub />
            </ProtectedRoute>
          }
        />
        <Route
          path="/community/forums"
          element={
            <ProtectedRoute requireAuth={true}>
              <CommunityForums />
            </ProtectedRoute>
          }
        />
        <Route
          path="/community/peer-support"
          element={
            <ProtectedRoute requireAuth={true}>
              <PeerSupport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/community/chat"
          element={
            <ProtectedRoute requireAuth={true}>
              <ChatRooms />
            </ProtectedRoute>
          }
        />

        {/* Wellness & Self-Care */}
        <Route
          path="/wellness"
          element={
            <ProtectedRoute requireAuth={true}>
              <WellnessCenter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wellness/dashboard"
          element={
            <ProtectedRoute requireAuth={true}>
              <WellnessDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wellness/mood-tracker"
          element={
            <ProtectedRoute requireAuth={true}>
              <MoodTracker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wellness/challenges"
          element={
            <ProtectedRoute requireAuth={true}>
              <DailyChallenges />
            </ProtectedRoute>
          }
        />
        <Route
          path="/wellness/achievements"
          element={
            <ProtectedRoute requireAuth={true}>
              <Achievements />
            </ProtectedRoute>
          }
        />

        {/* New Mood Tracking System */}
        <Route
          path="/mood"
          element={
            <ProtectedRoute requireAuth={true}>
              <MoodDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mood/dashboard"
          element={
            <ProtectedRoute requireAuth={true}>
              <MoodDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mood/tracker"
          element={
            <ProtectedRoute requireAuth={true}>
              <NewMoodTracker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mood/history"
          element={
            <ProtectedRoute requireAuth={true}>
              <MoodDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mood/analytics"
          element={
            <ProtectedRoute requireAuth={true}>
              <MoodDashboard />
            </ProtectedRoute>
          }
        />

        {/* Education & Resources */}
        <Route
          path="/education"
          element={
            <ProtectedRoute requireAuth={true}>
              <EducationCenter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/education/articles"
          element={
            <ProtectedRoute requireAuth={true}>
              <Articles />
            </ProtectedRoute>
          }
        />
        <Route
          path="/education/videos"
          element={
            <ProtectedRoute requireAuth={true}>
              <Videos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/education/audio"
          element={
            <ProtectedRoute requireAuth={true}>
              <AudioContent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/education/resources"
          element={
            <ProtectedRoute requireAuth={true}>
              <EducationResourceDirectory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resources"
          element={
            <ProtectedRoute requireAuth={true}>
              <ResourceDirectory />
            </ProtectedRoute>
          }
        />

        {/* Crisis Support */}
        <Route
          path="/crisis"
          element={
            <ProtectedRoute requireAuth={true}>
              <CrisisResources />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crisis/hotlines"
          element={
            <ProtectedRoute requireAuth={true}>
              <CrisisHotlines />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crisis/alerts"
          element={
            <ProtectedRoute requireAuth={true}>
              <CrisisAlertsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crisis/grounding"
          element={
            <ProtectedRoute requireAuth={true}>
              <GroundingTechniques />
            </ProtectedRoute>
          }
        />
        <Route
          path="/safety-plan"
          element={
            <ProtectedRoute requireAuth={true}>
              <SafetyPlanning />
            </ProtectedRoute>
          }
        />

        {/* Guide Verification (Public) */}
        <Route path="/guide/verification" element={<GuideVerification />} />
        <Route path="/guide/verification-pending" element={<GuideVerificationPending />} />
        <Route path="/guide/verification-faq" element={<GuideVerification />} />

        {/* Analytics Route - accessible to guides and admins */}
        <Route
          path="/analytics"
          element={
            <ProtectedRoute requireAuth={true}>
              <Analytics />
            </ProtectedRoute>
          }
        />

        {/* Clients Page - accessible to guides and admins */}
        <Route
          path="/clients"
          element={
            <ProtectedRoute requireAuth={true}>
              <ClientsPage />
            </ProtectedRoute>
          }
        />

        {/* Guide Features */}
        <Route
          path="/guide"
          element={
            <ProtectedRoute requireAuth={true}>
              <GuideDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guide/analytics"
          element={
            <ProtectedRoute requireAuth={true}>
              <GuideAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guide/clients"
          element={
            <ProtectedRoute requireAuth={true}>
              <ClientManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guide/crisis-alerts"
          element={
            <ProtectedRoute requireAuth={true}>
              <CrisisAlerts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guide/peer-support"
          element={
            <ProtectedRoute requireAuth={true}>
              <GuidePeerSupportManagement />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAuth={true} requireRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="user-roles" element={<UserRolesInfo />} />
          <Route path="compliance" element={<ComplianceReports />} />
          <Route path="content" element={<ContentManagement />} />
          <Route path="assessments" element={<AssessmentManagement />} />
          <Route path="community" element={<CommunityManagement />} />
          <Route path="peer-support" element={<PeerSupportManagement />} />
          <Route path="wellness" element={<WellnessManagement />} />
          <Route path="mood-tracker" element={<AdminMoodTracker />} />
          <Route path="config" element={<AdminSettings />} />
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HealthcareLayout>
  );
};

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <ComplianceProvider>
        <AccessibilityProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </TooltipProvider>
        </AccessibilityProvider>
      </ComplianceProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
