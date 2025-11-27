import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Users, FileText, Settings, BarChart3, 
  ClipboardList, UserCheck, Shield 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface RoleBasedActionButtonsProps {
  variant?: 'default' | 'compact' | 'card';
  className?: string;
}

export const RoleBasedActionButtons: React.FC<RoleBasedActionButtonsProps> = ({
  variant = 'default',
  className = '',
}) => {
  const { user, isGuide, isAdmin } = useAuth();
  const navigate = useNavigate();

  if (!user || user.role === 'user') {
    return null; // Regular users don't see these buttons
  }

  const guideActions = [
    {
      icon: Plus,
      label: 'Request Assessment',
      description: 'Request new assessment types or modifications',
      action: () => navigate('/assessments/guide'),
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      icon: Users,
      label: 'Assign Assessment',
      description: 'Assign assessments to your clients',
      action: () => navigate('/assessments/guide'),
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      icon: ClipboardList,
      label: 'My Assignments',
      description: 'View and manage client assignments',
      action: () => navigate('/assessments/guide'),
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      icon: BarChart3,
      label: 'Assessment Stats',
      description: 'View your assessment statistics',
      action: () => navigate('/assessments/guide'),
      color: 'bg-orange-500 hover:bg-orange-600',
    },
  ];

  const adminActions = [
    {
      icon: Shield,
      label: 'Admin Dashboard',
      description: 'Manage all assessment requests and types',
      action: () => navigate('/assessments/admin'),
      color: 'bg-red-500 hover:bg-red-600',
    },
    {
      icon: FileText,
      label: 'Review Requests',
      description: 'Review and approve assessment requests',
      action: () => navigate('/assessments/admin'),
      color: 'bg-indigo-500 hover:bg-indigo-600',
    },
    {
      icon: Settings,
      label: 'Manage Types',
      description: 'Create and manage assessment types',
      action: () => navigate('/assessments/admin'),
      color: 'bg-gray-500 hover:bg-gray-600',
    },
    {
      icon: UserCheck,
      label: 'System Stats',
      description: 'View system-wide statistics',
      action: () => navigate('/assessments/admin'),
      color: 'bg-teal-500 hover:bg-teal-600',
    },
  ];

  if (variant === 'compact') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {isGuide && (
          <>
            <Button
              onClick={() => navigate('/assessments/guide')}
              size="sm"
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Plus className="h-4 w-4 mr-1" />
              Request Assessment
            </Button>
            <Button
              onClick={() => navigate('/assessments/guide')}
              size="sm"
              className="bg-green-500 hover:bg-green-600"
            >
              <Users className="h-4 w-4 mr-1" />
              Assign to Client
            </Button>
          </>
        )}
        {isAdmin && (
          <>
            <Button
              onClick={() => navigate('/assessments/admin')}
              size="sm"
              className="bg-red-500 hover:bg-red-600"
            >
              <Shield className="h-4 w-4 mr-1" />
              Admin Panel
            </Button>
            <Button
              onClick={() => navigate('/assessments/admin')}
              size="sm"
              className="bg-indigo-500 hover:bg-indigo-600"
            >
              <FileText className="h-4 w-4 mr-1" />
              Review Requests
            </Button>
          </>
        )}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`space-y-4 ${className}`}>
        {isGuide && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-lg">Guide Actions</CardTitle>
                <Badge variant="secondary">Guide</Badge>
              </div>
              <CardDescription>
                Assessment management tools for guides
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {guideActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={index}
                      onClick={action.action}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-muted"
                    >
                      <Icon className="h-6 w-6" />
                      <div className="text-center">
                        <div className="font-medium text-sm">{action.label}</div>
                        <div className="text-xs text-muted-foreground">{action.description}</div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {isAdmin && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-500" />
                <CardTitle className="text-lg">Admin Actions</CardTitle>
                <Badge variant="destructive">Admin</Badge>
              </div>
              <CardDescription>
                Administrative tools for assessment management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {adminActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={index}
                      onClick={action.action}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-muted"
                    >
                      <Icon className="h-6 w-6" />
                      <div className="text-center">
                        <div className="font-medium text-sm">{action.label}</div>
                        <div className="text-xs text-muted-foreground">{action.description}</div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Default variant - horizontal button layout
  return (
    <div className={`space-y-4 ${className}`}>
      {isGuide && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-blue-500" />
            <span className="font-medium text-sm">Guide Actions</span>
            <Badge variant="secondary" className="text-xs">Guide</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {guideActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  onClick={action.action}
                  size="sm"
                  className={`${action.color} text-white`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {action.label}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-red-500" />
            <span className="font-medium text-sm">Admin Actions</span>
            <Badge variant="destructive" className="text-xs">Admin</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {adminActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  onClick={action.action}
                  size="sm"
                  className={`${action.color} text-white`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {action.label}
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleBasedActionButtons;
