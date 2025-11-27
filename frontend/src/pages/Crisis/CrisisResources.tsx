import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Phone, MessageSquare, AlertTriangle, Heart, 
  Clock, MapPin, ExternalLink, Shield, 
  Users, FileText, Activity
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface CrisisResource {
  id: string;
  name: string;
  description: string;
  phone: string;
  website?: string;
  available24h: boolean;
  type: 'hotline' | 'chat' | 'text' | 'local';
  category: 'suicide' | 'mental_health' | 'substance' | 'domestic' | 'general';
}

const CrisisResources: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const emergencyResources: CrisisResource[] = [
    {
      id: '1',
      name: 'National Suicide Prevention Lifeline',
      description: 'Free and confidential emotional support for people in suicidal crisis',
      phone: '988',
      website: 'https://suicidepreventionlifeline.org',
      available24h: true,
      type: 'hotline',
      category: 'suicide'
    },
    {
      id: '2',
      name: 'Crisis Text Line',
      description: 'Text-based crisis support available 24/7',
      phone: 'Text HOME to 741741',
      website: 'https://crisistextline.org',
      available24h: true,
      type: 'text',
      category: 'mental_health'
    },
    {
      id: '3',
      name: 'SAMHSA National Helpline',
      description: 'Treatment referral and information service for mental health and substance use',
      phone: '1-800-662-4357',
      website: 'https://samhsa.gov',
      available24h: true,
      type: 'hotline',
      category: 'substance'
    },
    {
      id: '4',
      name: 'National Domestic Violence Hotline',
      description: '24/7 confidential support for domestic violence survivors',
      phone: '1-800-799-7233',
      website: 'https://thehotline.org',
      available24h: true,
      type: 'hotline',
      category: 'domestic'
    }
  ];

  const handleEmergencyCall = (phone: string) => {
    // In a real app, this would integrate with device calling capabilities
    toast({
      title: 'Emergency Contact',
      description: `Call ${phone} for immediate assistance`,
      variant: 'default',
    });
  };

  const handleReportCrisis = () => {
    if (user?.role === 'guide' || user?.role === 'admin') {
      navigate('/guide/crisis-alerts');
    } else {
      // For regular users, this might open a crisis reporting form
      toast({
        title: 'Crisis Support',
        description: 'Connecting you with crisis support resources...',
        variant: 'default',
      });
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'suicide': return 'bg-red-100 text-red-800';
      case 'mental_health': return 'bg-blue-100 text-blue-800';
      case 'substance': return 'bg-purple-100 text-purple-800';
      case 'domestic': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-16 sm:pt-20 md:pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8 mt-4 sm:mt-6 md:mt-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Crisis Resources</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Immediate support and resources for mental health emergencies
          </p>
        </div>

        {/* Emergency Alert */}
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>If you are in immediate danger, call 911 or go to your nearest emergency room.</strong>
            <br />
            For mental health emergencies, call 988 (Suicide & Crisis Lifeline) available 24/7.
          </AlertDescription>
        </Alert>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button
            size="lg"
            className="bg-red-600 hover:bg-red-700 text-white h-16"
            onClick={() => handleEmergencyCall('988')}
          >
            <Phone className="w-6 h-6 mr-2" />
            Call 988 Now
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-blue-600 text-blue-600 hover:bg-blue-50 h-16"
            onClick={() => handleEmergencyCall('Text HOME to 741741')}
          >
            <MessageSquare className="w-6 h-6 mr-2" />
            Crisis Text Line
          </Button>
          {(user?.role === 'guide' || user?.role === 'admin') && (
            <Button
              size="lg"
              variant="outline"
              className="border-purple-600 text-purple-600 hover:bg-purple-50 h-16"
              onClick={handleReportCrisis}
            >
              <Shield className="w-6 h-6 mr-2" />
              Crisis Dashboard
            </Button>
          )}
        </div>

        {/* Crisis Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {emergencyResources.map((resource) => (
            <Card key={resource.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{resource.name}</CardTitle>
                    <Badge className={getCategoryColor(resource.category)} variant="secondary">
                      {resource.category.replace('_', ' ')}
                    </Badge>
                  </div>
                  {resource.available24h && (
                    <Badge className="bg-green-100 text-green-800" variant="secondary">
                      <Clock className="w-3 h-3 mr-1" />
                      24/7
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{resource.description}</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold">{resource.phone}</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleEmergencyCall(resource.phone)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Call Now
                    </Button>
                  </div>
                  {resource.website && (
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-gray-500" />
                      <a
                        href={resource.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Role-based Professional Resources */}
        {(user?.role === 'guide' || user?.role === 'admin') && (
          <Card className="mb-8 bg-gradient-to-br from-purple-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-600" />
                Professional Crisis Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">Crisis Assessment Tools</h4>
                  <p className="text-sm text-gray-600">Access standardized crisis assessment protocols</p>
                  <Button size="sm" variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    View Tools
                  </Button>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-900">Crisis Response Guidelines</h4>
                  <p className="text-sm text-gray-600">Professional guidelines for crisis intervention</p>
                  <Button size="sm" variant="outline">
                    <Activity className="w-4 h-4 mr-2" />
                    View Guidelines
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        
      </motion.div>
    </div>
  );
};

export default CrisisResources;