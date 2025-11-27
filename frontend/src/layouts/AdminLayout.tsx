import React from 'react';
import { Outlet } from 'react-router-dom';

const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-healthcare-bg">
      <Outlet />
    </div>
  );
};

export default AdminLayout;