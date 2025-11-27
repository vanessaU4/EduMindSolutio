import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Heart, 
  Target, 
  TrendingUp, 
  Calendar, 
  Award,
  ArrowRight,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  Activity,
  BookOpen,
  Users,
  LifeBuoy,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { CapabilityGuard } from '@/components/Auth/RoleGuard';

interface WellnessMetric {
  name: string;
  value: number;
  maxValue: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

interface RecentAssessment {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  riskLevel: string;
  completedAt: string;
  recommendations?: string[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
  points: number;
}

interface AssignedAssessment {
  id: string;
  name: string;
  assignedBy: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
}

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wellnessMetrics, setWellnessMetrics] = useState<WellnessMetric[]>([]);
  const [recentAssessments, setRecentAssessments] = useState<RecentAssessment[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [assignedAssessments, setAssignedAssessments] = useState<AssignedAssessment[]>([]);
  const [wellnessStreak, setWellnessStreak] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    // Mock data - replace with actual API calls
    setWellnessMetrics([
      { name: 'Mood', value: 7, maxValue: 10, trend: 'up', color: 'text-green-600' },
      { name: 'Energy', value: 6, maxValue: 10, trend: 'stable', color: 'text-blue-600' },
      { name: 'Anxiety', value: 4, maxValue: 10, trend: 'down', color: 'text-orange-600' },
      { name: 'Sleep', value: 8, maxValue: 10, trend: 'up', color: 'text-purple-600' }
    ]);

    setRecentAssessments([
      {
        id: '1',
        name: 'PHQ-9 Depression Screening',
        score: 8,
        maxScore: 27,
        riskLevel: 'mild',
        completedAt: '2 days ago',
        recommendations: ['Consider regular exercise', 'Practice mindfulness']
      },
      {
        id: '2',
        name: 'GAD-7 Anxiety Assessment',
        score: 12,
        maxScore: 21,
        riskLevel: 'moderate',
        completedAt: '1 week ago',
        recommendations: ['Deep breathing exercises', 'Limit caffeine intake']
      }
    ]);

    setAchievements([
      {
        id: '1',
        name: 'First Assessment',
        description: 'Completed your first mental health assessment',
        icon: '🎯',
        unlockedAt: '3 days ago',
        points: 50
      },
      {
        id: '2',
        name: 'Wellness Warrior',
        description: '7-day wellness tracking streak',
        icon: '🔥',
        unlockedAt: '1 day ago',
        points: 100
      }
    ]);

    setAssignedAssessments([
      {
        id: '1',
        name: 'Weekly Check-in Assessment',
        assignedBy: 'Dr. Sarah Mitchell',
        dueDate: '2024-01-25',
        priority: 'medium'
      }
    ]);

    setWellnessStreak(7);
    setCurrentLevel(3);
    setTotalPoints(450);
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'minimal': return 'badge-success';
      case 'mild': return 'badge-warning';
      case 'moderate': return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'severe': return 'badge-danger';
      default: return 'badge-premium';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'badge-danger';
      case 'medium': return 'badge-warning';
      case 'low': return 'badge-success';
      default: return 'badge-premium';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-shenations-purple-50/20">
      <div className="container mx-auto px-6 py-8 pt-24">
        
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            
            {/* Level & Points */}
            <CapabilityGuard capability="earn_achievements">
              <div className="card-premium p-4 lg:w-80">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-shenations-purple-600" />
                    <span className="font-semibold text-neutral-800">Level {currentLevel}</span>
                  </div>
                  <Badge className="badge-premium">{totalPoints} points</Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-neutral-600">
                    <span>Progress to Level {currentLevel + 1}</span>
                    <span>75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
              </div>
            </CapabilityGuard>
          </div>
        </motion.div>

        {/* Assigned Assessments Alert */}
        <CapabilityGuard capability="complete_assigned_assessments">
          {assignedAssessments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8"
            >
              <Alert className="border-shenations-purple-200 bg-shenations-purple-50">
                <Calendar className="h-4 w-4 text-shenations-purple-600" />
                <AlertDescription className="text-shenations-purple-800">
                  <strong>You have {assignedAssessments.length} assigned assessment(s)</strong> from your healthcare provider.
                  <Button 
                    className="btn-primary ml-4"
                    size="sm"
                    onClick={() => navigate('/assessments')}
                  >
                    View Assignments
                  </Button>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </CapabilityGuard>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid lg:grid-cols-3 gap-8"
        >
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Wellness Metrics */}
            <CapabilityGuard capability="log_mood_entries">
              <motion.div variants={itemVariants}>
                <Card className="card-premium">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <Activity className="w-6 h-6 text-shenations-purple-600" />
                        <span>Today's Wellness</span>
                      </CardTitle>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className="badge-success">
                          🔥 {wellnessStreak} day streak
                        </Badge>
                        <Button 
                          className="btn-secondary"
                          size="sm"
                          onClick={() => navigate('/wellness/mood-tracker')}
                        >
                          Log Entry
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {wellnessMetrics.map((metric, index) => (
                        <div key={metric.name} className="text-center space-y-2">
                          <div className="text-sm font-medium text-neutral-600">{metric.name}</div>
                          <div className={`text-2xl font-bold ${metric.color}`}>
                            {metric.value}/{metric.maxValue}
                          </div>
                          <Progress 
                            value={(metric.value / metric.maxValue) * 100} 
                            className="h-2"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </CapabilityGuard>

            {/* Recent Assessments */}
            <CapabilityGuard capability="view_own_assessment_history">
              <motion.div variants={itemVariants}>
                <Card className="card-premium">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <Brain className="w-6 h-6 text-shenations-purple-600" />
                        <span>Recent Assessments</span>
                      </CardTitle>
                      
                      <Button 
                        className="btn-secondary"
                        onClick={() => navigate('/assessments/history')}
                      >
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {recentAssessments.map((assessment) => (
                        <div key={assessment.id} className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-neutral-800">{assessment.name}</h4>
                              <p className="text-sm text-neutral-600">{assessment.completedAt}</p>
                            </div>
                            
                            <div className="text-right space-y-1">
                              <div className="font-semibold text-neutral-800">
                                {assessment.score}/{assessment.maxScore}
                              </div>
                              <Badge className={getRiskLevelColor(assessment.riskLevel)}>
                                {assessment.riskLevel}
                              </Badge>
                            </div>
                          </div>
                          
                          {assessment.recommendations && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-neutral-700">Recommendations:</p>
                              <ul className="text-sm text-neutral-600 space-y-1">
                                {assessment.recommendations.map((rec, index) => (
                                  <li key={index} className="flex items-center space-x-2">
                                    <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                                    <span>{rec}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </CapabilityGuard>

            {/* Quick Actions */}
            <motion.div variants={itemVariants}>
              <Card className="card-premium">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-6 h-6 text-shenations-purple-600" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <CapabilityGuard capability="take_assessments">
                      <Button 
                        className="btn-primary h-20 flex-col space-y-2"
                        onClick={() => navigate('/assessments')}
                      >
                        <Brain className="w-6 h-6" />
                        <span>Take Assessment</span>
                      </Button>
                    </CapabilityGuard>
                    
                    <CapabilityGuard capability="log_mood_entries">
                      <Button 
                        className="btn-secondary h-20 flex-col space-y-2"
                        onClick={() => navigate('/wellness/mood-tracker')}
                      >
                        <Heart className="w-6 h-6" />
                        <span>Log Mood</span>
                      </Button>
                    </CapabilityGuard>
                    
                    <CapabilityGuard capability="browse_articles">
                      <Button 
                        className="btn-secondary h-20 flex-col space-y-2"
                        onClick={() => navigate('/education')}
                      >
                        <BookOpen className="w-6 h-6" />
                        <span>Learn</span>
                      </Button>
                    </CapabilityGuard>
                    
                    <CapabilityGuard capability="create_forum_posts">
                      <Button 
                        className="btn-secondary h-20 flex-col space-y-2"
                        onClick={() => navigate('/community')}
                      >
                        <Users className="w-6 h-6" />
                        <span>Community</span>
                      </Button>
                    </CapabilityGuard>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Assigned Assessments */}
            <CapabilityGuard capability="complete_assigned_assessments">
              <motion.div variants={itemVariants}>
                <Card className="card-premium">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      <Calendar className="w-5 h-5 text-shenations-purple-600" />
                      <span>Assigned Assessments</span>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    {assignedAssessments.length > 0 ? (
                      <div className="space-y-3">
                        {assignedAssessments.map((assessment) => (
                          <div key={assessment.id} className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-neutral-800 text-sm">{assessment.name}</h4>
                              <Badge className={getPriorityColor(assessment.priority)}>
                                {assessment.priority}
                              </Badge>
                            </div>
                            
                            <p className="text-xs text-neutral-600 mb-2">
                              Assigned by: {assessment.assignedBy}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-1 text-xs text-neutral-500">
                                <Clock className="w-3 h-3" />
                                <span>Due: {assessment.dueDate}</span>
                              </div>
                              
                              <Button size="sm" className="btn-primary">
                                Start
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-neutral-500">
                        <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No assigned assessments</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </CapabilityGuard>

            {/* Recent Achievements */}
            <CapabilityGuard capability="earn_achievements">
              <motion.div variants={itemVariants}>
                <Card className="card-premium">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      <Award className="w-5 h-5 text-shenations-purple-600" />
                      <span>Recent Achievements</span>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      {achievements.map((achievement) => (
                        <div key={achievement.id} className="bg-gradient-to-r from-shenations-purple-50 to-shenations-pink-50 rounded-lg p-3">
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">{achievement.icon}</div>
                            <div className="flex-1">
                              <h4 className="font-medium text-neutral-800 text-sm">{achievement.name}</h4>
                              <p className="text-xs text-neutral-600">{achievement.description}</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs text-neutral-500">{achievement.unlockedAt}</span>
                                <Badge className="badge-premium text-xs">+{achievement.points} pts</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      className="btn-secondary w-full mt-4"
                      onClick={() => navigate('/wellness/progress')}
                    >
                      View All Achievements
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </CapabilityGuard>

            {/* Crisis Support */}
            <CapabilityGuard capability="access_crisis_hotlines">
              <motion.div variants={itemVariants}>
                <Card className="card-premium bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-lg text-red-800">
                      <LifeBuoy className="w-5 h-5" />
                      <span>Crisis Support</span>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-sm text-red-700 mb-4">
                      If you're experiencing a mental health crisis, help is available 24/7.
                    </p>
                    
                    <div className="space-y-2">
                      <Button 
                        className="bg-red-600 hover:bg-red-700 text-white w-full"
                        onClick={() => navigate('/crisis')}
                      >
                        <LifeBuoy className="w-4 h-4 mr-2" />
                        Get Crisis Support
                      </Button>
                      
                      <Button 
                        className="btn-secondary w-full"
                        onClick={() => navigate('/crisis/safety-plan')}
                      >
                        View Safety Plan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </CapabilityGuard>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
