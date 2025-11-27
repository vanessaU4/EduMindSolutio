import apiClient from './apiClient';

// Content types

export interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  featured_image?: string | null;
  estimated_read_time: number;
  is_published: boolean;
  is_featured: boolean;
  view_count: number;
  like_count: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
  author?: number;
}

export interface ArticleFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string[];
  difficulty_level: string;
  featured_image: File | null;
  estimated_read_time: number;
  is_published: boolean;
  is_featured: boolean;
}

export interface VideoFormData {
  title: string;
  description: string;
  video_url: string;
  thumbnail_image: File | null;
  duration_seconds: number;
  tags: string[];
  difficulty_level: string;
  is_published: boolean;
  is_featured: boolean;
}

export interface AudioFormData {
  title: string;
  description: string;
  audio_type: string;
  audio_file: File | null;
  audio_url: string;
  duration_seconds: number;
  tags: string[];
  thumbnail_image: File | null;
  is_published: boolean;
}

export interface ResourceFormData {
  name: string;
  description: string;
  resource_type: string;
  phone_number: string;
  email: string;
  website: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  cost_level: string;
  is_24_7: boolean;
  accepts_walk_ins: boolean;
}


export interface Video {
  id: number;
  title: string;
  description: string;
  video_url: string;
  thumbnail_image?: string | null;
  duration_seconds: number;
  tags: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  author: number;
  view_count: number;
  like_count: number;
  is_published: boolean;
  is_featured: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AudioContent {
  id: number;
  title: string;
  description: string;
  audio_type: 'meditation' | 'podcast' | 'music' | 'exercise' | 'story';
  audio_file?: string | null;
  audio_url: string;
  duration_seconds: number;
  tags: string[];
  author: number;
  thumbnail_image?: string | null;
  play_count: number;
  like_count: number;
  is_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface MentalHealthResource {
  id: number;
  name: string;
  description: string;
  resource_type: 'therapist' | 'clinic' | 'hospital' | 'support_group' | 'hotline' | 'online' | 'nonprofit';
  phone_number: string;
  email: string;
  website: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  latitude?: number;
  longitude?: number;
  services_offered: string[];
  specializations: string[];
  age_groups_served: string[];
  languages: string[];
  hours_of_operation: any;
  is_24_7: boolean;
  accepts_walk_ins: boolean;
  cost_level: 'free' | 'low' | 'moderate' | 'high' | 'varies';
  insurance_accepted: string[];
  is_verified: boolean;
  rating?: number;
  created_at: string;
  updated_at: string;
}

export interface ContentStats {
  articles: {
    total: number;
    featured: number;
  };
  videos: {
    total: number;
    featured: number;
  };
  audio: {
    total: number;
    meditations: number;
  };
  resources: {
    total: number;
    crisis_hotlines: number;
  };
}

export interface BulkActionRequest {
  action: 'publish' | 'unpublish' | 'delete';
  content_type: 'article' | 'video' | 'audio';
  content_ids: number[];
  hard_delete?: boolean;
}

export interface SearchRequest {
  q: string;
  type?: 'all' | 'article' | 'video' | 'audio';
  author?: string;
  published_only?: boolean;
}

// Paginated response interface for Django REST Framework
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Utility function to extract array from paginated or non-paginated response
export function extractArrayFromResponse<T>(response: T[] | PaginatedResponse<T>): T[] {
  return Array.isArray(response) ? response : response.results || [];
}

class ContentService {

  async getArticles(): Promise<Article[] | PaginatedResponse<Article>> {
    return apiClient.get<Article[] | PaginatedResponse<Article>>("/content/articles/");
  }

  async getVideos(): Promise<Video[] | PaginatedResponse<Video>> {
    return apiClient.get<Video[] | PaginatedResponse<Video>>("/content/videos/");
  }

  async getAudioContent(): Promise<AudioContent[] | PaginatedResponse<AudioContent>> {
    return apiClient.get<AudioContent[] | PaginatedResponse<AudioContent>>("/content/audio/");
  }

  async getResources(): Promise<MentalHealthResource[] | PaginatedResponse<MentalHealthResource>> {
    return apiClient.get<MentalHealthResource[] | PaginatedResponse<MentalHealthResource>>("/content/resources/");
  }

  async getContentStats(): Promise<ContentStats> {
    return apiClient.get<ContentStats>("/content/stats/");
  }

  async createArticle(articleData: ArticleFormData): Promise<Article> {
    // Validate required fields
    if (!articleData.title?.trim()) {
      throw new Error('Title is required');
    }
    if (!articleData.excerpt?.trim()) {
      throw new Error('Excerpt is required');
    }
    if (!articleData.content?.trim()) {
      throw new Error('Content is required');
    }
    
    const formData = new FormData();
    
    // Add text fields
    formData.append('title', articleData.title.trim());
    formData.append('slug', articleData.slug || '');
    formData.append('excerpt', articleData.excerpt.trim());
    formData.append('content', articleData.content.trim());
    formData.append('tags', JSON.stringify(articleData.tags || []));
    formData.append('difficulty_level', articleData.difficulty_level || 'beginner');
    formData.append('estimated_read_time', (articleData.estimated_read_time || 5).toString());
    formData.append('is_published', (articleData.is_published || false).toString());
    formData.append('is_featured', (articleData.is_featured || false).toString());
    
    // Add file if present
    if (articleData.featured_image) {
      formData.append('featured_image', articleData.featured_image);
    }

    return apiClient.post<Article>("/content/articles/", formData);
  }

  async updateArticle(id: number, articleData: ArticleFormData): Promise<Article> {
    const formData = new FormData();
    
    // Add text fields
    formData.append('title', articleData.title);
    formData.append('slug', articleData.slug);
    formData.append('excerpt', articleData.excerpt);
    formData.append('content', articleData.content);
    formData.append('tags', JSON.stringify(articleData.tags));
    formData.append('difficulty_level', articleData.difficulty_level);
    formData.append('estimated_read_time', articleData.estimated_read_time.toString());
    formData.append('is_published', articleData.is_published.toString());
    formData.append('is_featured', articleData.is_featured.toString());
    
    // Add file if present
    if (articleData.featured_image) {
      formData.append('featured_image', articleData.featured_image);
    }

    return apiClient.put<Article>(`/content/articles/${id}/`, formData);
  }

  async getArticle(id: number): Promise<Article> {
    return apiClient.get<Article>(`/content/articles/${id}/`);
  }

  async deleteArticle(slug: string, hardDelete: boolean = false): Promise<{ message: string }> {
    const params = hardDelete ? '?hard_delete=true' : '';
    return apiClient.delete<{ message: string }>(`/content/articles/${slug}/${params}`);
  }

  async updateArticleBySlug(slug: string, articleData: Partial<ArticleFormData>): Promise<Article> {
    const formData = new FormData();
    
    // Add text fields only if they exist
    Object.entries(articleData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'tags' && Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (key === 'featured_image' && value instanceof File) {
          formData.append(key, value);
        } else if (typeof value !== 'object') {
          formData.append(key, value.toString());
        }
      }
    });

    return apiClient.patch<Article>(`/content/articles/${slug}/`, formData);
  }

