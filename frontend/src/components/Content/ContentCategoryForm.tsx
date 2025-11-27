import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Save, Folder, Palette, Hash } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ContentCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  parent_category?: number | null;
  order: number;
  is_active: boolean;
}

interface ContentCategoryFormData {
  name: string;
  description: string;
  icon: string;
  color: string;
  parent_category: number | null;
  order: number;
  is_active: boolean;
}

interface ContentCategoryFormProps {
  initialData?: Partial<ContentCategoryFormData>;
  onSubmit: (data: ContentCategoryFormData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
  existingCategories?: ContentCategory[];
}

const ContentCategoryForm: React.FC<ContentCategoryFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
  existingCategories = []
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<ContentCategoryFormData>({
    name: '',
    description: '',
    icon: '',
    color: '',
    parent_category: null,
    order: 0,
    is_active: true,
    ...initialData
  });

  // Popular Lucide icons for mental health content
  const iconOptions = [
    { value: 'brain', label: 'Brain', icon: '🧠' },
    { value: 'heart', label: 'Heart', icon: '❤️' },
    { value: 'user', label: 'User', icon: '👤' },
    { value: 'users', label: 'Users', icon: '👥' },
    { value: 'book-open', label: 'Book Open', icon: '📖' },
    { value: 'headphones', label: 'Headphones', icon: '🎧' },
    { value: 'video', label: 'Video', icon: '📹' },
    { value: 'mic', label: 'Microphone', icon: '🎤' },
    { value: 'shield', label: 'Shield', icon: '🛡️' },
    { value: 'sun', label: 'Sun', icon: '☀️' },
    { value: 'moon', label: 'Moon', icon: '🌙' },
    { value: 'star', label: 'Star', icon: '⭐' },
    { value: 'leaf', label: 'Leaf', icon: '🍃' },
    { value: 'flower', label: 'Flower', icon: '🌸' },
    { value: 'compass', label: 'Compass', icon: '🧭' },
    { value: 'lightbulb', label: 'Lightbulb', icon: '💡' },
    { value: 'target', label: 'Target', icon: '🎯' },
    { value: 'zap', label: 'Zap', icon: '⚡' },
    { value: 'activity', label: 'Activity', icon: '📊' },
    { value: 'trending-up', label: 'Trending Up', icon: '📈' },
  ];

  // Tailwind CSS color classes
  const colorOptions = [
    { value: 'blue', label: 'Blue', class: 'bg-blue-100 text-blue-600', preview: 'bg-blue-500' },
    { value: 'green', label: 'Green', class: 'bg-green-100 text-green-600', preview: 'bg-green-500' },
    { value: 'purple', label: 'Purple', class: 'bg-purple-100 text-purple-600', preview: 'bg-purple-500' },
    { value: 'orange', label: 'Orange', class: 'bg-orange-100 text-orange-600', preview: 'bg-orange-500' },
    { value: 'red', label: 'Red', class: 'bg-red-100 text-red-600', preview: 'bg-red-500' },
    { value: 'yellow', label: 'Yellow', class: 'bg-yellow-100 text-yellow-600', preview: 'bg-yellow-500' },
    { value: 'pink', label: 'Pink', class: 'bg-pink-100 text-pink-600', preview: 'bg-pink-500' },
    { value: 'indigo', label: 'Indigo', class: 'bg-indigo-100 text-indigo-600', preview: 'bg-indigo-500' },
    { value: 'teal', label: 'Teal', class: 'bg-teal-100 text-teal-600', preview: 'bg-teal-500' },
    { value: 'gray', label: 'Gray', class: 'bg-gray-100 text-gray-600', preview: 'bg-gray-500' },
  ];

  useEffect(() => {
    // Set default order to be the next available order
    if (!isEditing && existingCategories.length > 0) {
      const maxOrder = Math.max(...existingCategories.map(cat => cat.order));
      setFormData(prev => ({ ...prev, order: maxOrder + 1 }));
    }
  }, [existingCategories, isEditing]);

