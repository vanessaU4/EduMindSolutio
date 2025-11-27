import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Shield, 
  BarChart3, 
  Users, 
  Clock, 
  Heart,
  Stethoscope,
  FileText,
  MessageSquare,
  Target,
  Award,
  Zap
} from 'lucide-react';

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  gradient: string;
  stats?: string;
}

const features: Feature[] = [
  {
    icon: Brain,
    title: 'Evidence-Based Assessments',
    description: 'Clinically validated screening tools including PHQ-9, GAD-7, and PCL-5 for comprehensive mental health evaluation.',
    gradient: 'from-shenations-purple-500 to-shenations-indigo-500',
    stats: '15+ Validated Tools'
  },
  {
    icon: Shield,
    title: 'Crisis Intervention',
    description: 'Real-time risk assessment with automated alerts and immediate intervention protocols for patient safety.',
    gradient: 'from-red-500 to-orange-500',
    stats: '24/7 Monitoring'
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Comprehensive reporting and trend analysis with predictive insights for better treatment outcomes.',
    gradient: 'from-shenations-pink-500 to-purple-500',
    stats: '50+ Report Types'
  },
  {
    icon: Users,
    title: 'Care Coordination',
    description: 'Seamless collaboration between patients, providers, and care teams with integrated communication tools.',
    gradient: 'from-blue-500 to-cyan-500',
    stats: '98% Team Satisfaction'
  },
  {
    icon: Stethoscope,
    title: 'Clinical Integration',
    description: 'Native EHR integration with major healthcare systems for streamlined workflow and documentation.',
    gradient: 'from-green-500 to-emerald-500',
    stats: 'Epic, Cerner Compatible'
  },
  {
    icon: Target,
    title: 'Personalized Care',
    description: 'Evidence-based treatment recommendations and personalized care plans based on individual patient profiles.',
    gradient: 'from-shenations-indigo-500 to-blue-500',
    stats: '85% Better Outcomes'
  }
];

const ProfessionalFeatures: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="py-24 bg-gradient-to-br from-neutral-50 to-shenations-purple-50/30">
      <div className="container mx-auto px-6">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center space-x-2 bg-shenations-purple-100 text-shenations-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            <span>Professional Features</span>
          </div>
          
          <h2 className="text-4xl lg:text-6xl font-bold text-neutral-800 mb-6">
            Everything You Need for
            <br />
            <span className="shenations-gradient-text">Professional Care</span>
          </h2>
          
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
            Comprehensive mental health platform designed by clinicians, for clinicians. 
            Streamline your workflow while delivering exceptional patient care.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group"
            >
              <div className="card-premium h-full hover:scale-105 transition-all duration-500">
                {/* Icon */}
                <div className="relative mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  {/* Floating Badge */}
                  {feature.stats && (
                    <div className="absolute -top-2 -right-2 bg-white border-2 border-shenations-purple-200 text-shenations-purple-700 text-xs font-semibold px-2 py-1 rounded-full shadow-md">
                      {feature.stats}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-neutral-800 group-hover:text-shenations-purple-700 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-neutral-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-shenations-purple-500/5 via-transparent to-shenations-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20 text-center"
        >
          <div className="card-premium max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              
              {/* Left Side - Content */}
              <div className="space-y-6 text-left">
                <div className="flex items-center space-x-3">
                  <Award className="w-8 h-8 text-shenations-purple-600" />
                  <h3 className="text-2xl font-bold text-neutral-800">
                    Trusted by Healthcare Leaders
                  </h3>
                </div>
                
                <p className="text-neutral-600 leading-relaxed">
                  Join over 500+ healthcare organizations already using our platform to 
                  deliver better mental health outcomes for their patients.
                </p>

                <div className="flex items-center space-x-8">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-shenations-purple-700">500+</div>
                    <div className="text-sm text-neutral-600">Healthcare Orgs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-shenations-purple-700">50K+</div>
                    <div className="text-sm text-neutral-600">Patients Served</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-shenations-purple-700">98%</div>
                    <div className="text-sm text-neutral-600">Satisfaction Rate</div>
                  </div>
                </div>
              </div>

              {/* Right Side - Visual */}
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Heart, color: 'text-red-500', label: 'Patient Care' },
                    { icon: FileText, color: 'text-blue-500', label: 'Documentation' },
                    { icon: MessageSquare, color: 'text-green-500', label: 'Communication' },
                    { icon: Clock, color: 'text-purple-500', label: 'Efficiency' }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                      className="bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl p-4 text-center hover:bg-white/80 transition-all duration-300"
                    >
                      <item.icon className={`w-8 h-8 ${item.color} mx-auto mb-2`} />
                      <div className="text-sm font-medium text-neutral-700">{item.label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProfessionalFeatures;
