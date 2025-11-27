import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { MoodTracker, MoodDashboard } from '@/pages/MoodTracker';

const MoodRouter: React.FC = () => {
  const { user } = useAuth();

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      {/* Mood Dashboard - Main overview */}
      <Route path="/" element={<MoodDashboard />} />
      
      {/* Mood Tracker - Camera capture */}
      <Route path="/tracker" element={<MoodTracker />} />
      
      {/* Mood History - View all entries */}
      <Route path="/history" element={<MoodDashboard />} />
      
      {/* Mood Analytics - Detailed insights */}
      <Route path="/analytics" element={<MoodDashboard />} />
      
      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/mood/" replace />} />
    </Routes>
  );
};

export default MoodRouter;
