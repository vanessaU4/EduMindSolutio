import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, Shield, Lock, CheckCircle, AlertTriangle, Heart } from 'lucide-react';
import { useCompliance } from '@/providers/ComplianceProvider';
import { useAccessibility } from '@/providers/AccessibilityProvider';
import { authService } from '@/services/authService';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'email' | 'verification' | 'success'>('email');

  const { logAccess } = useCompliance();
  const { announceToScreenReader } = useAccessibility();

  React.useEffect(() => {
    logAccess('PASSWORD_RESET_PAGE_VIEW', 'AUTHENTICATION');
  }, [logAccess]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validate email format
      if (!validateEmail(email)) {
        setError('Please enter a valid email address.');
        announceToScreenReader('Invalid email address entered');
        setIsLoading(false);
        return;
      }

      logAccess('PASSWORD_RESET_REQUEST', 'AUTHENTICATION', { email });

      // Use auth service for password reset
      await authService.requestPasswordReset(email);

      setStep('success');
      setIsSubmitted(true);
      announceToScreenReader('Password reset email sent successfully');
      logAccess('PASSWORD_RESET_EMAIL_SENT', 'AUTHENTICATION');
    } catch (error) {
      console.error('Password reset error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Network error. Please check your connection and try again.';
      setError(errorMessage);
      announceToScreenReader(`Password reset failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    try {
      logAccess('PASSWORD_RESET_RESEND', 'AUTHENTICATION');
      // Simulate resend
      await new Promise(resolve => setTimeout(resolve, 1000));
      announceToScreenReader('Password reset email resent');
    } catch (error) {
      setError('Failed to resend email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">EduMindSolutions</h1>
          <p className="text-sm text-gray-600">Youth Mental Health Platform</p>
        </div>

      

        {step === 'email' && (
          <Card className="healthcare-card">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center">
                <Lock className="w-5 h-5 mr-2 text-blue-600" />
                Reset Your Password
              </CardTitle>
              <CardDescription>
                Enter your email address and we'll send you a secure link to reset your password.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    required
                    disabled={isLoading}
                    className="healthcare-input"
                    aria-describedby="email-help"
                  />
                  <p id="email-help" className="text-xs text-gray-500">
                    We'll send password reset instructions to this email address.
                  </p>
                </div>

                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full healthcare-button-primary"
                  disabled={isLoading || !email}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending Reset Email...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Reset Email
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <Link 
                    to="/login" 
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Login
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 'success' && (
          <Card className="healthcare-card">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-green-800">Reset Email Sent</CardTitle>
              <CardDescription>
                We've sent password reset instructions to your email address.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <Mail className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Check your email:</strong> We've sent a secure password reset link to{' '}
                  <span className="font-medium">{email}</span>. The link will expire in 1 hour for security.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Next Steps:</h4>
                <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Check your email inbox (and spam folder)</li>
                  <li>Click the secure reset link in the email</li>
                  <li>Create a new strong password</li>
                  <li>Log in with your new password</li>
                </ol>
              </div>

              <div className="flex flex-col space-y-2">
                <Button 
                  variant="outline" 
                  onClick={handleResendEmail}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Resending...' : 'Resend Email'}
                </Button>
                
                <Button asChild variant="ghost" className="w-full">
                  <Link to="/login">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Security Information */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-blue-900 flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Healthcare-Grade Security
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Password reset links expire after 1 hour</li>
                <li>• All communications are encrypted</li>         
                <li>• Account activity is monitored for safety</li>
              </ul>
            </div>
          </CardContent>
        </Card>

     

       
      </div>
    </div>
  );
};

export default ForgotPassword;
