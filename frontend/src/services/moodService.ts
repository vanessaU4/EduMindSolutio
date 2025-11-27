import { apiClient } from './apiClient';

export interface MoodEntry {
  id: string;
  user_id: number;
  timestamp: string;
  emotion: string;
  confidence: number;
  emotions_breakdown: {
    happy: number;
    sad: number;
    angry: number;
    surprised: number;
    neutral: number;
    fear: number;
    disgust: number;
  };
  notes?: string;
  image_data?: string;
  created_at: string;
  updated_at: string;
}

export interface EmotionAnalysisRequest {
  image_data: string;
  include_breakdown?: boolean;
}

export interface EmotionAnalysisResponse {
  emotion: string;
  confidence: number;
  emotions: {
    happy: number;
    sad: number;
    angry: number;
    surprised: number;
    neutral: number;
    fear: number;
    disgust: number;
  };
  processing_time: number;
}

export interface MoodStats {
  total_entries: number;
  most_common_emotion: string;
  average_confidence: number;
  mood_trend: 'improving' | 'declining' | 'stable';
  entries_this_week: number;
  streak_days: number;
}

class MoodService {
  /**
   * Analyze emotion from image data
   */
  async analyzeEmotion(imageData: string): Promise<EmotionAnalysisResponse> {
    try {
      console.log('Analyzing emotion from image...');
      
      const requestData: EmotionAnalysisRequest = {
        image_data: imageData,
        include_breakdown: true
      };

      const result = await apiClient.post<EmotionAnalysisResponse>('/mood/analyze/', requestData);
      console.log('Emotion analysis result:', result);
      
      return result;
    } catch (error: any) {
      console.error('Failed to analyze emotion:', error);
      console.error('Error details:', error.response?.data);
      
      // Fallback to mock analysis for development
      console.warn('Using mock emotion analysis due to backend error');
      return this.getMockEmotionAnalysis();
    }
  }

