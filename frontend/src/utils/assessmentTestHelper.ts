/**
 * Assessment Test Helper
 * Provides utilities for testing assessment functionality
 */

export interface MockAssessmentType {
  id: number;
  name: string;
  display_name: string;
  description: string;
  instructions: string;
  total_questions: number;
  max_score: number;
  is_active: boolean;
  questions: MockAssessmentQuestion[];
}

export interface MockAssessmentQuestion {
  id: number;
  question_number: number;
  question_text: string;
  options: Array<{ text: string; score: number }>;
  is_reverse_scored: boolean;
}

export const mockAssessmentTypes: MockAssessmentType[] = [
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

export const createMockAssessmentService = () => {
  return {
    getAssessmentTypes: () => Promise.resolve(mockAssessmentTypes),
    getAssessmentType: (id: number) => {
      const type = mockAssessmentTypes.find(t => t.id === id);
      return type ? Promise.resolve(type) : Promise.reject(new Error('Assessment type not found'));
    },
    getAssessmentTypeByName: (name: string) => {
      const type = mockAssessmentTypes.find(t => t.name === name);
      return type ? Promise.resolve(type) : Promise.reject(new Error('Assessment type not found'));
    },
    getAssessmentHistory: () => Promise.resolve([]),
    submitAssessment: () => Promise.resolve({
      id: 1,
      user: 1,
      assessment_type: mockAssessmentTypes[0],
      total_score: 8,
      risk_level: 'mild' as const,
      interpretation: 'Mild depression symptoms',
      recommendations: [],
      completed_at: new Date().toISOString()
    })
  };
};

/**
 * Test if assessment endpoints are working
 */
export const testAssessmentEndpoints = async () => {
  const results = {
    getTypes: false,
    getSpecificType: false,
    errors: [] as string[]
  };

  try {
    // Test getting assessment types
    const response = await fetch('http://localhost:8000/api/assessments/types/', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      results.getTypes = true;
      const data = await response.json();
      console.log('Assessment types:', data);
    } else {
      results.errors.push(`Get types failed: ${response.status}`);
    }
  } catch (error) {
    results.errors.push(`Get types error: ${error}`);
  }

  try {
    // Test getting specific assessment type
    const response = await fetch('http://localhost:8000/api/assessments/types/1/', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      results.getSpecificType = true;
      const data = await response.json();
      console.log('Specific assessment type:', data);
    } else {
      results.errors.push(`Get specific type failed: ${response.status}`);
    }
  } catch (error) {
    results.errors.push(`Get specific type error: ${error}`);
  }

  return results;
};
