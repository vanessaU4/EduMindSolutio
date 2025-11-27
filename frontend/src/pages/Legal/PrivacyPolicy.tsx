import React from 'react';
import PlaceholderPage from '@/components/PlaceholderPage';
import { Eye } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <PlaceholderPage
      title="Privacy Policy"
      description="This page will be implemented as part of the EduMindSolutions platform"
      icon={Eye}
    />
  );
};

export default PrivacyPolicy;