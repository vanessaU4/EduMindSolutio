import React, { useState } from 'react';
import { useCompliance } from '@/providers/ComplianceProvider';
import { useAccessibility } from '@/providers/AccessibilityProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock, Eye, CheckCircle, AlertTriangle } from 'lucide-react';
import { config } from '@/utils/config';

const HealthcareTest: React.FC = () => {
  const { encryptData, decryptData, logAccess, auditTrail, isHIPAACompliant, updateActivity } = useCompliance();
  const { announceToScreenReader, isHighContrast, toggleHighContrast } = useAccessibility();
  
  const [testData, setTestData] = useState('');
  const [encryptedData, setEncryptedData] = useState('');
  const [decryptedData, setDecryptedData] = useState('');
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const handleEncryptionTest = () => {
    try {
      if (!testData.trim()) {
        setTestResult('error');
        announceToScreenReader('Please enter test data first');
        return;
      }

      const encrypted = encryptData(testData);
      setEncryptedData(encrypted);
      
      const decrypted = decryptData(encrypted);
      setDecryptedData(decrypted);
      
      const success = decrypted === testData;
      setTestResult(success ? 'success' : 'error');
      
      logAccess('ENCRYPTION_TEST', 'COMPLIANCE_VERIFICATION');
      announceToScreenReader(success ? 'Encryption test successful' : 'Encryption test failed');
      
    } catch (error) {
      console.error('Encryption test failed:', error);
      setTestResult('error');
      announceToScreenReader('Encryption test failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="healthcare-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-6 h-6 mr-2 text-blue-600" />
            Healthcare Platform Compliance Test
          </CardTitle>
          <CardDescription>
            Verify that all healthcare compliance features are working correctly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuration Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                Platform Configuration
              </h3>
              <div className="space-y-1 text-sm">
                <p><strong>Platform:</strong> {config.platform.name} v{config.platform.version}</p>
                <p><strong>Target Age:</strong> {config.platform.targetAgeMin}-{config.platform.targetAgeMax} years</p>
                <p><strong>Environment:</strong> {config.development.isDev ? 'Development' : 'Production'}</p>
                <p><strong>ComplianceProvider:</strong> <span className="text-green-600">✅ Initialized Successfully</span></p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center">
                <Lock className="w-4 h-4 mr-2 text-blue-600" />
                Compliance Status
              </h3>
              <div className="space-y-2">
                <Badge variant={isHIPAACompliant ? "default" : "destructive"} className="mr-2">
                  <Lock className="w-3 h-3 mr-1" />
                  HIPAA: {isHIPAACompliant ? 'Compliant' : 'Non-Compliant'}
                </Badge>
                <Badge variant={config.compliance.auditLogging ? "default" : "secondary"}>
                  <Shield className="w-3 h-3 mr-1" />
                  Audit Logging: {config.compliance.auditLogging ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Encryption Test */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center">
              <Lock className="w-4 h-4 mr-2 text-blue-600" />
              HIPAA Encryption Test
            </h3>
            
            <div className="space-y-2">
              <Label htmlFor="test-data">Test Data (simulated healthcare information)</Label>
              <Input
                id="test-data"
                value={testData}
                onChange={(e) => setTestData(e.target.value)}
                placeholder="Enter test data to encrypt..."
                className="w-full"
              />
            </div>
            
            <Button onClick={handleEncryptionTest} className="healthcare-button-primary">
              <Lock className="w-4 h-4 mr-2" />
              Test Encryption/Decryption
            </Button>
            
            {testResult && (
              <Alert className={testResult === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                {testResult === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={testResult === 'success' ? 'text-green-800' : 'text-red-800'}>
                  {testResult === 'success' 
                    ? 'Encryption/Decryption test passed successfully. Healthcare data protection is working.'
                    : 'Encryption/Decryption test failed. Please check the configuration.'
                  }
                </AlertDescription>
              </Alert>
            )}
            
            {encryptedData && (
              <div className="space-y-2">
                <Label>Encrypted Data (HIPAA Protected)</Label>
                <div className="p-3 bg-gray-100 rounded border text-sm font-mono break-all">
                  {encryptedData}
                </div>
              </div>
            )}
            
            {decryptedData && (
              <div className="space-y-2">
                <Label>Decrypted Data</Label>
                <div className="p-3 bg-gray-100 rounded border text-sm">
                  {decryptedData}
                </div>
              </div>
            )}
          </div>

          {/* Accessibility Test */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center">
              <Eye className="w-4 h-4 mr-2 text-purple-600" />
              Accessibility Features Test
            </h3>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                onClick={toggleHighContrast}
                className={isHighContrast ? 'bg-black text-white' : ''}
              >
                <Eye className="w-4 h-4 mr-2" />
                {isHighContrast ? 'Disable' : 'Enable'} High Contrast
              </Button>
              
              <Button
                variant="outline"
                onClick={() => announceToScreenReader('Screen reader test announcement')}
              >
                <Eye className="w-4 h-4 mr-2" />
                Test Screen Reader
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  updateActivity();
                  announceToScreenReader('Activity tracking test completed');
                }}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Test Activity Tracking
              </Button>
            </div>
          </div>

          {/* Audit Trail */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center">
              <Shield className="w-4 h-4 mr-2 text-green-600" />
              Recent Audit Trail ({auditTrail.length} entries)
            </h3>
            
            <div className="max-h-40 overflow-y-auto border rounded p-3 bg-gray-50">
              {auditTrail.slice(-5).map((entry, index) => (
                <div key={entry.id} className="text-xs mb-2 last:mb-0">
                  <span className="font-mono text-gray-500">
                    {entry.timestamp.toLocaleTimeString()}
                  </span>
                  <span className="ml-2 font-medium">{entry.action}</span>
                  <span className="ml-2 text-gray-600">{entry.resource}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Crisis Support Test */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 text-red-600" />
              Crisis Support Configuration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 border rounded">
                <strong>Primary Hotline:</strong><br />
                {config.crisis.primaryHotline}
              </div>
              <div className="p-3 border rounded">
                <strong>Crisis Text Line:</strong><br />
                Text HOME to {config.crisis.textLine}
              </div>
              <div className="p-3 border rounded">
                <strong>Emergency:</strong><br />
                {config.crisis.emergency}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthcareTest;
