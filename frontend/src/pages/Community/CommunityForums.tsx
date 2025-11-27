import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Users, 
  Heart, 
  Eye, 
  Plus, 
  Search, 
  Filter,
  Flame,
  Pin,
  Calendar,
  BookOpen,
  Brain,
  Lightbulb,
  Shield,
  Coffee,
  Gamepad2,
  Music,
  Camera,
  Palette,
  MoreHorizontal,
  Edit3,
  Trash2,
  Flag,
  Send,
  User,
  TrendingUp,
  Clock,
  ThumbsUp,
  Lock,
  HelpCircle,
  Sparkles,
  ArrowUp,
  Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '../../components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { communityService } from '../../services/communityService';
import CommentThread from '../../components/Community/CommentThread';
import ForumPostDetail from './ForumPostDetail';

// Simple toast notification system
const toast = {
  success: (message: string) => console.log('✅ Success:', message),
  error: (message: string) => console.error('❌ Error:', message),
};

interface ForumPost {
  id: number;
  title: string;
  content: string;
  author: {
    id: number;
    name: string;
    avatar?: string;
    isAnonymous: boolean;
  };
  category: string;
  replies: number;
  views: number;
  likes: number;
  likeCount: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  lastActivity: string;
  tags: string[];
}

interface ForumCategory {
  id: string;
  name: string;
  description: string;
  postCount: number;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Icon mapping function
const getIconComponent = (iconName: string): React.ComponentType<{ className?: string }> => {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'MessageSquare': MessageSquare,
    'Users': Users,
    'Heart': Heart,
    'TrendingUp': TrendingUp,
    'Shield': Shield,
    'HelpCircle': HelpCircle,
  };
  return iconMap[iconName] || MessageSquare;
};

