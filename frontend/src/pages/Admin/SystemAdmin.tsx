import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Settings, Users, FileText, MessageSquare, 
  ClipboardList, Shield, BarChart3, ArrowRight 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const SystemAdmin: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const adminSections = [
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
      path: '/admin/users',
    },
    {
      title: 'Content Management',
      description: 'Manage articles, videos, and resources',
      icon: FileText,
      color: 'bg-purple-100 text-purple-600',
      path: '/admin/content',
    },
    {
      title: 'Community Management',
      description: 'Moderate forums and community posts',
      icon: MessageSquare,
      color: 'bg-green-100 text-green-600',
      path: '/admin/community',
    },
    {
      title: 'Assessment Management',
      description: 'Configure assessments and view results',
      icon: ClipboardList,
      color: 'bg-orange-100 text-orange-600',
      path: '/admin/assessments',
    },
    {
      title: 'Compliance Reports',
      description: 'View audit logs and compliance data',
      icon: Shield,
      color: 'bg-red-100 text-red-600',
      path: '/admin/compliance',
    },
    {
      title: 'System Analytics',
      description: 'Platform metrics and insights',
      icon: BarChart3,
      color: 'bg-indigo-100 text-indigo-600',
      path: '/admin/analytics',
    },
  ];

  const stats = [
    { label: 'Total Users', value: '0', icon: Users },
    { label: 'Active Content', value: '0', icon: FileText },
    { label: 'Community Posts', value: '0', icon: MessageSquare },
    { label: 'Assessments Taken', value: '0', icon: ClipboardList },
  ];

  return (
<div className="container mx-auto px-8 py-12">
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Card className="my-8 mx-4">
      <CardHeader>
        <CardTitle>Administration Sections</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section, index) => (
            <div
              key={index}
              className="flex flex-col p-8 border rounded-xl hover:shadow-lg cursor-pointer transition-all"
              onClick={() => navigate(section.path)}
            >
              <div className={`w-12 h-12 rounded-lg ${section.color} flex items-center justify-center mb-4`}>
                <section.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{section.title}</h3>
              <p className="text-sm text-gray-600 mb-4 flex-1">{section.description}</p>
              <div className="flex items-center text-healthcare-primary text-sm font-medium">
                Manage
                <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </motion.div>
</div>

  );
};

export default SystemAdmin;