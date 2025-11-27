import React from 'react';
import PlaceholderPage from '@/components/PlaceholderPage';
import { FileText } from 'lucide-react';

const TermsOfService: React.FC = () => {
  return (
    <PlaceholderPage
      title="Terms of Service"
      description="This page will be implemented as part of the EduMindSolutions platform"
      icon={FileText}
    />
  );
};

export default TermsOfService;