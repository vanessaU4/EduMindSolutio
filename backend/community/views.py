from rest_framework import generics, status, filters, permissions
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied, NotFound, ValidationError
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q, Count, F
from .models import (
    ForumCategory, ForumPost, ForumComment, PeerSupportMatch, 
    ChatRoom, ChatMessage, ModerationReport, ChatRoomParticipant,
    PostLike, CommentLike
)
from .serializers import (
    ForumCategorySerializer, ForumPostSerializer, ForumCommentSerializer,
    ChatRoomSerializer, ChatMessageSerializer, PeerSupportMatchSerializer,
    ModerationReportSerializer
)


class CommunityHubView(generics.GenericAPIView):
    """Community hub overview"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'message': 'Welcome to the Community Hub',
            'features': [
                'Peer Support Groups',
                'Discussion Forums',
                'Chat Rooms',
                'Community Events'
            ],
            'user': request.user.username
        })


class ForumCategoryListView(generics.ListAPIView):
    """List all forum categories"""
    permission_classes = [IsAuthenticated]
    serializer_class = ForumCategorySerializer
    queryset = ForumCategory.objects.filter(is_active=True)


class ForumPostListView(generics.ListCreateAPIView):
    """List and create forum posts"""
    permission_classes = [IsAuthenticated]
    serializer_class = ForumPostSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'content']
    ordering_fields = ['created_at', 'last_activity', 'like_count']
    ordering = ['-last_activity']

    def get_queryset(self):
        # Show all posts for admins/guides, only approved for regular users
        if hasattr(self.request.user, 'role') and self.request.user.role in ['admin', 'guide']:
            queryset = ForumPost.objects.all()
        else:
            queryset = ForumPost.objects.filter(is_approved=True)
        
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category_id=category)
        return queryset
    
    def create(self, request, *args, **kwargs):
        """Override create to provide better error handling"""
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            print(f"Error creating post: {e}")
            print(f"Request data: {request.data}")
            return Response(
                {'error': str(e), 'details': 'Failed to create post'}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class ForumPostDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a forum post"""
    permission_classes = [IsAuthenticated]
    serializer_class = ForumPostSerializer

    def get_queryset(self):
        # Show all posts for admins/guides, only approved for regular users
        if hasattr(self.request.user, 'role') and self.request.user.role in ['admin', 'guide']:
            return ForumPost.objects.all()
        else:
            return ForumPost.objects.filter(is_approved=True)

    def get_object(self):
        obj = super().get_object()
        # Increment view count only for approved posts or admin/guide users
        if obj.is_approved or (hasattr(self.request.user, 'role') and self.request.user.role in ['admin', 'guide']):
            obj.view_count += 1
            obj.save(update_fields=['view_count'])
        return obj


class ForumCommentListView(generics.ListCreateAPIView):
    """List and create comments for a post with nested replies support"""
    permission_classes = [IsAuthenticated]
    serializer_class = ForumCommentSerializer

    def get_queryset(self):
        post_id = self.request.query_params.get('post', None)
        parent_id = self.request.query_params.get('parent', None)
        
        queryset = ForumComment.objects.filter(is_approved=True)
        
        if post_id:
            queryset = queryset.filter(post_id=post_id)
        
        # If parent_id is provided, get replies to that comment
        if parent_id:
            queryset = queryset.filter(parent_id=parent_id)
        else:
            # Only get top-level comments (no parent)
            queryset = queryset.filter(parent__isnull=True)
        
        return queryset.prefetch_related('replies', 'author').order_by('created_at')
    
    def perform_create(self, serializer):
        comment = serializer.save(author=self.request.user)
        
        # Update reply count if this is a reply
        if comment.parent:
            comment.parent.reply_count = comment.parent.replies.filter(is_approved=True).count()
            comment.parent.save(update_fields=['reply_count'])
        
        # Update post last_activity when a new comment is added
        comment.post.last_activity = timezone.now()
        comment.post.save(update_fields=['last_activity'])


