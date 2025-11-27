import { apiClient } from './apiClient';

export interface QuestionOption {
  id?: number;
  text: string;
  score: number;
}

export interface AssessmentQuestion {
  id?: number;
  question_number: number;
  question_text: string;
  question_type: 'multiple_choice' | 'multiple_select' | 'text_input' | 'rating_scale' | 'yes_no' | 'likert_scale';
  options: QuestionOption[];
  is_reverse_scored: boolean;
  is_required: boolean;
  min_value?: number;
  max_value?: number;
  scale_labels?: string[];
}

export interface AssessmentTypeWithQuestions {
  id: number;
  name: string;
  display_name: string;
  description: string;
  instructions: string;
  total_questions: number;
  max_score: number;
  is_active: boolean;
  questions: AssessmentQuestion[];
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface CreateQuestionData {
  assessment_type: number;
  question_text: string;
  question_type: 'multiple_choice' | 'multiple_select' | 'text_input' | 'rating_scale' | 'yes_no' | 'likert_scale';
  options: QuestionOption[];
  is_reverse_scored: boolean;
  is_required: boolean;
  min_value?: number;
  max_value?: number;
  scale_labels?: string[];
}

export interface UpdateQuestionData {
  question_text?: string;
  options?: QuestionOption[];
  is_reverse_scored?: boolean;
}

export interface QuestionAnalytics {
  question_id: number;
  question_text: string;
  assessment_type: string;
  total_responses: number;
  average_score: number;
  option_distribution: Record<string, number>;
  option_percentages: Record<string, number>;
  options: QuestionOption[];
}

export interface AnalyticsResponse {
  questions: QuestionAnalytics[];
  total_questions: number;
  total_responses: number;
}

class QuestionService {
  /**
   * Get all assessment types with their questions
   */
  async getAssessmentTypesWithQuestions(): Promise<AssessmentTypeWithQuestions[]> {
    try {
      // Use the existing assessment types endpoint which includes questions
      const response = await apiClient.get<PaginatedResponse<AssessmentTypeWithQuestions> | AssessmentTypeWithQuestions[]>('/assessments/types/');
      console.log('Raw API response:', response);
      
      // Handle paginated response format
      if (response && typeof response === 'object' && 'results' in response && Array.isArray(response.results)) {
        console.log('Found paginated response, extracting results:', response.results);
        return response.results;
      }
      // Handle direct array response
      else if (Array.isArray(response)) {
        return response;
      } 
      // Fallback for unexpected format
      else {
        console.error('API response is not in expected format:', response);
        return [];
      }
    } catch (error) {
      console.error('Failed to fetch assessment types with questions:', error);
      throw error;
    }
  }

  /**
   * Create a new question
   */
  async createQuestion(data: CreateQuestionData): Promise<AssessmentQuestion> {
    try {
      // Use the standard ViewSet endpoint for creating questions
      return await apiClient.post<AssessmentQuestion>('/assessments/questions/', data);
    } catch (error) {
      console.error('Failed to create question:', error);
      throw error;
    }
  }

  /**
   * Update an existing question
   */
  async updateQuestion(questionId: number, data: UpdateQuestionData): Promise<AssessmentQuestion> {
    try {
      // Use standard ViewSet endpoint for updating questions
      return await apiClient.put<AssessmentQuestion>(`/assessments/questions/${questionId}/`, data);
    } catch (error) {
      console.error('Failed to update question:', error);
      throw error;
    }
  }

  /**
   * Delete a question
   */
  async deleteQuestion(questionId: number): Promise<void> {
    try {
      // Use standard ViewSet endpoint for deleting questions
      await apiClient.delete(`/assessments/questions/${questionId}/`);
    } catch (error) {
      console.error('Failed to delete question:', error);
      throw error;
    }
  }

  /**
   * Get question analytics
   */
  async getQuestionAnalytics(): Promise<AnalyticsResponse> {
    try {
      return await apiClient.get<AnalyticsResponse>('/assessments/questions/analytics/');
    } catch (error) {
      console.error('Failed to fetch question analytics:', error);
      throw error;
    }
  }

