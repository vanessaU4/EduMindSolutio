from rest_framework import generics, permissions, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError
from .models import (
    Article, Video, AudioContent, MentalHealthResource,
    ArticleLike, ArticleView, ArticleShare, VideoLike, VideoView, VideoShare,
    AudioLike, AudioView, AudioShare
)
from .serializers import (
    ArticleSerializer, VideoSerializer,
    AudioContentSerializer, MentalHealthResourceSerializer
)


class ArticleListView(generics.ListCreateAPIView):
    """List and create articles"""
    queryset = Article.objects.filter(is_published=True)
    serializer_class = ArticleSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'excerpt', 'content', 'tags']
    ordering_fields = ['published_at', 'view_count', 'like_count']
    ordering = ['-published_at']

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        from django.core.cache import cache
        serializer.save(author=self.request.user)
        # Invalidate content stats cache when new content is created
        cache.delete('content_stats')


class ArticleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, delete articles"""
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    lookup_field = 'slug'

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        elif self.request.method in ['PUT', 'PATCH']:
            return [permissions.IsAuthenticated()]
        elif self.request.method == 'DELETE':
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]

    def get_object(self):
        obj = super().get_object()
        # Increment view count for GET requests
        if self.request.method == 'GET':
            obj.view_count += 1
            obj.save(update_fields=['view_count'])
        return obj
    
    def perform_update(self, serializer):
        """Custom update logic with validation"""
        # Check if user is author or admin
        article = self.get_object()
        if not (self.request.user == article.author or self.request.user.is_staff):
            raise ValidationError("You can only edit your own articles or be an admin.")
        
        # Update the article
        serializer.save(updated_at=timezone.now())
    
    def perform_destroy(self, instance):
        """Custom delete logic with validation"""
        # Check if user is author or admin
        if not (self.request.user == instance.author or self.request.user.is_staff):
            raise ValidationError("You can only delete your own articles or be an admin.")
        
        # Soft delete by unpublishing instead of hard delete for data integrity
        if self.request.query_params.get('hard_delete') == 'true' and self.request.user.is_staff:
            # Only admins can hard delete
            instance.delete()
        else:
            # Soft delete - just unpublish
            instance.is_published = False
            instance.save(update_fields=['is_published', 'updated_at'])
    
    def destroy(self, request, *args, **kwargs):
        """Override destroy to return custom response"""
        instance = self.get_object()
        hard_delete = request.query_params.get('hard_delete') == 'true'
        
        try:
            self.perform_destroy(instance)
            if hard_delete and request.user.is_staff:
                return Response(
                    {'message': 'Article permanently deleted successfully'}, 
                    status=status.HTTP_204_NO_CONTENT
                )
            else:
                return Response(
                    {'message': 'Article unpublished successfully'}, 
                    status=status.HTTP_200_OK
                )
        except ValidationError as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_403_FORBIDDEN
            )


class VideoListView(generics.ListCreateAPIView):
    """List and create videos"""
    queryset = Video.objects.filter(is_published=True)
    serializer_class = VideoSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'tags']
    ordering_fields = ['published_at', 'view_count', 'like_count']
    ordering = ['-published_at']

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]



    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class VideoDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, delete videos"""
    queryset = Video.objects.all()
    serializer_class = VideoSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        elif self.request.method in ['PUT', 'PATCH']:
            return [permissions.IsAuthenticated()]
        elif self.request.method == 'DELETE':
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]

    def get_object(self):
        obj = super().get_object()
        # Increment view count for GET requests
        if self.request.method == 'GET':
            obj.view_count += 1
            obj.save(update_fields=['view_count'])
        return obj
    
    def perform_update(self, serializer):
        """Custom update logic with validation"""
        # Check if user is author or admin
        video = self.get_object()
        if not (self.request.user == video.author or self.request.user.is_staff):
            raise ValidationError("You can only edit your own videos or be an admin.")
        
        # Update the video
        serializer.save(updated_at=timezone.now())
    
    def perform_destroy(self, instance):
        """Custom delete logic with validation"""
        # Check if user is author or admin
        if not (self.request.user == instance.author or self.request.user.is_staff):
            raise ValidationError("You can only delete your own videos or be an admin.")
        
        # Soft delete by unpublishing instead of hard delete for data integrity
        if self.request.query_params.get('hard_delete') == 'true' and self.request.user.is_staff:
            # Only admins can hard delete
            instance.delete()
        else:
            # Soft delete - just unpublish
            instance.is_published = False
            instance.save(update_fields=['is_published', 'updated_at'])
    
    def destroy(self, request, *args, **kwargs):
        """Override destroy to return custom response"""
        instance = self.get_object()
        hard_delete = request.query_params.get('hard_delete') == 'true'
        
        try:
            self.perform_destroy(instance)
            if hard_delete and request.user.is_staff:
                return Response(
                    {'message': 'Video permanently deleted successfully'}, 
                    status=status.HTTP_204_NO_CONTENT
                )
            else:
                return Response(
                    {'message': 'Video unpublished successfully'}, 
                    status=status.HTTP_200_OK
                )
        except ValidationError as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_403_FORBIDDEN
            )


