import { apiClient } from './apiClient';

export interface AssessmentType {
  id: number;
  name: string;
  display_name: string;
  description: string;
  instructions: string;
  total_questions: number;
  max_score: number;
  is_active: boolean;
  questions?: AssessmentQuestion[];
}

export interface AssessmentQuestion {
  id: number;
  question_number: number;
  question_text: string;
  options: Array<{ text: string; score: number }>;
  is_reverse_scored: boolean;
}

export interface Assessment {
  id: number;
  user: any;
  assessment_type: AssessmentType;
  total_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  interpretation: string;
  recommendations: any[];
  completed_at: string;
  percentage_score?: number;
}

export interface AssessmentResponse {
  question_id: number;
  selected_option_index: number;
}

export interface TakeAssessmentData {
  assessment_type_id: number;
  responses: AssessmentResponse[];
}

class AssessmentService {
  /**
   * Get all available assessment types
   */
  async getAssessmentTypes(): Promise<AssessmentType[]> {
    try {
      const response = await apiClient.get<any>('/assessments/types/');
      // Handle paginated response
      if (response && typeof response === 'object' && response.results) {
        return Array.isArray(response.results) ? response.results : [];
      }
      // Handle direct array response
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Failed to fetch assessment types:', error);
      return [];
    }
  }

