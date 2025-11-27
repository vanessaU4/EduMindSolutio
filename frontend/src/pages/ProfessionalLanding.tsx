import React from 'react';
import { motion } from 'framer-motion';
import { 
  ProfessionalHero, 
  ProfessionalFeatures 
} from '@/components/Professional';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  Quote, 
  ArrowRight, 
  CheckCircle,
  Users,
  Award,
  Shield,
  Zap,
  TrendingUp,
  Heart
} from 'lucide-react';

const testimonials = [
  {
    name: 'Dr. Sarah Mitchell',
    role: 'Chief Medical Officer',
    organization: 'Regional Health Network',
    content: 'EduMindSolutions has transformed how we approach mental health care. The platform\'s evidence-based assessments and real-time insights have improved our patient outcomes by 40%.',
    avatar: '/api/placeholder/60/60',
    rating: 5
  },
  {
    name: 'Michael Rodriguez',
    role: 'Clinical Director',
    organization: 'Community Mental Health Center',
    content: 'The crisis intervention features have been a game-changer. We can now identify high-risk patients immediately and provide timely interventions that save lives.',
    avatar: '/api/placeholder/60/60',
    rating: 5
  },
  {
    name: 'Dr. Jennifer Park',
    role: 'Psychiatrist',
    organization: 'University Medical Center',
    content: 'The comprehensive analytics and reporting capabilities give us unprecedented visibility into treatment effectiveness. It\'s like having a research team at your fingertips.',
    avatar: '/api/placeholder/60/60',
    rating: 5
  }
];

const stats = [
  { number: '500+', label: 'Healthcare Organizations', icon: Users },
  { number: '50K+', label: 'Lives Improved', icon: Heart },
  { number: '98%', label: 'Satisfaction Rate', icon: Star },
  { number: '40%', label: 'Better Outcomes', icon: TrendingUp }
];

const certifications = [
  { name: 'HIPAA Compliant', icon: Shield },
  { name: 'ISO 27001 Certified', icon: Award },
  { name: 'SOC 2 Type II', icon: CheckCircle },
  { name: 'FDA Cleared', icon: Zap }
];

const ProfessionalLanding: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-shenations-purple-50/30">
      
      {/* Hero Section */}
      <ProfessionalHero />

      {/* Stats Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <Badge className="badge-premium text-sm px-4 py-2 mb-6">
              <TrendingUp className="w-4 h-4 mr-2" />
              Trusted Worldwide
            </Badge>
            
            <h2 className="text-3xl lg:text-5xl font-bold text-neutral-800 mb-4">
              Transforming Mental Healthcare
              <br />
              <span className="shenations-gradient-text">Across the Globe</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-shenations-purple-500 to-shenations-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                
                <div className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-2">
                  {stat.number}
                </div>
                
                <div className="text-neutral-600 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <ProfessionalFeatures />

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-shenations-purple-50/50 to-shenations-pink-50/30">
        <div className="container mx-auto px-6">
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <Badge className="badge-premium text-sm px-4 py-2 mb-6">
              <Quote className="w-4 h-4 mr-2" />
              Client Success Stories
            </Badge>
            
            <h2 className="text-4xl lg:text-6xl font-bold text-neutral-800 mb-6">
              Loved by Healthcare
              <br />
              <span className="shenations-gradient-text">Professionals</span>
            </h2>
            
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              See how leading healthcare organizations are using EduMindSolutions 
              to deliver exceptional mental health care.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="card-premium group hover:scale-105 transition-all duration-500"
              >
                {/* Rating */}
                <div className="flex items-center space-x-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-neutral-700 leading-relaxed mb-6 italic">
                  "{testimonial.content}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-shenations-purple-100 to-shenations-pink-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-shenations-purple-700">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  
                  <div>
                    <div className="font-semibold text-neutral-800">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-neutral-600">
                      {testimonial.role}
                    </div>
                    <div className="text-sm text-shenations-purple-600 font-medium">
                      {testimonial.organization}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="py-20 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-800 mb-4">
              Enterprise-Grade Security & Compliance
            </h2>
            
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              Built with the highest standards of security and compliance 
              for healthcare organizations.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {certifications.map((cert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl p-6 text-center hover:bg-white/80 transition-all duration-300 group"
              >
                <cert.icon className="w-8 h-8 text-shenations-purple-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <div className="font-semibold text-neutral-800">
                  {cert.name}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-shenations-purple-600 via-shenations-pink-600 to-shenations-indigo-600 relative overflow-hidden">
        
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float" />
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/5 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-white/5 rounded-full blur-2xl" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <h2 className="text-4xl lg:text-6xl font-bold mb-6">
              Ready to Transform
              <br />
              Your Mental Health Care?
            </h2>
            
            <p className="text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-12">
              Join thousands of healthcare professionals who trust EduMindSolutions 
              to deliver exceptional patient outcomes.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button className="bg-white text-shenations-purple-700 hover:bg-white/90 px-8 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 group">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 px-8 py-4 text-lg font-semibold rounded-xl">
                Schedule Demo
              </Button>
            </div>

            <div className="mt-12 text-white/80 text-sm">
              No credit card required • 30-day free trial • Cancel anytime
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ProfessionalLanding;
