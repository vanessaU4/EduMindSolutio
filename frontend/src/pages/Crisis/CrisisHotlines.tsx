import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Phone, Clock, MapPin, Globe, AlertTriangle, 
  Plus, Edit, Trash2, Search, Heart, MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Hotline {
  id: number;
  name: string;
  description: string;
  phoneNumber: string;
  textNumber?: string;
  website?: string;
  category: string;
  specialties: string[];
  availability: string;
  languages: string[];
  location: string;
  isNational: boolean;
  isVerified: boolean;
  lastUpdated: string;
  priority: 'emergency' | 'urgent' | 'support';
}

const CrisisHotlines: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [hotlines, setHotlines] = useState<Hotline[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');

  const categories = [
    'All', 'Suicide Prevention', 'Crisis Support', 'Mental Health', 
    'Substance Abuse', 'Domestic Violence', 'Youth Support', 'LGBTQ+ Support'
  ];

  const priorities = ['All', 'emergency', 'urgent', 'support'];

  // Mock hotlines data
  const mockHotlines: Hotline[] = [
    {
      id: 1,
      name: 'National Suicide Prevention Lifeline',
      description: '24/7 crisis support for people in suicidal crisis or emotional distress.',
      phoneNumber: '988',
      textNumber: '988',
      website: 'https://suicidepreventionlifeline.org',
      category: 'Suicide Prevention',
      specialties: ['suicide prevention', 'crisis intervention', 'emotional support'],
      availability: '24/7',
      languages: ['English', 'Spanish'],
      location: 'National',
      isNational: true,
      isVerified: true,
      lastUpdated: '2024-10-01',
      priority: 'emergency'
    },
    {
      id: 2,
      name: 'Crisis Text Line',
      description: 'Free, 24/7 crisis support via text message.',
      phoneNumber: '741741',
      textNumber: '741741',
      website: 'https://www.crisistextline.org',
      category: 'Crisis Support',
      specialties: ['text support', 'crisis intervention', 'youth friendly'],
      availability: '24/7',
      languages: ['English', 'Spanish'],
      location: 'National',
      isNational: true,
      isVerified: true,
      lastUpdated: '2024-10-01',
      priority: 'emergency'
    },
    {
      id: 3,
      name: 'SAMHSA National Helpline',
      description: 'Treatment referral and information service for mental health and substance use disorders.',
      phoneNumber: '1-800-662-4357',
      website: 'https://www.samhsa.gov/find-help/national-helpline',
      category: 'Mental Health',
      specialties: ['treatment referrals', 'substance abuse', 'mental health information'],
      availability: '24/7',
      languages: ['English', 'Spanish'],
      location: 'National',
      isNational: true,
      isVerified: true,
      lastUpdated: '2024-09-28',
      priority: 'urgent'
    },
    {
      id: 4,
      name: 'National Domestic Violence Hotline',
      description: '24/7 confidential support for domestic violence survivors.',
      phoneNumber: '1-800-799-7233',
      textNumber: 'START to 88788',
      website: 'https://www.thehotline.org',
      category: 'Domestic Violence',
      specialties: ['domestic violence', 'safety planning', 'legal advocacy'],
      availability: '24/7',
      languages: ['English', 'Spanish', '200+ languages via interpretation'],
      location: 'National',
      isNational: true,
      isVerified: true,
      lastUpdated: '2024-09-25',
      priority: 'emergency'
    },
    {
      id: 5,
      name: 'Trevor Lifeline',
      description: '24/7 crisis support for LGBTQ+ youth.',
      phoneNumber: '1-866-488-7386',
      textNumber: 'START to 678-678',
      website: 'https://www.thetrevorproject.org',
      category: 'LGBTQ+ Support',
      specialties: ['LGBTQ+ youth', 'suicide prevention', 'crisis counseling'],
      availability: '24/7',
      languages: ['English'],
      location: 'National',
      isNational: true,
      isVerified: true,
      lastUpdated: '2024-09-20',
      priority: 'emergency'
    },
    {
      id: 6,
      name: 'NAMI HelpLine',
      description: 'Information, resource referrals and support for mental health questions.',
      phoneNumber: '1-800-950-6264',
      website: 'https://www.nami.org/help',
      category: 'Mental Health',
      specialties: ['mental health information', 'resource referrals', 'family support'],
      availability: 'Monday-Friday 10am-10pm ET',
      languages: ['English'],
      location: 'National',
      isNational: true,
      isVerified: true,
      lastUpdated: '2024-09-15',
      priority: 'support'
    }
  ];

  useEffect(() => {
    loadHotlines();
  }, []);

  const loadHotlines = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHotlines(mockHotlines);
      
      toast({
        title: 'Demo Mode',
        description: 'Displaying sample hotlines. Backend integration in progress.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load hotlines.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredHotlines = hotlines.filter(hotline => {
    const matchesSearch = hotline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hotline.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hotline.specialties.some(specialty => specialty.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || hotline.category === selectedCategory;
    const matchesPriority = selectedPriority === 'All' || hotline.priority === selectedPriority;
    
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'bg-red-100 text-red-800 border-red-200';
      case 'urgent': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'support': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'emergency': return <AlertTriangle className="w-4 h-4" />;
      case 'urgent': return <Clock className="w-4 h-4" />;
      case 'support': return <Heart className="w-4 h-4" />;
      default: return <Phone className="w-4 h-4" />;
    }
  };

  const handleCallHotline = (phoneNumber: string, name: string) => {
    // In a real app, this would initiate a call
    toast({
      title: 'Calling Hotline',
      description: `Connecting to ${name} at ${phoneNumber}`,
    });
  };

  const handleTextHotline = (textNumber: string, name: string) => {
    // In a real app, this would open text messaging
    toast({
      title: 'Text Support',
      description: `Text ${textNumber} to connect with ${name}`,
    });
  };

  const canManageHotlines = user?.role === 'admin';

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-16 sm:pt-20 md:pt-24">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-16 sm:pt-20 md:pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Emergency Alert */}
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Emergency:</strong> If you are in immediate danger, call 911 or go to your nearest emergency room.
          </AlertDescription>
        </Alert>

        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Crisis Hotlines
              </h1>
              <p className="text-gray-600">
                24/7 crisis support and mental health resources - help is always available
              </p>
            </div>
            {canManageHotlines && (
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Hotline
              </Button>
            )}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search hotlines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {priorities.map(priority => (
                <option key={priority} value={priority}>
                  {priority === 'All' ? 'All Priorities' : priority.charAt(0).toUpperCase() + priority.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Hotlines List */}
        <div className="space-y-4">
          {filteredHotlines.map((hotline) => (
            <Card key={hotline.id} className={`hover:shadow-lg transition-shadow border-l-4 ${getPriorityColor(hotline.priority).split(' ')[2]}`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{hotline.name}</CardTitle>
                      {hotline.isVerified && (
                        <Badge className="bg-green-100 text-green-800">Verified</Badge>
                      )}
                      {hotline.isNational && (
                        <Badge variant="outline">National</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getPriorityColor(hotline.priority)}>
                        <span className="flex items-center gap-1">
                          {getPriorityIcon(hotline.priority)}
                          {hotline.priority.charAt(0).toUpperCase() + hotline.priority.slice(1)}
                        </span>
                      </Badge>
                      <Badge variant="outline">{hotline.category}</Badge>
                      <Badge className="bg-green-100 text-green-800">
                        <Clock className="w-3 h-3 mr-1" />
                        {hotline.availability}
                      </Badge>
                    </div>
                  </div>
                  {canManageHotlines && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-600 mb-4">{hotline.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Specialties:</h4>
                    <div className="flex flex-wrap gap-1">
                      {hotline.specialties.map((specialty) => (
                        <Badge key={specialty} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Languages:</h4>
                    <p className="text-sm text-gray-600">{hotline.languages.join(', ')}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" />
                    {hotline.location}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleCallHotline(hotline.phoneNumber, hotline.name)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call {hotline.phoneNumber}
                    </Button>
                    {hotline.textNumber && (
                      <Button
                        onClick={() => handleTextHotline(hotline.textNumber, hotline.name)}
                        variant="outline"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Text
                      </Button>
                    )}
                    {hotline.website && (
                      <Button variant="outline">
                        <Globe className="w-4 h-4 mr-2" />
                        Website
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredHotlines.length === 0 && (
          <div className="text-center py-12">
            <Phone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hotlines found</h3>
            <p className="text-gray-500">
              Try adjusting your search criteria or check back later for new hotlines.
            </p>
          </div>
        )}

        {/* Quick Access Emergency Numbers */}
        <Card className="mt-8 bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Emergency Quick Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => handleCallHotline('911', 'Emergency Services')}
                className="bg-red-600 hover:bg-red-700 h-12"
              >
                <Phone className="w-4 h-4 mr-2" />
                911 - Emergency
              </Button>
              <Button
                onClick={() => handleCallHotline('988', 'Suicide Prevention Lifeline')}
                className="bg-red-600 hover:bg-red-700 h-12"
              >
                <Phone className="w-4 h-4 mr-2" />
                988 - Crisis Support
              </Button>
              <Button
                onClick={() => handleTextHotline('741741', 'Crisis Text Line')}
                className="bg-red-600 hover:bg-red-700 h-12"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Text 741741
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default CrisisHotlines;
