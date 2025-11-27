import React from 'react';
import { Outlet } from 'react-router-dom';

const GuideLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-healthcare-bg">
      <Outlet />
    </div>
  );
};

export default GuideLayout;