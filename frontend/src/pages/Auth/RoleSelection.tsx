import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Shield, Users } from 'lucide-react';

const RoleSelection: React.FC = () => {
  return (
    <div className="min-h-screen bg-healthcare-bg flex items-center justify-center py-12 px-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="flex items-center justify-center w-16 h-16 bg-healthcare-primary rounded-full">
              <Heart className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Role</h1>
          <p className="text-lg text-gray-600">Select how you'll be using EduMindSolutions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="healthcare-card hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                  <Heart className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-xl">Youth (13-23)</CardTitle>
              <CardDescription>
                Access mental health assessments, peer support, and wellness tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li>• Take clinical assessments (PHQ-9, GAD-7, PCL-5)</li>
                <li>• Join peer support communities</li>
                <li>• Track mood and wellness progress</li>
                <li>• Access educational resources</li>
                <li>• Create safety plans</li>
              </ul>
              <Button asChild className="w-full healthcare-button-primary">
                <Link to="/dashboard-router">Continue as Youth</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="healthcare-card hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-xl">Mental Health Guide</CardTitle>
              <CardDescription>
                Professional support, client management, and crisis intervention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li>• Manage client assessments and progress</li>
                <li>• Respond to crisis alerts</li>
                <li>• Moderate community content</li>
                <li>• Access professional analytics</li>
                <li>• Provide guided support</li>
              </ul>
              <Button asChild className="w-full healthcare-button-secondary">
                <Link to="/guide/verification">Apply as Guide</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            Need help choosing? <Link to="/contact" className="text-healthcare-primary hover:underline">Contact our support team</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
