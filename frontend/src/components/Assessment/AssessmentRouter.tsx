import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { RoleGuard } from '@/components/Auth/RoleGuard';
import {
  AssessmentCenter,
  TakeAssessment,
  UserAssessmentDashboard,
  GuideAssessmentManagement,
  AdminAssessmentOversight
} from '@/pages/Assessment';
import AssessmentResults from '@/pages/Assessment/AssessmentResults';
import AssessmentHistory from '@/pages/Assessment/AssessmentHistory';
import AssessmentDebugger from '@/components/Assessment/AssessmentDebugger';

const AssessmentRouter: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Main Assessment Center - accessible to all authenticated users */}
      <Route path="/" element={<AssessmentCenter />} />
      
      {/* Assessment Taking - accessible to all users */}
      <Route path="/take/:id" element={<TakeAssessment />} />
      
      {/* Assessment Results - accessible to all users */}
      <Route path="/results/:id" element={<AssessmentResults />} />
      
      {/* Assessment History - accessible to all users */}
      <Route path="/history" element={<AssessmentHistory />} />
      
      {/* Debug Route - temporary for troubleshooting */}
      <Route path="/debug" element={<AssessmentDebugger />} />
      
      {/* User-specific Dashboard */}
      <Route 
        path="/dashboard" 
        element={
          <RoleGuard allowedRoles={['user', 'guide', 'admin']}>
            <UserAssessmentDashboard />
          </RoleGuard>
        } 
      />
      
      {/* Guide Assessment Management */}
      <Route 
        path="/guide-management" 
        element={
          <RoleGuard allowedRoles={['guide', 'admin']}>
            <GuideAssessmentManagement />
          </RoleGuard>
        } 
      />
      
      {/* Admin Assessment Oversight */}
      <Route 
        path="/admin-oversight" 
        element={
          <RoleGuard allowedRoles={['admin']}>
            <AdminAssessmentOversight />
          </RoleGuard>
        } 
      />
      
      {/* Role-based default redirects */}
      <Route 
        path="/default" 
        element={
          user?.role === 'admin' ? (
            <Navigate to="/assessments/admin-oversight" replace />
          ) : user?.role === 'guide' ? (
            <Navigate to="/assessments/guide-management" replace />
          ) : (
            <Navigate to="/assessments/dashboard" replace />
          )
        } 
      />
      
      {/* Fallback redirect */}
      <Route path="*" element={<Navigate to="/assessments/" replace />} />
    </Routes>
  );
};

export default AssessmentRouter;
