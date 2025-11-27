import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Shield, Lock, CheckCircle, Users, Award, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  isLogin?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle, isLogin = false }) => {
  const features = [
    {
      icon: Shield,
      title: "HIPAA Compliant",
      description: "Your data is protected with enterprise-grade security"
    },
    {
      icon: Users,
      title: "Expert Guidance",
      description: "Connect with licensed mental health professionals"
    },
    {
      icon: Award,
      title: "Evidence-Based",
      description: "Clinically validated assessments and interventions"
    },
    {
      icon: Sparkles,
      title: "Personalized Care",
      description: "Tailored mental health support for youth aged 13-23"
    }
  ];

 

  return (
    <div className="min-h-screen bg-gradient-to-br from-healthcare-bg via-blue-50 to-purple-50 flex">
      {/* Left Column - Branding & Guide Content */}
      <motion.div 
        className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-gradient-to-br from-healthcare-primary via-blue-600 to-purple-600 relative overflow-hidden"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        {/* Floating Elements */}
        <motion.div 
          className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-40 right-20 w-16 h-16 bg-white/5 rounded-full"
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div 
          className="absolute bottom-40 left-20 w-12 h-12 bg-white/10 rounded-full"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16 text-white">
          {/* Logo & Brand */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center mb-6">
              <div className="flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mr-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">EduMindSolutions</h1>
                <p className="text-blue-100 text-lg">Mental Health Platform</p>
              </div>
            </div>
            
            {/* Compliance Badges */}
            <div className="flex gap-3">
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                <Lock className="w-3 h-3 mr-1" />
                HIPAA Secure
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                <CheckCircle className="w-3 h-3 mr-1" />
                Ages 13-23
              </Badge>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-4xl xl:text-5xl font-bold mb-6 leading-tight">
              {isLogin ? "Welcome Back to" : "Join Our Community of"}
              <br />
              <span className="text-blue-200">Mental Wellness</span>
            </h2>
            <p className="text-xl text-blue-100 leading-relaxed">
              {isLogin 
                ? "Continue your journey towards better mental health with personalized support and professional guidance."
                : "Start your journey towards better mental health with our comprehensive platform designed specifically for youth."
              }
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div 
            className="grid grid-cols-2 gap-6 mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {features.map((feature, index) => (
              <motion.div 
                key={feature.title}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
              >
                <feature.icon className="w-6 h-6 text-blue-200 mb-2" />
                <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                <p className="text-sm text-blue-100">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </motion.div>

      {/* Right Column - Form Content */}
      <motion.div 
        className="flex-1 lg:w-1/2 xl:w-2/5 flex items-center justify-center p-8 lg:p-12"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
      >
        <div className="w-full max-w-md">
          {/* Mobile Header - Only visible on small screens */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-16 h-16 bg-healthcare-primary rounded-full">
                <Heart className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">EduMindSolutions</h1>
            <div className="flex justify-center gap-2">
              <Badge variant="outline" className="hipaa-compliant">
                <Lock className="w-3 h-3 mr-1" />
                HIPAA Secure
              </Badge>
              <Badge variant="outline" className="text-green-600 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                Ages 13-23
              </Badge>
            </div>
          </div>

          {/* Form Header */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
            <p className="text-gray-600">{subtitle}</p>
          </motion.div>

          {/* Form Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {children}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;
