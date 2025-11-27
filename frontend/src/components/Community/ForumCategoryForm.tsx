import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { X, Save, Users } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ForumCategoryFormData {
  name: string;
  description: string;
  icon?: string;
  color?: string;
  is_active: boolean;
  order: number;
}

interface ForumCategoryFormProps {
  onSubmit: (data: ForumCategoryFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<ForumCategoryFormData>;
  isEditing?: boolean;
}

const ForumCategoryForm: React.FC<ForumCategoryFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<ForumCategoryFormData>({
    name: '',
    description: '',
    icon: '',
    color: '#3B82F6',
    is_active: true,
    order: 0,
    ...initialData
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: keyof ForumCategoryFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      toast({
        title: "Validation Error",
        description: "Category name must be at least 2 characters long.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.description.trim() || formData.description.trim().length < 10) {
      toast({
        title: "Validation Error",
        description: "Category description must be at least 10 characters long.",
        variant: "destructive"
      });
      return;
    }

    // Clean the data before sending
    const cleanedData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      icon: formData.icon || '',
      color: formData.color,
      is_active: formData.is_active,
      order: formData.order
    };

    try {
      setIsSubmitting(true);
      await onSubmit(cleanedData);
    } catch (error: any) {
      console.error('Error submitting form:', error);
      
      // Handle specific validation errors
      if (error?.response?.data) {
        const errorData = error.response.data;
        if (errorData.name && Array.isArray(errorData.name)) {
          toast({
            title: "Validation Error",
            description: errorData.name[0],
            variant: "destructive"
          });
        } else if (errorData.description && Array.isArray(errorData.description)) {
          toast({
            title: "Validation Error",
            description: errorData.description[0],
            variant: "destructive"
          });
        } else if (errorData.error) {
          toast({
            title: "Error",
            description: errorData.error,
            variant: "destructive"
          });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const colorOptions = [
    { value: '#3B82F6', label: 'Blue', class: 'bg-blue-500' },
    { value: '#10B981', label: 'Green', class: 'bg-green-500' },
    { value: '#F59E0B', label: 'Yellow', class: 'bg-yellow-500' },
    { value: '#EF4444', label: 'Red', class: 'bg-red-500' },
    { value: '#8B5CF6', label: 'Purple', class: 'bg-purple-500' },
    { value: '#06B6D4', label: 'Cyan', class: 'bg-cyan-500' },
    { value: '#F97316', label: 'Orange', class: 'bg-orange-500' },
    { value: '#84CC16', label: 'Lime', class: 'bg-lime-500' }
  ];

  const iconOptions = [
    { value: 'users', label: '👥 Users' },
    { value: 'heart', label: '❤️ Heart' },
    { value: 'brain', label: '🧠 Brain' },
    { value: 'star', label: '⭐ Star' },
    { value: 'lightbulb', label: '💡 Lightbulb' },
    { value: 'book', label: '📚 Book' },
    { value: 'chat', label: '💬 Chat' },
    { value: 'help', label: '❓ Help' }
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <CardTitle>{isEditing ? 'Edit Forum Category' : 'Create New Forum Category'}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {isEditing ? 'Update the category details' : 'Create a new discussion category'}
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
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Category Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter category name..."
              className="w-full"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe what this category is for..."
              className="w-full"
              rows={3}
            />
          </div>

          {/* Icon and Color */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="icon">Icon</Label>
              <select
                id="icon"
                value={formData.icon}
                onChange={(e) => handleInputChange('icon', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select an icon</option>
                {iconOptions.map((icon) => (
                  <option key={icon.value} value={icon.value}>
                    {icon.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => handleInputChange('color', color.value)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      formData.color === color.value ? 'border-gray-800' : 'border-gray-300'
                    } ${color.class}`}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Order */}
          <div className="space-y-2">
            <Label htmlFor="order">Display Order</Label>
            <Input
              id="order"
              type="number"
              value={formData.order}
              onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 0)}
              placeholder="0"
              className="w-full"
              min="0"
            />
            <p className="text-sm text-gray-600">Lower numbers appear first</p>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="active">Active Category</Label>
              <p className="text-sm text-gray-600">Make this category available for posts</p>
            </div>
            <Switch
              id="active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleInputChange('is_active', checked)}
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Category' : 'Create Category'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ForumCategoryForm;
