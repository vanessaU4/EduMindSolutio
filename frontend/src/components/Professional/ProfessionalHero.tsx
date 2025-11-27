import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Heart, Brain, Users, Award, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const ProfessionalHero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 shenations-hero-bg">
        <div className="absolute inset-0 bg-gradient-to-br from-shenations-purple-500/10 via-shenations-pink-500/5 to-shenations-indigo-500/10 animate-gradient" />
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-shenations-purple-200/30 rounded-full blur-xl animate-float" />
        <div className="absolute top-40 right-32 w-24 h-24 bg-shenations-pink-200/30 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-32 left-32 w-40 h-40 bg-shenations-indigo-200/30 rounded-full blur-xl animate-float" style={{ animationDelay: '4s' }} />
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-shenations-purple-300/20 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Badge className="badge-premium text-sm px-4 py-2">
                <Shield className="w-4 h-4 mr-2" />
                HIPAA Compliant & Secure
              </Badge>
            </motion.div>

            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="space-y-4"
            >
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="shenations-gradient-text">Transform</span>
                <br />
                <span className="text-neutral-800">Mental Health</span>
                <br />
                <span className="text-neutral-600">Care</span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-neutral-600 leading-relaxed max-w-2xl">
                Professional-grade mental health platform combining evidence-based assessments, 
                evidence-based insights, and compassionate care coordination.
              </p>
            </motion.div>

            {/* Features List */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="space-y-3"
            >
              {[
                'Clinically validated assessments',
                'Real-time crisis intervention',
                'Comprehensive care coordination',
                'Advanced analytics & reporting'
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-shenations-purple-600 flex-shrink-0" />
                  <span className="text-neutral-700 font-medium">{feature}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <Button className="btn-primary group">
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button className="btn-secondary">
                Watch Demo
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="flex items-center space-x-6 pt-8"
            >
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-shenations-purple-600" />
                <span className="text-sm text-neutral-600 font-medium">ISO 27001 Certified</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-shenations-purple-600" />
                <span className="text-sm text-neutral-600 font-medium">HIPAA Compliant</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Visual Elements */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            {/* Main Card */}
            <div className="card-premium max-w-md mx-auto">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-shenations-purple-500 to-shenations-pink-500 rounded-xl flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-800">Mental Health Assessment</h3>
                    <p className="text-sm text-neutral-600">PHQ-9 Depression Screening</p>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Progress</span>
                    <span className="font-medium text-shenations-purple-700">7 of 9 questions</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-shenations-purple-500 to-shenations-pink-500 h-2 rounded-full w-3/4 animate-pulse-slow" />
                  </div>
                </div>

                {/* Mock Question */}
                <div className="space-y-4">
                  <p className="text-neutral-800 font-medium">
                    Over the last 2 weeks, how often have you been bothered by feeling down, depressed, or hopeless?
                  </p>
                  
                  <div className="space-y-2">
                    {['Not at all', 'Several days', 'More than half the days', 'Nearly every day'].map((option, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${index === 1 ? 'border-shenations-purple-500 bg-shenations-purple-500' : 'border-neutral-300'}`} />
                        <span className={`text-sm ${index === 1 ? 'text-shenations-purple-700 font-medium' : 'text-neutral-600'}`}>
                          {option}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <Button className="btn-primary w-full">
                  Continue Assessment
                </Button>
              </div>
            </div>

            {/* Floating Stats */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="absolute -top-8 -right-8 card-glass p-4 animate-bounce-subtle"
            >
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8 text-shenations-purple-600" />
                <div>
                  <div className="text-lg font-bold text-neutral-800">50K+</div>
                  <div className="text-xs text-neutral-600">Lives Improved</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              className="absolute -bottom-8 -left-8 card-glass p-4 animate-bounce-subtle"
              style={{ animationDelay: '1s' }}
            >
              <div className="flex items-center space-x-3">
                <Heart className="w-8 h-8 text-shenations-pink-600" />
                <div>
                  <div className="text-lg font-bold text-neutral-800">98%</div>
                  <div className="text-xs text-neutral-600">Satisfaction</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProfessionalHero;
