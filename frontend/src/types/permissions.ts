export type UserRole = 'user' | 'guide' | 'admin';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  is_staff?: boolean;
  profile?: {
    name?: string;
    title?: string;
    credentials?: string;
    license_number?: string;
    specializations?: string[];
    years_experience?: number;
    avatar?: string;
  };
  preferences?: {
    anonymity_enabled?: boolean;
    peer_matching_enabled?: boolean;
    notifications?: Record<string, boolean>;
  };
}

export interface Permission {
  action: string;
  resource: string;
  conditions?: Record<string, any>;
}

export interface Capability {
  name: string;
  description: string;
  permissions: Permission[];
  roles: UserRole[];
}

// Define base capabilities first
const BASE_USER_CAPABILITIES = [
  // Self-Assessment & Monitoring
  'take_assessments',
  'view_own_assessment_history',
  'track_assessment_progress',
  'complete_assigned_assessments',
  'receive_recommendations',
  
  // Mood & Wellness Tracking
  'log_mood_entries',
  'track_activities',
  'complete_wellness_challenges',
  'earn_achievements',
  'view_wellness_progress',
  'receive_wellness_tips',
  
  // Community Participation
  'create_forum_posts',
  'comment_on_posts',
  'like_posts_comments',
  'view_forum_content',
  'report_content',
  'request_peer_support',
  'participate_chat_rooms',
  'send_chat_messages',
  
  // Educational Content
  'browse_articles',
  'watch_videos',
  'listen_audio_content',
  'bookmark_content',
  'track_content_engagement',
  'search_resources',
  'filter_resources',
  
  // Crisis Support
  'access_crisis_hotlines',
  'view_crisis_resources',
  'create_safety_plan',
  'trigger_crisis_alerts',
  'access_grounding_techniques',
  
  // Profile & Privacy
  'update_profile',
  'control_anonymity',
  'set_peer_preferences',
  'manage_notifications',
  'add_crisis_contact',
  'complete_onboarding'
];

const GUIDE_ADDITIONAL_CAPABILITIES = [
  // Client Assessment Management
  'assign_assessments',
  'set_assessment_due_dates',
  'track_client_progress',
  'view_client_results',
  'add_assessment_notes',
  'send_assessment_reminders',
  
  // Assessment System Management
  'request_new_assessments',
  'request_assessment_modifications',
  'propose_assessment_questions',
  'suggest_scoring_changes',
  'provide_change_justification',
  'track_assessment_requests',
  
  // Professional Profile
  'display_credentials',
  'add_license_info',
  'list_specializations',
  'specify_experience',
  'show_professional_profile',
  
  // Community Moderation
  'moderate_forum_posts',
  'moderate_comments',
  'pin_posts',
  'lock_threads',
  'approve_reject_content',
  'moderate_chat_rooms',
  'access_moderation_reports',
  'add_moderator_notes',
  'take_moderation_action',
  
  // Crisis Response
  'view_crisis_alerts',
  'respond_to_crisis',
  'acknowledge_crisis',
  'add_crisis_notes',
  'resolve_crisis_alerts',
  'set_followup_requirements',
  'monitor_high_risk_users'
];

