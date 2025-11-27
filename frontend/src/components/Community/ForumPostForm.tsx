import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Save, MessageSquare } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { communityService, ForumCategory } from '@/services/communityService';
import { extractArrayFromResponse } from '@/services/contentService';

interface ForumPostFormData {
  title: string;
  content: string;
  category: number | null;
  is_anonymous: boolean;
  is_pinned: boolean;
  is_locked: boolean;
  is_approved: boolean;
  author_mood?: string;
}

interface ForumPostFormProps {
  onSubmit: (data: ForumPostFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<ForumPostFormData>;
  isEditing?: boolean;
}

const ForumPostForm: React.FC<ForumPostFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<ForumPostFormData>({
    title: '',
    content: '',
    category: null,
    is_anonymous: false,
    is_pinned: false,
    is_locked: false,
    is_approved: true,
    author_mood: '',
    ...initialData
  });

  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await communityService.getForumCategories();
        const categoriesArray = extractArrayFromResponse(response);
        setCategories(categoriesArray.filter(cat => cat.is_active));
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        toast({
          title: "Error loading categories",
          description: "Failed to load forum categories. Please refresh the page.",
          variant: "destructive"
        });
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, [toast]);

  const handleInputChange = (field: keyof ForumPostFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || formData.title.trim().length < 5) {
      toast({
        title: "Validation Error",
        description: "Title must be at least 5 characters long.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.content.trim() || formData.content.trim().length < 10) {
      toast({
        title: "Validation Error",
        description: "Content must be at least 10 characters long.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.category) {
      toast({
        title: "Validation Error",
        description: "Please select a category.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } catch (error: any) {
      console.error('Error submitting form:', error);
      
      // Handle specific validation errors
      if (error?.response?.data) {
        const errorData = error.response.data;
        if (errorData.title && Array.isArray(errorData.title)) {
          toast({
            title: "Validation Error",
            description: errorData.title[0],
            variant: "destructive"
          });
        } else if (errorData.content && Array.isArray(errorData.content)) {
          toast({
            title: "Validation Error",
            description: errorData.content[0],
            variant: "destructive"
          });
        } else if (errorData.category && Array.isArray(errorData.category)) {
          toast({
            title: "Validation Error",
            description: errorData.category[0],
            variant: "destructive"
          });
        } else if (errorData.error) {
          toast({
            title: "Error",
            description: errorData.error,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to create post. Please check your input and try again.",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to create post. Please check your connection and try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const moodOptions = [
    { value: 'struggling', label: '😰 Struggling' },
    { value: 'neutral', label: '😐 Neutral' },
    { value: 'hopeful', label: '🌟 Hopeful' },
    { value: 'positive', label: '😊 Positive' }
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <CardTitle>{isEditing ? 'Edit Forum Post' : 'Create New Forum Post'}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {isEditing ? 'Update the forum post details' : 'Share your thoughts with the community'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter post title..."
              className="w-full"
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Write your post content..."
              className="w-full min-h-32"
              rows={6}
            />
          </div>

          {/* Category and Mood */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category?.toString() || ''}
                onValueChange={(value) => handleInputChange('category', parseInt(value))}
                disabled={categoriesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select a category"} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mood">Author Mood</Label>
              <Select
                value={formData.author_mood || ''}
                onValueChange={(value) => handleInputChange('author_mood', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your mood (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {moodOptions.map((mood) => (
                    <SelectItem key={mood.value} value={mood.value}>
                      {mood.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Post Settings */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Post Settings</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="anonymous">Anonymous Post</Label>
                  <p className="text-sm text-gray-600">Hide your identity from other users</p>
                </div>
                <Switch
                  id="anonymous"
                  checked={formData.is_anonymous}
                  onCheckedChange={(checked) => handleInputChange('is_anonymous', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="approved">Approved</Label>
                  <p className="text-sm text-gray-600">Post is approved for public viewing</p>
                </div>
                <Switch
                  id="approved"
                  checked={formData.is_approved}
                  onCheckedChange={(checked) => handleInputChange('is_approved', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="pinned">Pinned</Label>
                  <p className="text-sm text-gray-600">Pin this post to the top</p>
                </div>
                <Switch
                  id="pinned"
                  checked={formData.is_pinned}
                  onCheckedChange={(checked) => handleInputChange('is_pinned', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="locked">Locked</Label>
                  <p className="text-sm text-gray-600">Prevent new comments</p>
                </div>
                <Switch
                  id="locked"
                  checked={formData.is_locked}
                  onCheckedChange={(checked) => handleInputChange('is_locked', checked)}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Post' : 'Create Post'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ForumPostForm;
