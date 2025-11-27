import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Save, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { contentService, AudioContent, AudioFormData } from '@/services/contentService';

interface EditAudioFormProps {
  audio: AudioContent;
  onCancel: () => void;
  onSave: (updatedAudio: AudioContent) => void;
}

const EditAudioForm: React.FC<EditAudioFormProps> = ({ audio, onCancel, onSave }) => {
  const [formData, setFormData] = useState<Partial<AudioFormData>>({
    title: audio.title,
    description: audio.description,
    audio_type: audio.audio_type,
    audio_url: audio.audio_url,
    duration_seconds: audio.duration_seconds,
    tags: audio.tags || [],
    is_published: audio.is_published,
    audio_file: null,
    thumbnail_image: null
  });
  
  const [loading, setLoading] = useState(false);
  const [newTag, setNewTag] = useState('');
  const { toast } = useToast();


  const handleInputChange = (field: keyof AudioFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      audio_file: file
    }));
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      thumbnail_image: file
    }));
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const parseDuration = (timeString: string): number => {
    const parts = timeString.split(':');
    if (parts.length === 2) {
      const minutes = parseInt(parts[0]) || 0;
      const seconds = parseInt(parts[1]) || 0;
      return minutes * 60 + seconds;
    }
    return parseInt(timeString) || 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedAudio = await contentService.updateAudioContent(audio.id, formData);
      toast({
        title: "Success",
        description: "Audio content updated successfully",
      });
      onSave(updatedAudio);
    } catch (error) {
      console.error('Failed to update audio content:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update audio content",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={onCancel} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Content Management
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Audio Content</h1>
          <p className="text-gray-600 mt-2">Update your audio content and settings</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter audio title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your audio content..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="audio-type">Audio Type *</Label>
                  <Select
                    value={formData.audio_type || 'meditation'}
                    onValueChange={(value) => handleInputChange('audio_type', value as AudioFormData['audio_type'])}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meditation">Guided Meditation</SelectItem>
                      <SelectItem value="podcast">Podcast Episode</SelectItem>
                      <SelectItem value="music">Therapeutic Music</SelectItem>
                      <SelectItem value="exercise">Breathing Exercise</SelectItem>
                      <SelectItem value="story">Calming Story</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="duration">Duration (MM:SS) *</Label>
                  <Input
                    id="duration"
                    value={formatDuration(formData.duration_seconds || 0)}
                    onChange={(e) => handleInputChange('duration_seconds', parseDuration(e.target.value))}
                    placeholder="10:30"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="audio-url">Audio URL</Label>
                <Input
                  id="audio-url"
                  value={formData.audio_url || ''}
                  onChange={(e) => handleInputChange('audio_url', e.target.value)}
                  placeholder="https://example.com/audio.mp3 (if using external URL)"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Files & Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="audio-file">Audio File</Label>
                <Input
                  id="audio-file"
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioFileChange}
                />
                {audio.audio_file && (
                  <p className="text-sm text-gray-500 mt-1">
                    Current file: {audio.audio_file.split('/').pop()}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="thumbnail">Thumbnail Image</Label>
                <Input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                />
                {audio.thumbnail_image && (
                  <p className="text-sm text-gray-500 mt-1">
                    Current thumbnail: {audio.thumbnail_image.split('/').pop()}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Categorization & Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category?.toString() || ''}
                  onValueChange={(value) => handleInputChange('category', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
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

              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags?.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
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
                  <Button type="button" onClick={handleAddTag} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Publishing Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="published">Published</Label>
                  <p className="text-sm text-gray-500">Make this audio content visible to users</p>
                </div>
                <Switch
                  id="published"
                  checked={formData.is_published || false}
                  onCheckedChange={(checked) => handleInputChange('is_published', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAudioForm;
