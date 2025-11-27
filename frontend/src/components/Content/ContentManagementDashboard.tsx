import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MoreHorizontal,
  Plus,
  FileText,
  Video,
  Headphones,
  Heart,
  Eye,
  Calendar,
  Users,
  TrendingUp,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { 
  contentService, ContentStats, Article, Video as VideoType, AudioContent, MentalHealthResource,
  extractArrayFromResponse 
} from '@/services/contentService';
import { useAuth } from '@/hooks/useAuth';
import ErrorBoundary from '../ErrorBoundary';
import ArticleForm from './ArticleForm';
import VideoForm from './VideoForm';
import AudioForm from './AudioForm';
import MentalHealthResourceForm from './MentalHealthResourceForm';
import EditArticleForm from './EditArticleForm';
import EditVideoForm from './EditVideoForm';
import EditAudioForm from './EditAudioForm';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import BulkOperationsBar from './BulkOperationsBar';
import { Checkbox } from '@/components/ui/checkbox';

const ContentManagementDashboard: React.FC = () => {
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<'article' | 'video' | 'audio' | 'resource' | null>(null);
  const [editingContent, setEditingContent] = useState<{
    type: 'article' | 'video' | 'audio' | 'resource';
    data: Article | VideoType | AudioContent | MentalHealthResource;
  } | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    contentType: 'article' | 'video' | 'audio' | 'resource';
    contentId: number;
    contentTitle: string;
    contentSlug: string;
  } | null>(null);
  const [selectedItems, setSelectedItems] = useState<Array<{
    id: number;
    type: 'article' | 'video' | 'audio' | 'resource';
    title: string;
  }>>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [audioContent, setAudioContent] = useState<AudioContent[]>([]);
  const [resources, setResources] = useState<MentalHealthResource[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [selectedContentType, setSelectedContentType] = useState<'articles' | 'videos' | 'audio' | 'resources'>('articles');
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      fetchContentStats();
    } else {
      setLoading(false);
      setError('Authentication required');
    }
  }, [isAuthenticated]);

  // Stats cache
  const [statsCache, setStatsCache] = useState<{
    data?: ContentStats;
    lastFetch?: number;
  }>({});

  const fetchContentStats = async (forceRefresh = false) => {
    const now = Date.now();
    const cacheValid = statsCache.lastFetch && (now - statsCache.lastFetch) < CACHE_DURATION;
    
    if (!forceRefresh && cacheValid && statsCache.data) {
      setStats(statsCache.data);
      setLoading(false);
      return;
    }

    try {
      const data = await contentService.getContentStats();
      setStats(data);
      setStatsCache({ data, lastFetch: now });
    } catch (error) {
      console.error('Failed to fetch content stats:', error);
      setError(error instanceof Error ? error.message : 'Failed to load content statistics');
      // Set default stats on error to prevent UI issues
      const defaultStats = {
        articles: { total: 0, featured: 0 },
        videos: { total: 0, featured: 0 },
        audio: { total: 0, meditations: 0 },
        resources: { total: 0, crisis_hotlines: 0 }
      };
      setStats(defaultStats);
      setStatsCache({ data: defaultStats, lastFetch: now });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (formType: 'article' | 'video' | 'audio' | 'resource') => {
    setShowForm(formType);
  };

  const handleContentTypeSelect = (type: 'articles' | 'videos' | 'audio' | 'resources') => {
    setSelectedContentType(type);
    // Fetch content for the selected type if not cached
    const now = Date.now();
    const cacheValid = contentCache.lastFetch && (now - contentCache.lastFetch) < CACHE_DURATION;
    
    if (!cacheValid || !contentCache[type]) {
      fetchAllContent();
    } else {
      // Use cached data immediately
      switch (type) {
        case 'articles':
          setArticles(contentCache.articles || []);
          break;
        case 'videos':
          setVideos(contentCache.videos || []);
          break;
        case 'audio':
          setAudioContent(contentCache.audio || []);
          break;
        case 'resources':
          setResources(contentCache.resources || []);
          break;
      }
    }
  };

  const handleCloseForm = () => {
    setShowForm(null);
    // Refresh stats and content after content creation
    fetchContentStats(true);
    fetchAllContent(true); // Force refresh after content creation
  };

  // Cache for content to avoid unnecessary API calls
  const [contentCache, setContentCache] = useState<{
    articles?: Article[];
    videos?: VideoType[];
    audio?: AudioContent[];
    resources?: MentalHealthResource[];
    lastFetch?: number;
  }>({});

  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const fetchAllContent = async (forceRefresh = false) => {
    const now = Date.now();
    const cacheValid = contentCache.lastFetch && (now - contentCache.lastFetch) < CACHE_DURATION;
    
    if (!forceRefresh && cacheValid) {
      // Use cached data
      setArticles(contentCache.articles || []);
      setVideos(contentCache.videos || []);
      setAudioContent(contentCache.audio || []);
      setResources(contentCache.resources || []);
      return;
    }

    setContentLoading(true);
    try {
      // Optimized: Only fetch the selected content type initially
      const promises: Promise<any>[] = [];
      const types: string[] = [];
      
      if (selectedContentType === 'articles' || forceRefresh) {
        promises.push(contentService.getArticles());
        types.push('articles');
      }
      if (selectedContentType === 'videos' || forceRefresh) {
        promises.push(contentService.getVideos());
        types.push('videos');
      }
      if (selectedContentType === 'audio' || forceRefresh) {
        promises.push(contentService.getAudioContent());
        types.push('audio');
      }
      if (selectedContentType === 'resources' || forceRefresh) {
        promises.push(contentService.getResources());
        types.push('resources');
      }

      const responses = await Promise.all(promises);
      const newCache = { ...contentCache, lastFetch: now };
      
      responses.forEach((response, index) => {
        const type = types[index];
        const data = extractArrayFromResponse(response);
        
        switch (type) {
          case 'articles':
            setArticles(data);
            newCache.articles = data;
            break;
          case 'videos':
            setVideos(data);
            newCache.videos = data;
            break;
          case 'audio':
            setAudioContent(data);
            newCache.audio = data;
            break;
          case 'resources':
            setResources(data);
            newCache.resources = data;
            break;
        }
      });
      
      setContentCache(newCache);
    } catch (error) {
      console.error('Failed to fetch content:', error);
      toast({
        title: "Error loading content",
        description: "Failed to load content items. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setContentLoading(false);
    }
  };

  const handleEdit = (type: 'article' | 'video' | 'audio' | 'resource', data: Article | VideoType | AudioContent | MentalHealthResource) => {
    setEditingContent({ type, data });
  };

  const handleEditSave = (updatedContent: Article | VideoType | AudioContent | MentalHealthResource) => {
    // Update the local state with the updated content
    if (editingContent?.type === 'article') {
      setArticles(prev => prev.map(item => item.id === updatedContent.id ? updatedContent as Article : item));
    } else if (editingContent?.type === 'video') {
      setVideos(prev => prev.map(item => item.id === updatedContent.id ? updatedContent as VideoType : item));
    } else if (editingContent?.type === 'audio') {
      setAudioContent(prev => prev.map(item => item.id === updatedContent.id ? updatedContent as AudioContent : item));
    }
    setEditingContent(null);
    fetchContentStats(true); // Refresh stats
  };

  const handleEditCancel = () => {
    setEditingContent(null);
  };

  const handleTogglePublished = async (type: 'article' | 'video' | 'audio' | 'resource', id: number, currentStatus: boolean) => {
    try {
      const action = currentStatus ? 'unpublish' : 'publish';
      
      // Only call bulk action for supported content types
      if (type !== 'resource') {
        await contentService.bulkContentAction(action, type as 'article' | 'video' | 'audio', [id]);
      } else {
        // Handle resource verification separately since it's not a publish/unpublish action
        toast({
          title: "Feature not available",
          description: "Resource verification must be done individually by admins.",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: currentStatus ? "Content unpublished" : "Content published",
        description: `${type} has been ${currentStatus ? 'unpublished' : 'published'} successfully.`,
      });
      
      // Refresh content after status change
      fetchAllContent(true); // Force refresh after status change
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${currentStatus ? 'unpublish' : 'publish'} ${type}.`,
        variant: "destructive"
      });
    }
  };

  const handleDeleteClick = (type: 'article' | 'video' | 'audio' | 'resource', id: number, title: string, slug: string) => {
    setDeleteConfirmation({
      isOpen: true,
      contentType: type,
      contentId: id,
      contentTitle: title,
      contentSlug: slug
    });
  };

  const handleDeleteConfirm = async (hardDelete: boolean) => {
    if (!deleteConfirmation) return;

    setDeleteLoading(true);
    try {
      const { contentType, contentId, contentSlug } = deleteConfirmation;
      
      if (contentType === 'article') {
        await contentService.deleteArticle(contentSlug, hardDelete);
      } else if (contentType === 'video') {
        await contentService.deleteVideo(contentId, hardDelete);
      } else if (contentType === 'audio') {
        await contentService.deleteAudioContent(contentId, hardDelete);
      } else if (contentType === 'resource') {
        await contentService.deleteResource(contentId, hardDelete);
      }

      toast({
        title: hardDelete ? "Content permanently deleted" : "Content deleted",
        description: `${contentType} has been ${hardDelete ? 'permanently deleted' : 'deleted'} successfully.`,
      });

      // Refresh content and stats
      fetchAllContent(true); // Force refresh after deletion
      fetchContentStats(true);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to delete ${deleteConfirmation.contentType}.`,
        variant: "destructive"
      });
    } finally {
      setDeleteLoading(false);
      setDeleteConfirmation(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation(null);
  };

  const handleItemSelect = (id: number, type: 'article' | 'video' | 'audio' | 'resource', title: string) => {
    setSelectedItems(prev => {
      const exists = prev.find(item => item.id === id && item.type === type);
      if (exists) {
        return prev.filter(item => !(item.id === id && item.type === type));
      } else {
        return [...prev, { id, type, title }];
      }
    });
  };

  const handleClearSelection = () => {
    setSelectedItems([]);
  };

  const isItemSelected = (id: number, type: 'article' | 'video' | 'audio' | 'resource') => {
    return selectedItems.some(item => item.id === id && item.type === type);
  };

  // Fetch content when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      fetchAllContent();
    }
  }, [isAuthenticated]);

  const renderArticlesTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox
              checked={articles.length > 0 && articles.every(article => isItemSelected(article.id, 'article'))}
              onCheckedChange={(checked) => {
                if (checked) {
                  articles.forEach(article => {
                    if (!isItemSelected(article.id, 'article')) {
                      handleItemSelect(article.id, 'article', article.title);
                    }
                  });
                } else {
                  articles.forEach(article => {
                    if (isItemSelected(article.id, 'article')) {
                      handleItemSelect(article.id, 'article', article.title);
                    }
                  });
                }
              }}
            />
          </TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Views</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {articles.map((article) => (
          <TableRow key={article.id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                {article.is_featured && <Badge variant="secondary">Featured</Badge>}
                {article.title}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={article.is_published ? "default" : "secondary"}>
                {article.is_published ? 'Published' : 'Draft'}
              </Badge>
            </TableCell>
            <TableCell>{article.view_count}</TableCell>
            <TableCell>{new Date(article.created_at).toLocaleDateString()}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEdit('article', article)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleTogglePublished('article', article.id, article.is_published)}>
                    {article.is_published ? (
                      <><ToggleLeft className="mr-2 h-4 w-4" />Unpublish</>
                    ) : (
                      <><ToggleRight className="mr-2 h-4 w-4" />Publish</>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDeleteClick('article', article.id, article.title, article.slug)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderVideosTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Views</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {videos.map((video) => (
          <TableRow key={video.id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                {video.is_featured && <Badge variant="secondary">Featured</Badge>}
                {video.title}
              </div>
            </TableCell>
            <TableCell>{Math.floor(video.duration_seconds / 60)}:{(video.duration_seconds % 60).toString().padStart(2, '0')}</TableCell>
            <TableCell>
              <Badge variant={video.is_published ? "default" : "secondary"}>
                {video.is_published ? 'Published' : 'Draft'}
              </Badge>
            </TableCell>
            <TableCell>{video.view_count}</TableCell>
            <TableCell>{new Date(video.created_at).toLocaleDateString()}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEdit('video', video)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleTogglePublished('video', video.id, video.is_published)}>
                    {video.is_published ? (
                      <><ToggleLeft className="mr-2 h-4 w-4" />Unpublish</>
                    ) : (
                      <><ToggleRight className="mr-2 h-4 w-4" />Publish</>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDeleteClick('video', video.id, video.title, video.id.toString())}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderAudioTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Plays</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {audioContent.map((audio) => (
          <TableRow key={audio.id}>
            <TableCell className="font-medium">{audio.title}</TableCell>
            <TableCell>
              <Badge variant="outline">
                {audio.audio_type.charAt(0).toUpperCase() + audio.audio_type.slice(1)}
              </Badge>
            </TableCell>
            <TableCell>{Math.floor(audio.duration_seconds / 60)}:{(audio.duration_seconds % 60).toString().padStart(2, '0')}</TableCell>
            <TableCell>
              <Badge variant={audio.is_published ? "default" : "secondary"}>
                {audio.is_published ? 'Published' : 'Draft'}
              </Badge>
            </TableCell>
            <TableCell>{audio.play_count}</TableCell>
            <TableCell>{new Date(audio.created_at).toLocaleDateString()}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEdit('audio', audio)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleTogglePublished('audio', audio.id, audio.is_published)}>
                    {audio.is_published ? (
                      <><ToggleLeft className="mr-2 h-4 w-4" />Unpublish</>
                    ) : (
                      <><ToggleRight className="mr-2 h-4 w-4" />Publish</>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDeleteClick('audio', audio.id, audio.title, audio.id.toString())}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderResourcesTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Cost</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {resources.map((resource) => (
          <TableRow key={resource.id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                {resource.is_24_7 && <Badge variant="secondary">24/7</Badge>}
                {resource.name}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">
                {resource.resource_type.replace('_', ' ').split(' ').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </Badge>
            </TableCell>
            <TableCell>{resource.city ? `${resource.city}, ${resource.state}` : 'Online'}</TableCell>
            <TableCell>
              <Badge variant={resource.cost_level === 'free' ? 'default' : 'secondary'}>
                {resource.cost_level.charAt(0).toUpperCase() + resource.cost_level.slice(1)}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={resource.is_verified ? "default" : "secondary"}>
                {resource.is_verified ? 'Verified' : 'Pending'}
              </Badge>
            </TableCell>
            <TableCell>{new Date(resource.created_at).toLocaleDateString()}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEdit('resource', resource)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleTogglePublished('resource', resource.id, resource.is_verified)}>
                    {resource.is_verified ? (
                      <><ToggleLeft className="mr-2 h-4 w-4" />Unverify</>
                    ) : (
                      <><ToggleRight className="mr-2 h-4 w-4" />Verify</>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDeleteClick('resource', resource.id, resource.name, resource.id.toString())}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderContentTable = () => {
    const getContentData = () => {
      switch (selectedContentType) {
        case 'articles': return articles;
        case 'videos': return videos;
        case 'audio': return audioContent;
        case 'resources': return resources;
        default: return [];
      }
    };

    const getContentTitle = () => {
      switch (selectedContentType) {
        case 'articles': return 'Articles';
        case 'videos': return 'Videos';
        case 'audio': return 'Audio Content';
        case 'resources': return 'Mental Health Resources';
        default: return 'Content';
      }
    };

    const getEmptyIcon = () => {
      switch (selectedContentType) {
        case 'articles': return FileText;
        case 'videos': return Video;
        case 'audio': return Headphones;
        case 'resources': return MapPin;
        default: return FileText;
      }
    };

    const contentData = getContentData();
    const EmptyIcon = getEmptyIcon();

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{getContentTitle()}</CardTitle>
            <Button onClick={() => handleOpenForm(
              selectedContentType === 'articles' ? 'article' :
              selectedContentType === 'videos' ? 'video' :
              selectedContentType === 'audio' ? 'audio' : 'resource'
            )}>
              <Plus className="w-4 h-4 mr-2" />
              New {getContentTitle().slice(0, -1)}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {contentLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading {getContentTitle().toLowerCase()}...</p>
            </div>
          ) : contentData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <EmptyIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No {getContentTitle().toLowerCase()} found</p>
              <p className="text-sm">Create your first {getContentTitle().toLowerCase().slice(0, -1)} to get started</p>
            </div>
          ) : (
            <>
              <BulkOperationsBar
                selectedItems={selectedItems}
                onClearSelection={handleClearSelection}
                onRefresh={() => fetchAllContent(true)}
                userRole={user?.role}
              />
              {selectedContentType === 'articles' ? renderArticlesTable() :
               selectedContentType === 'videos' ? renderVideosTable() :
               selectedContentType === 'audio' ? renderAudioTable() :
               renderResourcesTable()}
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  const contentTypes = [
    {
      id: 'articles',
      name: 'Articles',
      icon: FileText,
      color: 'bg-blue-100 text-blue-600',
      description: 'Educational mental health articles',
      total: stats?.articles.total || 0,
      featured: stats?.articles.featured || 0,
    },
    {
      id: 'videos',
      name: 'Videos',
      icon: Video,
      color: 'bg-purple-100 text-purple-600',
      description: 'Educational videos and tutorials',
      total: stats?.videos.total || 0,
      featured: stats?.videos.featured || 0,
    },
    {
      id: 'audio',
      name: 'Audio Content',
      icon: Headphones,
      color: 'bg-green-100 text-green-600',
      description: 'Guided meditations and audio resources',
      total: stats?.audio.total || 0,
      featured: stats?.audio.meditations || 0,
    },
    {
      id: 'resources',
      name: 'Mental Health Resources',
      icon: MapPin,
      color: 'bg-orange-100 text-orange-600',
      description: 'Directory of mental health services',
      total: stats?.resources.total || 0,
      featured: stats?.resources.crisis_hotlines || 0,
    },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-16 sm:pt-20 md:pt-24">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-healthcare-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 pt-16 sm:pt-20 md:pt-24">
        <div className="flex items-center justify-center h-64">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Content</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => {
                setError(null);
                setLoading(true);
                fetchContentStats(true);
              }}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show specific form if requested
  if (showForm) {
    const renderForm = () => {
      const commonProps = {
        onCancel: handleCloseForm,
        onSubmit: async (data: any) => {
          try {
            console.log('🚀 Content creation started:', { type: showForm, data });
            
            switch (showForm) {
              case 'article':
                await contentService.createArticle(data);
                toast({
                  title: "Success",
                  description: "Article created successfully",
                });
                break;
              case 'video':
                await contentService.createVideo(data);
                toast({
                  title: "Success",
                  description: "Video created successfully",
                });
                break;
              case 'audio':
                console.log('Creating audio content with data:', data);
                await contentService.createAudioContent(data);
                toast({
                  title: "Success",
                  description: "Audio content created successfully",
                });
                break;
              case 'resource':
                await contentService.createResource(data);
                toast({
                  title: "Success",
                  description: "Resource created successfully",
                });
                break;
            }
            // Refresh data after successful creation
            fetchContentStats(true);
            fetchAllContent(true);
            handleCloseForm();
          } catch (error) {
            console.error('Content creation error:', error);
            toast({
              title: "Error",
              description: error instanceof Error ? error.message : "Failed to create content",
              variant: "destructive"
            });
          }
        }
      };

      switch (showForm) {
        case 'article':
          return (
            <ErrorBoundary>
              <ArticleForm {...commonProps} />
            </ErrorBoundary>
          );
        case 'video':
          return (
            <ErrorBoundary>
              <VideoForm {...commonProps} />
            </ErrorBoundary>
          );
        case 'audio':
          return (
            <ErrorBoundary>
              <AudioForm {...commonProps} />
            </ErrorBoundary>
          );
        case 'resource':
          return (
            <ErrorBoundary>
              <MentalHealthResourceForm {...commonProps} />
            </ErrorBoundary>
          );
        default:
          return null;
      }
    };

    return (
      <div className="container mx-auto px-4 py-8 pt-16 sm:pt-20 md:pt-24">
        <div className="mb-4">
          <Button variant="ghost" onClick={handleCloseForm} className="mb-4">
            ← Back to Dashboard
          </Button>
        </div>
        {renderForm()}
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8 pt-16 sm:pt-20 md:pt-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Management</h1>
          <p className="text-gray-600">Manage educational content, resources, and media for the platform</p>
        </div>

        {/* Content Type Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {contentTypes.map((type) => (
            <Card 
              key={type.id} 
              className={`cursor-pointer transition-all ${selectedContentType === type.id ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-lg'}`}
              onClick={() => handleContentTypeSelect(type.id as any)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-lg ${type.color} flex items-center justify-center`}>
                    <type.icon className="w-5 h-5" />
                  </div>
                  <Badge variant="outline">{type.total}</Badge>
                </div>
                <CardTitle className="text-lg">{type.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Featured: {type.featured}</span>
                  <Button size="sm" variant="outline" onClick={(e) => { 
                    e.stopPropagation(); 
                    handleOpenForm(
                      type.id === 'articles' ? 'article' :
                      type.id === 'videos' ? 'video' :
                      type.id === 'audio' ? 'audio' : 'resource'
                    ); 
                  }}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add New
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selected Content Display */}
        <ErrorBoundary>
          {renderContentTable()}
        </ErrorBoundary>

        {/* Edit Forms */}
        {editingContent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  Edit {editingContent.type.charAt(0).toUpperCase() + editingContent.type.slice(1)}
                </h2>
                <Button variant="ghost" onClick={handleEditCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {editingContent.type === 'article' && (
                <EditArticleForm
                  article={editingContent.data as Article}
                  onSave={handleEditSave}
                  onCancel={handleEditCancel}
                />
              )}
              {editingContent.type === 'video' && (
                <EditVideoForm
                  video={editingContent.data as VideoType}
                  onSave={handleEditSave}
                  onCancel={handleEditCancel}
                />
              )}
              {editingContent.type === 'audio' && (
                <EditAudioForm
                  audio={editingContent.data as AudioContent}
                  onSave={handleEditSave}
                  onCancel={handleEditCancel}
                />
              )}
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {deleteConfirmation && (
          <DeleteConfirmationDialog
            isOpen={deleteConfirmation.isOpen}
            onClose={handleDeleteCancel}
            onConfirm={handleDeleteConfirm}
            contentType={deleteConfirmation.contentType}
            contentTitle={deleteConfirmation.contentTitle}
            loading={deleteLoading}
          />
        )}

      </div>
    </ErrorBoundary>
  );
};

export default ContentManagementDashboard;
