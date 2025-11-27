import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/ui/toast';
import {
  AssessmentCenter,
  UserAssessmentDashboard,
  GuideAssessmentManagement,
  AdminAssessmentOversight,
  TakeAssessment
} from '@/pages/Assessment';

// Mock user contexts for different roles
const mockUserContext = (role: 'user' | 'guide' | 'admin') => ({
  user: {
    id: 1,
    email: `test-${role}@example.com`,
    username: `test-${role}`,
    role: role,
    first_name: 'Test',
    last_name: 'User'
  },
  isAuthenticated: true,
  login: jest.fn(),
  logout: jest.fn(),
  loading: false
});

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode; userRole: 'user' | 'guide' | 'admin' }> = ({ 
  children, 
  userRole 
}) => (
  <BrowserRouter>
    <AuthProvider value={mockUserContext(userRole)}>
      <ToastProvider>
        {children}
      </ToastProvider>
    </AuthProvider>
  </BrowserRouter>
);

describe('Assessment Workflow Tests', () => {
  // Mock API responses
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          assessment_types: [
            {
              id: 1,
              name: 'PHQ9',
              display_name: 'Depression Screening (PHQ-9)',
              description: 'Patient Health Questionnaire-9',
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
                }
              ]
            }
          ],
          assessments: [
            {
              id: 1,
              user: 1,
              assessment_type: {
                id: 1,
                name: 'PHQ9',
                display_name: 'Depression Screening (PHQ-9)',
                max_score: 27
              },
              total_score: 8,
              risk_level: 'mild',
              interpretation: 'Mild depression symptoms',
              recommendations: [],
              completed_at: '2024-01-20T10:00:00Z'
            }
          ]
        }),
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('User Role Assessment Workflow', () => {
    test('User can access assessment center and dashboard', async () => {
      render(
        <TestWrapper userRole="user">
          <AssessmentCenter />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Assessment Center')).toBeInTheDocument();
        expect(screen.getByText('My Dashboard')).toBeInTheDocument();
      });
    });

    test('User dashboard displays personalized content', async () => {
      render(
        <TestWrapper userRole="user">
          <UserAssessmentDashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Your Mental Health Journey')).toBeInTheDocument();
        expect(screen.getByText('Available Assessments')).toBeInTheDocument();
      });
    });

    test('User can start taking an assessment', async () => {
      // Mock useParams to return assessment ID
      jest.mock('react-router-dom', () => ({
        ...jest.requireActual('react-router-dom'),
        useParams: () => ({ id: '1' }),
      }));

      render(
        <TestWrapper userRole="user">
          <TakeAssessment />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Question 1 of')).toBeInTheDocument();
      });
    });
  });

  describe('Guide Role Assessment Workflow', () => {
    test('Guide can access client management interface', async () => {
      render(
        <TestWrapper userRole="guide">
          <AssessmentCenter />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Manage Clients')).toBeInTheDocument();
      });
    });

    test('Guide management dashboard displays client assignments', async () => {
      render(
        <TestWrapper userRole="guide">
          <GuideAssessmentManagement />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Assessment Management')).toBeInTheDocument();
        expect(screen.getByText('Client Assignments')).toBeInTheDocument();
        expect(screen.getByText('Assign Assessment')).toBeInTheDocument();
      });
    });

    test('Guide can assign assessment to client', async () => {
      render(
        <TestWrapper userRole="guide">
          <GuideAssessmentManagement />
        </TestWrapper>
      );

      // Click on assign tab
      fireEvent.click(screen.getByText('Assign Assessment'));

      await waitFor(() => {
        expect(screen.getByLabelText('Client Email *')).toBeInTheDocument();
        expect(screen.getByLabelText('Assessment Type *')).toBeInTheDocument();
      });

      // Fill out assignment form
      fireEvent.change(screen.getByLabelText('Client Email *'), {
        target: { value: 'client@example.com' }
      });

      // Submit assignment
      const assignButton = screen.getByText('Assign Assessment');
      fireEvent.click(assignButton);
    });
  });

  describe('Admin Role Assessment Workflow', () => {
    test('Admin can access system oversight interface', async () => {
      render(
        <TestWrapper userRole="admin">
          <AssessmentCenter />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('System Overview')).toBeInTheDocument();
      });
    });

    test('Admin oversight dashboard displays system metrics', async () => {
      render(
        <TestWrapper userRole="admin">
          <AdminAssessmentOversight />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Assessment Oversight')).toBeInTheDocument();
        expect(screen.getByText('Total Assessments')).toBeInTheDocument();
        expect(screen.getByText('Active Users')).toBeInTheDocument();
        expect(screen.getByText('Risk Level Distribution')).toBeInTheDocument();
      });
    });

    test('Admin can navigate between oversight tabs', async () => {
      render(
        <TestWrapper userRole="admin">
          <AdminAssessmentOversight />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Overview')).toBeInTheDocument();
      });

      // Test tab navigation
      fireEvent.click(screen.getByText('Assessment Types'));
      expect(screen.getByText('Assessment Type Performance')).toBeInTheDocument();

      fireEvent.click(screen.getByText('User Activity'));
      expect(screen.getByText('User Activity Monitoring')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Analytics'));
      expect(screen.getByText('Advanced Analytics')).toBeInTheDocument();
    });
  });

  describe('Role-based Access Control', () => {
    test('User cannot access guide management features', () => {
      render(
        <TestWrapper userRole="user">
          <AssessmentCenter />
        </TestWrapper>
      );

      expect(screen.queryByText('Manage Clients')).not.toBeInTheDocument();
      expect(screen.queryByText('System Overview')).not.toBeInTheDocument();
    });

    test('Guide cannot access admin oversight features', () => {
      render(
        <TestWrapper userRole="guide">
          <AssessmentCenter />
        </TestWrapper>
      );

      expect(screen.queryByText('System Overview')).not.toBeInTheDocument();
      expect(screen.getByText('Manage Clients')).toBeInTheDocument();
    });

    test('Admin has access to all features', async () => {
      render(
        <TestWrapper userRole="admin">
          <AssessmentCenter />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('System Overview')).toBeInTheDocument();
      });
    });
  });

  describe('Assessment Data Flow', () => {
    test('Assessment completion updates user dashboard', async () => {
      // This would test the full flow from taking an assessment to seeing results
      // In a real implementation, this would involve more complex state management
      
      render(
        <TestWrapper userRole="user">
          <UserAssessmentDashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Recent Assessment Results')).toBeInTheDocument();
      });
    });

    test('Guide can view client assessment results', async () => {
      render(
        <TestWrapper userRole="guide">
          <GuideAssessmentManagement />
        </TestWrapper>
      );

      await waitFor(() => {
        // Check for completed assignments
        expect(screen.getByText('Completed')).toBeInTheDocument();
      });
    });

    test('Admin can monitor system-wide assessment trends', async () => {
      render(
        <TestWrapper userRole="admin">
          <AdminAssessmentOversight />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('System Alerts')).toBeInTheDocument();
        expect(screen.getByText('Recent Assessment Activity')).toBeInTheDocument();
      });
    });
  });
});