class AudioContentListView(generics.ListCreateAPIView):
    """List and create audio content"""
    queryset = AudioContent.objects.filter(is_published=True)
    serializer_class = AudioContentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'tags']
    ordering_fields = ['created_at', 'published_at', 'play_count', 'like_count']
    ordering = ['-published_at', '-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        audio_type = self.request.query_params.get('audio_type')
        if audio_type:
            queryset = queryset.filter(audio_type=audio_type)
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class AudioContentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, delete audio content"""
    queryset = AudioContent.objects.all()
    serializer_class = AudioContentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        elif self.request.method in ['PUT', 'PATCH']:
            return [permissions.IsAuthenticated()]
        elif self.request.method == 'DELETE':
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]

    def get_object(self):
        obj = super().get_object()
        # Increment play count for GET requests
        if self.request.method == 'GET':
            obj.play_count += 1
            obj.save(update_fields=['play_count'])
        return obj
    
    def perform_update(self, serializer):
        """Custom update logic with validation"""
        # Check if user is author or admin
        audio = self.get_object()
        if not (self.request.user == audio.author or self.request.user.is_staff):
            raise ValidationError("You can only edit your own audio content or be an admin.")
        
        # Update the audio content
        serializer.save(updated_at=timezone.now())
    
    def perform_destroy(self, instance):
        """Custom delete logic with validation"""
        # Check if user is author or admin
        if not (self.request.user == instance.author or self.request.user.is_staff):
            raise ValidationError("You can only delete your own audio content or be an admin.")
        
        # Soft delete by unpublishing instead of hard delete for data integrity
        if self.request.query_params.get('hard_delete') == 'true' and self.request.user.is_staff:
            # Only admins can hard delete
            instance.delete()
        else:
            # Soft delete - just unpublish
            instance.is_published = False
            instance.save(update_fields=['is_published', 'updated_at'])
    
    def destroy(self, request, *args, **kwargs):
        """Override destroy to return custom response"""
        instance = self.get_object()
        hard_delete = request.query_params.get('hard_delete') == 'true'
        
        try:
            self.perform_destroy(instance)
            if hard_delete and request.user.is_staff:
                return Response(
                    {'message': 'Audio content permanently deleted successfully'}, 
                    status=status.HTTP_204_NO_CONTENT
                )
            else:
                return Response(
                    {'message': 'Audio content unpublished successfully'}, 
                    status=status.HTTP_200_OK
                )
        except ValidationError as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_403_FORBIDDEN
            )


class MentalHealthResourceListView(generics.ListCreateAPIView):
    """List and create mental health resources"""
    queryset = MentalHealthResource.objects.filter(is_verified=True)
    serializer_class = MentalHealthResourceSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'city', 'state', 'services_offered', 'specializations']
    ordering_fields = ['name', 'rating', 'created_at']
    ordering = ['name']

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), permissions.IsAdminUser()]
        return [permissions.AllowAny()]


class MentalHealthResourceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, delete mental health resources"""
    queryset = MentalHealthResource.objects.all()
    serializer_class = MentalHealthResourceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        elif self.request.method in ['PUT', 'PATCH']:
            return [permissions.IsAuthenticated(), permissions.IsAdminUser()]
        elif self.request.method == 'DELETE':
            return [permissions.IsAuthenticated(), permissions.IsAdminUser()]
        return [permissions.IsAuthenticated(), permissions.IsAdminUser()]
    
    def perform_update(self, serializer):
        """Custom update logic with validation"""
        # Only admins can update resources
        if not self.request.user.is_staff:
            raise ValidationError("Only administrators can edit mental health resources.")
        
        # Update the resource
        serializer.save(updated_at=timezone.now())
    
    def perform_destroy(self, instance):
        """Custom delete logic with validation"""
        # Only admins can delete resources
        if not self.request.user.is_staff:
            raise ValidationError("Only administrators can delete mental health resources.")
        
        # Soft delete by marking as unverified instead of hard delete
        if self.request.query_params.get('hard_delete') == 'true' and self.request.user.is_superuser:
            # Only superusers can hard delete
            instance.delete()
        else:
            # Soft delete - mark as unverified
            instance.is_verified = False
            instance.save(update_fields=['is_verified', 'updated_at'])
    
    def destroy(self, request, *args, **kwargs):
        """Override destroy to return custom response"""
        instance = self.get_object()
        hard_delete = request.query_params.get('hard_delete') == 'true'
        
        try:
            self.perform_destroy(instance)
            if hard_delete and request.user.is_superuser:
                return Response(
                    {'message': 'Mental health resource permanently deleted successfully'}, 
                    status=status.HTTP_204_NO_CONTENT
                )
            else:
                return Response(
                    {'message': 'Mental health resource marked as unverified successfully'}, 
                    status=status.HTTP_200_OK
                )
        except ValidationError as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_403_FORBIDDEN
            )


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def content_stats(request):
    """Get content statistics - optimized with single queries"""
    from django.db.models import Count, Q
    from django.core.cache import cache
    
    # Try to get from cache first (5 minutes)
    cache_key = 'content_stats'
    cached_stats = cache.get(cache_key)
    if cached_stats:
        return Response(cached_stats)
    
    # Optimized queries using aggregation
    article_stats = Article.objects.filter(is_published=True).aggregate(
        total=Count('id'),
        featured=Count('id', filter=Q(is_featured=True))
    )
    
    video_stats = Video.objects.filter(is_published=True).aggregate(
        total=Count('id'),
        featured=Count('id', filter=Q(is_featured=True))
    )
    
    audio_stats = AudioContent.objects.filter(is_published=True).aggregate(
        total=Count('id'),
        meditations=Count('id', filter=Q(audio_type='meditation'))
    )
    
    resource_stats = MentalHealthResource.objects.filter(is_verified=True).aggregate(
        total=Count('id'),
        crisis_hotlines=Count('id', filter=Q(resource_type='hotline'))
    )
    
    stats = {
        'articles': {
            'total': article_stats['total'] or 0,
            'featured': article_stats['featured'] or 0,
        },
        'videos': {
            'total': video_stats['total'] or 0,
            'featured': video_stats['featured'] or 0,
        },
        'audio': {
            'total': audio_stats['total'] or 0,
            'meditations': audio_stats['meditations'] or 0,
        },
        'resources': {
            'total': resource_stats['total'] or 0,
            'crisis_hotlines': resource_stats['crisis_hotlines'] or 0,
        }
    }
    
    # Cache for 5 minutes
    cache.set(cache_key, stats, 300)
    
    return Response(stats)


