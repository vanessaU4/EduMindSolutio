import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  User, 
  GraduationCap,
  Award,
  Heart,
  ArrowLeft
} from 'lucide-react';
import { useCompliance } from '@/providers/ComplianceProvider';
import { useAccessibility } from '@/providers/AccessibilityProvider';

interface VerificationFormData {
  licenseNumber: string;
  licenseType: string;
  licenseState: string;
  education: string;
  specializations: string[];
  experience: string;
  references: {
    name: string;
    title: string;
    organization: string;
    email: string;
    phone: string;
  }[];
  backgroundCheckConsent: boolean;
  ethicsAgreement: boolean;
  continuingEducation: boolean;
}

const GuideVerification: React.FC = () => {
  const [formData, setFormData] = useState<VerificationFormData>({
    licenseNumber: '',
    licenseType: '',
    licenseState: '',
    education: '',
    specializations: [],
    experience: '',
    references: [
      { name: '', title: '', organization: '', email: '', phone: '' },
      { name: '', title: '', organization: '', email: '', phone: '' }
    ],
    backgroundCheckConsent: false,
    ethicsAgreement: false,
    continuingEducation: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const navigate = useNavigate();
  const { logAccess } = useCompliance();
  const { announceToScreenReader } = useAccessibility();

  React.useEffect(() => {
    logAccess('GUIDE_VERIFICATION_PAGE_VIEW', 'PROFESSIONAL_VERIFICATION');
  }, [logAccess]);

  const licenseTypes = [
    'Licensed Clinical Social Worker (LCSW)',
    'Licensed Professional Counselor (LPC)',
    'Licensed Marriage and Family Therapist (LMFT)',
    'Licensed Mental Health Counselor (LMHC)',
    'Psychologist (PhD/PsyD)',
    'Psychiatrist (MD)',
    'Licensed Clinical Mental Health Counselor (LCMHC)',
    'Licensed Professional Clinical Counselor (LPCC)',
    'Other (Please specify in experience section)'
  ];

  const specializations = [
    'Adolescent Therapy',
    'Young Adult Counseling',
    'Depression Treatment',
    'Anxiety Disorders',
    'PTSD/Trauma Therapy',
    'Eating Disorders',
    'Substance Abuse',
    'Crisis Intervention',
    'Group Therapy',
    'Family Therapy',
    'Cognitive Behavioral Therapy (CBT)',
    'Dialectical Behavior Therapy (DBT)',
    'EMDR Therapy',
    'Mindfulness-Based Therapy'
  ];

  const handleSpecializationChange = (specialization: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      specializations: checked 
        ? [...prev.specializations, specialization]
        : prev.specializations.filter(s => s !== specialization)
    }));
  };

  const handleReferenceChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      references: prev.references.map((ref, i) => 
        i === index ? { ...ref, [field]: value } : ref
      )
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileNames = Array.from(files).map(file => file.name);
      setUploadedFiles(prev => [...prev, ...fileNames]);
      announceToScreenReader(`${fileNames.length} files uploaded successfully`);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.licenseNumber || !formData.licenseType || !formData.licenseState) {
      setError('Please complete all license information fields.');
      return false;
    }

    if (!formData.education || !formData.experience) {
      setError('Please provide education and experience information.');
      return false;
    }

    if (formData.specializations.length === 0) {
      setError('Please select at least one specialization.');
      return false;
    }

    const validReferences = formData.references.filter(ref => 
      ref.name && ref.title && ref.organization && ref.email
    );
    if (validReferences.length < 2) {
      setError('Please provide at least 2 complete professional references.');
      return false;
    }

    if (!formData.backgroundCheckConsent || !formData.ethicsAgreement) {
      setError('Please agree to all required terms and conditions.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      announceToScreenReader('Form validation failed. Please check the error message.');
      return;
    }

    setIsLoading(true);

    try {
      logAccess('GUIDE_VERIFICATION_SUBMIT', 'PROFESSIONAL_VERIFICATION');

      // TODO: Replace with actual API call to Django backend
      await new Promise(resolve => setTimeout(resolve, 2000));

      announceToScreenReader('Verification application submitted successfully');
      navigate('/guide/verification-pending');
    } catch (error) {
      console.error('Verification submission error:', error);
      setError('Failed to submit verification application. Please try again.');
      announceToScreenReader('Verification submission failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mental Health Guide Verification</h1>
            <p className="text-gray-600 mt-2">Professional credential verification for EduMindSolutions platform</p>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Shield className="w-3 h-3 mr-1" />
            HIPAA Compliant Professional Verification
          </Badge>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* License Information */}
          <Card className="healthcare-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="w-5 h-5 mr-2 text-blue-600" />
                Professional License Information
              </CardTitle>
              <CardDescription>
                Provide your current professional license details for verification.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">License Number *</Label>
                  <Input
                    id="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                    placeholder="Enter your license number"
                    required
                    className="healthcare-input"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="licenseState">License State *</Label>
                  <Input
                    id="licenseState"
                    value={formData.licenseState}
                    onChange={(e) => setFormData(prev => ({ ...prev, licenseState: e.target.value }))}
                    placeholder="State where licensed"
                    required
                    className="healthcare-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenseType">License Type *</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, licenseType: value }))}>
                  <SelectTrigger className="healthcare-input">
                    <SelectValue placeholder="Select your license type" />
                  </SelectTrigger>
                  <SelectContent>
                    {licenseTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Education and Experience */}
          <Card className="healthcare-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="w-5 h-5 mr-2 text-green-600" />
                Education and Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="education">Educational Background *</Label>
                <Textarea
                  id="education"
                  value={formData.education}
                  onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
                  placeholder="Describe your educational background, degrees, and relevant training..."
                  rows={3}
                  required
                  className="healthcare-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Professional Experience *</Label>
                <Textarea
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                  placeholder="Describe your professional experience working with youth mental health..."
                  rows={4}
                  required
                  className="healthcare-input"
                />
              </div>
            </CardContent>
          </Card>

          {/* Specializations */}
          <Card className="healthcare-card">
            <CardHeader>
              <CardTitle>Areas of Specialization *</CardTitle>
              <CardDescription>
                Select all areas where you have training and experience (minimum 1 required).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {specializations.map((specialization) => (
                  <div key={specialization} className="flex items-center space-x-2">
                    <Checkbox
                      id={specialization}
                      checked={formData.specializations.includes(specialization)}
                      onCheckedChange={(checked) => 
                        handleSpecializationChange(specialization, checked as boolean)
                      }
                    />
                    <Label htmlFor={specialization} className="text-sm">
                      {specialization}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Professional References */}
          <Card className="healthcare-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2 text-purple-600" />
                Professional References
              </CardTitle>
              <CardDescription>
                Provide at least 2 professional references who can verify your qualifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {formData.references.map((reference, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <h4 className="font-medium">Reference {index + 1}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`ref-name-${index}`}>Full Name *</Label>
                      <Input
                        id={`ref-name-${index}`}
                        value={reference.name}
                        onChange={(e) => handleReferenceChange(index, 'name', e.target.value)}
                        placeholder="Reference full name"
                        className="healthcare-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`ref-title-${index}`}>Title *</Label>
                      <Input
                        id={`ref-title-${index}`}
                        value={reference.title}
                        onChange={(e) => handleReferenceChange(index, 'title', e.target.value)}
                        placeholder="Professional title"
                        className="healthcare-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`ref-org-${index}`}>Organization *</Label>
                      <Input
                        id={`ref-org-${index}`}
                        value={reference.organization}
                        onChange={(e) => handleReferenceChange(index, 'organization', e.target.value)}
                        placeholder="Organization name"
                        className="healthcare-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`ref-email-${index}`}>Email *</Label>
                      <Input
                        id={`ref-email-${index}`}
                        type="email"
                        value={reference.email}
                        onChange={(e) => handleReferenceChange(index, 'email', e.target.value)}
                        placeholder="Professional email"
                        className="healthcare-input"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Document Upload */}
          <Card className="healthcare-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="w-5 h-5 mr-2 text-orange-600" />
                Required Documents
              </CardTitle>
              <CardDescription>
                Upload copies of your license, certifications, and other relevant documents.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Upload documents
                    </span>
                    <span className="mt-1 block text-sm text-gray-500">
                      PDF, JPG, PNG up to 10MB each
                    </span>
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
              
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Uploaded Files:</h4>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <FileText className="w-4 h-4 text-green-600" />
                      <span>{file}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Agreements and Consent */}
          <Card className="healthcare-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-red-600" />
                Required Agreements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="backgroundCheck"
                  checked={formData.backgroundCheckConsent}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, backgroundCheckConsent: checked as boolean }))
                  }
                />
                <Label htmlFor="backgroundCheck" className="text-sm leading-relaxed">
                  I consent to a background check and understand that this is required for platform approval. *
                </Label>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="ethics"
                  checked={formData.ethicsAgreement}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, ethicsAgreement: checked as boolean }))
                  }
                />
                <Label htmlFor="ethics" className="text-sm leading-relaxed">
                  I agree to follow the EduMindSolutions Code of Ethics and professional standards for youth mental health support. *
                </Label>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="continuingEd"
                  checked={formData.continuingEducation}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, continuingEducation: checked as boolean }))
                  }
                />
                <Label htmlFor="continuingEd" className="text-sm leading-relaxed">
                  I commit to completing required continuing education and training updates.
                </Label>
              </div>
            </CardContent>
          </Card>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 healthcare-button-primary h-12"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting Verification...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Submit for Verification
                </>
              )}
            </Button>
            
            <Button variant="outline" asChild className="h-12">
              <Link to="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Save as Draft
              </Link>
            </Button>
          </div>
        </form>

        {/* Information */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-blue-900">Verification Process</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Review process takes 5-7 business days</li>
                <li>• All credentials are verified with licensing boards</li>
                <li>• References will be contacted for verification</li>
                <li>• Background check will be conducted</li>
                <li>• You'll receive email updates on your application status</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GuideVerification;