class ForumCommentReplyView(APIView):
    """Create replies to comments"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, comment_id):
        try:
            parent_comment = ForumComment.objects.get(id=comment_id, is_approved=True)
            content = request.data.get('content', '').strip()
            is_anonymous = request.data.get('is_anonymous', True)
            
            if not content:
                return Response({'error': 'Content is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Create reply
            reply = ForumComment.objects.create(
                post=parent_comment.post,
                parent=parent_comment,
                author=request.user,
                content=content,
                is_anonymous=is_anonymous
            )
            
            # Update parent comment reply count
            parent_comment.reply_count = parent_comment.replies.filter(is_approved=True).count()
            parent_comment.save(update_fields=['reply_count'])
            
            # Serialize and return the reply
            serializer = ForumCommentSerializer(reply)
            return Response({
                'message': 'Reply created successfully',
                'reply': serializer.data
            }, status=status.HTTP_201_CREATED)
            
        except ForumComment.DoesNotExist:
            return Response({'error': 'Comment not found'}, status=status.HTTP_404_NOT_FOUND)


class ForumCommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a comment"""
    permission_classes = [IsAuthenticated]
    serializer_class = ForumCommentSerializer
    
    def get_queryset(self):
        return ForumComment.objects.filter(is_approved=True)
    
    def update(self, request, *args, **kwargs):
        comment = self.get_object()
        # Only author or admin can update
        if comment.author != request.user and not (hasattr(request.user, 'role') and request.user.role in ['admin', 'guide']):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        comment = self.get_object()
        # Only author or admin can delete
        if comment.author != request.user and not (hasattr(request.user, 'role') and request.user.role in ['admin', 'guide']):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)


class ChatRoomListView(generics.ListAPIView):
    """List available chat rooms"""
    permission_classes = [IsAuthenticated]
    serializer_class = ChatRoomSerializer
    queryset = ChatRoom.objects.filter(is_active=True)


class ChatRoomDetailView(generics.RetrieveAPIView):
    """Detailed view of a specific chat room"""
    permission_classes = [IsAuthenticated]
    serializer_class = ChatRoomSerializer
    queryset = ChatRoom.objects.filter(is_active=True)


class PostLikeView(APIView):
    """Like/unlike a forum post"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, post_id):
        try:
            post = ForumPost.objects.get(id=post_id, is_approved=True)
            like, created = PostLike.objects.get_or_create(
                user=request.user,
                post=post
            )
            
            if not created:
                # Unlike the post
                like.delete()
                post.like_count = max(0, post.like_count - 1)
                post.save(update_fields=['like_count'])
                
                return Response({
                    'liked': False,
                    'message': 'Post unliked successfully'
                }, status=status.HTTP_200_OK)
            else:
                # Like the post
                post.like_count += 1
                post.save(update_fields=['like_count'])
                
                return Response({
                    'liked': True,
                    'message': 'Post liked successfully'
                }, status=status.HTTP_201_CREATED)
                
        except ForumPost.DoesNotExist:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)


class CommentLikeView(APIView):
    """Like/unlike a forum comment"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, comment_id):
        try:
            comment = ForumComment.objects.get(id=comment_id, is_approved=True)
            like, created = CommentLike.objects.get_or_create(
                user=request.user,
                comment=comment
            )
            
            if not created:
                # Unlike the comment
                like.delete()
                comment.like_count = max(0, comment.like_count - 1)
                comment.save(update_fields=['like_count'])
                
                return Response({
                    'liked': False,
                    'message': 'Comment unliked successfully'
                }, status=status.HTTP_200_OK)
            else:
                # Like the comment
                comment.like_count += 1
                comment.save(update_fields=['like_count'])
                
                return Response({
                    'liked': True,
                    'message': 'Comment liked successfully'
                }, status=status.HTTP_201_CREATED)
                
        except ForumComment.DoesNotExist:
            return Response({'error': 'Comment not found'}, status=status.HTTP_404_NOT_FOUND)


class PeerSupportView(generics.ListCreateAPIView):
    """Peer support matching requests"""
    permission_classes = [IsAuthenticated]
    serializer_class = PeerSupportMatchSerializer

    def get_queryset(self):
        return PeerSupportMatch.objects.filter(requester=self.request.user)

