import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import { Button } from '@/components/ui/button';
import {
  Heart,
  Shield,
  Users,
  BookOpen,
  Phone,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Brain,
  MessageCircle,
} from 'lucide-react';

const Home: React.FC = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  if (isAuthenticated) {
    // Redirect authenticated users to their appropriate dashboard
    if (user?.role === 'guide') {
      window.location.href = '/guide';
      return null;
    } else if (user?.role === 'admin') {
      window.location.href = '/admin';
      return null;
    } else {
      window.location.href = '/dashboard';
      return null;
    }
  }

  const features = [
    {
      icon: Brain,
      title: 'Mental Health Assessments',
      description: 'Comprehensive mental health screenings with personalized insights',
      href: '/assessments',
    },
    {
      icon: Users,
      title: 'Community Support',
      description: 'Connect with peers in a safe, supportive environment',
      href: '/community',
    },
    {
      icon: Heart,
      title: 'Wellness Tools',
      description: 'Mood tracking, mindfulness, and personalized self-care',
      href: '/wellness',
    },
    {
      icon: Shield,
      title: 'Crisis Support',
      description: '24/7 crisis intervention and safety resources',
      href: '/crisis',
    },
  ];



  return (
    <div className="min-h-screen shenations-hero-bg">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="block text-gray-900">Transform Your</span>
              <span className="block shenations-gradient-text">Mental Wellness Journey</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Comprehensive mental health platform designed for youth aged 13-23. 
              Experience personalized care and peer support.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link to="/register" className="shenations-button-primary group">
                Begin Your Journey
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" className="shenations-button-secondary">
                Sign In
              </Link>
            </div>

            {/* Compliance Badges */}
            <div className="flex justify-center gap-6 mb-8 text-sm text-gray-600">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center">
                <Shield className="w-4 h-4 text-blue-500 mr-2" />
                <span>Secure & Private</span>
              </div>
            </div>

            {/* Crisis Alert */}
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-red-600 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">24/7 Crisis Support Available</span>
              </div>
              <p className="text-sm text-red-600">
                Call 988 • Text HOME to 741741 • Emergency: 911
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Essential Mental Health Tools
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need for your mental wellness journey in one platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
                <Link
                  to={feature.href}
                  className="text-blue-600 text-sm font-medium hover:text-blue-700"
                >
                  Learn more →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Emergency Section */}
      <section className="py-8 bg-red-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-xl font-bold">Crisis Support</h3>
            </div>
            <p className="mb-4">If you're experiencing a mental health crisis, help is available now.</p>
            <div className="flex justify-center gap-8 text-sm">
              <div>
                <div className="font-bold">988</div>
                <div>Suicide Prevention</div>
              </div>
              <div>
                <div className="font-bold">741741</div>
                <div>Crisis Text Line</div>
              </div>
              <div>
                <div className="font-bold">911</div>
                <div>Emergency</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;