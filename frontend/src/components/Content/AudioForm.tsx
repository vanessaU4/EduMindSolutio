import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Upload, Save, Play, Clock, File, Link, Music, Headphones } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { AudioFormData } from '@/services/contentService';
import { AUDIO_TYPE_OPTIONS } from '@/constants/categories';


interface AudioFormProps {
  initialData?: Partial<AudioFormData>;
  onSubmit: (data: AudioFormData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

const AudioForm: React.FC<AudioFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [durationInput, setDurationInput] = useState({ minutes: 0, seconds: 0 });
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  
  const [formData, setFormData] = useState<AudioFormData>({
    title: '',
    description: '',
    audio_type: 'meditation',
    audio_file: null,
    audio_url: '',
    duration_seconds: 1,
    tags: [],
    thumbnail_image: null,
    is_published: false,
    ...initialData
  });

  const audioTypeOptions = [
    { value: 'meditation', label: 'Guided Meditation', icon: '🧘' },
    { value: 'podcast', label: 'Podcast Episode', icon: '🎙️' },
    { value: 'music', label: 'Therapeutic Music', icon: '🎵' },
    { value: 'exercise', label: 'Breathing Exercise', icon: '💨' },
    { value: 'story', label: 'Calming Story', icon: '📖' },
  ];


  useEffect(() => {
    // Convert duration_seconds to minutes and seconds for display
    const minutes = Math.floor(formData.duration_seconds / 60);
    const seconds = formData.duration_seconds % 60;
    setDurationInput({ minutes, seconds });
  }, [formData.duration_seconds]);

  const handleInputChange = (field: keyof AudioFormData, value: any) => {
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

  const handleAudioFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast({
          title: "File too large",
          description: "Please select an audio file smaller than 50MB",
          variant: "destructive"
        });
        return;
      }
      
      // Check if it's an audio file
      const audioTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/webm'];
      if (!audioTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please select a valid audio file (MP3, WAV, OGG, MP4, WebM)",
          variant: "destructive"
        });
        return;
      }

      setFormData(prev => ({ ...prev, audio_file: file, audio_url: '' }));
    }
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

  const validateAudioUrl = (url: string): boolean => {
    const audioUrlRegex = /^https?:\/\/.+\.(mp3|wav|ogg|m4a|webm|aac)$/i;
    const streamingRegex = /^https?:\/\/(soundcloud\.com|spotify\.com|anchor\.fm)\/.+/i;
    
    return audioUrlRegex.test(url) || streamingRegex.test(url);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for the audio content",
        variant: "destructive"
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Description required",
        description: "Please enter a description for the audio content",
        variant: "destructive"
      });
      return;
    }

    if (uploadMethod === 'file' && !formData.audio_file) {
      toast({
        title: "Audio file required",
        description: "Please upload an audio file",
        variant: "destructive"
      });
      return;
    }

    if (uploadMethod === 'url' && !formData.audio_url.trim()) {
      toast({
        title: "Audio URL required",
        description: "Please enter an audio URL",
        variant: "destructive"
      });
      return;
    }

    if (uploadMethod === 'url' && !validateAudioUrl(formData.audio_url)) {
      toast({
        title: "Invalid audio URL",
        description: "Please enter a valid audio file URL or streaming service URL",
        variant: "destructive"
      });
      return;
    }


    if (formData.duration_seconds <= 0) {
      toast({
        title: "Duration required",
        description: "Please enter a valid audio duration (must be greater than 0 seconds)",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      toast({
        title: "Success",
        description: `Audio content ${isEditing ? 'updated' : 'created'} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save audio content",
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
            {isEditing ? 'Edit Audio Content' : 'Add New Audio Content'}
            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Audio'}
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
                placeholder="Enter audio content title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe this audio content..."
                rows={4}
                required
              />
            </div>

            {/* Audio Type */}
            <div className="space-y-2">
              <Label htmlFor="audio_type">Audio Type *</Label>
              <Select
                value={formData.audio_type}
                onValueChange={(value: typeof formData.audio_type) => 
                  handleInputChange('audio_type', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {audioTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="flex items-center gap-2">
                        <span>{option.icon}</span>
                        {option.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Audio Upload Method */}
            <div className="space-y-4">
              <Label>Audio Source *</Label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={uploadMethod === 'file' ? 'default' : 'outline'}
                  onClick={() => setUploadMethod('file')}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload File
                </Button>
                <Button
                  type="button"
                  variant={uploadMethod === 'url' ? 'default' : 'outline'}
                  onClick={() => setUploadMethod('url')}
                  className="flex items-center gap-2"
                >
                  <Music className="w-4 h-4" />
                  External URL
                </Button>
              </div>

              {uploadMethod === 'file' && (
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioFileUpload}
                  />
                  {formData.audio_file && (
                    <div className="text-sm text-gray-600">
                      Selected: {formData.audio_file.name}
                    </div>
                  )}
                  <div className="text-sm text-gray-500">
                    Supported formats: MP3, WAV, OGG, MP4, WebM (max 50MB)
                  </div>
                </div>
              )}

              {uploadMethod === 'url' && (
                <div className="space-y-2">
                  <Input
                    value={formData.audio_url}
                    onChange={(e) => handleInputChange('audio_url', e.target.value)}
                    placeholder="https://example.com/audio.mp3"
                  />
                  <div className="text-sm text-gray-500">
                    Direct audio file URLs or streaming service links (SoundCloud, Spotify, etc.)
                  </div>
                </div>
              )}
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
                Optional: Upload a cover image for the audio content
              </div>
            </div>

            {/* Publishing Options */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium">Publishing Options</h3>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="is_published">Published</Label>
                  <p className="text-sm text-gray-600">Make this audio content visible to users</p>
                </div>
                <Switch
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => handleInputChange('is_published', checked)}
                />
              </div>
            </div>

            {/* Audio Preview Info */}
            {(formData.audio_file || formData.audio_url) && (
              <div className="flex items-center gap-2 text-sm text-gray-600 p-3 bg-green-50 rounded-lg">
                <Headphones className="w-4 h-4" />
                <span>
                  Audio source: {formData.audio_file ? formData.audio_file.name : formData.audio_url}
                </span>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AudioForm;
