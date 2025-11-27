import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Phone, Mail, MapPin, Lock, Eye, FileText } from 'lucide-react';

const HealthcareFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Mental Health Support',
      links: [
        { name: 'Crisis Resources', href: '/crisis', icon: Phone },
        { name: 'Assessment Center', href: '/assessments', icon: Shield },
        { name: 'Community Support', href: '/community', icon: Heart },
        { name: 'Wellness Tools', href: '/wellness', icon: Heart },
      ],
    },
    {
      title: 'Resources',
      links: [
        { name: 'Educational Content', href: '/education', icon: FileText },
        { name: 'Resource Directory', href: '/resources', icon: MapPin },
        { name: 'Safety Planning', href: '/safety-plan', icon: Shield },
        { name: 'Professional Help', href: '/resources?type=professional', icon: Phone },
      ],
    },
    {
      title: 'Legal & Compliance',
      links: [
        { name: 'Privacy Policy', href: '/privacy-policy', icon: Eye },
        { name: 'Terms of Service', href: '/terms-of-service', icon: FileText },
        { name: 'Medical Disclaimer', href: '/medical-disclaimer', icon: Shield },
        { name: 'HIPAA Compliance', href: '/hipaa-compliance', icon: Lock },
      ],
    },
    {
      title: 'Contact & Support',
      links: [
        { name: 'Contact Us', href: '/contact', icon: Mail },
        { name: 'Technical Support', href: '/support', icon: Phone },
        { name: 'Accessibility', href: '/accessibility', icon: Eye },
        { name: 'Report Issue', href: '/report', icon: Shield },
      ],
    },
  ];

  const emergencyContacts = [
    { name: 'National Suicide Prevention Lifeline', number: '988' },
    { name: 'Crisis Text Line', number: 'Text HOME to 741741' },
    { name: 'Emergency Services', number: '911' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Emergency Banner */}
      <div className="bg-red-600 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-4 text-center">
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Crisis Support:</span>
            </div>
            {emergencyContacts.map((contact, index) => (
              <div key={index} className="flex items-center">
                <span className="text-sm">
                  {contact.name}: <strong>{contact.number}</strong>
                </span>
                {index < emergencyContacts.length - 1 && (
                  <span className="mx-2 text-red-300">|</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      to={link.href}
                      className="flex items-center text-gray-300 hover:text-white transition-colors"
                    >
                      <link.icon className="w-4 h-4 mr-2" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Platform Information */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Brand and Mission */}
            <div>
              <div className="flex items-center mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg mr-3">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">EduMindSolutions</h3>
                  <p className="text-sm text-gray-400">Mental Health Platform for Youth</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                EduMindSolutions is a comprehensive mental health platform designed specifically 
                for youth aged 13-23. We provide evidence-based assessments, peer support, 
                educational resources, and crisis intervention services in a safe, 
                HIPAA-compliant environment.
              </p>
            </div>

            {/* Compliance and Certifications */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Healthcare Compliance</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Lock className="w-5 h-5 mr-3 text-green-400" />
                  <div>
                    <p className="font-medium">HIPAA Compliant</p>
                    <p className="text-sm text-gray-400">Health Insurance Portability and Accountability Act</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Shield className="w-5 h-5 mr-3 text-blue-400" />
                  <div>
                    <p className="font-medium">WCAG 2.1 AA Accessible</p>
                    <p className="text-sm text-gray-400">Web Content Accessibility Guidelines</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Eye className="w-5 h-5 mr-3 text-purple-400" />
                  <div>
                    <p className="font-medium">Privacy by Design</p>
                    <p className="text-sm text-gray-400">Built with user privacy as a core principle</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright and Legal */}
        <div className="mt-8 pt-8 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-center">
          <div className="text-sm text-gray-400">
            <p>&copy; {currentYear} EduMindSolutions. All rights reserved.</p>
            <p className="mt-1">
              Developed for the Ministry of Health - Mental Health Initiative
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-6 text-sm text-gray-400">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link to="/terms-of-service" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link to="/accessibility" className="hover:text-white transition-colors">
              Accessibility
            </Link>
            <Link to="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default HealthcareFooter;
