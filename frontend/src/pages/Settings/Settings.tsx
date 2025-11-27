import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Settings as SettingsIcon, User as UserIcon, Bell, Shield, Palette, 
  Globe, Heart, Phone, Mail, Lock, Eye, EyeOff,
  Save, AlertTriangle, CheckCircle, Smartphone
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { userService, User } from '@/services/userService';

interface UserSettings {
  // Profile Settings
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  age: number;
  gender: string;
  
  // Privacy Settings
  isAnonymousPreferred: boolean;
  allowPeerMatching: boolean;
  profileVisibility: 'public' | 'private' | 'friends';
  
  // Notification Settings
  emailNotifications: boolean;
  pushNotifications: boolean;
  crisisAlerts: boolean;
  communityUpdates: boolean;
  assessmentReminders: boolean;
  
  // Accessibility Settings
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  
  // Crisis Settings
  crisisContactPhone: string;
  emergencyContact: string;
  safetyPlanEnabled: boolean;
}

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [settings, setSettings] = useState<UserSettings>({
    firstName: user?.first_name || '',
    lastName: user?.last_name || '',
    email: user?.email || '',
    phone: '',
    bio: '',
    age: 18,
    gender: '',
    isAnonymousPreferred: true,
    allowPeerMatching: true,
    profileVisibility: 'private',
    emailNotifications: true,
    pushNotifications: true,
    crisisAlerts: true,
    communityUpdates: false,
    assessmentReminders: true,
    fontSize: 'medium',
    highContrast: false,
    reducedMotion: false,
    screenReader: false,
    crisisContactPhone: '',
    emergencyContact: '',
    safetyPlanEnabled: false,
  });

  useEffect(() => {
    // Load user settings from API
    if (user) {
      loadUserSettings();
    }
  }, [user]);

  const loadUserSettings = async () => {
    try {
      setLoading(true);
      console.log('Loading user settings from API...');
      
      // Load current user profile from API
      const currentUser = await userService.getCurrentUser();
      console.log('Loaded user data:', currentUser);
      
      // Map API response to settings state
      setSettings({
        firstName: currentUser.first_name || '',
        lastName: currentUser.last_name || '',
        email: currentUser.email || '',
        phone: '', // Not in current API response
        bio: currentUser.bio || '',
        age: currentUser.age || 18,
        gender: currentUser.gender || '',
        isAnonymousPreferred: currentUser.is_anonymous_preferred ?? true,
        allowPeerMatching: currentUser.allow_peer_matching ?? true,
        profileVisibility: 'private', // Default since not in API
        emailNotifications: currentUser.notification_preferences?.email ?? true,
        pushNotifications: currentUser.notification_preferences?.push ?? true,
        crisisAlerts: currentUser.notification_preferences?.crisis ?? true,
        communityUpdates: currentUser.notification_preferences?.community ?? false,
        assessmentReminders: currentUser.notification_preferences?.assessments ?? true,
        fontSize: 'medium',
        highContrast: false,
        reducedMotion: false,
        screenReader: false,
        crisisContactPhone: currentUser.crisis_contact_phone || '',
        emergencyContact: '', // Not in current API
        safetyPlanEnabled: false, // Default since not in API
      });
      
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your settings. Using defaults.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      console.log('Saving settings to API...', settings);
      
      // Prepare data for API update
      const updateData = {
        first_name: settings.firstName,
        last_name: settings.lastName,
        age: settings.age,
        gender: settings.gender,
        bio: settings.bio,
        is_anonymous_preferred: settings.isAnonymousPreferred,
        allow_peer_matching: settings.allowPeerMatching,
        crisis_contact_phone: settings.crisisContactPhone,
        notification_preferences: {
          email: settings.emailNotifications,
          push: settings.pushNotifications,
          crisis: settings.crisisAlerts,
          community: settings.communityUpdates,
          assessments: settings.assessmentReminders,
        }
      };
      
      // Save to API using userService
      await userService.updateProfile(updateData);
      console.log('Settings saved successfully');
      
      toast({
        title: 'Settings Saved',
        description: 'Your settings have been updated successfully.',
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePasswordChange = async () => {
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast({
          title: 'Error',
          description: 'New passwords do not match.',
          variant: 'destructive',
        });
        return;
      }

      if (passwordData.newPassword.length < 8) {
        toast({
          title: 'Error',
          description: 'Password must be at least 8 characters long.',
          variant: 'destructive',
        });
        return;
      }

      setLoading(true);
      console.log('Changing password...');
      
      // Note: This would require a password change endpoint in userService
      // For now, we'll show a message that this feature needs backend implementation
      toast({
        title: 'Feature Coming Soon',
        description: 'Password change functionality will be available once the backend endpoint is implemented.',
        variant: 'default',
      });

      // Reset password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

    } catch (error) {
      console.error('Failed to change password:', error);
      toast({
        title: 'Error',
        description: 'Failed to change password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !settings.firstName && !settings.lastName) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-healthcare-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <SettingsIcon className="w-8 h-8 text-healthcare-primary" />
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Manage your account and platform preferences</p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="accessibility" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Accessibility
            </TabsTrigger>
            <TabsTrigger value="crisis" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Crisis Support
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={settings.firstName}
                      onChange={(e) => handleSettingChange('firstName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={settings.lastName}
                      onChange={(e) => handleSettingChange('lastName', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleSettingChange('email', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => handleSettingChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      min="13"
                      max="23"
                      value={settings.age}
                      onChange={(e) => handleSettingChange('age', parseInt(e.target.value))}
                    />
                    <p className="text-xs text-gray-500 mt-1">Ages 13-23 supported</p>
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={settings.gender}
                      onValueChange={(value) => handleSettingChange('gender', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="non_binary">Non-binary</SelectItem>
                        <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={settings.bio}
                    onChange={(e) => handleSettingChange('bio', e.target.value)}
                    placeholder="Tell us a bit about yourself..."
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">{settings.bio.length}/500 characters</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter current password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({...prev, currentPassword: e.target.value}))}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({...prev, newPassword: e.target.value}))}
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({...prev, confirmPassword: e.target.value}))}
                  />
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handlePasswordChange}
                  disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Update Password
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Anonymous Interactions</Label>
                    <p className="text-sm text-gray-500">
                      Prefer anonymous interactions in community features
                    </p>
                  </div>
                  <Switch
                    checked={settings.isAnonymousPreferred}
                    onCheckedChange={(checked) => handleSettingChange('isAnonymousPreferred', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Peer Matching</Label>
                    <p className="text-sm text-gray-500">
                      Allow matching with peers for support
                    </p>
                  </div>
                  <Switch
                    checked={settings.allowPeerMatching}
                    onCheckedChange={(checked) => handleSettingChange('allowPeerMatching', checked)}
                  />
                </div>

                <Separator />

                <div>
                  <Label>Profile Visibility</Label>
                  <Select
                    value={settings.profileVisibility}
                    onValueChange={(value: 'public' | 'private' | 'friends') => 
                      handleSettingChange('profileVisibility', value)
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public - Anyone can see your profile</SelectItem>
                      <SelectItem value="friends">Friends Only - Only connected peers</SelectItem>
                      <SelectItem value="private">Private - Only you can see your profile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data & Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-900">HIPAA Compliant</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Your health information is protected under HIPAA regulations and encrypted at rest and in transit.
                  </p>
                </div>
                <Button variant="outline" className="w-full">
                  Download My Data
                </Button>
                <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Delete My Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Notifications
                    </Label>
                    <p className="text-sm text-gray-500">
                      Receive important updates via email
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      Push Notifications
                    </Label>
                    <p className="text-sm text-gray-500">
                      Receive notifications on your device
                    </p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      Crisis Alerts
                    </Label>
                    <p className="text-sm text-gray-500">
                      Emergency notifications and crisis support
                    </p>
                  </div>
                  <Switch
                    checked={settings.crisisAlerts}
                    onCheckedChange={(checked) => handleSettingChange('crisisAlerts', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Community Updates</Label>
                    <p className="text-sm text-gray-500">
                      New posts, replies, and community activity
                    </p>
                  </div>
                  <Switch
                    checked={settings.communityUpdates}
                    onCheckedChange={(checked) => handleSettingChange('communityUpdates', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Assessment Reminders</Label>
                    <p className="text-sm text-gray-500">
                      Gentle reminders for mental health check-ins
                    </p>
                  </div>
                  <Switch
                    checked={settings.assessmentReminders}
                    onCheckedChange={(checked) => handleSettingChange('assessmentReminders', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Accessibility Settings */}
          <TabsContent value="accessibility" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Accessibility Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Font Size</Label>
                  <Select
                    value={settings.fontSize}
                    onValueChange={(value: 'small' | 'medium' | 'large') => 
                      handleSettingChange('fontSize', value)
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium (Default)</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>High Contrast Mode</Label>
                    <p className="text-sm text-gray-500">
                      Increase contrast for better visibility
                    </p>
                  </div>
                  <Switch
                    checked={settings.highContrast}
                    onCheckedChange={(checked) => handleSettingChange('highContrast', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Reduced Motion</Label>
                    <p className="text-sm text-gray-500">
                      Minimize animations and transitions
                    </p>
                  </div>
                  <Switch
                    checked={settings.reducedMotion}
                    onCheckedChange={(checked) => handleSettingChange('reducedMotion', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Screen Reader Support</Label>
                    <p className="text-sm text-gray-500">
                      Enhanced compatibility with screen readers
                    </p>
                  </div>
                  <Switch
                    checked={settings.screenReader}
                    onCheckedChange={(checked) => handleSettingChange('screenReader', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Crisis Support Settings */}
          <TabsContent value="crisis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  Crisis Support Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="font-medium text-red-900">Emergency Information</span>
                  </div>
                  <p className="text-sm text-red-700">
                    This information helps us provide better crisis support. All information is kept confidential.
                  </p>
                </div>

                <div>
                  <Label htmlFor="crisisContactPhone">Crisis Contact Phone</Label>
                  <Input
                    id="crisisContactPhone"
                    type="tel"
                    value={settings.crisisContactPhone}
                    onChange={(e) => handleSettingChange('crisisContactPhone', e.target.value)}
                    placeholder="Emergency contact number"
                  />
                  <p className="text-xs text-gray-500 mt-1">Optional - for crisis intervention use only</p>
                </div>

                <div>
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    value={settings.emergencyContact}
                    onChange={(e) => handleSettingChange('emergencyContact', e.target.value)}
                    placeholder="Name and relationship (e.g., Mom - Jane Smith)"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Safety Plan Enabled</Label>
                    <p className="text-sm text-gray-500">
                      Enable personalized safety planning tools
                    </p>
                  </div>
                  <Switch
                    checked={settings.safetyPlanEnabled}
                    onCheckedChange={(checked) => handleSettingChange('safetyPlanEnabled', checked)}
                  />
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Crisis Resources</h4>
                  <div className="space-y-2 text-sm text-blue-700">
                    <p><strong>National Suicide Prevention Lifeline:</strong> 988</p>
                    <p><strong>Crisis Text Line:</strong> Text HOME to 741741</p>
                    <p><strong>Emergency Services:</strong> 911</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end pt-6">
          <Button 
            onClick={handleSaveSettings} 
            disabled={loading}
            className="bg-healthcare-primary hover:bg-blue-700"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;