import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, LucideIcon } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  features?: string[];
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ 
  title, 
  description, 
  icon: Icon = Heart,
  features = []
}) => {
  return (
    <div className="min-h-screen bg-healthcare-bg p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="healthcare-card">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-16 h-16 bg-healthcare-primary rounded-full">
                <Icon className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            {features.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Planned Features:</h3>
                <ul className="space-y-2">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-healthcare-primary mr-2">•</span>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <p className="text-gray-600">
                This page is currently under development and will be implemented 
                as part of the comprehensive EduMindSolutions platform.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlaceholderPage;