  async createVideo(videoData: VideoFormData): Promise<Video> {
    console.log('🎥 VideoService: Creating video with data:', videoData);
    
    // Check authentication
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    console.log('🔐 VideoService: Authentication token present:', !!token);
    
    // Test authentication by making a simple request first
    try {
      console.log('🧪 VideoService: Testing authentication with stats endpoint...');
      await this.getContentStats();
      console.log('✅ VideoService: Authentication test passed');
    } catch (authError) {
      console.error('❌ VideoService: Authentication test failed:', authError);
      throw new Error('Authentication failed. Please log in again.');
    }
    
    // Create a minimal test payload first
    console.log('🧪 VideoService: Testing with minimal payload...');
    const testFormData = new FormData();
    testFormData.append('title', 'Test Video');
    testFormData.append('description', 'Test Description');
    testFormData.append('video_url', 'https://youtube.com/watch?v=test');
    testFormData.append('duration_seconds', '60');
    testFormData.append('difficulty_level', 'beginner');
    testFormData.append('tags', '[]');
    testFormData.append('is_published', 'false');
    testFormData.append('is_featured', 'false');
    
    console.log('🧪 VideoService: Minimal test payload:');
    for (let [key, value] of testFormData.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    
    // Validate required fields
    if (!videoData.title?.trim()) {
      throw new Error('Title is required');
    }
    if (!videoData.description?.trim()) {
      throw new Error('Description is required');
    }
    if (!videoData.video_url?.trim()) {
      throw new Error('Video URL is required');
    }
    if (!videoData.duration_seconds || videoData.duration_seconds <= 0) {
      throw new Error('Duration must be greater than 0 seconds');
    }
    
    const formData = new FormData();
    
    // Add text fields
    formData.append('title', videoData.title.trim());
    formData.append('description', videoData.description.trim());
    formData.append('video_url', videoData.video_url.trim());
    formData.append('duration_seconds', videoData.duration_seconds.toString());
    
    // Handle tags properly
    const tags = Array.isArray(videoData.tags) ? videoData.tags : [];
    formData.append('tags', JSON.stringify(tags));
    
    formData.append('difficulty_level', videoData.difficulty_level || 'beginner');
    formData.append('is_published', (videoData.is_published || false).toString());
    formData.append('is_featured', (videoData.is_featured || false).toString());
    
    // Add file if present
    if (videoData.thumbnail_image) {
      formData.append('thumbnail_image', videoData.thumbnail_image);
    }

    // Debug: Log FormData contents
    console.log('🎥 VideoService: FormData contents:');
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    }

    return apiClient.post<Video>("/content/videos/", formData);
  }

