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
  is_standard?: boolean;
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
   * Get specific assessment result by ID
   */
  async getAssessmentResult(id: number): Promise<Assessment> {
    try {
      console.log(`Fetching assessment result ${id} from API...`);
      const result = await apiClient.get<Assessment>(`/assessments/results/${id}/`);
      console.log(`Assessment result ${id} fetched successfully:`, result);
      return result;
    } catch (error: any) {
      console.error(`Failed to fetch assessment result ${id}:`, error);
      throw error;
    }
  }

  /**
   * Assign assessment to client (Guide functionality)
   */
  async assignAssessment(assignmentData: {
    client: number;
    assessment_type: number;
    due_date?: string;
    priority: string;
    notes: string;
  }): Promise<any> {
    try {
      console.log('Assigning assessment to client:', assignmentData);
      
      // Validate required fields
      if (!assignmentData.client || !assignmentData.assessment_type) {
        throw new Error('Client and assessment_type are required');
      }
      
      // Log the exact payload being sent
      console.log('Final payload being sent to backend:', JSON.stringify(assignmentData, null, 2));
      
      // Ensure priority is valid
      const validPriorities = ['low', 'medium', 'high'];
      if (!validPriorities.includes(assignmentData.priority)) {
        assignmentData.priority = 'medium'; // Default fallback
      }
      
      const result = await apiClient.post('/assessments/guide/assignments/', assignmentData);
      return result;
    } catch (error: any) {
      console.error('Failed to assign assessment:', error);
      if (error.response?.data) {
        console.error('Backend validation errors:', error.response.data);
      }
      throw error;
    }
  }

  /**
   * Get assessment statistics (Admin only)
   */
  async getAssessmentStats(): Promise<{
    total_assessments: number;
    assessments_this_month: number;
    completion_rate: number;
    popular_assessments: Array<{
      name: string;
      count: number;
    }>;
    assessment_scores: Array<{
      date: string;
      average_score: number;
    }>;
    risk_distribution: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
  }> {
    try {
      console.log('Fetching assessment statistics...');
      const response = await apiClient.get<{
        total_assessments: number;
        assessments_this_month: number;
        completion_rate: number;
        popular_assessments: Array<{
          name: string;
          count: number;
        }>;
        assessment_scores: Array<{
          date: string;
          average_score: number;
        }>;
        risk_distribution: {
          low: number;
          medium: number;
          high: number;
          critical: number;
        };
      }>('/assessments/admin/stats/');
      return response;
    } catch (error) {
      console.error('Failed to fetch assessment statistics:', error);
      // Return default stats if API fails
      return {
        total_assessments: 0,
        assessments_this_month: 0,
        completion_rate: 0,
        popular_assessments: [],
        assessment_scores: [],
        risk_distribution: {
          low: 0,
          medium: 0,
          high: 0,
          critical: 0
        }
      };
    }
  }

  /**
   * Create new assessment type (Admin only)
   */
  async createAssessmentType(data: {
    name: string;
    display_name: string;
    description: string;
    instructions: string;
    is_active: boolean;
    questions?: Array<{
      question_text: string;
      options: Array<{ text: string; score: number }>;
      is_reverse_scored: boolean;
    }>;
  }): Promise<AssessmentType> {
    try {
      console.log('Creating new assessment type:', data);
      const result = await apiClient.post<AssessmentType>('/assessments/admin/types/', data);
      console.log('Assessment type created successfully:', result);
      return result;
    } catch (error: any) {
      console.error('Failed to create assessment type:', error);
      throw error;
    }
  }

  /**
   * Update assessment type (Admin only)
   */
  async updateAssessmentType(id: number, data: {
    name?: string;
    display_name?: string;
    description?: string;
    instructions?: string;
    is_active?: boolean;
    total_questions?: number;
    max_score?: number;
  }): Promise<AssessmentType> {
    try {
      console.log(`Updating assessment type ${id}:`, data);
      const result = await apiClient.patch<AssessmentType>(`/assessments/admin/types/${id}/`, data);
      console.log('Assessment type updated successfully:', result);
      return result;
    } catch (error: any) {
      console.error('Failed to update assessment type:', error);
      throw error;
    }
  }

  /**
   * Delete assessment type (Admin only)
   */
  async deleteAssessmentType(id: number): Promise<void> {
    try {
      console.log(`Deleting assessment type ${id}`);
      await apiClient.delete(`/assessments/admin/types/${id}/`);
      console.log('Assessment type deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete assessment type:', error);
      throw error;
    }
  }

  /**
   * Toggle assessment type active status (Admin only)
   */
  async toggleAssessmentTypeStatus(id: number, isActive: boolean): Promise<AssessmentType> {
    try {
      console.log(`Toggling assessment type ${id} status to ${isActive}`);
      const result = await apiClient.patch<AssessmentType>(`/assessments/admin/types/${id}/`, {
        is_active: isActive
      });
      console.log('Assessment type status updated successfully:', result);
      return result;
    } catch (error: any) {
      console.error('Failed to toggle assessment type status:', error);
      throw error;
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
}

const assessmentService = new AssessmentService();
export default assessmentService;