  /**
   * Save mood entry to database
   */
  async saveMoodEntry(data: {
    emotion: string;
    confidence: number;
    emotions_breakdown: any;
    notes?: string;
    image_data?: string;
  }): Promise<MoodEntry> {
    try {
      console.log('Saving mood entry to database:', data);
      
      const result = await apiClient.post<MoodEntry>('/mood/entries/', data);
      console.log('Mood entry saved successfully:', result);
      
      return result;
    } catch (error: any) {
      console.error('Failed to save mood entry:', error);
      
      // Return mock entry for development
      console.warn('Using mock mood entry');
      return {
        id: Date.now().toString(),
        user_id: 1,
        timestamp: new Date().toISOString(),
        emotion: data.emotion,
        confidence: data.confidence,
        emotions_breakdown: data.emotions_breakdown,
        notes: data.notes,
        image_data: data.image_data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  }

  /**
   * Get user's mood history
   */
  async getMoodHistory(limit?: number): Promise<MoodEntry[]> {
    try {
      console.log('Fetching mood history from database...');
      
      const params = limit ? `?limit=${limit}` : '';
      const result = await apiClient.get<{results: MoodEntry[]}>(`/mood/entries/${params}`);
      
      console.log('Mood history retrieved:', result);
      return result.results || [];
    } catch (error: any) {
      console.error('Failed to fetch mood history:', error);
      
      // Return mock history for development
      console.warn('Using mock mood history');
      return this.getMockMoodHistory();
    }
  }

  /**
   * Get mood statistics
   */
  async getMoodStats(): Promise<MoodStats> {
    try {
      console.log('Fetching mood statistics...');
      
      const result = await apiClient.get<MoodStats>('/mood/stats/');
      console.log('Mood stats retrieved:', result);
      
      return result;
    } catch (error: any) {
      console.error('Failed to fetch mood stats:', error);
      
      // Return mock stats for development
      return {
        total_entries: 15,
        most_common_emotion: 'happy',
        average_confidence: 0.78,
        mood_trend: 'improving',
        entries_this_week: 5,
        streak_days: 3
      };
    }
  }

  /**
   * Delete mood entry
   */
  async deleteMoodEntry(entryId: string): Promise<void> {
    try {
      await apiClient.delete(`/mood/entries/${entryId}/`);
      console.log('Mood entry deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete mood entry:', error);
      throw error;
    }
  }

  /**
   * Update mood entry
   */
  async updateMoodEntry(entryId: string, data: Partial<MoodEntry>): Promise<MoodEntry> {
    try {
      const result = await apiClient.patch<MoodEntry>(`/mood/entries/${entryId}/`, data);
      console.log('Mood entry updated successfully:', result);
      
      return result;
    } catch (error: any) {
      console.error('Failed to update mood entry:', error);
      throw error;
    }
  }

  /**
   * Get mood trends over time
   */
  async getMoodTrends(period: 'week' | 'month' | 'year' = 'month'): Promise<any[]> {
    try {
      const result = await apiClient.get<any[]>(`/mood/trends/?period=${period}`);
      return result;
    } catch (error: any) {
      console.error('Failed to fetch mood trends:', error);
      throw error;
    }
  }

  /**
   * Get admin mood dashboard data (admin only)
   */
  async getAdminMoodDashboard(): Promise<any[]> {
    try {
      console.log('Fetching admin mood dashboard data...');
      const result = await apiClient.get<any[]>('/mood/admin/dashboard/');
      console.log('Admin mood data retrieved:', result);
      return result;
    } catch (error: any) {
      console.error('Failed to fetch admin mood data:', error);
      throw error;
    }
  }

  /**
   * Mock emotion analysis for development
   */
  private getMockEmotionAnalysis(): EmotionAnalysisResponse {
    const emotions = ['happy', 'sad', 'neutral', 'surprised', 'angry'];
    const primaryEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    
    const mockEmotions = {
      happy: Math.random() * 0.3,
      sad: Math.random() * 0.3,
      angry: Math.random() * 0.2,
      surprised: Math.random() * 0.2,
      neutral: Math.random() * 0.4,
      fear: Math.random() * 0.1,
      disgust: Math.random() * 0.1
    };

    // Boost the primary emotion
    mockEmotions[primaryEmotion as keyof typeof mockEmotions] = 0.6 + Math.random() * 0.3;

    // Normalize to sum to 1
    const total = Object.values(mockEmotions).reduce((sum, val) => sum + val, 0);
    Object.keys(mockEmotions).forEach(key => {
      mockEmotions[key as keyof typeof mockEmotions] /= total;
    });

    return {
      emotion: primaryEmotion,
      confidence: mockEmotions[primaryEmotion as keyof typeof mockEmotions],
      emotions: mockEmotions,
      processing_time: 1.2
    };
  }

  /**
   * Mock mood history for development
   */
  private getMockMoodHistory(): MoodEntry[] {
    const emotions = ['happy', 'sad', 'neutral', 'surprised', 'angry'];
    const mockEntries: MoodEntry[] = [];

    for (let i = 0; i < 10; i++) {
      const emotion = emotions[Math.floor(Math.random() * emotions.length)];
      const confidence = 0.6 + Math.random() * 0.3;
      const timestamp = new Date(Date.now() - i * 86400000 - Math.random() * 86400000).toISOString();

      mockEntries.push({
        id: (i + 1).toString(),
        user_id: 1,
        timestamp,
        emotion,
        confidence,
        emotions_breakdown: {
          happy: emotion === 'happy' ? confidence : Math.random() * 0.3,
          sad: emotion === 'sad' ? confidence : Math.random() * 0.3,
          angry: emotion === 'angry' ? confidence : Math.random() * 0.2,
          surprised: emotion === 'surprised' ? confidence : Math.random() * 0.2,
          neutral: emotion === 'neutral' ? confidence : Math.random() * 0.4,
          fear: Math.random() * 0.1,
          disgust: Math.random() * 0.1
        },
        notes: i % 3 === 0 ? `Sample note for entry ${i + 1}` : undefined,
        created_at: timestamp,
        updated_at: timestamp
      });
    }

    return mockEntries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Mock trend data for development
   */
  private getMockTrendData(): any[] {
    const days = 30;
    const trends = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      trends.push({
        date: date.toISOString().split('T')[0],
        happy: Math.random() * 0.4 + 0.3,
        sad: Math.random() * 0.3 + 0.1,
        neutral: Math.random() * 0.3 + 0.2,
        angry: Math.random() * 0.2,
        surprised: Math.random() * 0.2,
        average_confidence: 0.6 + Math.random() * 0.3
      });
    }
    
    return trends;
  }
}

export const moodService = new MoodService();
export default moodService;