  async createAudioContent(audioData: AudioFormData): Promise<AudioContent> {
    console.log('AudioService: Creating audio content with data:', audioData);
    
    // Validate required fields
    if (!audioData.title?.trim()) {
      throw new Error('Title is required');
    }
    if (!audioData.description?.trim()) {
      throw new Error('Description is required');
    }
    if (!audioData.audio_type?.trim()) {
      throw new Error('Audio type is required');
    }
    
    const formData = new FormData();
    
    // Add text fields
    formData.append('title', audioData.title.trim());
    formData.append('description', audioData.description.trim());
    formData.append('audio_type', audioData.audio_type.trim());
    
    // Only add audio_url if it's not empty, otherwise provide empty string
    if (audioData.audio_url && audioData.audio_url.trim()) {
      formData.append('audio_url', audioData.audio_url.trim());
    } else {
      formData.append('audio_url', '');
    }
    
    // Ensure duration is at least 1
    const duration = Math.max(1, audioData.duration_seconds);
    formData.append('duration_seconds', duration.toString());
    
    // Handle tags - ensure it's a valid array and send as individual items
    const tags = Array.isArray(audioData.tags) ? audioData.tags : [];
    console.log('AudioService: Tags before processing:', tags);
    
    // Try sending tags as a JSON string, but ensure it's properly formatted
    if (tags.length > 0) {
      const tagsJson = JSON.stringify(tags);
      console.log('AudioService: Tags JSON string:', tagsJson);
      formData.append('tags', tagsJson);
    } else {
      // Send empty array as JSON string
      formData.append('tags', '[]');
    }
    formData.append('is_published', audioData.is_published.toString());
    
    // Add files if present
    if (audioData.audio_file) {
      console.log('AudioService: Adding audio file:', audioData.audio_file.name);
      formData.append('audio_file', audioData.audio_file);
    }
    if (audioData.thumbnail_image) {
      console.log('AudioService: Adding thumbnail image:', audioData.thumbnail_image.name);
      formData.append('thumbnail_image', audioData.thumbnail_image);
    }

    console.log('AudioService: Sending FormData to /content/audio/');
    
    // Debug: Log FormData contents
    console.log('AudioService: FormData contents:');
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    }
    