// Integration test for complete workflow
describe('End-to-End Assessment Workflow', () => {
  test('Complete user assessment journey', async () => {
    // 1. User visits assessment center
    const { rerender } = render(
      <TestWrapper userRole="user">
        <AssessmentCenter />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Assessment Center')).toBeInTheDocument();
    });

    // 2. User navigates to dashboard
    rerender(
      <TestWrapper userRole="user">
        <UserAssessmentDashboard />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Your Mental Health Journey')).toBeInTheDocument();
    });

    // 3. User starts an assessment
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useParams: () => ({ id: '1' }),
    }));

    rerender(
      <TestWrapper userRole="user">
        <TakeAssessment />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Question 1 of')).toBeInTheDocument();
    });

    // Test would continue with assessment completion and result viewing
  });

  test('Complete guide client management workflow', async () => {
    // 1. Guide accesses management interface
    const { rerender } = render(
      <TestWrapper userRole="guide">
        <GuideAssessmentManagement />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Assessment Management')).toBeInTheDocument();
    });

    // 2. Guide assigns assessment
    fireEvent.click(screen.getByText('Assign Assessment'));
    
    await waitFor(() => {
      expect(screen.getByLabelText('Client Email *')).toBeInTheDocument();
    });

    // 3. Guide monitors client progress
    fireEvent.click(screen.getByText('Overview'));
    
    await waitFor(() => {
      expect(screen.getByText('Client Assignments')).toBeInTheDocument();
    });
  });
});

export default AssessmentWorkflowTest;