const CommunityForums: React.FC = () => {
  // Mock current user for now - replace with actual auth context
  const currentUser = { id: 1, username: 'current_user', role: 'user' };
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: '',
    isAnonymous: true
  });
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState({
    content: '',
    isAnonymous: true
  });
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  useEffect(() => {
    loadForumData();
  }, []);

  const loadForumData = async () => {
    try {
      setLoading(true);
      const [categoriesData, postsData] = await Promise.all([
        communityService.getForumCategories(),
        communityService.getForumPosts()
      ]);
      
      // Debug: Log the API responses to verify real data
      console.log('🔍 Categories Data:', categoriesData);
      console.log('🔍 Posts Data:', postsData);
      console.log('🔍 Sample Post:', postsData[0]);
      
      const transformedCategories = Array.isArray(categoriesData) 
        ? categoriesData.map(cat => ({
            id: cat.id.toString(),
            name: cat.name,
            description: cat.description,
            postCount: (cat as any).post_count || 0,
            color: cat.color || '#3B82F6',
            icon: getIconComponent(cat.icon || 'MessageSquare')
          }))
        : [];
      
      setCategories(transformedCategories);
      
      const transformedPosts = Array.isArray(postsData) 
        ? postsData.map(post => ({
            id: post.id,
            title: post.title,
            content: post.content,
            author: {
              id: post.author,
              name: post.author_display_name,
              isAnonymous: post.is_anonymous
            },
            category: post.category?.toString() || '1',
            replies: post.comment_count || 0,
            views: post.view_count || 0,
            likes: post.like_count || 0,
            likeCount: post.like_count || 0,
            isPinned: post.is_pinned || false,
            isLocked: post.is_locked || false,
            createdAt: post.created_at,
            lastActivity: post.last_activity || post.updated_at,
            tags: []
          }))
        : [];
      
      setPosts(transformedPosts);
      
    } catch (error) {
      console.error('Failed to load forum data:', error);
      setCategories([]);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim() || !newPost.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const postData = {
        title: newPost.title,
        content: newPost.content,
        category: parseInt(newPost.category),
        is_anonymous: newPost.isAnonymous
      };

      await communityService.createForumPost(postData);
      toast.success('Post created successfully!');
      setIsCreatePostOpen(false);
      setNewPost({ title: '', content: '', category: '', isAnonymous: true });
      loadForumData();
    } catch (error) {
      toast.error('Failed to create post');
    }
  };

  const handleLikePost = async (postId: number) => {
    try {
      const response = await communityService.likePost(postId);
      
      // Update liked posts state
      const newLikedPosts = new Set(likedPosts);
      if (likedPosts.has(postId)) {
        newLikedPosts.delete(postId);
      } else {
        newLikedPosts.add(postId);
      }
      setLikedPosts(newLikedPosts);
      
      // Update post like count in state
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, likeCount: post.likeCount + (likedPosts.has(postId) ? -1 : 1) }
            : post
        )
      );
      
      toast.success(response.message || 'Post liked successfully!');
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const loadComments = async (postId: number) => {
    try {
      const commentsData = await communityService.getComments(postId);
      setComments(commentsData);
    } catch (error) {
      toast.error('Failed to load comments');
    }
  };

  const handleCreateComment = async (postId: number) => {
    if (!newComment.content.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      const commentData = {
        post: postId,
        content: newComment.content,
        is_anonymous: newComment.isAnonymous
      };

      await communityService.createComment(commentData);
      toast.success('Comment posted successfully!');
      setNewComment({ content: '', isAnonymous: true });
      loadComments(postId);
    } catch (error) {
      toast.error('Failed to post comment');
    }
  };

  const handleCommentUpdate = () => {
    if (selectedPost) {
      loadComments(selectedPost.id);
    }
  };

  // Role-based moderation functions
  const handlePinPost = async (postId: number) => {
    if (currentUser?.role !== 'guide' && currentUser?.role !== 'admin') return;
    
    try {
      // Update local state optimistically
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, isPinned: true }
          : post
      ));
      
      toast.success('Post has been pinned to the top');
    } catch (error) {
      console.error('Error pinning post:', error);
      toast.error('Failed to pin post. Please try again.');
    }
  };

  const handleLockPost = async (postId: number) => {
    if (currentUser?.role !== 'guide' && currentUser?.role !== 'admin') return;
    
    try {
      // Update local state optimistically
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, isLocked: true }
          : post
      ));
      
      toast.success('Post has been locked from further replies');
    } catch (error) {
      console.error('Error locking post:', error);
      toast.error('Failed to lock post. Please try again.');
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (currentUser?.role !== 'admin') return;
    
    try {
      // Remove from local state
      setPosts(posts.filter(post => post.id !== postId));
      
      toast.success('Post has been permanently deleted');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post. Please try again.');
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-healthcare-primary"></div>
      </div>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30">
      <motion.div 
        className="container mx-auto px-6 py-8 max-w-7xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Enhanced Header */}
        <motion.div className="mb-12" variants={itemVariants}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Community Forums
              </h1>
              <p className="text-gray-600 text-lg">Connect with others, share experiences, and find support</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="px-3 py-1 text-sm border-purple-200 text-purple-700">
                <Sparkles className="w-4 h-4 mr-1" />
                Moderated
              </Badge>
              <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-3 py-1">
                <MessageSquare className="h-4 w-4 mr-1" />
                {posts.length} discussions
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Community Stats Cards */}
        <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" variants={itemVariants}>
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Discussions</p>
                  <p className="text-2xl font-bold text-blue-900">{posts.length}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Active Categories</p>
                  <p className="text-2xl font-bold text-green-900">{categories.length}</p>
                </div>
                <Shield className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Total Replies</p>
                  <p className="text-2xl font-bold text-purple-900">{posts.reduce((sum, post) => sum + post.replies, 0)}</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Community Likes</p>
                  <p className="text-2xl font-bold text-orange-900">{posts.reduce((sum, post) => sum + post.likes, 0)}</p>
                </div>
                <Heart className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Categories */}
        <motion.div className="mb-8" variants={itemVariants}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Discussion Categories</h2>
        
        </motion.div>

        {/* Enhanced Search and Actions */}
        <motion.div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8" variants={itemVariants}>
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full lg:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search discussions, topics, or users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" className="flex items-center space-x-2">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Filter Tabs */}
        <motion.div className="mb-8" variants={itemVariants}>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none lg:flex">
              <TabsTrigger value="all" className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>All Posts</span>
              </TabsTrigger>
              <TabsTrigger value="trending" className="flex items-center space-x-2">
                <Flame className="w-4 h-4" />
                <span>Trending</span>
              </TabsTrigger>
              <TabsTrigger value="pinned" className="flex items-center space-x-2">
                <Pin className="w-4 h-4" />
                <span>Pinned</span>
              </TabsTrigger>
              <TabsTrigger value="recent" className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Recent</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Enhanced Posts List */}
        <motion.div className="space-y-6" variants={itemVariants}>
          {filteredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card 
                className="hover:shadow-lg transition-all duration-300 border-gray-200 hover:border-blue-300 cursor-pointer"
                onClick={() => setSelectedPostId(post.id)}
              >
                <CardContent className="p-0">
                  <div className="p-4">
                    <div className="flex items-start space-x-3 min-w-0">
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarImage src={post.author.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-600 text-white font-semibold text-sm">
                          {post.author.isAnonymous ? '?' : post.author.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          {post.isPinned && (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                              <Pin className="w-3 h-3 mr-1" />
                              Pinned
                            </Badge>
                          )}
                          {post.isLocked && (
                            <Badge variant="secondary">
                              <Lock className="w-3 h-3 mr-1" />
                              Locked
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="font-semibold text-lg text-gray-900 hover:text-blue-600 cursor-pointer mb-2 line-clamp-1 break-words overflow-hidden">
                          {post.title}
                        </h3>
                        
                        <p className="text-gray-600 mb-3 line-clamp-2 leading-relaxed break-words overflow-hidden text-sm">{post.content}</p>
                        
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center space-x-3 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <User className="w-3 h-3" />
                              <span className="font-medium">{post.author.isAnonymous ? 'Anonymous' : post.author.name}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{getTimeAgo(post.createdAt)}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {categories.find(c => c.id === post.category)?.name || 'General'}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-1 text-gray-500">
                              <MessageSquare className="w-4 h-4" />
                              <span className="text-sm font-medium">{post.replies}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-gray-500">
                              <Eye className="w-4 h-4" />
                              <span className="text-sm font-medium">{post.views}</span>
                            </div>
                            <button
                              onClick={() => handleLikePost(post.id)}
                              className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors"
                            >
                              <Heart className="w-4 h-4" />
                              <span className="text-sm font-medium">{post.likes}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Moderation Actions */}
                  {(currentUser?.role === 'guide' || currentUser?.role === 'admin') && (
                    <div className="border-t border-gray-100 px-6 py-3 bg-gray-50">
                      <div className="flex items-center space-x-2">
                        {!post.isPinned && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePinPost(post.id)}
                            className="text-xs"
                          >
                            <Pin className="w-3 h-3 mr-1" />
                            Pin
                          </Button>
                        )}
                        {!post.isLocked && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleLockPost(post.id)}
                            className="text-xs"
                          >
                            <Lock className="w-3 h-3 mr-1" />
                            Lock
                          </Button>
                        )}
                        {currentUser?.role === 'admin' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeletePost(post.id)}
                            className="text-xs"
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {filteredPosts.length === 0 && (
          <motion.div 
            className="text-center py-16"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-12 h-12 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No discussions found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm ? 'Try adjusting your search terms or browse different categories.' : 'No discussions available at the moment.'}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Forum Post Detail Modal */}
      {selectedPostId && (
        <ForumPostDetail
          postId={selectedPostId}
          onClose={() => setSelectedPostId(null)}
        />
      )}
    </div>
  );
};

export default CommunityForums;
