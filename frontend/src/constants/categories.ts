// Hardcoded categories for content organization
// These replace the dynamic categories that were previously stored in the database

export interface ContentCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  parent_category?: number | null;
  order: number;
  is_active: boolean;
}

export const CONTENT_CATEGORIES: ContentCategory[] = [
  {
    id: 1,
    name: "Mental Health Basics",
    description: "Fundamental concepts and understanding of mental health",
    icon: "brain",
    color: "blue",
    parent_category: null,
    order: 1,
    is_active: true
  },
  {
    id: 2,
    name: "Anxiety & Stress",
    description: "Content related to anxiety disorders and stress management",
    icon: "zap",
    color: "orange",
    parent_category: null,
    order: 2,
    is_active: true
  },
  {
    id: 3,
    name: "Depression",
    description: "Resources and information about depression",
    icon: "sun",
    color: "yellow",
    parent_category: null,
    order: 3,
    is_active: true
  },
  {
    id: 4,
    name: "Mindfulness & Meditation",
    description: "Mindfulness practices and meditation techniques",
    icon: "leaf",
    color: "green",
    parent_category: null,
    order: 4,
    is_active: true
  },
  {
    id: 5,
    name: "Self-Care",
    description: "Self-care strategies and wellness practices",
    icon: "heart",
    color: "pink",
    parent_category: null,
    order: 5,
    is_active: true
  },
  {
    id: 6,
    name: "Relationships",
    description: "Healthy relationships and communication",
    icon: "users",
    color: "purple",
    parent_category: null,
    order: 6,
    is_active: true
  },
  {
    id: 7,
    name: "Therapy & Treatment",
    description: "Information about therapy and treatment options",
    icon: "shield",
    color: "teal",
    parent_category: null,
    order: 7,
    is_active: true
  },
  {
    id: 8,
    name: "Crisis Support",
    description: "Emergency resources and crisis intervention",
    icon: "activity",
    color: "red",
    parent_category: null,
    order: 8,
    is_active: true
  },
  {
    id: 9,
    name: "Personal Growth",
    description: "Personal development and growth resources",
    icon: "trending-up",
    color: "indigo",
    parent_category: null,
    order: 9,
    is_active: true
  },
  {
    id: 10,
    name: "Sleep & Rest",
    description: "Sleep hygiene and rest-related content",
    icon: "moon",
    color: "gray",
    parent_category: null,
    order: 10,
    is_active: true
  }
];

// Audio type options for audio content
export const AUDIO_TYPE_OPTIONS = [
  { value: 'meditation', label: 'Guided Meditation' },
  { value: 'podcast', label: 'Podcast Episode' },
  { value: 'music', label: 'Therapeutic Music' },
  { value: 'exercise', label: 'Breathing Exercise' },
  { value: 'story', label: 'Calming Story' }
];

// Resource type options for mental health resources
export const RESOURCE_TYPE_OPTIONS = [
  { value: 'therapist', label: 'Individual Therapist' },
  { value: 'clinic', label: 'Mental Health Clinic' },
  { value: 'hospital', label: 'Hospital/Emergency' },
  { value: 'support_group', label: 'Support Group' },
  { value: 'hotline', label: 'Crisis Hotline' },
  { value: 'online', label: 'Online Service' },
  { value: 'nonprofit', label: 'Non-profit Organization' }
];

// Cost level options for mental health resources
export const COST_LEVEL_OPTIONS = [
  { value: 'free', label: 'Free' },
  { value: 'low', label: 'Low Cost' },
  { value: 'moderate', label: 'Moderate Cost' },
  { value: 'high', label: 'High Cost' },
  { value: 'varies', label: 'Cost Varies' }
];

// Difficulty level options
export const DIFFICULTY_LEVEL_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
];

// Helper function to get category by ID
export const getCategoryById = (id: number): ContentCategory | undefined => {
  return CONTENT_CATEGORIES.find(category => category.id === id);
};

// Helper function to get category name by ID
export const getCategoryName = (id: number): string => {
  const category = getCategoryById(id);
  return category ? category.name : 'Unknown Category';
};

// Helper function to get active categories
export const getActiveCategories = (): ContentCategory[] => {
  return CONTENT_CATEGORIES.filter(category => category.is_active);
};
