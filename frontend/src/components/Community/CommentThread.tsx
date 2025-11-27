import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Reply, 
  MoreHorizontal, 
  Edit3, 
  Trash2,
  Send,
  User
} from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
// Simple toast notification system
const toast = {
  success: (message: string) => console.log('✅ Success:', message),
  error: (message: string) => console.error('❌ Error:', message),
};
import { communityService, ForumComment } from '../../services/communityService';

interface CommentThreadProps {
  postId: number;
  comments: ForumComment[];
  onCommentUpdate: () => void;
  currentUser?: any;
}

interface CommentItemProps {
  comment: ForumComment;
  postId: number;
  onCommentUpdate: () => void;
  currentUser?: any;
  level?: number;
}

const CommentItem: React.FC<CommentItemProps> = ({ 
  comment, 
  postId, 
  onCommentUpdate, 
  currentUser,
  level = 0 
}) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [editContent, setEditContent] = useState(comment.content);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.like_count || 0);
  const [replies, setReplies] = useState<ForumComment[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const maxNestingLevel = 3;
  const isMaxNested = level >= maxNestingLevel;

  useEffect(() => {
    if (comment.reply_count > 0 && showReplies) {
      loadReplies();
    }
  }, [showReplies, comment.id]);

  const loadReplies = async () => {
    try {
      setIsLoading(true);
      const repliesData = await communityService.getComments(postId, comment.id);
      setReplies(repliesData);
    } catch (error) {
      toast.error('Failed to load replies');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const response = await communityService.likeComment(comment.id);
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
      toast.success(response.message);
    } catch (error) {
      toast.error('Failed to like comment');
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;

    try {
      const response = await communityService.replyToComment(comment.id, {
        content: replyContent,
        is_anonymous: isAnonymous
      });
      
      setReplies(prev => [...prev, response.reply]);
      setReplyContent('');
      setIsReplying(false);
      setShowReplies(true);
      onCommentUpdate();
      toast.success('Reply posted successfully!');
    } catch (error) {
      toast.error('Failed to post reply');
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;

    try {
      await communityService.updateComment(comment.id, {
        content: editContent
      });
      setIsEditing(false);
      onCommentUpdate();
      toast.success('Comment updated successfully!');
    } catch (error) {
      toast.error('Failed to update comment');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await communityService.deleteComment(comment.id);
      onCommentUpdate();
      toast.success('Comment deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete comment');
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${level > 0 ? 'ml-8 border-l-2 border-gray-100 pl-4' : ''}`}
    >
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
        {/* Comment Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={comment.author?.avatar} />
              <AvatarFallback>
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-sm">
                  {comment.author_display_name}
                </span>
                {comment.is_anonymous && (
                  <Badge variant="secondary" className="text-xs">Anonymous</Badge>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {formatTimeAgo(comment.created_at)}
              </span>
            </div>
          </div>

          {/* Comment Actions Menu */}
          {currentUser && (currentUser.id === comment.author?.id || currentUser.role === 'admin') && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Comment Content */}
        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleEdit}>
                Save
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-gray-700 mb-3 leading-relaxed">{comment.content}</p>
        )}

        {/* Comment Actions */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-xs">{likeCount}</span>
          </Button>

          {!isMaxNested && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsReplying(!isReplying)}
              className="flex items-center space-x-1 text-gray-500"
            >
              <Reply className="w-4 h-4" />
              <span className="text-xs">Reply</span>
            </Button>
          )}

          {comment.reply_count > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center space-x-1 text-gray-500"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs">
                {showReplies ? 'Hide' : 'Show'} {comment.reply_count} {comment.reply_count === 1 ? 'reply' : 'replies'}
              </span>
            </Button>
          )}
        </div>

        {/* Reply Form */}
        <AnimatePresence>
          {isReplying && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-gray-50 rounded-lg"
            >
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your reply..."
                className="mb-3"
                rows={3}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`anonymous-reply-${comment.id}`}
                    checked={isAnonymous}
                    onCheckedChange={(checked) => setIsAnonymous(!!checked)}
                  />
                  <Label htmlFor={`anonymous-reply-${comment.id}`} className="text-sm">
                    Reply anonymously
                  </Label>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setIsReplying(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleReply} disabled={!replyContent.trim()}>
                    <Send className="w-4 h-4 mr-1" />
                    Reply
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nested Replies */}
      <AnimatePresence>
        {showReplies && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 space-y-4"
          >
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : (
              replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  postId={postId}
                  onCommentUpdate={onCommentUpdate}
                  currentUser={currentUser}
                  level={level + 1}
                />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const CommentThread: React.FC<CommentThreadProps> = ({ 
  postId, 
  comments, 
  onCommentUpdate, 
  currentUser 
}) => {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          postId={postId}
          onCommentUpdate={onCommentUpdate}
          currentUser={currentUser}
        />
      ))}
    </div>
  );
};

export default CommentThread;