const ADMIN_ADDITIONAL_CAPABILITIES = [
  // User Management
  'create_user_accounts',
  'manage_user_accounts',
  'assign_user_roles',
  'activate_deactivate_users',
  'view_all_user_profiles',
  'access_user_activity',
  'review_user_assessments',
  'review_safety_plans',
  
  // Assessment Administration
  'create_assessment_types',
  'define_assessment_questions',
  'set_scoring_criteria',
  'approve_assessment_requests',
  'modify_assessments',
  'activate_deactivate_assessments',
  'create_assessment_recommendations',
  
  // Content Management
  'create_publish_articles',
  'create_content_categories',
  'upload_manage_videos',
  'upload_manage_audio',
  'feature_homepage_content',
  'set_content_difficulty',
  'manage_tags_metadata',
  'add_verify_resources',
  'update_resource_info',
  
  // Community Administration
  'create_manage_forum_categories',
  'set_category_properties',
  'create_manage_chat_rooms',
  'assign_chat_moderators',
  'set_chat_limits',
  'review_all_reports',
  'take_final_moderation_action',
  'ban_users',
  
  // Crisis Management
  'add_manage_crisis_hotlines',
  'set_hotline_priority',
  'create_crisis_resources',
  'target_crisis_resources',
  'view_all_crisis_alerts',
  'assign_crisis_response',
  'monitor_crisis_resolution',
  
  // Wellness & Gamification
  'create_achievements',
  'design_daily_challenges',
  'set_challenge_points',
  'create_wellness_tips',
  'target_wellness_content',
  'adjust_leveling_system',
  
  // System Configuration
  'configure_notifications',
  'set_platform_policies',
  'manage_api_integrations',
  'access_analytics_reporting',
  'export_data',
  'configure_privacy_settings'
];

// Core capabilities by role - now properly constructed without circular references
export const USER_CAPABILITIES: Record<UserRole, string[]> = {
  user: BASE_USER_CAPABILITIES,
  guide: [...BASE_USER_CAPABILITIES, ...GUIDE_ADDITIONAL_CAPABILITIES],
  admin: [...BASE_USER_CAPABILITIES, ...GUIDE_ADDITIONAL_CAPABILITIES, ...ADMIN_ADDITIONAL_CAPABILITIES]
};

// Permission definitions
export const PERMISSIONS: Record<string, Permission> = {
  // Assessment permissions
  take_assessments: {
    action: 'take',
    resource: 'assessment'
  },
  assign_assessments: {
    action: 'assign',
    resource: 'assessment',
    conditions: { target_role: 'user' }
  },
  create_assessment_types: {
    action: 'create',
    resource: 'assessment_type'
  },
  
  // Forum permissions
  create_forum_posts: {
    action: 'create',
    resource: 'forum_post'
  },
  moderate_forum_posts: {
    action: 'moderate',
    resource: 'forum_post'
  },
  
  // User management permissions
  manage_user_accounts: {
    action: 'manage',
    resource: 'user_account'
  },
  
  // Crisis permissions
  trigger_crisis_alerts: {
    action: 'trigger',
    resource: 'crisis_alert'
  },
  respond_to_crisis: {
    action: 'respond',
    resource: 'crisis_alert'
  },
  
  // Content permissions
  create_publish_articles: {
    action: 'create',
    resource: 'article'
  }
};

// Helper functions
export const hasCapability = (user: any | null, capability: string): boolean => {
  if (!user) return false;
  
  const userCapabilities = USER_CAPABILITIES[user.role] || [];
  return userCapabilities.includes(capability);
};

export const hasAnyCapability = (user: any | null, capabilities: string[]): boolean => {
  if (!user) return false;
  
  return capabilities.some(capability => hasCapability(user, capability));
};

export const hasAllCapabilities = (user: any | null, capabilities: string[]): boolean => {
  if (!user) return false;
  
  return capabilities.every(capability => hasCapability(user, capability));
};

export const canAccessRoute = (user: any | null, requiredCapabilities: string[]): boolean => {
  if (!user) return false;
  
  return hasAnyCapability(user, requiredCapabilities);
};

export const isAdmin = (user: any | null): boolean => {
  return user?.role === 'admin' || user?.is_staff === true;
};

export const isGuide = (user: any | null): boolean => {
  return user?.role === 'guide' || isAdmin(user);
};

export const isUser = (user: any | null): boolean => {
  return user?.role === 'user';
};

// Role hierarchy check
export const hasRoleOrHigher = (user: any | null, requiredRole: UserRole): boolean => {
  if (!user) return false;
  
  const roleHierarchy: Record<UserRole, number> = {
    user: 1,
    guide: 2,
    admin: 3
  };
  
  const userLevel = roleHierarchy[user.role] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;
  
  return userLevel >= requiredLevel;
};
