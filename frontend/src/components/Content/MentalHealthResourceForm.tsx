import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Plus, Save, MapPin, Phone, Mail, Globe, Clock, Star } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface MentalHealthResourceFormData {
  name: string;
  description: string;
  resource_type: 'therapist' | 'clinic' | 'hospital' | 'support_group' | 'hotline' | 'online' | 'nonprofit';
  phone_number: string;
  email: string;
  website: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  latitude: number | null;
  longitude: number | null;
  services_offered: string[];
  specializations: string[];
  age_groups_served: string[];
  languages: string[];
  hours_of_operation: Record<string, string>;
  is_24_7: boolean;
  accepts_walk_ins: boolean;
  cost_level: 'free' | 'low' | 'moderate' | 'high' | 'varies';
  insurance_accepted: string[];
  is_verified: boolean;
  rating: number | null;
}

interface MentalHealthResourceFormProps {
  initialData?: Partial<MentalHealthResourceFormData>;
  onSubmit: (data: MentalHealthResourceFormData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

const MentalHealthResourceForm: React.FC<MentalHealthResourceFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [newService, setNewService] = useState('');
  const [newSpecialization, setNewSpecialization] = useState('');
  const [newAgeGroup, setNewAgeGroup] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newInsurance, setNewInsurance] = useState('');
  
  const [formData, setFormData] = useState<MentalHealthResourceFormData>({
    name: '',
    description: '',
    resource_type: 'therapist',
    phone_number: '',
    email: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    latitude: null,
    longitude: null,
    services_offered: [],
    specializations: [],
    age_groups_served: [],
    languages: [],
    hours_of_operation: {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: ''
    },
    is_24_7: false,
    accepts_walk_ins: false,
    cost_level: 'varies',
    insurance_accepted: [],
    is_verified: false,
    rating: null,
    ...initialData
  });

  const resourceTypeOptions = [
    { value: 'therapist', label: 'Individual Therapist', icon: '👨‍⚕️' },
    { value: 'clinic', label: 'Mental Health Clinic', icon: '🏥' },
    { value: 'hospital', label: 'Hospital/Emergency', icon: '🚑' },
    { value: 'support_group', label: 'Support Group', icon: '👥' },
    { value: 'hotline', label: 'Crisis Hotline', icon: '📞' },
    { value: 'online', label: 'Online Service', icon: '💻' },
    { value: 'nonprofit', label: 'Non-profit Organization', icon: '🤝' },
  ];

  const costLevelOptions = [
    { value: 'free', label: 'Free', color: 'bg-green-100 text-green-800' },
    { value: 'low', label: 'Low Cost', color: 'bg-blue-100 text-blue-800' },
    { value: 'moderate', label: 'Moderate Cost', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High Cost', color: 'bg-red-100 text-red-800' },
    { value: 'varies', label: 'Cost Varies', color: 'bg-gray-100 text-gray-800' },
  ];

  const daysOfWeek = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];

  const handleInputChange = (field: keyof MentalHealthResourceFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleHoursChange = (day: string, hours: string) => {
    setFormData(prev => ({
      ...prev,
      hours_of_operation: {
        ...prev.hours_of_operation,
        [day]: hours
      }
    }));
  };

  const handleAddToArray = (field: keyof MentalHealthResourceFormData, value: string, setter: (value: string) => void) => {
    if (value.trim() && Array.isArray(formData[field])) {
      const currentArray = formData[field] as string[];
      if (!currentArray.includes(value.trim())) {
        setFormData(prev => ({
          ...prev,
          [field]: [...currentArray, value.trim()]
        }));
        setter('');
      }
    }
  };

  const handleRemoveFromArray = (field: keyof MentalHealthResourceFormData, valueToRemove: string) => {
    if (Array.isArray(formData[field])) {
      const currentArray = formData[field] as string[];
      setFormData(prev => ({
        ...prev,
        [field]: currentArray.filter(item => item !== valueToRemove)
      }));
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  const validateWebsite = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for the resource",
        variant: "destructive"
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Description required",
        description: "Please enter a description for the resource",
        variant: "destructive"
      });
      return;
    }

