import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, ExternalLink, MapPin, Phone, Globe, 
  Plus, Edit, Trash2, Star, Clock, Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Resource {
  id: number;
  name: string;
  description: string;
  category: string;
  type: 'hotline' | 'website' | 'app' | 'organization' | 'book' | 'tool';
  tags: string[];
  url?: string;
  phone?: string;
  address?: string;
  hours?: string;
  cost: 'Free' | 'Paid' | 'Insurance' | 'Sliding Scale';
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  lastUpdated: string;
  availability: '24/7' | 'Business Hours' | 'Limited' | 'Varies';
}

const ResourceDirectory: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedCost, setSelectedCost] = useState('All');

  const categories = [
    'All', 'Crisis Support', 'Therapy & Counseling', 'Support Groups', 
    'Educational Resources', 'Self-Help Tools', 'Emergency Services', 'Healthcare Providers'
  ];

  const types = ['All', 'hotline', 'website', 'app', 'organization', 'book', 'tool'];
  const costs = ['All', 'Free', 'Paid', 'Insurance', 'Sliding Scale'];

  // Mock resources data
  const mockResources: Resource[] = [
    {
      id: 1,
      name: 'National Suicide Prevention Lifeline',
      description: '24/7 crisis support for people in suicidal crisis or emotional distress.',
      category: 'Crisis Support',
      type: 'hotline',
      tags: ['crisis', 'suicide prevention', '24/7', 'emergency'],
      phone: '988',
      cost: 'Free',
      rating: 4.8,
      reviewCount: 1247,
      isVerified: true,
      lastUpdated: '2024-10-01',
      availability: '24/7'
    },
    {
      id: 2,
      name: 'BetterHelp',
      description: 'Online therapy platform connecting users with licensed therapists.',
      category: 'Therapy & Counseling',
      type: 'website',
      tags: ['therapy', 'online counseling', 'licensed therapists'],
      url: 'https://www.betterhelp.com',
      cost: 'Paid',
      rating: 4.2,
      reviewCount: 8934,
      isVerified: true,
      lastUpdated: '2024-09-28',
      availability: 'Varies'
    },
    {
      id: 3,
      name: 'Headspace',
      description: 'Meditation and mindfulness app with guided sessions.',
      category: 'Self-Help Tools',
      type: 'app',
      tags: ['meditation', 'mindfulness', 'sleep', 'stress relief'],
      url: 'https://www.headspace.com',
      cost: 'Paid',
      rating: 4.5,
      reviewCount: 12456,
      isVerified: true,
      lastUpdated: '2024-09-25',
      availability: '24/7'
    },
    {
      id: 4,
      name: 'NAMI (National Alliance on Mental Illness)',
      description: 'Mental health advocacy organization providing education and support.',
      category: 'Support Groups',
      type: 'organization',
      tags: ['advocacy', 'education', 'support groups', 'family support'],
      url: 'https://www.nami.org',
      phone: '1-800-950-6264',
      cost: 'Free',
      rating: 4.6,
      reviewCount: 2341,
      isVerified: true,
      lastUpdated: '2024-09-20',
      availability: 'Business Hours'
    },
    {
      id: 5,
      name: 'Feeling Good: The New Mood Therapy',
      description: 'Classic self-help book on cognitive behavioral therapy techniques.',
      category: 'Educational Resources',
      type: 'book',
      tags: ['CBT', 'self-help', 'depression', 'anxiety'],
      cost: 'Paid',
      rating: 4.7,
      reviewCount: 5678,
      isVerified: true,
      lastUpdated: '2024-09-15',
      availability: '24/7'
    },
    {
      id: 6,
      name: 'Crisis Text Line',
      description: 'Free, 24/7 crisis support via text message.',
      category: 'Crisis Support',
      type: 'hotline',
      tags: ['crisis', 'text support', '24/7', 'youth friendly'],
      phone: 'Text HOME to 741741',
      cost: 'Free',
      rating: 4.4,
      reviewCount: 3421,
      isVerified: true,
      lastUpdated: '2024-10-01',
      availability: '24/7'
    },
    {
      id: 7,
      name: 'Psychology Today Therapist Directory',
      description: 'Directory to find therapists, psychiatrists, and treatment centers.',
      category: 'Healthcare Providers',
      type: 'website',
      tags: ['therapist directory', 'psychiatrists', 'treatment centers'],
      url: 'https://www.psychologytoday.com',
      cost: 'Free',
      rating: 4.1,
      reviewCount: 6789,
      isVerified: true,
      lastUpdated: '2024-09-30',
      availability: '24/7'
    }
  ];

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setResources(mockResources);
      
      toast({
        title: 'Demo Mode',
        description: 'Displaying sample resources. Backend integration in progress.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load resources.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || resource.category === selectedCategory;
    const matchesType = selectedType === 'All' || resource.type === selectedType;
    const matchesCost = selectedCost === 'All' || resource.cost === selectedCost;
    
    return matchesSearch && matchesCategory && matchesType && matchesCost;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hotline': return <Phone className="w-4 h-4" />;
      case 'website': return <Globe className="w-4 h-4" />;
      case 'app': return <Users className="w-4 h-4" />;
      case 'organization': return <MapPin className="w-4 h-4" />;
      default: return <ExternalLink className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'hotline': return 'bg-red-100 text-red-800';
      case 'website': return 'bg-blue-100 text-blue-800';
      case 'app': return 'bg-green-100 text-green-800';
      case 'organization': return 'bg-purple-100 text-purple-800';
      case 'book': return 'bg-orange-100 text-orange-800';
      case 'tool': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCostColor = (cost: string) => {
    switch (cost) {
      case 'Free': return 'bg-green-100 text-green-800';
      case 'Paid': return 'bg-red-100 text-red-800';
      case 'Insurance': return 'bg-blue-100 text-blue-800';
      case 'Sliding Scale': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case '24/7': return 'bg-green-100 text-green-800';
      case 'Business Hours': return 'bg-blue-100 text-blue-800';
      case 'Limited': return 'bg-yellow-100 text-yellow-800';
      case 'Varies': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const canManageResources = user?.role === 'admin' || user?.role === 'guide';

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
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Resource Directory
              </h1>
              <p className="text-gray-600">
                Comprehensive directory of mental health resources and support services
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search resources..."
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
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {types.map(type => (
                <option key={type} value={type}>
                  {type === 'All' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={selectedCost}
              onChange={(e) => setSelectedCost(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {costs.map(cost => (
                <option key={cost} value={cost}>{cost}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Resources List */}
        <div className="space-y-4">
          {filteredResources.map((resource) => (
            <Card key={resource.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{resource.name}</CardTitle>
                      {resource.isVerified && (
                        <Badge className="bg-green-100 text-green-800">Verified</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge className={getTypeColor(resource.type)}>
                        <span className="flex items-center gap-1">
                          {getTypeIcon(resource.type)}
                          {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                        </span>
                      </Badge>
                      <Badge className={getCostColor(resource.cost)}>{resource.cost}</Badge>
                      <Badge className={getAvailabilityColor(resource.availability)}>
                        <Clock className="w-3 h-3 mr-1" />
                        {resource.availability}
                      </Badge>
                      <Badge variant="outline">{resource.category}</Badge>
                    </div>
                  </div>
                  {canManageResources && (
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
                <p className="text-gray-600 mb-4">{resource.description}</p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {resource.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      {renderStars(resource.rating)}
                      <span className="text-sm text-gray-600 ml-1">
                        {resource.rating} ({resource.reviewCount.toLocaleString()} reviews)
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {resource.phone && (
                      <Button size="sm" variant="outline">
                        <Phone className="w-4 h-4 mr-1" />
                        {resource.phone}
                      </Button>
                    )}
                    {resource.url && (
                      <Button size="sm" variant="outline">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Visit
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
            <p className="text-gray-500">
              Try adjusting your search criteria or check back later for new resources.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ResourceDirectory;