# COMPREHENSIVE COMMUNITY API ENDPOINTS

class PostLikeView(APIView):
    """Like/unlike a forum post"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, post_id):
        try:
            post = ForumPost.objects.get(id=post_id, is_approved=True)
            like, created = PostLike.objects.get_or_create(
                user=request.user, 
                post=post
            )
            
            if not created:
                # Unlike if already liked
                like.delete()
                post.like_count = F('like_count') - 1
                post.save(update_fields=['like_count'])
                return Response({'liked': False, 'message': 'Post unliked'})
            else:
                # Like the post
                post.like_count = F('like_count') + 1
                post.save(update_fields=['like_count'])
                return Response({'liked': True, 'message': 'Post liked'})
                
        except ForumPost.DoesNotExist:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

class CommentLikeView(APIView):
    """Like/unlike a forum comment"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, comment_id):
        try:
            comment = ForumComment.objects.get(id=comment_id, is_approved=True)
            like, created = CommentLike.objects.get_or_create(
                user=request.user, 
                comment=comment
            )
            
            if not created:
                like.delete()
                comment.like_count = F('like_count') - 1
                comment.save(update_fields=['like_count'])
                return Response({'liked': False, 'message': 'Comment unliked'})
            else:
                comment.like_count = F('like_count') + 1
                comment.save(update_fields=['like_count'])
                return Response({'liked': True, 'message': 'Comment liked'})
                
        except ForumComment.DoesNotExist:
            return Response({'error': 'Comment not found'}, status=status.HTTP_404_NOT_FOUND)

class ModerationReportView(generics.ListCreateAPIView):
    """Create and view moderation reports"""
    permission_classes = [IsAuthenticated]
    serializer_class = ModerationReportSerializer
    
    def get_queryset(self):
        if self.request.user.role in ['guide', 'admin']:
            return ModerationReport.objects.all()
        return ModerationReport.objects.filter(reporter=self.request.user)

