import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, Plus, Edit, Trash2, Eye, Volume2, Music, Headphones,
  Mic, BookOpen, Filter, Download, Share2, Heart, Clock, User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { contentService, AudioContent, extractArrayFromResponse } from '@/services/contentService';

// Extended AudioContent interface with additional UI properties
interface ExtendedAudioContent extends AudioContent {
  category_name?: string;
  author_name?: string;
  isLiked?: boolean;
}

import AudioForm from '@/components/Content/AudioForm';
import AudioGrid from '@/components/Content/AudioGrid';
import AudioModal from '@/components/Content/AudioModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const AudioManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [audioContent, setAudioContent] = useState<ExtendedAudioContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [playingId, setPlayingId] = useState<number | null>(null);
  
  // Modal states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState<ExtendedAudioContent | null>(null);
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [audioToDelete, setAudioToDelete] = useState<number | null>(null);

  const audioTypes = ['All', 'meditation', 'podcast', 'music', 'exercise', 'story'];
  const categories = [
    'All', 'Meditation', 'Sleep Stories', 'Guided Imagery', 
    'Podcasts', 'Affirmations', 'Nature Sounds', 'Breathing Exercises'
  ];

  // Check if user can manage audio content
  const canManageContent = user?.role === 'admin' || user?.role === 'guide';

  useEffect(() => {
    if (canManageContent) {
      loadAudioContent();
    }
  }, [canManageContent]);

  const loadAudioContent = async () => {
    setLoading(true);
    try {
      const response = await contentService.getAudioContent();
      const audioArray = extractArrayFromResponse(response);
      
      // Map backend fields to frontend interface
      const mappedAudio: ExtendedAudioContent[] = audioArray.map((audio: any) => ({
        ...audio,
        author_name: audio.author_name || audio.author || 'Unknown Author',
        category_name: audio.category_name || audio.category || 'General',
        isLiked: audio.isLiked || false
      }));
      
      setAudioContent(mappedAudio);
    } catch (error) {
      console.error('Failed to load audio content:', error);
      toast({
        title: 'Error',
        description: 'Failed to load audio content. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter audio content
  const filteredContent = audioContent.filter(audio => {
    const matchesSearch = audio.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         audio.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         audio.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'All' || audio.audio_type === selectedType;
    const matchesCategory = selectedCategory === 'All' || 
                           audio.category_name === selectedCategory || 
                           (typeof audio.category === 'string' && audio.category === selectedCategory);
    
    return matchesSearch && matchesType && matchesCategory;
  });

  // CRUD Operations
  const handleCreateAudio = async (formData: any) => {
    try {
      const newAudio = await contentService.createAudioContent(formData);
      setAudioContent(prev => [newAudio, ...prev]);
      setShowCreateForm(false);
      toast({
        title: 'Success',
        description: 'Audio content created successfully!',
      });
    } catch (error) {
      console.error('Failed to create audio:', error);
      throw new Error('Failed to create audio content');
    }
  };

  const handleUpdateAudio = async (formData: any) => {
    if (!selectedAudio) return;
    
    try {
      const updatedAudio = await contentService.updateAudioContent(selectedAudio.id, formData);
      setAudioContent(prev => prev.map(audio => 
        audio.id === selectedAudio.id ? updatedAudio : audio
      ));
      setShowEditForm(false);
      setSelectedAudio(null);
      toast({
        title: 'Success',
        description: 'Audio content updated successfully!',
      });
    } catch (error) {
      console.error('Failed to update audio:', error);
      throw new Error('Failed to update audio content');
    }
  };

  const handleDeleteAudio = async () => {
    if (!audioToDelete) return;
    
    try {
      await contentService.deleteAudioContent(audioToDelete);
      setAudioContent(prev => prev.filter(audio => audio.id !== audioToDelete));
      setShowDeleteDialog(false);
      setAudioToDelete(null);
      toast({
        title: 'Success',
        description: 'Audio content deleted successfully!',
      });
    } catch (error) {
      console.error('Failed to delete audio:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete audio content. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Audio playback
  const handlePlay = (audio: ExtendedAudioContent) => {
    setPlayingId(audio.id);
    // Update play count optimistically
    setAudioContent(prev => prev.map(a => 
      a.id === audio.id 
        ? { ...a, play_count: (a.play_count || 0) + 1 }
        : a
    ));
  };

  const handlePause = () => {
    setPlayingId(null);
  };

  const handleLike = async (audioId: number) => {
    const audio = audioContent.find(a => a.id === audioId);
    const isCurrentlyLiked = audio?.isLiked;
    
    try {
      // Optimistic update
      setAudioContent(prev => prev.map(audio => 
        audio.id === audioId 
          ? { 
              ...audio, 
              like_count: isCurrentlyLiked 
                ? Math.max((audio.like_count || 1) - 1, 0)
                : (audio.like_count || 0) + 1,
              isLiked: !isCurrentlyLiked 
            }
          : audio
      ));
      
      // Try to save to backend
      try {
        await contentService.likeAudioContent(audioId);
      } catch (apiError) {
        console.warn('Audio like API not available, using local state only');
      }
      
      toast({
        title: isCurrentlyLiked ? 'Audio Unliked' : 'Audio Liked',
        description: 'Thank you for your feedback!',
      });
    } catch (error) {
      // Revert on error
      setAudioContent(prev => prev.map(audio => 
        audio.id === audioId 
          ? { ...audio, like_count: audio.like_count, isLiked: isCurrentlyLiked }
          : audio
      ));
      
      toast({
        title: 'Error',
        description: 'Failed to update like status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleShare = async (audio: ExtendedAudioContent) => {
    const shareData = {
      title: audio.title,
      text: audio.description,
      url: `${window.location.origin}/education/audio/${audio.id}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        await contentService.shareAudioContent(audio.id, 'native_share');
      } else {
        await navigator.clipboard.writeText(shareData.url);
        await contentService.shareAudioContent(audio.id, 'copy_link');
        toast({
          title: 'Link Copied',
          description: 'Audio link copied to clipboard!',
        });
      }
    } catch (error) {
      console.error('Failed to share audio:', error);
      toast({
        title: 'Share Failed',
        description: 'Unable to share audio. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = (audio: ExtendedAudioContent) => {
    const audioSource = audio.audio_file || audio.audio_url;
    if (audioSource) {
      const link = document.createElement('a');
      link.href = audioSource;
      link.download = `${audio.title}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleEdit = (audio: ExtendedAudioContent) => {
    setSelectedAudio(audio);
    setShowEditForm(true);
  };

  const confirmDelete = (audioId: number) => {
    setAudioToDelete(audioId);
    setShowDeleteDialog(true);
  };

  const viewAudio = (audio: ExtendedAudioContent) => {
    setSelectedAudio(audio);
    setShowAudioModal(true);
  };

  if (!canManageContent) {
    return (
      <div className="container mx-auto px-4 py-8 pt-16 sm:pt-20 md:pt-24">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">
            You don't have permission to manage audio content. Please contact an administrator.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-16 sm:pt-20 md:pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Audio Content Management
              </h1>
              <p className="text-gray-600">
                Create, edit, and manage audio content for mental wellness
              </p>
            </div>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Audio Content
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search audio content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {audioTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'All' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Volume2 className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{audioContent.length}</p>
                  <p className="text-sm text-gray-600">Total Audio</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Eye className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {audioContent.reduce((sum, audio) => sum + (audio.play_count || 0), 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Total Plays</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Heart className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {audioContent.reduce((sum, audio) => sum + (audio.like_count || 0), 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Total Likes</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {Math.round(audioContent.reduce((sum, audio) => sum + audio.duration_seconds, 0) / 3600)}h
                  </p>
                  <p className="text-sm text-gray-600">Total Duration</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Audio Grid */}
        <AudioGrid
          audioContent={filteredContent as any}
          loading={loading}
          canManageContent={canManageContent}
          playingId={playingId}
          onPlay={handlePlay as any}
          onPause={handlePause}
          onLike={handleLike}
          onShare={handleShare as any}
          onEdit={handleEdit as any}
          onDelete={confirmDelete}
          onDownload={handleDownload as any}
        />

        {/* Create Audio Form Modal */}
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Audio Content</DialogTitle>
            </DialogHeader>
            <AudioForm
              onSubmit={handleCreateAudio}
              onCancel={() => setShowCreateForm(false)}
              isEditing={false}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Audio Form Modal */}
        <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Audio Content</DialogTitle>
            </DialogHeader>
            {selectedAudio && (
              <AudioForm
                initialData={{
                  title: selectedAudio.title,
                  description: selectedAudio.description,
                  audio_type: selectedAudio.audio_type,
                  audio_file: null,
                  audio_url: selectedAudio.audio_url,
                  duration_seconds: selectedAudio.duration_seconds,
                  category: typeof selectedAudio.category === 'number' ? selectedAudio.category : null,
                  tags: selectedAudio.tags,
                  thumbnail_image: null,
                  is_published: selectedAudio.is_published
                }}
                onSubmit={handleUpdateAudio}
                onCancel={() => {
                  setShowEditForm(false);
                  setSelectedAudio(null);
                }}
                isEditing={true}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Audio Detail Modal */}
        <AudioModal
          audio={selectedAudio as any}
          isOpen={showAudioModal}
          onClose={() => {
            setShowAudioModal(false);
            setSelectedAudio(null);
          }}
          onLike={handleLike}
          onShare={handleShare as any}
          onDownload={handleDownload as any}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600">
                Are you sure you want to delete this audio content? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAudio}
                >
                  Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
};

export default AudioManagement;