  /**
   * Bulk create questions
   */
  async bulkCreateQuestions(assessmentTypeId: number, questions: Omit<CreateQuestionData, 'assessment_type_id'>[]): Promise<{created_questions: AssessmentQuestion[], count: number}> {
    try {
      return await apiClient.post('/assessments/questions/bulk-create/', {
        assessment_type_id: assessmentTypeId,
        questions
      });
    } catch (error) {
      console.error('Failed to bulk create questions:', error);
      throw error;
    }
  }

  /**
   * Get question templates for common assessment types
   */
  getQuestionTemplates() {
    return {
      depression: {
        text: 'Over the last 2 weeks, how often have you been bothered by...',
        options: [
          { text: 'Not at all', score: 0 },
          { text: 'Several days', score: 1 },
          { text: 'More than half the days', score: 2 },
          { text: 'Nearly every day', score: 3 }
        ]
      },
      anxiety: {
        text: 'Over the last 2 weeks, how often have you been bothered by...',
        options: [
          { text: 'Not at all', score: 0 },
          { text: 'Several days', score: 1 },
          { text: 'More than half the days', score: 2 },
          { text: 'Nearly every day', score: 3 }
        ]
      },
      likert_5: {
        text: 'Please rate your agreement with the following statement:',
        options: [
          { text: 'Strongly Disagree', score: 1 },
          { text: 'Disagree', score: 2 },
          { text: 'Neutral', score: 3 },
          { text: 'Agree', score: 4 },
          { text: 'Strongly Agree', score: 5 }
        ]
      },
      frequency: {
        text: 'How often do you experience...',
        options: [
          { text: 'Never', score: 0 },
          { text: 'Rarely', score: 1 },
          { text: 'Sometimes', score: 2 },
          { text: 'Often', score: 3 },
          { text: 'Always', score: 4 }
        ]
      },
      severity: {
        text: 'How severe is...',
        options: [
          { text: 'Not at all', score: 0 },
          { text: 'Mild', score: 1 },
          { text: 'Moderate', score: 2 },
          { text: 'Severe', score: 3 },
          { text: 'Very Severe', score: 4 }
        ]
      }
    };
  }

  /**
   * Validate question data
   */
  validateQuestion(data: Partial<CreateQuestionData>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.question_text?.trim()) {
      errors.push('Question text is required');
    }

    if (!data.options || data.options.length < 2) {
      errors.push('At least 2 answer options are required');
    }

    if (data.options) {
      data.options.forEach((option, index) => {
        if (!option.text?.trim()) {
          errors.push(`Option ${index + 1} text is required`);
        }
        if (typeof option.score !== 'number') {
          errors.push(`Option ${index + 1} must have a valid score`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Calculate question statistics
   */
  calculateQuestionStats(analytics: QuestionAnalytics[]) {
    const totalQuestions = analytics.length;
    const totalResponses = analytics.reduce((sum, q) => sum + q.total_responses, 0);
    const avgResponsesPerQuestion = totalQuestions > 0 ? totalResponses / totalQuestions : 0;
    
    const mostAnsweredQuestion = analytics.reduce((max, q) => 
      q.total_responses > max.total_responses ? q : max, 
      analytics[0] || { total_responses: 0 }
    );

    const leastAnsweredQuestion = analytics.reduce((min, q) => 
      q.total_responses < min.total_responses ? q : min, 
      analytics[0] || { total_responses: Infinity }
    );

    return {
      totalQuestions,
      totalResponses,
      avgResponsesPerQuestion: Math.round(avgResponsesPerQuestion * 100) / 100,
      mostAnsweredQuestion: mostAnsweredQuestion.total_responses > 0 ? mostAnsweredQuestion : null,
      leastAnsweredQuestion: leastAnsweredQuestion.total_responses < Infinity ? leastAnsweredQuestion : null
    };
  }
}

export const questionService = new QuestionService();
export default questionService;
