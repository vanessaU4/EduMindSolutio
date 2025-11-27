import { apiClient } from './apiClient';

export interface WellnessData {
  currentStreak: number;
  totalPoints: number;
  weeklyGoal: number;
  weeklyProgress: number;
  recentMoods: { date: string; mood: number; note?: string }[];
  achievements: { id: string; title: string; description: string; earned: boolean; date?: string }[];
  todaysChallenge: { id: string; title: string; description: string; completed: boolean };
}

export interface MoodEntry {
  mood_rating: number;
  energy_level: number;
  anxiety_level: number;
  sleep_quality: number;
  notes: string;
  activities: string[];
  triggers: string[];
  date: string;
}

export interface Achievement {
  id: number;
  achievement_name: string;
  achievement_description: string;
  achievement_icon: string;
  achievement_category: string;
  earned_at: string;
  points_earned: number;
}

export interface Challenge {
  id: number;
  title: string;
  description: string;
  challenge_type: string;
  instructions: string;
  points_reward: number;
  target_value?: number;
  duration_minutes?: number;
  is_completed_today: boolean;
  is_active?: boolean;
  created_at?: string;
}

export interface WeeklyChallenge {
  id: number;
  title: string;
  description: string;
  challenge_type: string;
  instructions: string;
  target_days: number;
  points_per_day: number;
  bonus_points: number;
  start_date: string;
  end_date: string;
  progress?: {
    days_completed: number;
    total_points_earned: number;
    is_completed: boolean;
    completion_percentage: number;
  };
  is_enrolled: boolean;
  is_active?: boolean;
  created_at?: string;
}

class WellnessService {
  // Dashboard and Stats
  async getDashboard(): Promise<any> {
    try {
      const response = await apiClient.get<any>('/wellness/dashboard/');
      return response;
    } catch (error) {
      console.error('Failed to fetch wellness dashboard:', error);
      throw error;
    }
  }

  async getWellnessData(): Promise<WellnessData> {
    try {
      const response = await apiClient.get<WellnessData>('/wellness/data/');
      return response;
    } catch (error) {
      console.error('Failed to fetch wellness data:', error);
      throw error;
    }
  }

  // Mood Tracking
  async createMoodEntry(moodEntry: MoodEntry): Promise<MoodEntry> {
    try {
      const response = await apiClient.post<MoodEntry>('/wellness/api/v2/mood-entries-v2/', moodEntry);
      return response;
    } catch (error) {
      console.error('Failed to create mood entry:', error);
      throw error;
    }
  }

  async addMoodEntry(moodEntry: MoodEntry): Promise<void> {
    try {
      await this.createMoodEntry(moodEntry);
    } catch (error) {
      console.error('Failed to add mood entry:', error);
      throw error;
    }
  }

