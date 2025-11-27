import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  Eye, 
  Share2, 
  Pin, 
  Lock, 
  Flag, 
  MoreHorizontal,
  Edit3,
  Trash2,
  Send,
  User,
  Calendar,
  Tag
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Separator } from '../../components/ui/separator';
import { communityService } from '../../services/communityService';
import CommentThread from '../../components/Community/CommentThread';

// Simple toast notification system
const toast = {
  success: (message: string) => console.log('✅ Success:', message),
  error: (message: string) => console.error('❌ Error:', message),
};

interface ForumPostDetailProps {
  postId: number;
  onClose: () => void;
}

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
  category: {
    id: string;
    name: string;
    color: string;
  };
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

const ForumPostDetail: React.FC<ForumPostDetailProps> = ({ postId, onClose }) => {
  // Mock current user for now - replace with actual auth context
  const currentUser = { id: 1, username: 'current_user', role: 'user' };
  
  const [post, setPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [newComment, setNewComment] = useState({
    content: '',
    isAnonymous: true
  });

  useEffect(() => {
    loadPostData();
  }, [postId]);

  const loadPostData = async () => {
    try {
      setLoading(true);
      
      // Load post details and comments in parallel
      const [postData, commentsData] = await Promise.all([
        communityService.getForumPost(postId),
        communityService.getComments(postId)
      ]);
      
      // Set the comments data
      setComments(commentsData);
      
      // Transform post data to match interface
      const transformedPost: ForumPost = {
        id: postData.id,
        title: postData.title,
        content: postData.content,
        author: {
          id: postData.author,
          name: postData.author_display_name,
          isAnonymous: postData.is_anonymous
        },
        category: {
          id: postData.category?.toString() || '1',
          name: 'General Discussion',
          color: 'bg-blue-500'
        },
        replies: postData.comment_count || 0,
        views: postData.view_count || 0,
        likes: postData.like_count || 0,
        likeCount: postData.like_count || 0,
        isPinned: postData.is_pinned || false,
        isLocked: postData.is_locked || false,
        createdAt: postData.created_at,
        lastActivity: postData.updated_at,
        tags: []
      };
      
      setPost(transformedPost);
      setComments(commentsData);
      setLikeCount(transformedPost.likeCount);
      
    } catch (error) {
      console.error('Failed to load post data:', error);
      toast.error('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleLikePost = async () => {
    if (!post) return;
    
    try {
      const response = await communityService.likePost(post.id);
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
      toast.success(response.message || 'Post liked successfully!');
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handleCreateComment = async () => {
    if (!newComment.content.trim() || !post) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      const commentData = {
        post: post.id,
        content: newComment.content,
        is_anonymous: newComment.isAnonymous
      };

      await communityService.createComment(commentData);
      toast.success('Comment posted successfully!');
      setNewComment({ content: '', isAnonymous: true });
      
      // Reload comments
      const commentsData = await communityService.getComments(post.id);
      setComments(commentsData);
      
      // Update post reply count
      setPost(prev => prev ? { ...prev, replies: prev.replies + 1 } : null);
    } catch (error) {
      toast.error('Failed to post comment');
    }
  };

  const handleCommentUpdate = async () => {
    if (post) {
      const commentsData = await communityService.getComments(post.id);
      setComments(commentsData);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading post...</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!post) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <Card className="w-full max-w-4xl mx-4">
          <CardContent className="p-8 text-center">
            <p className="text-red-600">Post not found</p>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white rounded-lg shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Forums</span>
          </Button>
          
          <div className="flex items-center space-x-2">
            {post.isPinned && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                <Pin className="w-3 h-3 mr-1" />
                Pinned
              </Badge>
            )}
            {post.isLocked && (
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                <Lock className="w-3 h-3 mr-1" />
                Locked
              </Badge>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Post Content */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{post.title}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={post.author.avatar} />
                      <AvatarFallback>
                        <User className="w-3 h-3" />
                      </AvatarFallback>
                    </Avatar>
                    <span>{post.author.name}</span>
                    {post.author.isAnonymous && (
                      <Badge variant="secondary" className="text-xs">Anonymous</Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatTimeAgo(post.createdAt)}</span>
                  </div>
                  <Badge className={post.category.color}>
                    {post.category.name}
                  </Badge>
                </div>
              </div>
              
              {/* Post Actions Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Flag className="w-4 h-4 mr-2" />
                    Report
                  </DropdownMenuItem>
                  {currentUser.role === 'admin' && (
                    <>
                      <DropdownMenuItem>
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Post Body */}
            <div className="prose max-w-none mb-6">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Post Stats and Actions */}
            <div className="flex items-center justify-between py-4 border-t border-gray-100">
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{post.views} views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.replies} replies</span>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLikePost}
                className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                <span>{likeCount}</span>
              </Button>
            </div>
          </div>

          <Separator />

          {/* Comments Section */}
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Comments ({comments.length})
            </h3>

            {/* New Comment Form */}
            {!post.isLocked && (
              <Card className="mb-6 bg-gray-50">
                <CardContent className="p-4">
                  <Label className="block text-sm font-medium mb-2">Add a comment</Label>
                  <Textarea
                    value={newComment.content}
                    onChange={(e) => setNewComment({...newComment, content: e.target.value})}
                    placeholder="Share your thoughts..."
                    className="mb-3"
                    rows={3}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="anonymous-comment"
                        checked={newComment.isAnonymous}
                        onCheckedChange={(checked) => setNewComment({...newComment, isAnonymous: !!checked})}
                      />
                      <Label htmlFor="anonymous-comment" className="text-sm">
                        Comment anonymously
                      </Label>
                    </div>
                    <Button onClick={handleCreateComment} disabled={!newComment.content.trim()}>
                      <Send className="w-4 h-4 mr-1" />
                      Post Comment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comments Thread */}
            {comments.length > 0 ? (
              <CommentThread
                postId={post.id}
                comments={comments}
                onCommentUpdate={handleCommentUpdate}
                currentUser={currentUser}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ForumPostDetail;
