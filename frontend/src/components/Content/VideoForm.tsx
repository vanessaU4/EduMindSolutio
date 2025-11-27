import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Upload, Save, Play, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { VideoFormData } from '@/services/contentService';
import { DIFFICULTY_LEVEL_OPTIONS } from '@/constants/categories';


interface VideoFormProps {
  initialData?: Partial<VideoFormData>;
  onSubmit: (data: VideoFormData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

const VideoForm: React.FC<VideoFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [durationInput, setDurationInput] = useState({ minutes: 0, seconds: 0 });
  
  const [formData, setFormData] = useState<VideoFormData>({
    title: '',
    description: '',
    video_url: '',
    thumbnail_image: null,
    duration_seconds: 0,
    tags: [],
    difficulty_level: 'beginner',
    is_published: false,
    is_featured: false,
    ...initialData
  });


  useEffect(() => {
    // Convert duration_seconds to minutes and seconds for display
    const minutes = Math.floor(formData.duration_seconds / 60);
    const seconds = formData.duration_seconds % 60;
    setDurationInput({ minutes, seconds });
  }, [formData.duration_seconds]);

  const handleInputChange = (field: keyof VideoFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDurationChange = (type: 'minutes' | 'seconds', value: number) => {
    const newDuration = { ...durationInput, [type]: value };
    setDurationInput(newDuration);
    const totalSeconds = newDuration.minutes * 60 + newDuration.seconds;
    handleInputChange('duration_seconds', totalSeconds);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleThumbnailUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive"
        });
        return;
      }
      setFormData(prev => ({ ...prev, thumbnail_image: file }));
    }
  };

  const validateVideoUrl = (url: string): boolean => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\/.+/;
    const directVideoRegex = /^https?:\/\/.+\.(mp4|webm|ogg|mov|avi)$/i;
    
    return youtubeRegex.test(url) || vimeoRegex.test(url) || directVideoRegex.test(url);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🎬 VideoForm: Submitting form with data:', formData);
    
    if (!formData.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for the video",
        variant: "destructive"
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Description required",
        description: "Please enter a description for the video",
        variant: "destructive"
      });
      return;
    }

    if (!formData.video_url.trim()) {
      toast({
        title: "Video URL required",
        description: "Please enter a video URL",
        variant: "destructive"
      });
      return;
    }

    if (!validateVideoUrl(formData.video_url)) {
      toast({
        title: "Invalid video URL",
        description: "Please enter a valid YouTube, Vimeo, or direct video URL",
        variant: "destructive"
      });
      return;
    }


    if (formData.duration_seconds <= 0) {
      toast({
        title: "Duration required",
        description: "Please enter a valid video duration (must be greater than 0 seconds)",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      toast({
        title: "Success",
        description: `Video ${isEditing ? 'updated' : 'created'} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save video",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {isEditing ? 'Edit Video' : 'Add New Video'}
            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Video'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter video title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe what this video covers..."
                rows={4}
                required
              />
            </div>

            {/* Video URL */}
            <div className="space-y-2">
              <Label htmlFor="video_url">Video URL *</Label>
              <Input
                id="video_url"
                value={formData.video_url}
                onChange={(e) => handleInputChange('video_url', e.target.value)}
                placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                required
              />
              <div className="text-sm text-gray-500">
                Supported: YouTube, Vimeo, or direct video file URLs
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label>Duration *</Label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="999"
                    value={durationInput.minutes}
                    onChange={(e) => handleDurationChange('minutes', parseInt(e.target.value) || 0)}
                    className="w-20"
                  />
                  <span className="text-sm text-gray-600">minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={durationInput.seconds}
                    onChange={(e) => handleDurationChange('seconds', parseInt(e.target.value) || 0)}
                    className="w-20"
                  />
                  <span className="text-sm text-gray-600">seconds</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Total: {formatDuration(formData.duration_seconds)}</span>
                </div>
              </div>
            </div>

            {/* Difficulty Level */}
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select
                value={formData.difficulty_level}
                onValueChange={(value) => handleInputChange('difficulty_level', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Thumbnail Image */}
            <div className="space-y-2">
              <Label htmlFor="thumbnail_image">Thumbnail Image</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="thumbnail_image"
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  className="flex-1"
                />
                <Button type="button" variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
              </div>
              {formData.thumbnail_image && (
                <div className="text-sm text-gray-600">
                  Selected: {formData.thumbnail_image.name}
                </div>
              )}
              <div className="text-sm text-gray-500">
                Optional: Upload a custom thumbnail or leave blank to use video platform's thumbnail
              </div>
            </div>

            {/* Publishing Options */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium">Publishing Options</h3>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="is_published">Published</Label>
                  <p className="text-sm text-gray-600">Make this video visible to users</p>
                </div>
                <Switch
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => handleInputChange('is_published', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="is_featured">Featured</Label>
                  <p className="text-sm text-gray-600">Show this video in featured content</p>
                </div>
                <Switch
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
                />
              </div>
            </div>

            {/* Video Preview Info */}
            {formData.video_url && (
              <div className="flex items-center gap-2 text-sm text-gray-600 p-3 bg-blue-50 rounded-lg">
                <Play className="w-4 h-4" />
                <span>Video URL: {formData.video_url}</span>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoForm;