class AdminModerationView(APIView):
    """Admin/Guide moderation actions"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, report_id):
        if request.user.role not in ['guide', 'admin']:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            report = ModerationReport.objects.get(id=report_id)
            action = request.data.get('action')
            moderator_notes = request.data.get('moderator_notes', '')
            
            if action == 'resolve':
                report.status = 'resolved'
                report.moderator = request.user
                report.moderator_notes = moderator_notes
                report.resolved_at = timezone.now()
                report.save()
                
                return Response({'message': 'Report resolved successfully'})
            elif action == 'dismiss':
                report.status = 'dismissed'
                report.moderator = request.user
                report.moderator_notes = moderator_notes
                report.resolved_at = timezone.now()
                report.save()
                
                return Response({'message': 'Report dismissed'})
            else:
                return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)
                
        except ModerationReport.DoesNotExist:
            return Response({'error': 'Report not found'}, status=status.HTTP_404_NOT_FOUND)

class AdminForumCategoryView(generics.ListCreateAPIView):
    """Admin can manage forum categories"""
    serializer_class = ForumCategorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if not hasattr(self.request.user, 'role') or self.request.user.role != 'admin':
            raise permissions.PermissionDenied("Admin access required")
        return ForumCategory.objects.all()
    
    def perform_create(self, serializer):
        if not hasattr(self.request.user, 'role') or self.request.user.role != 'admin':
            raise permissions.PermissionDenied("Admin access required")
        serializer.save()
    
    def create(self, request, *args, **kwargs):
        """Override create to provide better error handling"""
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {'error': str(e), 'details': 'Failed to create category'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class AdminForumCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin can update/delete forum categories"""
    serializer_class = ForumCategorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if not hasattr(self.request.user, 'role') or self.request.user.role != 'admin':
            raise permissions.PermissionDenied("Admin access required")
        return ForumCategory.objects.all()
    
    def destroy(self, request, *args, **kwargs):
        """Override destroy to check for posts before deletion"""
        category = self.get_object()
        
        # Check if category has any posts
        post_count = category.posts.count()
        if post_count > 0:
            return Response(
                {
                    'error': f'Cannot delete category "{category.name}" because it has {post_count} post(s). Please move or delete the posts first.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().destroy(request, *args, **kwargs)

class AdminForumPostView(generics.ListCreateAPIView):
    """Admin can manage all forum posts"""
    serializer_class = ForumPostSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'content', 'author__username']
    ordering_fields = ['created_at', 'last_activity', 'like_count', 'view_count']
    ordering = ['-last_activity']
    
    def get_queryset(self):
        if self.request.user.role not in ['admin', 'guide']:
            raise permissions.PermissionDenied("Admin or Guide access required")
        return ForumPost.objects.all()

class AdminForumPostDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin can update/delete forum posts"""
    serializer_class = ForumPostSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if not hasattr(self.request.user, 'role') or self.request.user.role not in ['admin', 'guide']:
            raise permissions.PermissionDenied("Admin or Guide access required")
        return ForumPost.objects.all()
    
    def destroy(self, request, *args, **kwargs):
        """Override destroy to provide better error handling"""
        try:
            post = self.get_object()
            post_title = post.title
            result = super().destroy(request, *args, **kwargs)
            
            # Log the deletion for audit purposes
            print(f"Post '{post_title}' deleted by {request.user.username}")
            
            return result
        except Exception as e:
            return Response(
                {'error': str(e), 'details': 'Failed to delete post'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class AdminChatRoomView(generics.ListCreateAPIView):
    """Admin can manage chat rooms"""
    serializer_class = ChatRoomSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role != 'admin':
            raise permissions.PermissionDenied("Admin access required")
        return ChatRoom.objects.all()
    
    def perform_create(self, serializer):
        if self.request.user.role != 'admin':
            raise permissions.PermissionDenied("Admin access required")
        serializer.save()

class AdminChatRoomDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin can update/delete chat rooms"""
    serializer_class = ChatRoomSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role != 'admin':
            raise permissions.PermissionDenied("Admin access required")
        return ChatRoom.objects.all()

class CommunityStatsView(APIView):
    """Community statistics for dashboard"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user_role = request.user.role
        
        # Basic stats for all users
        stats = {
            'total_posts': ForumPost.objects.filter(is_approved=True).count(),
            'total_comments': ForumComment.objects.filter(is_approved=True).count(),
            'active_chat_rooms': ChatRoom.objects.filter(is_active=True).count(),
            'user_posts': ForumPost.objects.filter(author=request.user, is_approved=True).count(),
        }
        
        # Additional stats for guides and admins
        if user_role in ['guide', 'admin']:
            stats.update({
                'pending_reports': ModerationReport.objects.filter(status='pending').count(),
                'total_reports': ModerationReport.objects.count(),
                'active_peer_matches': PeerSupportMatch.objects.filter(status='active').count(),
            })
        
        # Admin-only stats
        if user_role == 'admin':
            stats.update({
                'total_categories': ForumCategory.objects.count(),
                'total_users_active': ForumPost.objects.values('author').distinct().count(),
                'posts_this_week': ForumPost.objects.filter(
                    created_at__gte=timezone.now() - timezone.timedelta(days=7)
                ).count(),
            })
        
        return Response(stats)

class UserForumActivityView(APIView):
    """Get user's forum activity"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user_posts = ForumPost.objects.filter(
            author=request.user, 
            is_approved=True
        ).order_by('-created_at')[:5]
        
        user_comments = ForumComment.objects.filter(
            author=request.user,
            is_approved=True
        ).order_by('-created_at')[:5]
        
        return Response({
            'recent_posts': ForumPostSerializer(user_posts, many=True).data,
            'recent_comments': ForumCommentSerializer(user_comments, many=True).data,
            'total_posts': ForumPost.objects.filter(author=request.user, is_approved=True).count(),
            'total_comments': ForumComment.objects.filter(author=request.user, is_approved=True).count(),
        })

