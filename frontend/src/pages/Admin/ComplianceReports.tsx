import React from 'react';
import PlaceholderPage from '@/components/PlaceholderPage';
import { FileText } from 'lucide-react';

const ComplianceReports: React.FC = () => {
  return (
    <PlaceholderPage
      title="Compliance Reports"
      description="This page will be implemented as part of the EduMindSolutions platform"
      icon={FileText}
    />
  );
};

export default ComplianceReports;