  const handleInputChange = (field: keyof ContentCategoryFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getSelectedIcon = () => {
    return iconOptions.find(icon => icon.value === formData.icon);
  };

  const getSelectedColor = () => {
    return colorOptions.find(color => color.value === formData.color);
  };

  const getParentCategories = () => {
    // Only show top-level categories as potential parents to avoid circular references
    return existingCategories.filter(cat => !cat.parent_category);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for the category",
        variant: "destructive"
      });
      return;
    }

    // Check for duplicate names
    const duplicateName = existingCategories.find(cat => 
      cat.name.toLowerCase() === formData.name.toLowerCase().trim() && 
      (!isEditing || cat.id !== (initialData as any)?.id)
    );
    
    if (duplicateName) {
      toast({
        title: "Duplicate name",
        description: "A category with this name already exists",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      toast({
        title: "Success",
        description: `Category ${isEditing ? 'updated' : 'created'} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save category",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {isEditing ? 'Edit Content Category' : 'Create New Content Category'}
            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Category'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-2">
              <Label htmlFor="name">Category Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter category name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe what content belongs in this category..."
                rows={3}
              />
            </div>

            {/* Visual Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="icon">Icon</Label>
                <Select
                  value={formData.icon}
                  onValueChange={(value) => handleInputChange('icon', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an icon">
                      {getSelectedIcon() && (
                        <span className="flex items-center gap-2">
                          <span>{getSelectedIcon()?.icon}</span>
                          {getSelectedIcon()?.label}
                        </span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {iconOptions.map((icon) => (
                      <SelectItem key={icon.value} value={icon.value}>
                        <span className="flex items-center gap-2">
                          <span>{icon.icon}</span>
                          {icon.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Color Theme</Label>
                <Select
                  value={formData.color}
                  onValueChange={(value) => handleInputChange('color', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a color">
                      {getSelectedColor() && (
                        <span className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded ${getSelectedColor()?.preview}`}></div>
                          {getSelectedColor()?.label}
                        </span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <span className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded ${color.preview}`}></div>
                          {color.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Category Preview */}
            {(formData.name || formData.icon || formData.color) && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Preview</Label>
                <div className="flex items-center gap-3">
                  {formData.icon && formData.color && (
                    <div className={`w-10 h-10 rounded-lg ${getSelectedColor()?.class} flex items-center justify-center`}>
                      <span className="text-lg">{getSelectedIcon()?.icon}</span>
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{formData.name || 'Category Name'}</div>
                    {formData.description && (
                      <div className="text-sm text-gray-600">{formData.description}</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Hierarchy and Organization */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parent_category">Parent Category</Label>
                <Select
                  value={formData.parent_category?.toString() || ''}
                  onValueChange={(value) => handleInputChange('parent_category', value ? parseInt(value) : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="None (Top Level)">
                      {formData.parent_category && (
                        <span className="flex items-center gap-2">
                          <Folder className="w-4 h-4" />
                          {existingCategories.find(cat => cat.id === formData.parent_category)?.name}
                        </span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None (Top Level)</SelectItem>
                    {getParentCategories().map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        <span className="flex items-center gap-2">
                          <Folder className="w-4 h-4" />
                          {category.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-sm text-gray-500">
                  Leave empty for top-level category
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Display Order</Label>
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-gray-500" />
                  <Input
                    id="order"
                    type="number"
                    min="0"
                    value={formData.order}
                    onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
                <div className="text-sm text-gray-500">
                  Lower numbers appear first
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="is_active">Active Category</Label>
                <p className="text-sm text-gray-600">
                  Active categories are visible and can be used for content
                </p>
              </div>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              />
            </div>

            {/* Category Stats (if editing) */}
            {isEditing && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Category Information</h3>
                <div className="text-sm text-blue-700">
                  <p>This category is currently being used by content in the system.</p>
                  <p>Changes to the name and organization will be reflected across all associated content.</p>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentCategoryForm;
