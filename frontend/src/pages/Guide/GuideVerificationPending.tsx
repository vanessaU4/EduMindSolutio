import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  CheckCircle, 
  Shield, 
  Phone, 
  Mail, 
  FileText, 
  Users, 
  Search, 
  Heart,
  AlertTriangle,
  User,
  Settings,
  BookOpen,
  HelpCircle
} from 'lucide-react';
import { useCompliance } from '@/providers/ComplianceProvider';
import { useAccessibility } from '@/providers/AccessibilityProvider';
import { authService } from '@/services/authService';
import { config } from '@/utils/config';
const { crisis } = config;

const GuideVerificationPending: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submissionDate, setSubmissionDate] = useState<string>('');
  const [estimatedCompletion, setEstimatedCompletion] = useState<string>('');

  const navigate = useNavigate();
  const { logAccess } = useCompliance();
  const { announceToScreenReader } = useAccessibility();

  useEffect(() => {
    const initializePage = async () => {
      try {
        logAccess('VERIFICATION_PENDING_PAGE_VIEW', 'PROFESSIONAL_VERIFICATION');
        
        // Get current user
        const currentUser = authService.getUser();
        if (!currentUser) {
          navigate('/login');
          return;
        }

        setUser(currentUser);
        
        // Calculate dates (mock data - in real app, get from backend)
        const today = new Date();
        const submission = new Date(today.getTime() - (2 * 24 * 60 * 60 * 1000)); // 2 days ago
        const completion = new Date(today.getTime() + (5 * 24 * 60 * 60 * 1000)); // 5 days from now
        
        setSubmissionDate(submission.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }));
        setEstimatedCompletion(completion.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }));

        announceToScreenReader('Guide verification pending page loaded. Your professional verification is currently under review.');
      } catch (error) {
        console.error('Error loading verification status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializePage();
  }, [logAccess, announceToScreenReader, navigate]);

  const verificationSteps = [
    { id: 1, title: 'Application Submitted', status: 'completed', description: 'Your verification documents have been received' },
    { id: 2, title: 'Credential Review', status: 'in-progress', description: 'Verifying license and professional credentials' },
    { id: 3, title: 'Reference Check', status: 'pending', description: 'Contacting your professional references' },
    { id: 4, title: 'Background Verification', status: 'pending', description: 'Conducting background check' },
    { id: 5, title: 'Final Approval', status: 'pending', description: 'Final review and account activation' }
  ];

  const currentStep = verificationSteps.findIndex(step => step.status === 'in-progress') + 1;
  const progressPercentage = (currentStep / verificationSteps.length) * 100;

  const availableActions = [
    {
      title: 'Complete Your Profile',
      description: 'Add additional information to enhance your professional profile',
      icon: User,
      action: '/profile/edit',
      available: true
    },
    {
      title: 'Review Platform Features',
      description: 'Explore the tools and resources available to guides',
      icon: BookOpen,
      action: '/guide/features',
      available: true
    },
    {
      title: 'Platform Training',
      description: 'Access training materials for the EduMindSolutions platform',
      icon: Settings,
      action: '/guide/training',
      available: true
    },
    {
      title: 'Client Management',
      description: 'Access client management tools (available after approval)',
      icon: Users,
      action: '/guide/clients',
      available: false
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
            <Clock className="w-10 h-10 text-orange-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Verification Under Review</h1>
            <p className="text-gray-600 mt-2">
              Thank you for submitting your professional verification, {user?.first_name}
            </p>
          </div>
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            <Clock className="w-3 h-3 mr-1" />
            Review in Progress
          </Badge>
        </div>

        {/* Status Overview */}
        <Card className="healthcare-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-600" />
              Verification Status
            </CardTitle>
            <CardDescription>
              Your application is being reviewed by our credentialing team
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Review Progress</span>
                <span className="text-gray-600">{Math.round(progressPercentage)}% Complete</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {/* Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Submitted:</span>
                <p className="text-gray-600">{submissionDate}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Expected Completion:</span>
                <p className="text-gray-600">{estimatedCompletion}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification Steps */}
        <Card className="healthcare-card">
          <CardHeader>
            <CardTitle>Review Process</CardTitle>
            <CardDescription>
              Our comprehensive verification process ensures the highest standards of professional care
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {verificationSteps.map((step, index) => (
                <div key={step.id} className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    step.status === 'completed' 
                      ? 'bg-green-100 text-green-600' 
                      : step.status === 'in-progress'
                      ? 'bg-orange-100 text-orange-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {step.status === 'completed' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : step.status === 'in-progress' ? (
                      <Clock className="w-4 h-4" />
                    ) : (
                      <span className="text-xs font-medium">{step.id}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      step.status === 'completed' ? 'text-green-800' :
                      step.status === 'in-progress' ? 'text-orange-800' : 'text-gray-600'
                    }`}>
                      {step.title}
                    </h4>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* What We're Reviewing */}
        <Card className="healthcare-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="w-5 h-5 mr-2 text-purple-600" />
              What We're Reviewing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Professional Credentials</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Professional license verification</li>
                  <li>• Educational background confirmation</li>
                  <li>• Specialization certifications</li>
                  <li>• Continuing education requirements</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Professional References</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Contact with provided references</li>
                  <li>• Professional experience verification</li>
                  <li>• Character and competency assessment</li>
                  <li>• Youth mental health experience</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Actions */}
        <Card className="healthcare-card">
          <CardHeader>
            <CardTitle>What You Can Do While Waiting</CardTitle>
            <CardDescription>
              Prepare for your role as a mental health guide on our platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableActions.map((action, index) => (
                <div key={index} className={`p-4 border rounded-lg ${
                  action.available 
                    ? 'hover:bg-blue-50 cursor-pointer border-blue-200' 
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}>
                  <div className="flex items-start space-x-3">
                    <action.icon className={`w-5 h-5 mt-0.5 ${
                      action.available ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        action.available ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {action.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                      {action.available && (
                        <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto text-blue-600">
                          Get Started →
                        </Button>
                      )}
                      {!action.available && (
                        <span className="text-xs text-gray-500 mt-2 block">
                          Available after verification approval
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Support Information */}
        <Card className="healthcare-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="w-5 h-5 mr-2 text-green-600" />
              Need Help?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Verification Support</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span>verification@edumindsolutions.health</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span>1-800-VERIFY-1 (1-800-837-4391)</span>
                  </div>
                  <p className="text-gray-600">
                    Available Monday-Friday, 8 AM - 6 PM EST
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Frequently Asked Questions</h4>
                <div className="space-y-2 text-sm">
                  <Link to="/guide/verification-faq" className="block text-blue-600 hover:underline">
                    • How long does verification take?
                  </Link>
                  <Link to="/guide/verification-faq" className="block text-blue-600 hover:underline">
                    • What if my references don't respond?
                  </Link>
                  <Link to="/guide/verification-faq" className="block text-blue-600 hover:underline">
                    • Can I update my application?
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Crisis Support Alert */}
        <Alert className="border-red-200 bg-red-50">
          <Phone className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Crisis Support Available 24/7:</strong> If you or someone you know is experiencing a mental health crisis, 
            don't wait for verification completion. Call the National Suicide Prevention Lifeline at{' '}
            <a 
              href={`tel:${crisis.primaryHotline}`}
              className="font-bold underline hover:no-underline"
            >
              {crisis.primaryHotline}
            </a>
            {' '}or text HOME to{' '}
            <a 
              href={`sms:${crisis.textLine}`}
              className="font-bold underline hover:no-underline"
            >
              {crisis.textLine}
            </a>
            .
          </AlertDescription>
        </Alert>

        {/* Platform Information */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <h3 className="font-semibold text-blue-900 flex items-center justify-center">
                <Heart className="w-5 h-5 mr-2" />
                EduMindSolutions Professional Network
              </h3>
              <p className="text-sm text-blue-700">
                Join our network of verified mental health professionals dedicated to supporting youth aged 13-23
              </p>
              <div className="flex justify-center space-x-6 text-xs text-blue-600">
                <span className="flex items-center">
                  <Shield className="w-3 h-3 mr-1" />
                  HIPAA Compliant
                </span>
                <span className="flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified Professionals
                </span>
                <span className="flex items-center">
                  <Heart className="w-3 h-3 mr-1" />
                  24/7 Crisis Support
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-center space-x-4">
          <Button variant="outline" asChild>
            <Link to="/dashboard">
              Return to Dashboard
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/guide/verification-faq">
              View FAQ
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GuideVerificationPending;
