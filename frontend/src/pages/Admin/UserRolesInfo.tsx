import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, Users, BookOpen, MessageSquare, 
  BarChart3, Settings, Eye, Edit, Trash2,
  UserCheck, AlertTriangle, FileText, Video,
  Headphones, Heart, Phone
} from 'lucide-react';

const UserRolesInfo: React.FC = () => {
  const userRoles = [
    {
      role: 'admin',
      title: 'Administrator',
      description: 'Full system access with all administrative privileges',
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: Shield,
      permissions: [
        { action: 'User Management', description: 'Create, edit, delete, activate/deactivate all users', icon: Users },
        { action: 'Content Management', description: 'Full CRUD access to articles, videos, audio content', icon: BookOpen },
        { action: 'System Settings', description: 'Configure platform settings and preferences', icon: Settings },
        { action: 'Analytics & Reports', description: 'Access all system analytics and user reports', icon: BarChart3 },
        { action: 'Crisis Management', description: 'Handle crisis alerts and emergency situations', icon: AlertTriangle },
        { action: 'Community Moderation', description: 'Moderate all community content and interactions', icon: MessageSquare },
        { action: 'Resource Management', description: 'Manage mental health resources directory', icon: Heart },
      ],
      restrictions: [
        'None - Full system access'
      ]
    },
    {
      role: 'guide',
      title: 'Guide/Mentor',
      description: 'Mental health professionals who can guide users and moderate content',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: UserCheck,
      permissions: [
        { action: 'Content Creation', description: 'Create and edit educational articles, videos, audio', icon: BookOpen },
        { action: 'User Guidance', description: 'View user profiles and provide guidance', icon: Users },
        { action: 'Community Moderation', description: 'Moderate community posts and interactions', icon: MessageSquare },
        { action: 'Crisis Response', description: 'Respond to crisis alerts and provide support', icon: AlertTriangle },
        { action: 'Assessment Review', description: 'Review user assessment results', icon: FileText },
        { action: 'Resource Recommendations', description: 'Recommend mental health resources', icon: Heart },
        { action: 'Analytics Access', description: 'View analytics for guided users', icon: BarChart3 },
      ],
      restrictions: [
        'Cannot delete users',
        'Cannot access system settings',
        'Cannot view all user data (only assigned users)',
        'Cannot manage other guides or admins'
      ]
    },
    {
      role: 'user',
      title: 'Standard User',
      description: 'Platform users seeking mental health support and resources',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: Users,
      permissions: [
        { action: 'Profile Management', description: 'Edit own profile and preferences', icon: Edit },
        { action: 'Assessment Access', description: 'Take mental health assessments (PHQ-9, GAD-7, etc.)', icon: FileText },
        { action: 'Educational Content', description: 'Access articles, videos, and audio content', icon: BookOpen },
        { action: 'Community Participation', description: 'Participate in peer support discussions', icon: MessageSquare },
        { action: 'Resource Discovery', description: 'Browse mental health resources directory', icon: Heart },
        { action: 'Crisis Support', description: 'Access crisis intervention resources', icon: Phone },
        { action: 'Progress Tracking', description: 'View own progress and assessment history', icon: BarChart3 },
        { action: 'Wellness Tools', description: 'Use mood tracking and wellness features', icon: Heart },
      ],
      restrictions: [
        'Cannot access other users\' data',
        'Cannot create or edit educational content',
        'Cannot moderate community content',
        'Cannot access administrative features',
        'Cannot view system analytics'
      ]
    }
  ];

  const systemFeatures = [
    {
      category: 'Content Management',
      icon: BookOpen,
      features: [
        { name: 'Articles', admin: true, guide: true, user: false, description: 'Educational mental health articles' },
        { name: 'Videos', admin: true, guide: true, user: false, description: 'Educational video content' },
        { name: 'Audio Content', admin: true, guide: true, user: false, description: 'Podcasts, meditations, etc.' },
        { name: 'Resource Directory', admin: true, guide: true, user: false, description: 'Mental health resources database' },
      ]
    },
    {
      category: 'User Management',
      icon: Users,
      features: [
        { name: 'Create Users', admin: true, guide: false, user: false, description: 'Add new users to system' },
        { name: 'Edit Users', admin: true, guide: false, user: false, description: 'Modify user profiles and roles' },
        { name: 'Delete Users', admin: true, guide: false, user: false, description: 'Remove users from system' },
        { name: 'View All Users', admin: true, guide: false, user: false, description: 'Access complete user directory' },
      ]
    },
    {
      category: 'Assessment Tools',
      icon: FileText,
      features: [
        { name: 'PHQ-9 Depression', admin: true, guide: true, user: true, description: 'Depression screening tool' },
        { name: 'GAD-7 Anxiety', admin: true, guide: true, user: true, description: 'Anxiety assessment' },
        { name: 'PCL-5 PTSD', admin: true, guide: true, user: true, description: 'PTSD screening' },
        { name: 'Custom Assessments', admin: true, guide: true, user: false, description: 'Create custom assessment tools' },
      ]
    },
    {
      category: 'Community Features',
      icon: MessageSquare,
      features: [
        { name: 'Peer Support Groups', admin: true, guide: true, user: true, description: 'Participate in support groups' },
        { name: 'Content Moderation', admin: true, guide: true, user: false, description: 'Moderate community posts' },
        { name: 'Crisis Alerts', admin: true, guide: true, user: false, description: 'Handle emergency situations' },
        { name: 'Anonymous Mode', admin: true, guide: true, user: true, description: 'Anonymous participation option' },
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 pt-16 sm:pt-20 md:pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8 mt-4 sm:mt-6 md:mt-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">User Roles & Permissions</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Comprehensive overview of user roles and system capabilities in EduMindSolutions
          </p>
        </div>

        {/* User Roles Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {userRoles.map((role, index) => (
            <Card key={index} className={`border-2 ${role.color.split(' ')[2]}`}>
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-lg ${role.color} flex items-center justify-center`}>
                    <role.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{role.title}</CardTitle>
                    <Badge className={role.color}>{role.role.toUpperCase()}</Badge>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{role.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2">✓ Permissions</h4>
                    <div className="space-y-2">
                      {role.permissions.map((permission, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <permission.icon className="w-4 h-4 mt-0.5 text-green-600 flex-shrink-0" />
                          <div>
                            <span className="font-medium text-sm">{permission.action}</span>
                            <p className="text-xs text-gray-600">{permission.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-red-700 mb-2">✗ Restrictions</h4>
                    <div className="space-y-1">
                      {role.restrictions.map((restriction, idx) => (
                        <p key={idx} className="text-xs text-red-600">• {restriction}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* System Features Matrix */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>System Features Access Matrix</CardTitle>
            <p className="text-gray-600">Feature access by user role</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {systemFeatures.map((category, categoryIdx) => (
                <div key={categoryIdx}>
                  <div className="flex items-center gap-2 mb-3">
                    <category.icon className="w-5 h-5 text-healthcare-primary" />
                    <h3 className="text-lg font-semibold">{category.category}</h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-3">Feature</th>
                          <th className="text-center py-2 px-3">Admin</th>
                          <th className="text-center py-2 px-3">Guide</th>
                          <th className="text-center py-2 px-3">User</th>
                          <th className="text-left py-2 px-3">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {category.features.map((feature, featureIdx) => (
                          <tr key={featureIdx} className="border-b">
                            <td className="py-2 px-3 font-medium">{feature.name}</td>
                            <td className="text-center py-2 px-3">
                              {feature.admin ? (
                                <Badge className="bg-green-100 text-green-800">✓</Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800">✗</Badge>
                              )}
                            </td>
                            <td className="text-center py-2 px-3">
                              {feature.guide ? (
                                <Badge className="bg-green-100 text-green-800">✓</Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800">✗</Badge>
                              )}
                            </td>
                            <td className="text-center py-2 px-3">
                              {feature.user ? (
                                <Badge className="bg-green-100 text-green-800">✓</Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800">✗</Badge>
                              )}
                            </td>
                            <td className="py-2 px-3 text-gray-600">{feature.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">For Administrators</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Create test users using the management command</li>
                  <li>• Set up initial content and resources</li>
                  <li>• Configure system settings and preferences</li>
                  <li>• Monitor user activity and system health</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">For Guides</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Create educational content for users</li>
                  <li>• Monitor assigned users and their progress</li>
                  <li>• Respond to crisis alerts promptly</li>
                  <li>• Moderate community interactions</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default UserRolesInfo;
