import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, Plus, X, Edit, Save, Phone, 
  Heart, Users, AlertTriangle, CheckCircle 
} from 'lucide-react';
import { crisisService } from '@/services/crisisService';

interface SafetyPlanData {
  warning_signs: string[];
  cope_strategies: string[];
  support_people: { name: string; phone: string; relationship: string }[];
  professional_contacts: { name: string; phone: string; role: string }[];
  safe_environment: string[];
  reasons_to_live: string[];
  emergency_contacts: { name: string; phone: string }[];
}

const SafetyPlan: React.FC = () => {
  const [safetyPlan, setSafetyPlan] = useState<SafetyPlanData>({
    warning_signs: [],
    coping_strategies: [],
    support_people: [],
    professional_contacts: [],
    safe_environment: [],
    reasons_to_live: [],
    emergency_contacts: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSafetyPlan();
  }, []);

  const loadSafetyPlan = async () => {
    try {
      setLoading(true);
      const data = await crisisService.getSafetyPlan();
      setSafetyPlan(data);
    } catch (error) {
      console.error('Failed to load safety plan:', error);
      // Keep empty plan structure if API fails
      setSafetyPlan({
        warning_signs: [],
        coping_strategies: [],
        support_people: [],
        professional_contacts: [],
        safe_environment: [],
        reasons_to_live: [],
        emergency_contacts: [
          { name: 'National Suicide Prevention Lifeline', phone: '988' },
          { name: 'Crisis Text Line', phone: '741741' },
          { name: 'Emergency Services', phone: '911' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const addItem = (section: keyof SafetyPlanData, item: any) => {
    setSafetyPlan(prev => ({
      ...prev,
      [section]: [...(prev[section] as any[]), item]
    }));
  };

  const removeItem = (section: keyof SafetyPlanData, index: number) => {
    setSafetyPlan(prev => ({
      ...prev,
      [section]: (prev[section] as any[]).filter((_, i) => i !== index)
    }));
  };

  const updateItem = (section: keyof SafetyPlanData, index: number, newValue: any) => {
    setSafetyPlan(prev => ({
      ...prev,
      [section]: (prev[section] as any[]).map((item, i) => i === index ? newValue : item)
    }));
  };

  const savePlan = () => {
    // Save to backend
    setIsEditing(false);
    // Show success message
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-healthcare-primary"></div>
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
        <div className="mb-8 mt-4 sm:mt-6 md:mt-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Shield className="w-8 h-8 text-healthcare-primary" />
                Safety Plan
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                A personalized plan to help you stay safe during difficult times
              </p>
            </div>
            <Button
              onClick={() => isEditing ? savePlan() : setIsEditing(true)}
              className="bg-healthcare-primary hover:bg-blue-700"
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Plan
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Plan
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Emergency Alert */}
        <Alert className="mb-8 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>If you are in immediate danger:</strong> Call 911 or go to your nearest emergency room.
            <br />
            <strong>Crisis Support:</strong> Call 988 (Suicide & Crisis Lifeline) or text HOME to 741741
          </AlertDescription>
        </Alert>

        <div className="space-y-8">
          {/* Step 1: Warning Signs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-red-100 text-red-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
                Warning Signs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Recognize the thoughts, feelings, and behaviors that indicate you might be entering a crisis.
              </p>
              <div className="space-y-2">
                {safetyPlan.warning_signs.map((sign, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <span className="flex-1">{sign}</span>
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem('warning_signs', index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <Button
                    variant="outline"
                    onClick={() => addItem('warning_signs', 'New warning sign')}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Warning Sign
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Coping Strategies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
                Coping Strategies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Things you can do on your own to help yourself feel better and distract from difficult thoughts.
              </p>
              <div className="space-y-2">
                {safetyPlan.coping_strategies.map((strategy, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <span className="flex-1">{strategy}</span>
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem('coping_strategies', index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <Button
                    variant="outline"
                    onClick={() => addItem('coping_strategies', 'New coping strategy')}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Coping Strategy
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Support People */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
                People for Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Trusted friends and family members you can reach out to for support.
              </p>
              <div className="space-y-3">
                {safetyPlan.support_people.map((person, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded">
                    <div className="flex-1">
                      <div className="font-medium">{person.name}</div>
                      <div className="text-sm text-gray-600">{person.relationship}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="font-mono">{person.phone}</span>
                    </div>
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem('support_people', index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <Button
                    variant="outline"
                    onClick={() => addItem('support_people', { name: 'New Contact', phone: '', relationship: '' })}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Support Person
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Step 4: Professional Contacts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-purple-100 text-purple-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</span>
                Professional Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Mental health professionals and crisis services you can contact.
              </p>
              <div className="space-y-3">
                {safetyPlan.professional_contacts.map((contact, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded">
                    <div className="flex-1">
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-sm text-gray-600">{contact.role}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="font-mono">{contact.phone}</span>
                    </div>
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem('professional_contacts', index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <Button
                    variant="outline"
                    onClick={() => addItem('professional_contacts', { name: 'New Professional', phone: '', role: '' })}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Professional Contact
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Step 5: Reasons to Live */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-pink-100 text-pink-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">5</span>
                Reasons for Living
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Things that are important to you and give your life meaning.
              </p>
              <div className="space-y-2">
                {safetyPlan.reasons_to_live.map((reason, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-pink-50 rounded">
                    <Heart className="w-4 h-4 text-pink-600 flex-shrink-0" />
                    <span className="flex-1">{reason}</span>
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem('reasons_to_live', index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <Button
                    variant="outline"
                    onClick={() => addItem('reasons_to_live', 'New reason to live')}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Reason to Live
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contacts */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Emergency Contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {safetyPlan.emergency_contacts.map((contact, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded border border-red-200">
                    <div className="font-medium text-red-900">{contact.name}</div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-red-600" />
                      <a 
                        href={`tel:${contact.phone}`}
                        className="font-mono text-red-600 hover:text-red-800 font-bold text-lg"
                      >
                        {contact.phone}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default SafetyPlan;
