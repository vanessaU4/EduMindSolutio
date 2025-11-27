import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Heart, 
  Shield, 
  ArrowRight, 
  Loader2, 
  CheckCircle, 
  Info, 
  Users, 
  BarChart3, 
  Settings, 
  HelpCircle,
  Target,
  Award,
  Calendar,
  Clock,
  TrendingUp,
  Plus,
  Filter,
  Search
} from 'lucide-react';
import assessmentService, { AssessmentType, Assessment } from '@/services/assessmentService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const ProfessionalAssessmentCenter: React.FC = () => {
  const [assessmentTypes, setAssessmentTypes] = useState<AssessmentType[]>([]);
  const [recentAssessments, setRecentAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [types, history] = await Promise.all([
        assessmentService.getAssessmentTypes(),
        assessmentService.getAssessmentHistory(),
      ]);
      setAssessmentTypes(Array.isArray(types) ? types : []);
      setRecentAssessments(Array.isArray(history) ? history.slice(0, 5) : []);
    } catch (error) {
      console.error('Failed to load assessments:', error);
      setAssessmentTypes([]);
      setRecentAssessments([]);
      toast({
        title: 'Error',
        description: 'Failed to load assessments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getAssessmentIcon = (name: string) => {
    switch (name) {
      case 'PHQ9':
        return <Brain className="w-8 h-8 text-shenations-purple-600" />;
      case 'GAD7':
        return <Heart className="w-8 h-8 text-shenations-pink-600" />;
      case 'PCL5':
        return <Shield className="w-8 h-8 text-shenations-indigo-600" />;
      default:
        return <Target className="w-8 h-8 text-neutral-600" />;
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'minimal':
        return 'badge-success';
      case 'mild':
        return 'badge-warning';
      case 'moderate':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'moderately_severe':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'severe':
        return 'badge-danger';
      default:
        return 'badge-premium';
    }
  };

  const filteredAssessments = assessmentTypes.filter(assessment => {
    const matchesSearch = assessment.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterCategory === 'all' || assessment.name.toLowerCase().includes(filterCategory);
    return matchesSearch && matchesFilter;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-shenations-purple-600 mx-auto" />
          <p className="text-neutral-600 font-medium">Loading assessments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-shenations-purple-50/20">
      <div className="container mx-auto px-6 py-8 pt-24">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            
            <div className="space-y-4">
              <Badge className="badge-premium">
                <Brain className="w-4 h-4 mr-2" />
                Assessment Center
              </Badge>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-neutral-800">
                Professional
                <br />
                <span className="shenations-gradient-text">Mental Health</span>
                <br />
                <span className="text-neutral-600">Assessments</span>
              </h1>
              
              <p className="text-xl text-neutral-600 leading-relaxed max-w-2xl">
                Evidence-based screening tools designed for clinical excellence. 
                Monitor patient progress with validated assessments and real-time insights.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 lg:w-80">
              <div className="card-premium text-center">
                <Award className="w-8 h-8 text-shenations-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-neutral-800">15+</div>
                <div className="text-sm text-neutral-600">Validated Tools</div>
              </div>
              
              <div className="card-premium text-center">
                <Users className="w-8 h-8 text-shenations-pink-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-neutral-800">50K+</div>
                <div className="text-sm text-neutral-600">Assessments</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="card-premium mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center">
            
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search assessments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-premium pl-10"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-neutral-600" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="input-premium min-w-[150px]"
              >
                <option value="all">All Categories</option>
                <option value="phq">Depression</option>
                <option value="gad">Anxiety</option>
                <option value="pcl">PTSD</option>
              </select>
            </div>

            {/* Quick Actions */}
            <div className="flex space-x-2">
              <Button className="btn-secondary">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
              
              <Button className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                New Assessment
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Alert className="mb-8 border-shenations-purple-200 bg-shenations-purple-50/50 backdrop-blur-sm">
            <Info className="h-5 w-5 text-shenations-purple-600" />
            <AlertDescription className="text-shenations-purple-800 font-medium">
              These assessments are evidence-based screening tools. Results should always be interpreted 
              by qualified mental health professionals and used as part of comprehensive clinical evaluation.
            </AlertDescription>
          </Alert>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-3">
            
            {/* Available Assessments */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-neutral-800">Available Assessments</h2>
                <Badge className="badge-premium">
                  {filteredAssessments.length} Tools Available
                </Badge>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {filteredAssessments.map((assessment, index) => (
                  <motion.div
                    key={assessment.id}
                    variants={itemVariants}
                    className="group"
                  >
                    <div className="card-premium h-full hover:scale-105 transition-all duration-500 cursor-pointer"
                         onClick={() => navigate(`/assessments/take/${assessment.id}`)}>
                      
                      {/* Header */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-shenations-purple-100 to-shenations-pink-100 rounded-2xl flex items-center justify-center group-hover:shadow-lg transition-all duration-300">
                            {getAssessmentIcon(assessment.name)}
                          </div>
                          
                          <div>
                            <h3 className="text-xl font-bold text-neutral-800 group-hover:text-shenations-purple-700 transition-colors">
                              {assessment.display_name}
                            </h3>
                            <Badge className="badge-premium text-xs mt-1">
                              {assessment.total_questions} questions
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-neutral-600 leading-relaxed mb-6">
                        {assessment.description}
                      </p>

                      {/* Features */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-neutral-700">Clinically validated</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="text-neutral-700">5-10 minutes completion</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <BarChart3 className="w-4 h-4 text-purple-600" />
                          <span className="text-neutral-700">Real-time scoring</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button className="btn-primary w-full group">
                        Start Assessment
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="card-premium">
                <h3 className="text-lg font-bold text-neutral-800 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-shenations-purple-600" />
                  Recent Activity
                </h3>
                
                <div className="space-y-4">
                  {recentAssessments.length > 0 ? (
                    recentAssessments.map((assessment) => (
                      <div key={assessment.id} className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-lg p-3 hover:bg-white/80 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-neutral-800 text-sm">
                            {assessment.assessment_type.display_name}
                          </div>
                          <Badge className={`${getRiskLevelColor(assessment.risk_level)} text-xs`}>
                            {assessment.risk_level.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="text-xs text-neutral-600">
                          Score: {assessment.total_score}/{assessment.assessment_type.max_score}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {new Date(assessment.completed_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-neutral-500">
                      <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No recent assessments</p>
                    </div>
                  )}
                </div>
                
                {recentAssessments.length > 0 && (
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => navigate('/assessments/history')}
                  >
                    View All History
                  </Button>
                )}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <div className="card-premium">
                <h3 className="text-lg font-bold text-neutral-800 mb-4 flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-shenations-purple-600" />
                  Quick Actions
                </h3>
                
                <div className="space-y-3">
                  {[
                    { icon: BarChart3, label: 'View Analytics', href: '/analytics' },
                    { icon: Users, label: 'Patient Management', href: '/patients' },
                    { icon: HelpCircle, label: 'Help & Support', href: '/help' },
                    { icon: Settings, label: 'Settings', href: '/settings' }
                  ].map((action, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(action.href)}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-shenations-purple-50 transition-colors text-left group"
                    >
                      <action.icon className="w-5 h-5 text-shenations-purple-600 group-hover:scale-110 transition-transform" />
                      <span className="font-medium text-neutral-700">{action.label}</span>
                      <ArrowRight className="w-4 h-4 text-neutral-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Help Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="card-premium bg-gradient-to-br from-shenations-purple-50 to-shenations-pink-50">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-shenations-purple-500 to-shenations-pink-500 rounded-xl flex items-center justify-center mx-auto">
                    <HelpCircle className="w-6 h-6 text-white" />
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-neutral-800 mb-2">Need Help?</h4>
                    <p className="text-sm text-neutral-600 leading-relaxed">
                      Access our comprehensive guide on mental health assessments and best practices.
                    </p>
                  </div>
                  
                  <Button className="btn-secondary w-full">
                    View Documentation
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalAssessmentCenter;