  async getMoodHistory(days: number = 30): Promise<MoodEntry[]> {
    try {
      const response = await apiClient.get<MoodEntry[]>(`/wellness/api/v2/mood-entries-v2/?days=${days}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch mood history:', error);
      throw error;
    }
  }

  async getMoodStats(days: number = 30): Promise<any> {
    try {
      const response = await apiClient.get<any>(`/wellness/api/v2/mood-entries-v2/stats/?days=${days}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch mood stats:', error);
      throw error;
    }
  }

  // Daily Challenges
  async getDailyChallenges(): Promise<Challenge[]> {
    try {
      const response = await apiClient.get<Challenge[]>('/wellness/api/v2/daily-challenges-v2/');
      return response;
    } catch (error) {
      console.error('Failed to fetch daily challenges:', error);
      throw error;
    }
  }

  async completeChallenge(challengeId: number, completionData: any): Promise<any> {
    try {
      const response = await apiClient.post<any>(`/wellness/api/v2/daily-challenges-v2/${challengeId}/complete/`, completionData);
      return response;
    } catch (error) {
      console.error('Failed to complete challenge:', error);
      throw error;
    }
  }

  // Weekly Challenges
  async getWeeklyChallenges(): Promise<WeeklyChallenge[]> {
    try {
      const response = await apiClient.get<WeeklyChallenge[]>('/wellness/api/v2/weekly-challenges/');
      return response;
    } catch (error) {
      console.error('Failed to fetch weekly challenges:', error);
      throw error;
    }
  }

  async enrollInWeeklyChallenge(challengeId: number): Promise<any> {
    try {
      const response = await apiClient.post<any>(`/wellness/api/v2/weekly-challenges/${challengeId}/enroll/`);
      return response;
    } catch (error) {
      console.error('Failed to enroll in weekly challenge:', error);
      throw error;
    }
  }

  async completeWeeklyChallengeDay(challengeId: number): Promise<any> {
    try {
      const response = await apiClient.post<any>(`/wellness/api/v2/weekly-challenges/${challengeId}/complete_day/`);
      return response;
    } catch (error) {
      console.error('Failed to complete weekly challenge day:', error);
      throw error;
    }
  }

  // Achievements
  async getAchievements(): Promise<Achievement[]> {
    try {
      const response = await apiClient.get<Achievement[]>('/wellness/achievements/');
      return response;
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
      throw error;
    }
  }

  async getUserAchievements(): Promise<Achievement[]> {
    try {
      const response = await apiClient.get<Achievement[]>('/wellness/api/v2/user-achievements-v2/');
      return response;
    } catch (error) {
      console.error('Failed to fetch user achievements:', error);
      throw error;
    }
  }

  async getAvailableAchievements(): Promise<any[]> {
    try {
      const response = await apiClient.get<any[]>('/wellness/api/v2/achievements-v2/');
      return response;
    } catch (error) {
      console.error('Failed to fetch available achievements:', error);
      throw error;
    }
  }

  // Wellness Insights
  async getWellnessInsights(): Promise<any> {
    try {
      const response = await apiClient.get<any>('/wellness/insights/');
      return response;
    } catch (error) {
      console.error('Failed to fetch wellness insights:', error);
      throw error;
    }
  }

  async generateMoodPattern(data: { days: number }): Promise<any> {
    try {
      const response = await apiClient.post<any>('/wellness/api/v2/mood-patterns/generate_insights/', data);
      return response;
    } catch (error) {
      console.error('Failed to generate mood pattern:', error);
      throw error;
    }
  }

  // Wellness Tips
  async getWellnessTips(): Promise<any[]> {
    try {
      const response = await apiClient.get<any[]>('/wellness/api/v2/wellness-tips-v2/');
      return response;
    } catch (error) {
      console.error('Failed to fetch wellness tips:', error);
      throw error;
    }
  }

  async markTipHelpful(tipId: number, isHelpful: boolean): Promise<any> {
    try {
      const response = await apiClient.post<any>(`/wellness/api/v2/wellness-tips-v2/${tipId}/mark_helpful/`, { is_helpful: isHelpful });
      return response;
    } catch (error) {
      console.error('Failed to mark tip as helpful:', error);
      throw error;
    }
  }

  // Progress Tracking
  async getUserProgress(period: string = '30'): Promise<any> {
    try {
      const response = await apiClient.get<any>(`/wellness/progress/?period=${period}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch user progress:', error);
      throw error;
    }
  }

  // Admin Challenge Management
  async createDailyChallenge(challengeData: Partial<Challenge>): Promise<Challenge> {
    try {
      const response = await apiClient.post<Challenge>('/wellness/api/v2/daily-challenges-v2/', challengeData);
      return response;
    } catch (error) {
      console.error('Failed to create daily challenge:', error);
      throw error;
    }
  }

  async updateDailyChallenge(challengeId: number, challengeData: Partial<Challenge>): Promise<Challenge> {
    try {
      const response = await apiClient.put<Challenge>(`/wellness/api/v2/daily-challenges-v2/${challengeId}/`, challengeData);
      return response;
    } catch (error) {
      console.error('Failed to update daily challenge:', error);
      throw error;
    }
  }

  async deleteDailyChallenge(challengeId: number): Promise<void> {
    try {
      await apiClient.delete(`/wellness/api/v2/daily-challenges-v2/${challengeId}/`);
    } catch (error) {
      console.error('Failed to delete daily challenge:', error);
      throw error;
    }
  }

  async createWeeklyChallenge(challengeData: Partial<WeeklyChallenge>): Promise<WeeklyChallenge> {
    try {
      const response = await apiClient.post<WeeklyChallenge>('/wellness/api/v2/weekly-challenges/', challengeData);
      return response;
    } catch (error) {
      console.error('Failed to create weekly challenge:', error);
      throw error;
    }
  }

  async updateWeeklyChallenge(challengeId: number, challengeData: Partial<WeeklyChallenge>): Promise<WeeklyChallenge> {
    try {
      const response = await apiClient.put<WeeklyChallenge>(`/wellness/api/v2/weekly-challenges/${challengeId}/`, challengeData);
      return response;
    } catch (error) {
      console.error('Failed to update weekly challenge:', error);
      throw error;
    }
  }

  async deleteWeeklyChallenge(challengeId: number): Promise<void> {
    try {
      await apiClient.delete(`/wellness/api/v2/weekly-challenges/${challengeId}/`);
    } catch (error) {
      console.error('Failed to delete weekly challenge:', error);
      throw error;
    }
  }

  // Challenge Analytics for Admins
  async getChallengeAnalytics(): Promise<any> {
    try {
      const response = await apiClient.get<any>('/wellness/api/v2/challenge-analytics/');
      return response;
    } catch (error) {
      console.error('Failed to fetch challenge analytics:', error);
      throw error;
    }
  }

  async getUserChallengeStats(): Promise<any> {
    try {
      const response = await apiClient.get<any>('/wellness/api/v2/user-challenge-stats/');
      return response;
    } catch (error) {
      console.error('Failed to fetch user challenge stats:', error);
      throw error;
    }
  }

  // Legacy methods for backward compatibility
  async updateWellnessGoal(goal: number): Promise<void> {
    try {
      await apiClient.put('/wellness/goal/', { weekly_goal: goal });
    } catch (error) {
      console.error('Failed to update wellness goal:', error);
      throw error;
    }
  }
}

export const wellnessService = new WellnessService();
