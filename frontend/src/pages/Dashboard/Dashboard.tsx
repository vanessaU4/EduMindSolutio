import React, { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  Shield,
  Users,
  BookOpen,
  Phone,
  TrendingUp,
  Clock,
  Award,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Star,
  Sparkles,
  Zap,
  Globe,
  Brain,
  Activity,
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  // Check both Redux state and localStorage for authentication
  const storedUser = authService.getUser();
  const hasToken = !!authService.getAccessToken();
  const isAuthed = isAuthenticated || (!!storedUser && hasToken);
  const currentUser = user || storedUser;

  // Redirect authenticated users to their appropriate dashboard using smart router
  if (isAuthed && currentUser) {
    return <Navigate to="/dashboard-router" replace />;
  }

  const features = [
    {
      icon: Shield,
      title: 'Clinical Assessments',
      description: 'Evidence-based mental health screenings including PHQ-9, GAD-7, and PCL-5',
      href: '/assessments',
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      delay: '0ms',
    },
    {
      icon: Users,
      title: 'Peer Support Community',
      description: 'Connect with others in a safe, moderated environment',
      href: '/community',
      color: 'bg-gradient-to-br from-blue-600 to-indigo-600',
      delay: '100ms',
    },
    {
      icon: Heart,
      title: 'Wellness Tools',
      description: 'Mood tracking, daily challenges, and self-care resources',
      href: '/wellness',
      color: 'bg-gradient-to-br from-indigo-500 to-purple-600',
      delay: '200ms',
    },
    {
      icon: BookOpen,
      title: 'Educational Resources',
      description: 'Learn about mental health, coping strategies, and recovery',
      href: '/education',
      color: 'bg-gradient-to-br from-blue-400 to-cyan-500',
      delay: '300ms',
    },
    {
      icon: Phone,
      title: 'Crisis Support',
      description: '24/7 crisis intervention and safety planning resources',
      href: '/crisis',
      color: 'bg-gradient-to-br from-red-500 to-pink-600',
      delay: '400ms',
    },
    {
      icon: TrendingUp,
      title: 'Progress Tracking',
      description: 'Monitor your mental health journey with personalized insights',
      href: '/progress',
      color: 'bg-gradient-to-br from-indigo-600 to-blue-700',
      delay: '500ms',
    },
  ];

  // Remove hardcoded stats - these should come from API or be removed entirely
  const stats = [
    { icon: Activity, value: '24/7', label: 'Crisis Support Available', color: 'text-purple-600' },
  ];



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='7' cy='7' r='7'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-28 sm:pt-32 md:pt-36 lg:pt-40">
          <div className="text-center">
            {/* Animated Logo */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-white/10 rounded-full backdrop-blur-sm border border-white/20 shadow-2xl">
                  <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-white animate-pulse" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>

            {/* Main Heading with Gradient Text */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent animate-fade-in-down">
              EduMindSolutions
            </h1>
            
            <div className="flex items-center justify-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
              <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-blue-100">
                Mental Health Platform for Youth
              </p>
              <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
            </div>
            
            <p className="text-lg sm:text-xl mb-8 text-blue-200 max-w-4xl mx-auto leading-relaxed px-4">
              Transform your mental wellness journey with our comprehensive, HIPAA-compliant platform 
              featuring professional assessments, peer support communities, and 24/7 crisis intervention 
              services designed specifically for youth aged 13-23.
            </p>
            
            {/* Enhanced Compliance Badges */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-10 px-4">
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <CheckCircle className="w-4 h-4 mr-2" />
                HIPAA Compliant
              </Badge>
              <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Shield className="w-4 h-4 mr-2" />
                WCAG 2.1 AA
              </Badge>
              <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Heart className="w-4 h-4 mr-2" />
                Evidence-Based
              </Badge>
              <Badge className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-4 py-2 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Star className="w-4 h-4 mr-2" />
                Professional
              </Badge>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4 mb-12">
              <Button size="lg" asChild className="bg-white text-blue-700 hover:bg-blue-50 text-base font-semibold px-8 py-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
                <Link to="/register">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm text-base font-semibold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105">
                <Link to="/login">
                  Welcome Back
                </Link>
              </Button>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="flex justify-center mb-2">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 group-hover:scale-110 transition-transform duration-300">
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-blue-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section className="py-20 relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Comprehensive Platform
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Advanced Mental Health Support
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Experience the future of mental healthcare with our comprehensive platform designed specifically for youth
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="group relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-fade-in-down"
                style={{animationDelay: feature.delay}}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="relative z-10 pb-4">
                  <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors duration-300">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative z-10 pt-0">
                  <Button 
                    variant="outline" 
                    asChild 
                    className="w-full border-2 border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300 font-semibold py-3 rounded-xl group-hover:shadow-lg"
                  >
                    <Link to={feature.href}>
                      Explore Now
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M20 20c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8 8 3.6 8 8zm0-20c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8 8 3.6 8 8z'/%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-8">
            Why Choose EduMindSolutions?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Join thousands of youth who have transformed their mental wellness journey with our innovative platform
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center group">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/20 group-hover:scale-110 transition-transform duration-300">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Personalized Insights</h3>
              <p className="text-blue-100 leading-relaxed">
                Advanced assessment tools provide personalized mental health insights and recommendations
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/20 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Privacy First</h3>
              <p className="text-blue-100 leading-relaxed">
                Your data is protected with enterprise-grade security and full HIPAA compliance
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/20 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Expert Support</h3>
              <p className="text-blue-100 leading-relaxed">
                Access to licensed mental health professionals and peer support communities 24/7
              </p>
            </div>
          </div>
          
          <Button size="lg" asChild className="bg-white text-blue-700 hover:bg-blue-50 text-lg font-semibold px-10 py-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
            <Link to="/register">
              <Star className="w-5 h-5 mr-2" />
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
