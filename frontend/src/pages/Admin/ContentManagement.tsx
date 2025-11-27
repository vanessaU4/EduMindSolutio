import React from 'react';
import { RoleGuard } from '@/components/RoleGuard';
import { ContentManagementDashboard } from '@/components/Content';

const ContentManagement: React.FC = () => {
  return (
    <RoleGuard requireModeration>
      <ContentManagementDashboard />
    </RoleGuard>
  );
};

export default ContentManagement;