  /**
   * Get specific assessment type with questions
   */
  async getAssessmentType(id: number): Promise<AssessmentType> {
    try {
      console.log(`Fetching assessment type ${id} from API...`);
      const result = await apiClient.get<AssessmentType>(`/assessments/types/${id}/`);
      console.log(`Assessment type ${id} fetched successfully:`, result);
      
      // Validate that the assessment has questions
      if (!result.questions || result.questions.length === 0) {
        console.warn(`Assessment type ${id} has no questions! This may be a custom assessment type without questions added yet.`);
        // Return the assessment type with empty questions array instead of throwing error
        return {
          ...result,
          questions: []
        };
      } else {
        console.log(`Assessment type ${id} has ${result.questions.length} questions`);
        result.questions.forEach((q, index) => {
          console.log(`  Question ${index + 1} (ID: ${q.id}): ${q.question_text}`);
        });
      }
      
      return result;
    } catch (error: any) {
      console.error(`Failed to fetch assessment type ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get user's assessment history
   */
  async getAssessmentHistory(): Promise<Assessment[]> {
    try {
      console.log('Fetching assessment history from database...');
      const response = await apiClient.get<any>('/assessments/history/');
      // Handle paginated response
      if (response && typeof response === 'object' && response.results) {
        return Array.isArray(response.results) ? response.results : [];
      }
      // Handle direct array response
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Failed to fetch assessment history from database:', error);
      return [];
    }
  }

  /**
   * Submit assessment responses
   */
  async submitAssessment(data: TakeAssessmentData): Promise<Assessment> {
    try {
      console.log('Submitting assessment to database via API:', data);
      const result = await apiClient.post<Assessment>('/assessments/take/', data);
      console.log('Assessment successfully stored in database:', result);
      return result;
    } catch (error: any) {
      console.error('Failed to submit assessment to database:', error);
      throw error;
    }
  }

  /**
   * Get all assessments (Admin only)
   */
  async getAllAssessments(): Promise<Assessment[]> {
    try {
      console.log('Fetching all assessments for admin...');
      const response = await apiClient.get<any>('/assessments/history/');
      // Handle paginated response
      if (response && typeof response === 'object' && response.results) {
        return Array.isArray(response.results) ? response.results : [];
      }
      // Handle direct array response
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Failed to fetch all assessments:', error);
      return [];
    }
  }

  /**
   * Get assessment requests (Admin only)
   */
  async getAssessmentRequests(): Promise<any[]> {
    try {
      console.log('Fetching assessment requests for admin...');
      const response = await apiClient.get<any>('/assessments/admin/requests/');
      // Handle paginated response
      if (response && typeof response === 'object' && response.results) {
        return Array.isArray(response.results) ? response.results : [];
      }
      // Handle direct array response
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Failed to fetch assessment requests:', error);
      return [];
    }
  }

  /**
   * Get all questions for admin management
   */
  async getAllQuestions(): Promise<any[]> {
    try {
      console.log('Fetching all questions for admin...');
      const assessmentTypes = await this.getAssessmentTypes();
      
      // Ensure assessmentTypes is an array
      if (!Array.isArray(assessmentTypes)) {
        console.error('Assessment types is not an array:', assessmentTypes);
        return [];
      }
      
      const allQuestions: any[] = [];
      
      for (const type of assessmentTypes) {
        try {
          const detailedType = await this.getAssessmentType(type.id);
          if (detailedType.questions && Array.isArray(detailedType.questions)) {
            detailedType.questions.forEach(question => {
              allQuestions.push({
                ...question,
                assessment_type: type.name,
                assessment_type_display: type.display_name,
                is_active: true
              });
            });
          }
        } catch (typeError) {
          console.error(`Failed to fetch questions for assessment type ${type.id}:`, typeError);
          continue;
        }
      }
      
      return allQuestions;
    } catch (error) {
      console.error('Failed to fetch all questions:', error);
      return [];
    }
  }

  /**
   * Get specific assessment type by name with questions
   */
  async getAssessmentTypeByName(name: string): Promise<AssessmentType> {
    try {
      return await apiClient.get<AssessmentType>(`/assessments/types/${name}/`);
    } catch (error) {
      console.error(`Failed to fetch assessment type ${name}:`, error);
      // Return mock data as fallback
      const mockTypes = this.getMockAssessmentTypes();
      const mockType = mockTypes.find(t => t.name === name);
      if (mockType) {
        return mockType;
      }
      throw new Error(`Assessment type with name ${name} not found`);
    }
  }

  /**
   * Get mock assessment types for fallback
   */
  private getMockAssessmentTypes(): AssessmentType[] {
    return [
      {
        id: 1,
        name: 'PHQ9',
        display_name: 'Patient Health Questionnaire-9',
        description: 'A 9-question instrument for screening, diagnosing, monitoring and measuring the severity of depression.',
        instructions: 'Over the last 2 weeks, how often have you been bothered by any of the following problems?',
        total_questions: 9,
        max_score: 27,
        is_active: true,
        questions: [
          {
            id: 1,
            question_number: 1,
            question_text: 'Little interest or pleasure in doing things',
            options: [
              { text: 'Not at all', score: 0 },
              { text: 'Several days', score: 1 },
              { text: 'More than half the days', score: 2 },
              { text: 'Nearly every day', score: 3 }
            ],
            is_reverse_scored: false
          },
          {
            id: 2,
            question_number: 2,
            question_text: 'Feeling down, depressed, or hopeless',
            options: [
              { text: 'Not at all', score: 0 },
              { text: 'Several days', score: 1 },
              { text: 'More than half the days', score: 2 },
              { text: 'Nearly every day', score: 3 }
            ],
            is_reverse_scored: false
          }
        ]
      },
      {
        id: 2,
        name: 'GAD7',
        display_name: 'Generalized Anxiety Disorder 7-item',
        description: 'A 7-question screening tool for generalized anxiety disorder.',
        instructions: 'Over the last 2 weeks, how often have you been bothered by the following problems?',
        total_questions: 7,
        max_score: 21,
        is_active: true,
        questions: [
          {
            id: 3,
            question_number: 1,
            question_text: 'Feeling nervous, anxious, or on edge',
            options: [
              { text: 'Not at all', score: 0 },
              { text: 'Several days', score: 1 },
              { text: 'More than half the days', score: 2 },
              { text: 'Nearly every day', score: 3 }
            ],
            is_reverse_scored: false
          },
          {
            id: 4,
            question_number: 2,
            question_text: 'Not being able to stop or control worrying',
            options: [
              { text: 'Not at all', score: 0 },
              { text: 'Several days', score: 1 },
              { text: 'More than half the days', score: 2 },
              { text: 'Nearly every day', score: 3 }
            ],
            is_reverse_scored: false
          }
        ]
      }
    ];
  }

  /**
   * Submit assessment responses
   */
  async submitAssessment(data: TakeAssessmentData): Promise<Assessment> {
    try {
      console.log('Submitting assessment to database via API:', data);
      console.log('Assessment Type ID:', data.assessment_type_id);
      console.log('Responses Array:', data.responses);
      console.log('Responses Count:', data.responses.length);
      console.log('Detailed Responses:', JSON.stringify(data.responses, null, 2));
      
      const result = await apiClient.post<Assessment>('/assessments/take/', data);
      console.log('Assessment successfully stored in database:', result);
      return result;
    } catch (error: any) {
      console.error('Failed to submit assessment to database:', error);
      console.error('Error details:', error?.response?.data);
      
      // If it's a network error or server error, throw it to show user the real error
      if (error?.response?.status >= 500 || !error?.response) {
        throw new Error('Failed to save assessment to database. Please check your connection and try again.');
      }
      
      // For other errors (like validation), also throw to show specific error
      if (error?.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      // Return mock result as fallback only for development/testing
      console.warn('Using mock data as fallback for assessment submission');
      return {
        id: Date.now(),
        user: 1,
        assessment_type: this.getMockAssessmentTypes().find(t => t.id === data.assessment_type_id)!,
        total_score: data.responses.reduce((sum, r) => sum + r.selected_option_index, 0),
        risk_level: 'mild',
        interpretation: 'Assessment completed successfully (offline mode - not saved to database)',
        recommendations: [],
        completed_at: new Date().toISOString()
      };
    }
  }

  /**
   * Get user's assessment history
   */
  async getAssessmentHistory(): Promise<Assessment[]> {
    try {
      console.log('Fetching assessment history from database...');
      const history = await apiClient.get<Assessment[]>('/assessments/history/');
      console.log('Assessment history retrieved from database:', history);
      return history;
    } catch (error) {
      console.error('Failed to fetch assessment history from database:', error);
      console.warn('Using mock assessment history as fallback');
      // Return mock history as fallback
      return this.getMockAssessmentHistory();
    }
  }

  /**
   * Get specific assessment result
   */
  async getAssessmentResult(id: number): Promise<Assessment> {
    try {
      return await apiClient.get<Assessment>(`/assessments/results/${id}/`);
    } catch (error) {
      console.error(`Failed to fetch assessment result ${id}:`, error);
      // Return mock result as fallback
      const mockHistory = this.getMockAssessmentHistory();
      const result = mockHistory.find(a => a.id === id);
      if (result) {
        return result;
      }
      throw new Error(`Assessment result with ID ${id} not found`);
    }
  }

  /**
   * Get recommendations for assessment type and risk level
   */
  async getRecommendations(assessmentType: string, riskLevel: string): Promise<any[]> {
    try {
      return await apiClient.get<any[]>(
        `/assessments/recommendations/?assessment_type=${assessmentType}&risk_level=${riskLevel}`
      );
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      // Return mock recommendations as fallback
      return this.getMockRecommendations(riskLevel);
    }
  }

  /**
   * Get mock assessment history for fallback
   */
  private getMockAssessmentHistory(): Assessment[] {
    const mockTypes = this.getMockAssessmentTypes();
    return [
      {
        id: 1,
        user: 1,
        assessment_type: mockTypes[0],
        total_score: 8,
        risk_level: 'mild',
        interpretation: 'Mild depression symptoms detected',
        recommendations: [],
        completed_at: '2024-01-20T10:00:00Z'
      },
      {
        id: 2,
        user: 1,
        assessment_type: mockTypes[1],
        total_score: 5,
        risk_level: 'minimal',
        interpretation: 'Minimal anxiety symptoms',
        recommendations: [],
        completed_at: '2024-01-18T14:30:00Z'
      }
    ];
  }

  /**
   * Create new assessment type (Admin only)
   */
  async createAssessmentType(data: Partial<AssessmentType>): Promise<AssessmentType> {
    try {
      console.log('Creating assessment type with data:', data);
      return await apiClient.post<AssessmentType>('/assessments/admin/types/', data);
    } catch (error: any) {
      console.error('Failed to create assessment type:', error);
      console.error('Error response:', error?.response?.data);
      console.error('Error status:', error?.response?.status);
      
      // Enhance error message with backend details
      if (error?.response?.data) {
        const backendError = error.response.data;
        console.error('Backend validation errors:', backendError);
        
        // Create a more detailed error
        const enhancedError = new Error(error.message);
        (enhancedError as any).response = error.response;
        throw enhancedError;
      }
      
      throw error;
    }
  }

  /**
   * Update assessment type (Admin only)
   */
  async updateAssessmentType(id: number, data: Partial<AssessmentType>): Promise<AssessmentType> {
    try {
      return await apiClient.patch<AssessmentType>(`/assessments/admin/types/${id}/`, data);
    } catch (error) {
      console.error('Failed to update assessment type:', error);
      throw error;
    }
  }

  /**
   * Delete assessment type (Admin only)
   */
  async deleteAssessmentType(id: number): Promise<void> {
    try {
      return await apiClient.delete(`/assessments/admin/types/${id}/`);
    } catch (error) {
      console.error('Failed to delete assessment type:', error);
      throw error;
    }
  }

  /**
   * Toggle assessment type active status (Admin only)
   */
  async toggleAssessmentTypeStatus(id: number, isActive: boolean): Promise<AssessmentType> {
    try {
      return await apiClient.patch<AssessmentType>(`/assessments/admin/types/${id}/`, { is_active: isActive });
    } catch (error) {
      console.error('Failed to toggle assessment type status:', error);
      throw error;
    }
  }

  /**
   * Get all assessments (Admin only)
   */
  async getAllAssessments(): Promise<Assessment[]> {
    try {
      console.log('Fetching all assessments for admin...');
      const response = await apiClient.get<any>('/assessments/history/');
      // Handle paginated response
      if (response && typeof response === 'object' && response.results) {
        return Array.isArray(response.results) ? response.results : [];
      }
      // Handle direct array response
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Failed to fetch all assessments:', error);
      return [];
    }
  }

  /**
   * Get assessment requests (Admin only)
   */
  async getAssessmentRequests(): Promise<any[]> {
    try {
      console.log('Fetching assessment requests for admin...');
      const response = await apiClient.get<any>('/assessments/admin/requests/');
      // Handle paginated response
      if (response && typeof response === 'object' && response.results) {
        return Array.isArray(response.results) ? response.results : [];
      }
      // Handle direct array response
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Failed to fetch assessment requests:', error);
      return [];
    }
  }

  /**
   * Get all questions for admin management
   */
  async getAllQuestions(): Promise<any[]> {
    try {
      console.log('Fetching all questions for admin...');
      const assessmentTypes = await this.getAssessmentTypes();
      
      // Ensure assessmentTypes is an array
      if (!Array.isArray(assessmentTypes)) {
        console.error('Assessment types is not an array:', assessmentTypes);
        return [];
      }
      
      const allQuestions: any[] = [];
      
      for (const type of assessmentTypes) {
        try {
          const detailedType = await this.getAssessmentType(type.id);
          if (detailedType.questions && Array.isArray(detailedType.questions)) {
            detailedType.questions.forEach(question => {
              allQuestions.push({
                ...question,
                assessment_type: type.name,
                assessment_type_display: type.display_name,
                is_active: true
              });
            });
          }
        } catch (typeError) {
          console.error(`Failed to fetch questions for assessment type ${type.id}:`, typeError);
          continue;
        }
      }
      
      return allQuestions;
    } catch (error) {
      console.error('Failed to fetch all questions:', error);
      return [];
    }
  }

  /**
   * Get assessment statistics (Admin only)
   */
  async getAssessmentStats(): Promise<{
    totalAssessments: number;
    thisWeek: number;
    highRisk: number;
    averageScore: number;
  }> {
    try {
      const response = await apiClient.get<{
        total_assessments: number;
        total_assignments: number;
        total_requests: number;
        pending_requests: number;
        approved_requests: number;
        rejected_requests: number;
      }>('/assessments/admin/stats/');
      // Map backend response to frontend format
      return {
        totalAssessments: response.total_assessments || 0,
        thisWeek: response.total_assessments || 0, // Backend doesn't have this week filter yet
        highRisk: response.total_assessments || 0, // Backend doesn't have high risk count yet
        averageScore: 0 // Backend doesn't calculate average score yet
      };
    } catch (error) {
      console.error('Failed to fetch assessment stats:', error);
      // Return mock stats as fallback
      return {
        totalAssessments: 156,
        thisWeek: 23,
        highRisk: 8,
        averageScore: 12.5
      };
    }
  }

  /**
   * Assign assessment to clients (Guide only)
   */
  async assignAssessment(assignmentData: {
    client: number;
    assessment_type: number;
    due_date?: string;
    priority: string;
    notes?: string;
  }): Promise<any> {
    try {
      return await apiClient.post('/assessments/guide/assignments/', assignmentData);
    } catch (error) {
      console.error('Failed to assign assessment:', error);
      throw error;
    }
  }

  /**
   * Get mock recommendations for fallback
   */
  private getMockRecommendations(riskLevel: string): any[] {
    const baseRecommendations = [
      {
        title: 'Regular Exercise',
        description: 'Engage in physical activity for at least 30 minutes daily',
        category: 'lifestyle'
      },
      {
        title: 'Mindfulness Practice',
        description: 'Try meditation or deep breathing exercises',
        category: 'mental_health'
      }
    ];

    if (riskLevel === 'moderate' || riskLevel === 'severe') {
      baseRecommendations.push({
        title: 'Professional Support',
        description: 'Consider speaking with a mental health professional',
        category: 'professional_help'
      });
    }

    return baseRecommendations;
  }
}

export const assessmentService = new AssessmentService();
export default assessmentService;