class PeerSupportMatchingView(APIView):
    """Handle peer support matching"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get user's peer support matches"""
        matches = PeerSupportMatch.objects.filter(
            Q(requester=request.user) | Q(supporter=request.user)
        ).order_by('-created_at')
        
        serializer = PeerSupportMatchSerializer(matches, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        """Create a new peer support request"""
        serializer = PeerSupportMatchSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            match = serializer.save()
            
            # Simple matching logic - find available supporters
            # In a real system, this would be more sophisticated
            available_supporters = PeerSupportMatch.objects.filter(
                status='pending',
                supporter__isnull=True
            ).exclude(requester=request.user)
            
            return Response({
                'message': 'Peer support request created successfully',
                'match_id': match.id,
                'status': match.status
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request, match_id):
        """Accept, complete, approve, or reject a peer support match"""
        try:
            match = PeerSupportMatch.objects.get(id=match_id)
            action = request.data.get('action')
            
            if action == 'accept' and match.supporter is None:
                match.supporter = request.user
                match.status = 'active'
                match.matched_at = timezone.now()
                match.save()
                
                return Response({'message': 'Peer support match accepted'})
            
            elif action == 'complete' and match.supporter == request.user:
                match.status = 'completed'
                match.completed_at = timezone.now()
                match.save()
                
                return Response({'message': 'Peer support match completed'})
            
            elif action == 'approve' and (request.user.is_staff or request.user.role in ['admin', 'guide']):
                match.status = 'pending'
                match.approved_by = request.user
                match.approved_at = timezone.now()
                match.admin_message = request.data.get('message', '')
                match.save()
                
                return Response({'message': 'Peer support request approved'})
            
            elif action == 'reject' and (request.user.is_staff or request.user.role in ['admin', 'guide']):
                match.status = 'rejected'
                match.approved_by = request.user
                match.approved_at = timezone.now()
                match.rejection_reason = request.data.get('reason', '')
                match.admin_message = request.data.get('message', '')
                match.save()
                
                return Response({'message': 'Peer support request rejected'})
            
            else:
                return Response({'error': 'Invalid action or insufficient permissions'}, status=status.HTTP_400_BAD_REQUEST)
                
        except PeerSupportMatch.DoesNotExist:
            return Response({'error': 'Match not found'}, status=status.HTTP_404_NOT_FOUND)


# COMPREHENSIVE CHAT ROOM CRUD SYSTEM FOR 3 USERS

class ChatRoomCRUDView(generics.ListCreateAPIView):
    """Complete CRUD for chat rooms designed for 3 users"""
    permission_classes = [IsAuthenticated]
    serializer_class = ChatRoomSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'topic']
    ordering_fields = ['created_at', 'last_activity', 'participant_count']
    ordering = ['-last_activity']

    def get_queryset(self):
        queryset = ChatRoom.objects.filter(is_active=True)
        
        # Filter by room type
        room_type = self.request.query_params.get('type', None)
        if room_type:
            queryset = queryset.filter(room_type=room_type)
        
        # Filter by availability (not full)
        available_only = self.request.query_params.get('available', None)
        if available_only == 'true':
            queryset = queryset.annotate(
                participant_count=Count('participants')
            ).filter(participant_count__lt=3)
        
        # Filter by user's rooms
        my_rooms = self.request.query_params.get('my_rooms', None)
        if my_rooms == 'true':
            queryset = queryset.filter(participants=self.request.user)
        
        return queryset.annotate(
            participant_count=Count('participants')
        ).prefetch_related('participants', 'creator')

    def perform_create(self, serializer):
        room = serializer.save(creator=self.request.user)
        # Automatically add creator as participant
        ChatRoomParticipant.objects.create(
            room=room,
            user=self.request.user,
            is_active=True
        )


class ChatRoomDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Detailed CRUD operations for specific chat room"""
    permission_classes = [IsAuthenticated]
    serializer_class = ChatRoomSerializer
    
    def get_queryset(self):
        return ChatRoom.objects.filter(is_active=True).annotate(
            participant_count=Count('participants')
        ).prefetch_related('participants', 'creator', 'messages')
    
    def update(self, request, *args, **kwargs):
        room = self.get_object()
        # Only creator or admin can update room
        if room.creator != request.user and not hasattr(request.user, 'role') or request.user.role != 'admin':
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        room = self.get_object()
        # Only creator or admin can delete room
        if room.creator != request.user and not hasattr(request.user, 'role') or request.user.role != 'admin':
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)


class ChatRoomJoinView(APIView):
    """Join a chat room (max 100 users)"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        try:
            room = ChatRoom.objects.get(id=pk, is_active=True)
            
            # Check if user is already in room FIRST
            if room.participants.filter(id=request.user.id).exists():
                return Response({
                    'message': 'Welcome back! You are already in this chat room',
                    'room_name': room.name,
                    'participant_count': room.get_participant_count(),
                    'room_code': room.room_code,
                    'already_member': True
                }, status=status.HTTP_200_OK)
            
            # Check if room is full
            if room.is_full():
                return Response({
                    'error': f'Chat room is full ({room.get_participant_count()}/{room.max_participants} participants)',
                    'participant_count': room.get_participant_count(),
                    'max_participants': room.max_participants
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Add user to room
            participant, created = ChatRoomParticipant.objects.get_or_create(
                room=room,
                user=request.user,
                defaults={'is_active': True}
            )
            
            if not created:
                participant.is_active = True
                participant.last_seen = timezone.now()
                participant.save()
            
            # Update room activity
            room.last_activity = timezone.now()
            room.save()
            
            # Create system message
            ChatMessage.objects.create(
                room=room,
                author=request.user,
                content=f"{request.user.display_name} joined the chat",
                is_system_message=True,
                is_anonymous=False
            )
            
            return Response({
                'message': 'Successfully joined chat room',
                'room_name': room.name,
                'participant_count': room.get_participant_count(),
                'room_code': room.room_code
            })
            
        except ChatRoom.DoesNotExist:
            return Response({'error': 'Chat room not found'}, status=status.HTTP_404_NOT_FOUND)


class ChatRoomLeaveView(APIView):
    """Leave a chat room"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        try:
            room = ChatRoom.objects.get(id=pk, is_active=True)
            
            # Check if user is in room
            try:
                participant = ChatRoomParticipant.objects.get(
                    room=room,
                    user=request.user,
                    is_active=True
                )
            except ChatRoomParticipant.DoesNotExist:
                return Response({
                    'error': 'You are not in this chat room'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Remove user from room
            participant.is_active = False
            participant.save()
            
            # Create system message
            ChatMessage.objects.create(
                room=room,
                author=request.user,
                content=f"{request.user.display_name} left the chat",
                is_system_message=True,
                is_anonymous=False
            )
            
            # Update room activity
            room.last_activity = timezone.now()
            room.save()
            
            return Response({
                'message': 'Successfully left chat room',
                'participant_count': room.get_participant_count()
            })
            
        except ChatRoom.DoesNotExist:
            return Response({'error': 'Chat room not found'}, status=status.HTTP_404_NOT_FOUND)


class ChatRoomJoinByCodeView(APIView):
    """Join chat room using room code"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        room_code = request.data.get('room_code', '').upper()
        
        if not room_code:
            return Response({'error': 'Room code is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            room = ChatRoom.objects.get(room_code=room_code, is_active=True)
            
            # Check if room is full
            if room.is_full():
                return Response({
                    'error': 'Chat room is full (3/3 participants)',
                    'room_name': room.name
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if user is already in room
            if room.participants.filter(id=request.user.id).exists():
                return Response({
                    'message': 'You are already in this chat room',
                    'room_id': room.id,
                    'room_name': room.name
                })
            
            # Add user to room
            ChatRoomParticipant.objects.create(
                room=room,
                user=request.user,
                is_active=True
            )
            
            # Create system message
            ChatMessage.objects.create(
                room=room,
                author=request.user,
                content=f"{request.user.display_name} joined using room code",
                is_system_message=True,
                is_anonymous=False
            )
            
            return Response({
                'message': 'Successfully joined chat room',
                'room_id': room.id,
                'room_name': room.name,
                'participant_count': room.get_participant_count()
            })
            
        except ChatRoom.DoesNotExist:
            return Response({'error': 'Invalid room code'}, status=status.HTTP_404_NOT_FOUND)


class ChatMessageCRUDView(generics.ListCreateAPIView):
    """CRUD operations for chat messages"""
    permission_classes = [IsAuthenticated]
    serializer_class = ChatMessageSerializer
    
    def get_queryset(self):
        room_id = self.request.query_params.get('room_id')
        if not room_id:
            return ChatMessage.objects.none()
        
        # Check if user is participant in the room
        try:
            room = ChatRoom.objects.get(id=room_id, is_active=True)
            if not room.participants.filter(id=self.request.user.id).exists():
                return ChatMessage.objects.none()
            
            return ChatMessage.objects.filter(room=room).order_by('created_at')
        except ChatRoom.DoesNotExist:
            return ChatMessage.objects.none()
    
    def perform_create(self, serializer):
        room_id = self.request.data.get('room')
        try:
            room = ChatRoom.objects.get(id=room_id, is_active=True)
            
            # Check if user is participant
            if not room.participants.filter(id=self.request.user.id).exists():
                raise PermissionDenied("You must be a participant to send messages")
            
            # Update user's last seen
            ChatRoomParticipant.objects.filter(
                room=room,
                user=self.request.user
            ).update(last_seen=timezone.now())
            
            # Update room activity
            room.last_activity = timezone.now()
            room.save()
            
            serializer.save(
                room=room,
                author=self.request.user
            )
            
        except ChatRoom.DoesNotExist:
            raise NotFound("Chat room not found")


class ChatRoomParticipantsView(APIView):
    """Get participants of a chat room"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        try:
            room = ChatRoom.objects.get(id=pk, is_active=True)
            
            # Check if user is participant
            if not room.participants.filter(id=request.user.id).exists():
                return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
            
            participants = ChatRoomParticipant.objects.filter(
                room=room,
                is_active=True
            ).select_related('user').order_by('joined_at')
            
            participant_data = []
            for participant in participants:
                participant_data.append({
                    'id': participant.user.id,
                    'username': participant.user.username,
                    'display_name': participant.user.display_name,
                    'joined_at': participant.joined_at,
                    'last_seen': participant.last_seen,
                    'is_creator': participant.user == room.creator
                })
            
            return Response({
                'room_name': room.name,
                'room_code': room.room_code,
                'participant_count': len(participant_data),
                'max_participants': room.max_participants,
                'participants': participant_data
            })
            
        except ChatRoom.DoesNotExist:
            return Response({'error': 'Chat room not found'}, status=status.HTTP_404_NOT_FOUND)


class ChatRoomStatsView(APIView):
    """Get chat room statistics"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user_rooms = ChatRoom.objects.filter(
            participants=request.user,
            is_active=True
        ).count()
        
        created_rooms = ChatRoom.objects.filter(
            creator=request.user,
            is_active=True
        ).count()
        
        total_messages = ChatMessage.objects.filter(
            author=request.user,
            is_system_message=False
        ).count()
        
        available_rooms = ChatRoom.objects.filter(
            is_active=True
        ).annotate(
            participant_count=Count('participants')
        ).filter(participant_count__lt=3).count()
        
        return Response({
            'user_rooms': user_rooms,
            'created_rooms': created_rooms,
            'total_messages': total_messages,
            'available_rooms': available_rooms,
            'max_participants_per_room': 3
        })


class AdminPeerSupportView(APIView):
    """Admin view for managing all peer support requests"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Only admin and guide users can access this endpoint
        if not hasattr(request.user, 'role') or request.user.role not in ['admin', 'guide']:
            return Response({'error': 'Admin or Guide access required'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get all peer support matches for admin review
        matches = PeerSupportMatch.objects.all().order_by('-created_at')
        serializer = PeerSupportMatchSerializer(matches, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