    if (formData.email && !validateEmail(formData.email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    if (formData.phone_number && !validatePhone(formData.phone_number)) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
      return;
    }

    if (formData.website && !validateWebsite(formData.website)) {
      toast({
        title: "Invalid website URL",
        description: "Please enter a valid website URL",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      toast({
        title: "Success",
        description: `Mental health resource ${isEditing ? 'updated' : 'created'} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save resource",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {isEditing ? 'Edit Mental Health Resource' : 'Add New Mental Health Resource'}
            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Resource'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="contact">Contact & Location</TabsTrigger>
              <TabsTrigger value="services">Services & Details</TabsTrigger>
              <TabsTrigger value="availability">Availability & Cost</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit}>
              <TabsContent value="basic" className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Resource Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter resource name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the services and approach of this resource..."
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resource_type">Resource Type *</Label>
                  <Select
                    value={formData.resource_type}
                    onValueChange={(value: typeof formData.resource_type) => 
                      handleInputChange('resource_type', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {resourceTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <span className="flex items-center gap-2">
                            <span>{option.icon}</span>
                            {option.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cost_level">Cost Level</Label>
                    <Select
                      value={formData.cost_level}
                      onValueChange={(value: typeof formData.cost_level) => 
                        handleInputChange('cost_level', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {costLevelOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <Badge className={option.color}>{option.label}</Badge>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rating">Rating (1-5)</Label>
                    <Input
                      id="rating"
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      value={formData.rating || ''}
                      onChange={(e) => handleInputChange('rating', parseFloat(e.target.value) || null)}
                      placeholder="4.5"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contact" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <Input
                        id="phone_number"
                        value={formData.phone_number}
                        onChange={(e) => handleInputChange('phone_number', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="contact@example.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Address Information
                  </h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="123 Main Street"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="City"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder="State"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="zip_code">ZIP Code</Label>
                      <Input
                        id="zip_code"
                        value={formData.zip_code}
                        onChange={(e) => handleInputChange('zip_code', e.target.value)}
                        placeholder="12345"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        value={formData.latitude || ''}
                        onChange={(e) => handleInputChange('latitude', parseFloat(e.target.value) || null)}
                        placeholder="40.7128"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        value={formData.longitude || ''}
                        onChange={(e) => handleInputChange('longitude', parseFloat(e.target.value) || null)}
                        placeholder="-74.0060"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="services" className="space-y-6">
                {/* Services Offered */}
                <div className="space-y-2">
                  <Label>Services Offered</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.services_offered.map((service) => (
                      <Badge key={service} variant="secondary" className="flex items-center gap-1">
                        {service}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => handleRemoveFromArray('services_offered', service)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newService}
                      onChange={(e) => setNewService(e.target.value)}
                      placeholder="Add a service"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddToArray('services_offered', newService, setNewService))}
                    />
                    <Button type="button" onClick={() => handleAddToArray('services_offered', newService, setNewService)} variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Specializations */}
                <div className="space-y-2">
                  <Label>Specializations</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.specializations.map((spec) => (
                      <Badge key={spec} variant="secondary" className="flex items-center gap-1">
                        {spec}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => handleRemoveFromArray('specializations', spec)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newSpecialization}
                      onChange={(e) => setNewSpecialization(e.target.value)}
                      placeholder="Add a specialization"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddToArray('specializations', newSpecialization, setNewSpecialization))}
                    />
                    <Button type="button" onClick={() => handleAddToArray('specializations', newSpecialization, setNewSpecialization)} variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Age Groups Served */}
                <div className="space-y-2">
                  <Label>Age Groups Served</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.age_groups_served.map((age) => (
                      <Badge key={age} variant="secondary" className="flex items-center gap-1">
                        {age}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => handleRemoveFromArray('age_groups_served', age)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newAgeGroup}
                      onChange={(e) => setNewAgeGroup(e.target.value)}
                      placeholder="Add an age group"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddToArray('age_groups_served', newAgeGroup, setNewAgeGroup))}
                    />
                    <Button type="button" onClick={() => handleAddToArray('age_groups_served', newAgeGroup, setNewAgeGroup)} variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Languages */}
                <div className="space-y-2">
                  <Label>Languages Spoken</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.languages.map((lang) => (
                      <Badge key={lang} variant="secondary" className="flex items-center gap-1">
                        {lang}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => handleRemoveFromArray('languages', lang)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      placeholder="Add a language"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddToArray('languages', newLanguage, setNewLanguage))}
                    />
                    <Button type="button" onClick={() => handleAddToArray('languages', newLanguage, setNewLanguage)} variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Insurance Accepted */}
                <div className="space-y-2">
                  <Label>Insurance Accepted</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.insurance_accepted.map((insurance) => (
                      <Badge key={insurance} variant="secondary" className="flex items-center gap-1">
                        {insurance}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => handleRemoveFromArray('insurance_accepted', insurance)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newInsurance}
                      onChange={(e) => setNewInsurance(e.target.value)}
                      placeholder="Add insurance provider"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddToArray('insurance_accepted', newInsurance, setNewInsurance))}
                    />
                    <Button type="button" onClick={() => handleAddToArray('insurance_accepted', newInsurance, setNewInsurance)} variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="availability" className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Hours of Operation
                  </h3>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-1">
                      <Label htmlFor="is_24_7">24/7 Service</Label>
                      <p className="text-sm text-gray-600">Available 24 hours a day, 7 days a week</p>
                    </div>
                    <Switch
                      id="is_24_7"
                      checked={formData.is_24_7}
                      onCheckedChange={(checked) => handleInputChange('is_24_7', checked)}
                    />
                  </div>

                  {!formData.is_24_7 && (
                    <div className="space-y-3">
                      {daysOfWeek.map((day) => (
                        <div key={day} className="grid grid-cols-2 gap-4 items-center">
                          <Label className="capitalize">{day}</Label>
                          <Input
                            value={formData.hours_of_operation[day]}
                            onChange={(e) => handleHoursChange(day, e.target.value)}
                            placeholder="9:00 AM - 5:00 PM or 'Closed'"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium">Additional Options</h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="accepts_walk_ins">Accepts Walk-ins</Label>
                      <p className="text-sm text-gray-600">No appointment necessary</p>
                    </div>
                    <Switch
                      id="accepts_walk_ins"
                      checked={formData.accepts_walk_ins}
                      onCheckedChange={(checked) => handleInputChange('accepts_walk_ins', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="is_verified">Verified Resource</Label>
                      <p className="text-sm text-gray-600">Information has been verified by administrators</p>
                    </div>
                    <Switch
                      id="is_verified"
                      checked={formData.is_verified}
                      onCheckedChange={(checked) => handleInputChange('is_verified', checked)}
                    />
                  </div>
                </div>

                {formData.rating && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 p-3 bg-yellow-50 rounded-lg">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>Rating: {formData.rating}/5.0</span>
                  </div>
                )}
              </TabsContent>
            </form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MentalHealthResourceForm;