class ArticleLikeView(APIView):
    """Handle article likes/unlikes"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            article = get_object_or_404(Article, pk=pk, is_published=True)
            user = request.user
            
            with transaction.atomic():
                # Check if user already liked this article
                try:
                    like = ArticleLike.objects.get(user=user, article=article)
                    # User already liked, so unlike
                    like.delete()
                    article.like_count = max(0, article.like_count - 1)
                    article.save(update_fields=['like_count'])
                    liked = False
                except ArticleLike.DoesNotExist:
                    # User hasn't liked, so like
                    ArticleLike.objects.create(user=user, article=article)
                    article.like_count += 1
                    article.save(update_fields=['like_count'])
                    liked = True
                
                # Return updated article data
                return Response({
                    'id': article.id,
                    'title': article.title,
                    'like_count': article.like_count,
                    'isLiked': liked,
                    'message': 'Like status updated successfully'
                }, status=status.HTTP_200_OK)
                
        except Article.DoesNotExist:
            return Response(
                {'error': 'Article not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            import traceback
            print(f"Error in ArticleLikeView: {e}")
            print(traceback.format_exc())
            return Response(
                {'error': f'Failed to update like status: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ArticleViewView(APIView):
    """Track article views"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        article = get_object_or_404(Article, pk=pk, is_published=True)
        user = request.user
        
        # Get client IP and user agent
        ip_address = self.get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        # Create view record
        ArticleView.objects.create(
            user=user,
            article=article,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        # Update view count
        article.view_count += 1
        article.save(update_fields=['view_count'])
        
        return Response({
            'message': 'View tracked successfully',
            'view_count': article.view_count
        }, status=status.HTTP_200_OK)
    
    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class ArticleShareView(APIView):
    """Track article shares"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        article = get_object_or_404(Article, pk=pk, is_published=True)
        user = request.user
        
        # Get share method from request data
        method = request.data.get('method', 'copy_link')
        
        # Validate method
        valid_methods = [choice[0] for choice in ArticleShare.SHARE_METHOD_CHOICES]
        if method not in valid_methods:
            method = 'copy_link'
        
        # Get client IP
        ip_address = self.get_client_ip(request)
        
        # Create share record
        ArticleShare.objects.create(
            user=user,
            article=article,
            method=method,
            ip_address=ip_address
        )
        
        return Response({
            'message': 'Share tracked successfully',
            'method': method
        }, status=status.HTTP_200_OK)
    
    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
