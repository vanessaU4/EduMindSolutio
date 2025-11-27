import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { 
  ClipboardList, Users, TrendingUp, Activity, Brain, FileText, BarChart3,
  Loader2, AlertCircle, CheckCircle2, AlertTriangle, Plus, Search,
  MoreHorizontal, Eye, Edit, Trash2, Settings, Target, Award, Shield, X, Save
} from 'lucide-react';
import assessmentService, { Assessment, AssessmentType } from '@/services/assessmentService';
import { RoleGuard } from '@/components/RoleGuard';
import { useToast } from '@/hooks/use-toast';
import ErrorBoundary from '@/components/ErrorBoundary';

// Helper function to extract array from paginated response
function extractArrayFromResponse<T>(response: T[] | { results?: T[] }): T[] {
  return Array.isArray(response) ? response : response.results || [];
}

const AssessmentManagement: React.FC = () => {
  const [assessmentTypes, setAssessmentTypes] = useState<AssessmentType[]>([]);
  const [recentAssessments, setRecentAssessments] = useState<Assessment[]>([]);
  const [selectedContentType, setSelectedContentType] = useState<'overview' | 'assessments' | 'results' | 'analytics'>('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<AssessmentType | null>(null);
  const [selectedAssessments, setSelectedAssessments] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    instructions: '',
    is_active: true,
  });
  const [stats, setStats] = useState({
    totalAssessments: 0,
    thisWeek: 0,
    highRisk: 0,
    averageScore: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load assessment types and handle pagination
      const typesResponse = await assessmentService.getAssessmentTypes();
      const types = extractArrayFromResponse(typesResponse);
      setAssessmentTypes(types);
      
      // Load assessment statistics
      const statsData = await assessmentService.getAssessmentStats();
      setStats({
        totalAssessments: statsData.total_assessments || 0,
        thisWeek: statsData.assessments_this_month || 0, // Using monthly data as weekly isn't available
        highRisk: statsData.risk_distribution?.high || 0,
        averageScore: statsData.completion_rate || 0, // Using completion rate as average score isn't available
      });
      
      // Load recent assessments
      const assessmentsResponse = await assessmentService.getAllAssessments();
      const assessments = extractArrayFromResponse(assessmentsResponse);
      setRecentAssessments(assessments.slice(0, 5)); // Show only recent 5
      
    } catch (error) {
      console.error('Failed to load assessment data:', error);
      setAssessmentTypes([]);
      setRecentAssessments([]);
      toast({
        title: 'Error',
        description: 'Failed to load assessment data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContentTypeSelect = (type: 'overview' | 'assessments' | 'results' | 'analytics') => {
    setSelectedContentType(type);
  };

  const getAssessmentIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'phq9':
      case 'depression':
        return <Brain className="w-6 h-6" />;
      case 'gad7':
      case 'anxiety':
        return <Target className="w-6 h-6" />;
      case 'pcl5':
      case 'ptsd':
        return <Shield className="w-6 h-6" />;
      default:
        return <ClipboardList className="w-6 h-6" />;
    }
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      setSaving(true);
      await assessmentService.toggleAssessmentTypeStatus(id, !isActive);
      toast({
        title: 'Success',
        description: `Assessment ${isActive ? 'deactivated' : 'activated'} successfully`,
      });
      await loadData();
    } catch (error: any) {
      console.error('Error toggling assessment status:', error);
      let errorMessage = 'Failed to update assessment status';
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAssessment = async (id: number, assessmentName: string) => {
    // Enhanced confirmation dialog
    const confirmed = window.confirm(
      `⚠️ DELETE ASSESSMENT TYPE\n\n` +
      `Assessment: ${assessmentName}\n\n` +
      `This will permanently delete this assessment type and cannot be undone.\n\n` +
      `⚠️ WARNING: If users have taken this assessment, deletion may be prevented by the system.\n\n` +
      `Are you sure you want to proceed?`
    );
    
    if (!confirmed) return;

    try {
      setSaving(true);
      await assessmentService.deleteAssessmentType(id);
      toast({
        title: '🗑️ Deleted Successfully',
        description: `Assessment type "${assessmentName}" has been permanently deleted`,
      });
      await loadData();
    } catch (error: any) {
      console.error('Error deleting assessment:', error);
      let errorMessage = 'Failed to delete assessment type';
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: '❌ Delete Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedAssessments.length === 0) {
      toast({
        title: 'No Selection',
        description: 'Please select assessments to delete',
        variant: 'destructive',
      });
      return;
    }

    // Filter out standard assessments
    const deletableAssessments = selectedAssessments.filter(id => {
      const assessment = assessmentTypes.find(a => a.id === id);
      return assessment && !assessment.is_standard;
    });

    if (deletableAssessments.length === 0) {
      toast({
        title: 'Cannot Delete',
        description: 'Selected assessments are standard types and cannot be deleted',
        variant: 'destructive',
      });
      return;
    }

    const skippedCount = selectedAssessments.length - deletableAssessments.length;
    const selectedNames = assessmentTypes
      .filter(a => deletableAssessments.includes(a.id))
      .map(a => a.display_name)
      .join(', ');

    const confirmed = window.confirm(
      `⚠️ BULK DELETE ASSESSMENT TYPES\n\n` +
      `Deletable Assessments (${deletableAssessments.length}):\n${selectedNames}\n\n` +
      (skippedCount > 0 ? `⚠️ ${skippedCount} standard assessment(s) will be skipped (cannot delete PHQ9, GAD7, PCL5)\n\n` : '') +
      `This will permanently delete these assessment types and cannot be undone.\n\n` +
      `⚠️ WARNING: Assessments with existing user data may be prevented from deletion.\n\n` +
      `Are you sure you want to proceed?`
    );

    if (!confirmed) return;

    try {
      setSaving(true);
      const deletePromises = deletableAssessments.map(id => 
        assessmentService.deleteAssessmentType(id)
      );
      
      await Promise.all(deletePromises);
      
      toast({
        title: '🗑️ Bulk Delete Successful',
        description: `Successfully deleted ${deletableAssessments.length} assessment types` + 
          (skippedCount > 0 ? ` (${skippedCount} standard assessments skipped)` : ''),
      });
      
      setSelectedAssessments([]);
      await loadData();
    } catch (error: any) {
      console.error('Error in bulk delete:', error);
      toast({
        title: '❌ Bulk Delete Failed',
        description: 'Some assessments could not be deleted. Check individual assessments for details.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSelectAssessment = (id: number) => {
    setSelectedAssessments(prev => 
      prev.includes(id) 
        ? prev.filter(assessmentId => assessmentId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const selectableAssessments = filteredAssessments.filter(a => !a.is_standard);
    const allSelectableSelected = selectableAssessments.every(a => selectedAssessments.includes(a.id));
    
    if (allSelectableSelected) {
      setSelectedAssessments([]);
    } else {
      setSelectedAssessments(selectableAssessments.map(a => a.id));
    }
  };

  const filteredAssessments = assessmentTypes.filter(assessment => 
    assessment.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assessment.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenForm = () => {
    setEditingAssessment(null);
    setFormData({
      name: '',
      display_name: '',
      description: '',
      instructions: '',
      is_active: true,
    });
    setShowForm(true);
  };

  const handleEditAssessment = (assessment: AssessmentType) => {
    setEditingAssessment(assessment);
    setFormData({
      name: assessment.name,
      display_name: assessment.display_name,
      description: assessment.description,
      instructions: assessment.instructions || '',
      is_active: assessment.is_active,
    });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAssessment(null);
    setFormData({
      name: '',
      display_name: '',
      description: '',
      instructions: '',
      is_active: true,
    });
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitForm = async () => {
    if (!formData.display_name.trim() || !formData.description.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    // For new assessments, name is required
    if (!editingAssessment && !formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Assessment name is required for new assessments',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      const cleanedData: any = {
        display_name: formData.display_name.trim(),
        description: formData.description.trim(),
        instructions: formData.instructions.trim() || '',
        is_active: formData.is_active,
      };

      // Always include name field - backend will handle validation for standard assessments
      if (formData.name.trim()) {
        cleanedData.name = formData.name.trim();
      }

      // Add default values for new assessments
      if (!editingAssessment) {
        cleanedData.total_questions = 0;
        cleanedData.max_score = 0;
      }

      console.log('Submitting assessment data:', cleanedData);
      console.log('Is editing standard assessment:', editingAssessment?.is_standard);

      if (editingAssessment) {
        await assessmentService.updateAssessmentType(editingAssessment.id, cleanedData);
        toast({
          title: 'Success',
          description: 'Assessment type updated successfully',
        });
      } else {
        await assessmentService.createAssessmentType(cleanedData);
        toast({
          title: 'Success',
          description: 'Assessment type created successfully',
        });
      }
      
      handleCloseForm();
      await loadData();
    } catch (error: any) {
      console.error('Error submitting form:', error);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      
      let errorMessage = editingAssessment ? 'Failed to update assessment type' : 'Failed to create assessment type';
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        console.error('Backend error data:', errorData);
        
        // Handle different error response formats
        if (errorData.name && Array.isArray(errorData.name)) {
          errorMessage = `Name: ${errorData.name[0]}`;
        } else if (errorData.display_name && Array.isArray(errorData.display_name)) {
          errorMessage = `Display Name: ${errorData.display_name[0]}`;
        } else if (errorData.description && Array.isArray(errorData.description)) {
          errorMessage = `Description: ${errorData.description[0]}`;
        } else if (errorData.instructions && Array.isArray(errorData.instructions)) {
          errorMessage = `Instructions: ${errorData.instructions[0]}`;
        } else if (errorData.total_questions && Array.isArray(errorData.total_questions)) {
          errorMessage = `Total Questions: ${errorData.total_questions[0]}`;
        } else if (errorData.max_score && Array.isArray(errorData.max_score)) {
          errorMessage = `Max Score: ${errorData.max_score[0]}`;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (typeof errorData === 'object') {
          // Try to extract any validation errors
          const errors = [];
          for (const [field, fieldErrors] of Object.entries(errorData)) {
            if (Array.isArray(fieldErrors)) {
              errors.push(`${field}: ${fieldErrors[0]}`);
            } else if (typeof fieldErrors === 'string') {
              errors.push(`${field}: ${fieldErrors}`);
            }
          }
          if (errors.length > 0) {
            errorMessage = errors.join(', ');
          }
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'minimal':
        return 'bg-green-100 text-green-800';
      case 'mild':
        return 'bg-blue-100 text-blue-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'moderately_severe':
        return 'bg-orange-100 text-orange-800';
      case 'severe':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevelIcon = (level: string) => {
    switch (level) {
      case 'minimal':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'mild':
      case 'moderate':
        return <AlertCircle className="w-4 h-4" />;
      case 'moderately_severe':
      case 'severe':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-healthcare-primary" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <RoleGuard requireModeration>
        <div className="container mx-auto px-4 py-8 pt-16 sm:pt-20 md:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="mb-8 mt-4 sm:mt-6 md:mt-8">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                    Assessment Management
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Monitor and manage mental health assessments with professional tools
                  </p>
                </div>
                <Button 
                  onClick={handleOpenForm}
                  className="bg-healthcare-primary hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Assessment
                </Button>
              </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-blue-600 font-medium">Total</p>
                      <p className="text-2xl font-bold text-blue-900">{stats.totalAssessments}</p>
                    </div>
                    <div className="p-2 bg-blue-200 rounded-lg">
                      <ClipboardList className="w-4 h-4 text-blue-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-green-600 font-medium">This Week</p>
                      <p className="text-2xl font-bold text-green-900">{stats.thisWeek}</p>
                    </div>
                    <div className="p-2 bg-green-200 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-green-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-red-600 font-medium">High Risk</p>
                      <p className="text-2xl font-bold text-red-900">{stats.highRisk}</p>
                    </div>
                    <div className="p-2 bg-red-200 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-red-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-purple-600 font-medium">Types</p>
                      <p className="text-2xl font-bold text-purple-900">{assessmentTypes.length}</p>
                    </div>
                    <div className="p-2 bg-purple-200 rounded-lg">
                      <Brain className="w-4 h-4 text-purple-700" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>


            {/* Search and Actions */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search assessments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {/* Bulk Actions */}
                {selectedAssessments.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {selectedAssessments.length} selected
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkDelete}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      disabled={saving}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Selected ({selectedAssessments.length})
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedAssessments([])}
                    >
                      Clear Selection
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {filteredAssessments.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="text-xs"
                  >
                    {(() => {
                      const selectableAssessments = filteredAssessments.filter(a => !a.is_standard);
                      const allSelectableSelected = selectableAssessments.every(a => selectedAssessments.includes(a.id));
                      return allSelectableSelected ? 'Deselect All' : `Select All Deletable (${selectableAssessments.length})`;
                    })()}
                  </Button>
                )}
                <Button 
                  onClick={handleOpenForm}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Assessment Type
                </Button>
              </div>
            </div>

            {/* Assessment Types Grid */}
            {filteredAssessments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No Assessment Types Found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm ? 'No assessments match your search.' : 'Get started by adding your first assessment type.'}
                  </p>
                  {!searchTerm && (
                    <Button className="bg-healthcare-primary hover:bg-blue-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Assessment
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredAssessments.map((assessment) => (
                  <Card key={assessment.id} className={`hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-200 ${selectedAssessments.includes(assessment.id) ? 'border-blue-400 bg-blue-50' : ''}`}>
                    <CardContent className="p-4">
                      {/* Selection Checkbox */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedAssessments.includes(assessment.id)}
                            onChange={() => handleSelectAssessment(assessment.id)}
                            disabled={assessment.is_standard}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                          />
                          {assessment.is_standard && (
                            <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                              Protected
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {assessment.is_standard ? 'Cannot delete standard' : 'Select for bulk actions'}
                        </span>
                      </div>
                      
                      {/* Header with Icon and Status */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                          {getAssessmentIcon(assessment.name)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={assessment.is_active ? 'default' : 'secondary'} className="text-xs">
                            {assessment.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-3 w-3" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditAssessment(assessment)}>
                                <Edit className="mr-2 h-3 w-3" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleActive(assessment.id, assessment.is_active)}>
                                <Settings className="mr-2 h-3 w-3" />
                                {assessment.is_active ? 'Deactivate' : 'Activate'}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={assessment.is_standard ? undefined : () => handleDeleteAssessment(assessment.id, assessment.display_name)}
                                className={assessment.is_standard 
                                  ? "text-gray-400 cursor-not-allowed opacity-50" 
                                  : "text-red-600 hover:bg-red-50"
                                }
                                disabled={assessment.is_standard}
                              >
                                <Trash2 className="mr-2 h-3 w-3" />
                                {assessment.is_standard ? 'Cannot Delete (Standard)' : 'Delete Permanently'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Assessment Info */}
                      <div className="mb-3">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
                          {assessment.display_name}
                        </h3>
                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                          {assessment.description}
                        </p>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                          <p className="text-lg font-bold text-gray-900">{assessment.total_questions}</p>
                          <p className="text-xs text-gray-600">Questions</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2 text-center">
                          <p className="text-lg font-bold text-gray-900">{assessment.max_score}</p>
                          <p className="text-xs text-gray-600">Max Score</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-3 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => handleEditAssessment(assessment)}
                        >
                          <Edit className="mr-1 h-3 w-3" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className={assessment.is_standard 
                            ? "text-xs text-gray-400 border-gray-200 cursor-not-allowed opacity-50" 
                            : "text-xs text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                          }
                          onClick={assessment.is_standard ? undefined : () => handleDeleteAssessment(assessment.id, assessment.display_name)}
                          disabled={saving || assessment.is_standard}
                          title={assessment.is_standard ? 'Cannot delete standard assessment types (PHQ9, GAD7, PCL5)' : 'Delete this assessment type'}
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          {assessment.is_standard ? 'Protected' : 'Delete'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Recent Results Section */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Recent Assessment Results</h2>
                <Button variant="outline" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  View All Results
                </Button>
              </div>
              
              {recentAssessments.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Results</h3>
                    <p className="text-gray-600">Assessment results will appear here once users complete assessments.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentAssessments.map((result) => (
                    <Card key={result.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {result.assessment_type.display_name}
                          </h4>
                          <Badge className={getRiskLevelColor(result.risk_level)} variant="secondary">
                            {result.risk_level.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{result.interpretation}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Score: {result.total_score}/{result.assessment_type.max_score}</span>
                          <span>{new Date(result.completed_at).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Popup Form */}
            {showForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Plus className="w-5 h-5 text-blue-600" />
                        {editingAssessment ? 'Edit Assessment Type' : 'Create New Assessment Type'}
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={handleCloseForm}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Assessment Name *
                        </label>
                        {editingAssessment ? (
                          <Input
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="e.g., PHQ9, GAD7, CUSTOM_ASSESSMENT"
                            className="w-full"
                            disabled={editingAssessment?.is_standard}
                          />
                        ) : (
                          <div className="space-y-2">
                            <select
                              value={formData.name}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              className="w-full p-2 border rounded-lg"
                              required
                            >
                              <option value="">Select or enter custom name</option>
                              <option value="PHQ9">PHQ9 - Depression Assessment</option>
                              <option value="GAD7">GAD7 - Anxiety Assessment</option>
                              <option value="PCL5">PCL5 - PTSD Assessment</option>
                              <option value="CUSTOM">Custom Assessment</option>
                            </select>
                            {formData.name === 'CUSTOM' && (
                              <Input
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="Enter custom assessment name (e.g., ANXIETY_SCALE)"
                                className="w-full"
                              />
                            )}
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {editingAssessment?.is_standard 
                            ? "Standard assessment names cannot be changed" 
                            : "Unique identifier for the assessment (alphanumeric and underscores only)"
                          }
                        </p>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Display Name *
                        </label>
                        <Input
                          value={formData.display_name}
                          onChange={(e) => handleInputChange('display_name', e.target.value)}
                          placeholder="e.g., Depression Assessment"
                          className="w-full"
                        />
                        <p className="text-xs text-gray-500 mt-1">Name shown to users (can be the same for multiple assessments)</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Description *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Brief description of what this assessment measures..."
                        className="w-full p-3 border rounded-lg resize-none min-h-[80px]"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Instructions
                      </label>
                      <textarea
                        value={formData.instructions}
                        onChange={(e) => handleInputChange('instructions', e.target.value)}
                        placeholder="Instructions for users taking this assessment..."
                        className="w-full p-3 border rounded-lg resize-none min-h-[100px]"
                        rows={4}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) => handleInputChange('is_active', e.target.checked)}
                        className="rounded"
                      />
                      <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                        Active (available for users to take)
                      </label>
                    </div>

                    <div className="flex space-x-3 pt-4 border-t">
                      <Button
                        onClick={handleSubmitForm}
                        disabled={saving || 
                          (!editingAssessment && !formData.name.trim()) || 
                          !formData.display_name.trim() || 
                          !formData.description.trim()}
                        className="bg-healthcare-primary hover:bg-blue-700"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {saving ? 'Saving...' : editingAssessment ? 'Update Assessment' : 'Create Assessment'}
                      </Button>
                      <Button variant="outline" onClick={handleCloseForm}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        </div>
      </RoleGuard>
    </ErrorBoundary>
  );
};

export default AssessmentManagement;