    try {
      const result = await apiClient.post<AudioContent>("/content/audio/", formData);
      console.log('AudioService: Audio creation successful:', result);
      return result;
    } catch (error: any) {
      console.error('AudioService: Audio creation failed:', error);
      
      // Log more detailed error information
      if (error.response) {
        console.error('AudioService: Error response:', error.response);
        console.error('AudioService: Error status:', error.response.status);
        console.error('AudioService: Error data:', error.response.data);
      }
      
      throw error;
    }
  }

  async updateAudioContent(id: number, audioData: AudioFormData): Promise<AudioContent> {
    const formData = new FormData();
    
    // Add text fields
    formData.append('title', audioData.title);
    formData.append('description', audioData.description);
    formData.append('audio_type', audioData.audio_type);
    formData.append('audio_url', audioData.audio_url);
    formData.append('duration_seconds', audioData.duration_seconds.toString());
    formData.append('tags', JSON.stringify(audioData.tags));
    formData.append('is_published', audioData.is_published.toString());
    
    // Add files if present
    if (audioData.audio_file) {
      formData.append('audio_file', audioData.audio_file);
    }
    if (audioData.thumbnail_image) {
      formData.append('thumbnail_image', audioData.thumbnail_image);
    }

    return apiClient.put<AudioContent>(`/content/audio/${id}/`, formData);
  }

  async getAudioContentById(id: number): Promise<AudioContent> {
    return apiClient.get<AudioContent>(`/content/audio/${id}/`);
  }

  async deleteAudioContent(id: number, hardDelete: boolean = false): Promise<{ message: string }> {
    const params = hardDelete ? '?hard_delete=true' : '';
    return apiClient.delete<{ message: string }>(`/content/audio/${id}/${params}`);
  }

  async updateVideo(id: number, videoData: Partial<VideoFormData>): Promise<Video> {
    const formData = new FormData();
    
    // Add text fields only if they exist
    Object.entries(videoData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'tags' && Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else if (key === 'thumbnail_image' && value instanceof File) {
          formData.append(key, value);
        } else if (typeof value !== 'object') {
          formData.append(key, value.toString());
        }
      }
    });

    return apiClient.patch<Video>(`/content/videos/${id}/`, formData);
  }

  async deleteVideo(id: number, hardDelete: boolean = false): Promise<{ message: string }> {
    const params = hardDelete ? '?hard_delete=true' : '';
    return apiClient.delete<{ message: string }>(`/content/videos/${id}/${params}`);
  }

  async getVideo(id: number): Promise<Video> {
    return apiClient.get<Video>(`/content/videos/${id}/`);
  }

  async likeAudioContent(id: number): Promise<{ liked: boolean; like_count: number }> {
    return apiClient.post<{ liked: boolean; like_count: number }>(`/content/audio/${id}/like/`);
  }

  async shareAudioContent(id: number, method: string = 'copy_link'): Promise<void> {
    return apiClient.post<void>(`/content/audio/${id}/share/`, { method });
  }

  async createResource(resourceData: ResourceFormData): Promise<MentalHealthResource> {
    const data = {
      name: resourceData.name,
      description: resourceData.description,
      resource_type: resourceData.resource_type,
      phone_number: resourceData.phone_number,
      email: resourceData.email,
      website: resourceData.website,
      address: resourceData.address,
      city: resourceData.city,
      state: resourceData.state,
      zip_code: resourceData.zip_code,
      cost_level: resourceData.cost_level,
      is_24_7: resourceData.is_24_7,
      accepts_walk_ins: resourceData.accepts_walk_ins,
      is_verified: false // Will need admin approval
    };

    return apiClient.post<MentalHealthResource>("/content/resources/", data);
  }

  async updateResource(id: number, resourceData: Partial<ResourceFormData>): Promise<MentalHealthResource> {
    const data = {
      ...resourceData,
      is_verified: false // Will need admin approval for changes
    };

    return apiClient.patch<MentalHealthResource>(`/content/resources/${id}/`, data);
  }

  async deleteResource(id: number, hardDelete: boolean = false): Promise<{ message: string }> {
    const params = hardDelete ? '?hard_delete=true' : '';
    return apiClient.delete<{ message: string }>(`/content/resources/${id}/${params}`);
  }

  async getResource(id: number): Promise<MentalHealthResource> {
    return apiClient.get<MentalHealthResource>(`/content/resources/${id}/`);
  }


  // Audio-specific utility methods
  async getAudioByType(audioType: 'meditation' | 'podcast' | 'music' | 'exercise' | 'story'): Promise<AudioContent[]> {
    const response = await this.getAudioContent();
    const audioArray = extractArrayFromResponse(response);
    return audioArray.filter(audio => audio.audio_type === audioType);
  }

  async getFeaturedAudio(): Promise<AudioContent[]> {
    // This would typically be a separate endpoint, but for now filter locally
    const response = await this.getAudioContent();
    const audioArray = extractArrayFromResponse(response);
    return audioArray.filter(audio => audio.is_published).slice(0, 6);
  }

  async searchAudioContent(query: string): Promise<AudioContent[]> {
    // This would typically use a search endpoint with query parameters
    const response = await this.getAudioContent();
    const audioArray = extractArrayFromResponse(response);
    return audioArray.filter(audio => 
      audio.title.toLowerCase().includes(query.toLowerCase()) ||
      audio.description.toLowerCase().includes(query.toLowerCase()) ||
      audio.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
  }

  // New management endpoints
  async getManagementDashboard(): Promise<any> {
    return apiClient.get<any>('/content/management/dashboard/');
  }

  async bulkContentAction(action: 'publish' | 'unpublish' | 'delete', contentType: 'article' | 'video' | 'audio', contentIds: number[], hardDelete: boolean = false): Promise<{ message: string; updated_count: number }> {
    return apiClient.post<{ message: string; updated_count: number }>('/content/management/bulk-action/', {
      action,
      content_type: contentType,
      content_ids: contentIds,
      hard_delete: hardDelete
    });
  }

  async searchContent(query: string, type: 'all' | 'article' | 'video' | 'audio' = 'all', author?: string, publishedOnly: boolean = true): Promise<any> {
    const params = new URLSearchParams({
      q: query,
      type,
      published_only: publishedOnly.toString()
    });
    
    if (author) {
      params.append('author', author);
    }

    return apiClient.get<any>(`/content/management/search/?${params.toString()}`);
  }

  async duplicateContent(contentType: 'article' | 'video' | 'audio', contentId: number): Promise<any> {
    return apiClient.post<any>(`/content/management/duplicate/${contentType}/${contentId}/`);
  }

  async getContentAnalytics(): Promise<any> {
    return apiClient.get<any>('/content/management/analytics/');
  }
}

export const contentService = new ContentService();
export default contentService;
