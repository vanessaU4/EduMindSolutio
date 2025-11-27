import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  HelpCircle, 
  Clock, 
  Phone, 
  Mail, 
  FileText, 
  Shield, 
  Heart,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useCompliance } from '@/providers/ComplianceProvider';
import { useAccessibility } from '@/providers/AccessibilityProvider';
import { config } from '@/utils/config';
const { crisis } = config;

const GuideVerificationFAQ: React.FC = () => {
  const { logAccess } = useCompliance();
  const { announceToScreenReader } = useAccessibility();

  React.useEffect(() => {
    logAccess('VERIFICATION_FAQ_PAGE_VIEW', 'PROFESSIONAL_VERIFICATION');
    announceToScreenReader('Guide verification frequently asked questions page loaded');
  }, [logAccess, announceToScreenReader]);

  const faqs = [
    {
      question: "How long does the verification process take?",
      answer: "The complete verification process typically takes 5-7 business days. This includes credential verification, reference checks, and background screening. We'll send you email updates at each stage of the process."
    },
    {
      question: "What if my professional references don't respond?",
      answer: "We understand that references can be busy. We'll make multiple attempts to contact them over several days. If we're unable to reach a reference after 3 business days, we'll contact you to provide an alternative reference."
    },
    {
      question: "Can I update my verification application after submission?",
      answer: "Minor updates can be made by contacting our verification team at verification@edumindsolutions.health. For major changes, you may need to resubmit your application, which could restart the review timeline."
    },
    {
      question: "What happens if my verification is denied?",
      answer: "If your application doesn't meet our requirements, we'll provide detailed feedback and, when possible, guidance on how to address any issues. You may reapply after addressing the concerns raised."
    },
    {
      question: "Do I need malpractice insurance to be approved?",
      answer: "Yes, current professional liability insurance is required for all mental health guides on our platform. You'll need to provide proof of coverage during the verification process."
    },
    {
      question: "Can I practice in multiple states through the platform?",
      answer: "You can only provide services in states where you hold a valid, active license. Our platform will restrict your access to clients based on your licensed jurisdictions."
    },
    {
      question: "What if my license is up for renewal during verification?",
      answer: "Please ensure your license is current before applying. If your license expires during verification, the process will be paused until you provide proof of renewal."
    },
    {
      question: "How do you verify my educational background?",
      answer: "We verify degrees and certifications directly with educational institutions and credentialing bodies. This process is automated for most major institutions but may take longer for international credentials."
    },
    {
      question: "What background check is performed?",
      answer: "We conduct a comprehensive background check including criminal history, professional sanctions, and verification with state licensing boards. This is required for all healthcare professionals on our platform."
    },
    {
      question: "Can I start seeing clients while verification is pending?",
      answer: "No, you must complete the full verification process before accessing client management tools or providing services through our platform. However, you can complete your profile and access training materials."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <HelpCircle className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Verification FAQ</h1>
            <p className="text-gray-600 mt-2">
              Frequently asked questions about the professional verification process
            </p>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Shield className="w-3 h-3 mr-1" />
            Professional Verification Guide
          </Badge>
        </div>

        {/* Quick Links */}
        <Card className="healthcare-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" asChild className="h-auto p-4">
                <Link to="/guide/verification-pending">
                  <div className="text-center">
                    <Clock className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                    <div className="font-medium">Check Status</div>
                    <div className="text-sm text-gray-600">View verification progress</div>
                  </div>
                </Link>
              </Button>
              
              <Button variant="outline" asChild className="h-auto p-4">
                <a href="mailto:verification@edumindsolutions.health">
                  <div className="text-center">
                    <Mail className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <div className="font-medium">Contact Support</div>
                    <div className="text-sm text-gray-600">Email verification team</div>
                  </div>
                </a>
              </Button>
              
              <Button variant="outline" asChild className="h-auto p-4">
                <Link to="/guide/verification">
                  <div className="text-center">
                    <FileText className="w-6 h-6 mx-auto mb-2 text-green-600" />
                    <div className="font-medium">New Application</div>
                    <div className="text-sm text-gray-600">Start verification process</div>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <Card key={index} className="healthcare-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-start">
                  <HelpCircle className="w-5 h-5 mr-2 mt-0.5 text-blue-600 flex-shrink-0" />
                  {faq.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Information */}
        <Card className="healthcare-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="w-5 h-5 mr-2 text-green-600" />
              Still Need Help?
            </CardTitle>
            <CardDescription>
              Our verification team is here to assist you throughout the process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Verification Support</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <a href="mailto:verification@edumindsolutions.health" className="text-blue-600 hover:underline">
                      verification@edumindsolutions.health
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <a href="tel:1-800-837-4391" className="text-blue-600 hover:underline">
                      1-800-VERIFY-1 (1-800-837-4391)
                    </a>
                  </div>
                  <p className="text-gray-600">
                    Available Monday-Friday, 8 AM - 6 PM EST
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Technical Support</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-purple-600" />
                    <a href="mailto:support@edumindsolutions.health" className="text-purple-600 hover:underline">
                      support@edumindsolutions.health
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-purple-600" />
                    <a href="tel:1-800-338-6463" className="text-purple-600 hover:underline">
                      1-800-EDUMIND (1-800-338-6463)
                    </a>
                  </div>
                  <p className="text-gray-600">
                    Available 24/7 for technical issues
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Notice */}
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Important:</strong> The verification process is required for all mental health professionals 
            before providing services through our platform. This ensures the safety and quality of care for 
            our youth community aged 13-23.
          </AlertDescription>
        </Alert>

        {/* Crisis Support Alert */}
        <Alert className="border-red-200 bg-red-50">
          <Phone className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Crisis Support Available 24/7:</strong> If you or someone you know is experiencing a mental health crisis, 
            call the National Suicide Prevention Lifeline at{' '}
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
            <Link to="/guide/verification-pending">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Status
            </Link>
          </Button>
          <Button asChild>
            <Link to="/dashboard">
              Return to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GuideVerificationFAQ;
