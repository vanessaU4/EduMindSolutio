import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Brain,
  Heart,
  Shield,
  ArrowRight,
  Plus,
  Filter,
  Search,
  Bell,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MetricCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface RecentAssessment {
  id: string;
  patientName: string;
  assessmentType: string;
  score: number;
  maxScore: number;
  riskLevel: 'minimal' | 'mild' | 'moderate' | 'severe';
  completedAt: string;
}

const ProfessionalDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const metrics: MetricCard[] = [
    {
      title: 'Total Assessments',
      value: '2,847',
      change: '+12.5%',
      trend: 'up',
      icon: Brain,
      color: 'from-shenations-purple-500 to-shenations-indigo-500'
    },
    {
      title: 'Active Patients',
      value: '1,234',
      change: '+8.2%',
      trend: 'up',
      icon: Users,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'High Risk Alerts',
      value: '23',
      change: '-15.3%',
      trend: 'down',
      icon: AlertTriangle,
      color: 'from-red-500 to-orange-500'
    },
    {
      title: 'Completion Rate',
      value: '94.7%',
      change: '+2.1%',
      trend: 'up',
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const recentAssessments: RecentAssessment[] = [
    {
      id: '1',
      patientName: 'Sarah Johnson',
      assessmentType: 'PHQ-9',
      score: 15,
      maxScore: 27,
      riskLevel: 'moderate',
      completedAt: '2 hours ago'
    },
    {
      id: '2',
      patientName: 'Michael Chen',
      assessmentType: 'GAD-7',
      score: 8,
      maxScore: 21,
      riskLevel: 'mild',
      completedAt: '4 hours ago'
    },
    {
      id: '3',
      patientName: 'Emily Davis',
      assessmentType: 'PCL-5',
      score: 45,
      maxScore: 80,
      riskLevel: 'severe',
      completedAt: '6 hours ago'
    },
    {
      id: '4',
      patientName: 'Robert Wilson',
      assessmentType: 'PHQ-9',
      score: 3,
      maxScore: 27,
      riskLevel: 'minimal',
      completedAt: '1 day ago'
    }
  ];

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'minimal': return 'badge-success';
      case 'mild': return 'badge-warning';
      case 'moderate': return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'severe': return 'badge-danger';
      default: return 'badge-premium';
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-shenations-purple-50/20">
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            
            {/* Left Side */}
            <div className="flex items-center space-x-6">
              <div>
                <h1 className="text-2xl font-bold text-neutral-800">
                  Professional Dashboard
                </h1>
                <p className="text-neutral-600">Welcome back, Dr. Anderson</p>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              <Button className="btn-ghost">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              
              <Button className="btn-ghost relative">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </Button>
              
              <Button className="btn-ghost">
                <Settings className="w-4 h-4" />
              </Button>
              
              <Button className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                New Assessment
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        
        {/* Metrics Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="card-premium group hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${metric.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <metric.icon className="w-6 h-6 text-white" />
                </div>
                
                <div className={`flex items-center space-x-1 text-sm font-medium ${
                  metric.trend === 'up' ? 'text-green-600' : 
                  metric.trend === 'down' ? 'text-red-600' : 'text-neutral-600'
                }`}>
                  <TrendingUp className={`w-4 h-4 ${metric.trend === 'down' ? 'rotate-180' : ''}`} />
                  <span>{metric.change}</span>
                </div>
              </div>
              
              <div>
                <div className="text-2xl font-bold text-neutral-800 mb-1">
                  {metric.value}
                </div>
                <div className="text-sm text-neutral-600">
                  {metric.title}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Recent Assessments */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="card-premium">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Brain className="w-6 h-6 text-shenations-purple-600" />
                  <h2 className="text-xl font-bold text-neutral-800">
                    Recent Assessments
                  </h2>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button className="btn-ghost">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button className="btn-secondary">
                    View All
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {recentAssessments.map((assessment, index) => (
                  <motion.div
                    key={assessment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl p-4 hover:bg-white/80 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between">
                      
                      {/* Left Side */}
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-shenations-purple-100 to-shenations-pink-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-semibold text-shenations-purple-700">
                            {assessment.patientName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        
                        <div>
                          <div className="font-semibold text-neutral-800">
                            {assessment.patientName}
                          </div>
                          <div className="text-sm text-neutral-600">
                            {assessment.assessmentType} • {assessment.completedAt}
                          </div>
                        </div>
                      </div>

                      {/* Right Side */}
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-semibold text-neutral-800">
                            {assessment.score}/{assessment.maxScore}
                          </div>
                          <div className="text-sm text-neutral-600">Score</div>
                        </div>
                        
                        <Badge className={`${getRiskColor(assessment.riskLevel)} capitalize`}>
                          {assessment.riskLevel}
                        </Badge>
                        
                        <Button className="btn-ghost opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Quick Actions & Alerts */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            
            {/* Quick Actions */}
            <div className="card-premium">
              <h3 className="text-lg font-bold text-neutral-800 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-shenations-purple-600" />
                Quick Actions
              </h3>
              
              <div className="space-y-3">
                {[
                  { icon: Plus, label: 'New Assessment', color: 'text-shenations-purple-600' },
                  { icon: Users, label: 'Patient List', color: 'text-blue-600' },
                  { icon: BarChart3, label: 'Analytics', color: 'text-green-600' },
                  { icon: Settings, label: 'Settings', color: 'text-neutral-600' }
                ].map((action, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-shenations-purple-50 transition-colors text-left"
                  >
                    <action.icon className={`w-5 h-5 ${action.color}`} />
                    <span className="font-medium text-neutral-700">{action.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Alerts */}
            <div className="card-premium">
              <h3 className="text-lg font-bold text-neutral-800 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                Priority Alerts
              </h3>
              
              <div className="space-y-3">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-semibold text-red-800">High Risk Patient</span>
                  </div>
                  <p className="text-sm text-red-700">
                    Emily Davis scored 45/80 on PCL-5 assessment
                  </p>
                </div>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-semibold text-amber-800">Overdue Follow-up</span>
                  </div>
                  <p className="text-sm text-amber-700">
                    3 patients have overdue follow-up assessments
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;
