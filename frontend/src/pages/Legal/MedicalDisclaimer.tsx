import React from 'react';
import PlaceholderPage from '@/components/PlaceholderPage';
import { Shield } from 'lucide-react';

const MedicalDisclaimer: React.FC = () => {
  return (
    <PlaceholderPage
      title="Medical Disclaimer"
      description="This page will be implemented as part of the EduMindSolutions platform"
      icon={Shield}
    />
  );
};

export default MedicalDisclaimer;