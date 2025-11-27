from rest_framework import generics, permissions, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.db.models import Q, Count
from .models import (
    Article, Video, AudioContent, MentalHealthResource
)
from .serializers import (
    ArticleSerializer, VideoSerializer,
    AudioContentSerializer, MentalHealthResourceSerializer
)


class ContentManagementDashboardView(APIView):
    """Dashboard view for content management with statistics and recent activity"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Get user's content statistics
        user_articles = Article.objects.filter(author=user)
        user_videos = Video.objects.filter(author=user)
        user_audio = AudioContent.objects.filter(author=user)
        
        # Admin statistics
        admin_stats = {}
        if user.is_staff:
            admin_stats = {
                'total_users_content': {
                    'articles': Article.objects.count(),
                    'videos': Video.objects.count(),
                    'audio': AudioContent.objects.count(),
                    'resources': MentalHealthResource.objects.count(),
                },
                'pending_approval': {
                    'articles': Article.objects.filter(is_published=False).count(),
                    'videos': Video.objects.filter(is_published=False).count(),
                    'audio': AudioContent.objects.filter(is_published=False).count(),
                },
                'recent_activity': {
                    'articles': Article.objects.order_by('-created_at')[:5].values(
                        'id', 'title', 'author__username', 'created_at', 'is_published'
                    ),
                    'videos': Video.objects.order_by('-created_at')[:5].values(
                        'id', 'title', 'author__username', 'created_at', 'is_published'
                    ),
                }
            }
        
        return Response({
            'user_content': {
                'articles': {
                    'total': user_articles.count(),
                    'published': user_articles.filter(is_published=True).count(),
                    'draft': user_articles.filter(is_published=False).count(),
                    'total_views': sum(user_articles.values_list('view_count', flat=True)),
                    'total_likes': sum(user_articles.values_list('like_count', flat=True)),
                },
                'videos': {
                    'total': user_videos.count(),
                    'published': user_videos.filter(is_published=True).count(),
                    'draft': user_videos.filter(is_published=False).count(),
                    'total_views': sum(user_videos.values_list('view_count', flat=True)),
                    'total_likes': sum(user_videos.values_list('like_count', flat=True)),
                },
                'audio': {
                    'total': user_audio.count(),
                    'published': user_audio.filter(is_published=True).count(),
                    'draft': user_audio.filter(is_published=False).count(),
                    'total_plays': sum(user_audio.values_list('play_count', flat=True)),
                    'total_likes': sum(user_audio.values_list('like_count', flat=True)),
                },
            },
            'recent_content': {
                'articles': ArticleSerializer(
                    user_articles.order_by('-updated_at')[:5], 
                    many=True, 
                    context={'request': request}
                ).data,
                'videos': VideoSerializer(
                    user_videos.order_by('-updated_at')[:5], 
                    many=True, 
                    context={'request': request}
                ).data,
                'audio': AudioContentSerializer(
                    user_audio.order_by('-updated_at')[:5], 
                    many=True, 
                    context={'request': request}
                ).data,
            },
            'admin_stats': admin_stats
        })


class BulkContentActionView(APIView):
    """Handle bulk actions on content (publish, unpublish, delete)"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        action = request.data.get('action')
        content_type = request.data.get('content_type')  # 'article', 'video', 'audio'
        content_ids = request.data.get('content_ids', [])
        
        if not action or not content_type or not content_ids:
            return Response(
                {'error': 'Missing required fields: action, content_type, content_ids'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get the appropriate model
        model_map = {
            'article': Article,
            'video': Video,
            'audio': AudioContent,
        }
        
        if content_type not in model_map:
            return Response(
                {'error': 'Invalid content_type'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        model = model_map[content_type]
        
        # Filter content based on user permissions
        if request.user.is_staff:
            # Admins can act on any content
            queryset = model.objects.filter(id__in=content_ids)
        else:
            # Regular users can only act on their own content
            queryset = model.objects.filter(id__in=content_ids, author=request.user)
        
        if not queryset.exists():
            return Response(
                {'error': 'No content found or insufficient permissions'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            with transaction.atomic():
                if action == 'publish':
                    updated_count = queryset.update(
                        is_published=True, 
                        published_at=timezone.now(),
                        updated_at=timezone.now()
                    )
                elif action == 'unpublish':
                    updated_count = queryset.update(
                        is_published=False,
                        updated_at=timezone.now()
                    )
                elif action == 'delete':
                    if request.user.is_staff and request.data.get('hard_delete'):
                        # Hard delete for admins
                        updated_count = queryset.count()
                        queryset.delete()
                    else:
                        # Soft delete - unpublish
                        updated_count = queryset.update(
                            is_published=False,
                            updated_at=timezone.now()
                        )
                else:
                    return Response(
                        {'error': 'Invalid action'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            return Response({
                'message': f'Successfully {action}ed {updated_count} {content_type}(s)',
                'updated_count': updated_count
            })
            
        except Exception as e:
            return Response(
                {'error': f'Failed to perform bulk action: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ContentSearchView(generics.ListAPIView):
    """Advanced search across all content types"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        query = request.query_params.get('q', '')
        content_type = request.query_params.get('type', 'all')  # 'all', 'article', 'video', 'audio'
        author_filter = request.query_params.get('author')
        published_only = request.query_params.get('published_only', 'true').lower() == 'true'
        
        results = {}
        
        # Base filters
        base_filters = Q()
        if published_only and not request.user.is_staff:
            base_filters &= Q(is_published=True)
        
        if author_filter:
            base_filters &= Q(author__username__icontains=author_filter)
        
        # Search query filters
        search_filters = Q()
        if query:
            search_filters = (
                Q(title__icontains=query) |
                Q(description__icontains=query) |
                Q(tags__icontains=query)
            )
        
        # Search articles
        if content_type in ['all', 'article']:
            article_filters = base_filters & search_filters
            if query:
                article_filters |= Q(content__icontains=query) | Q(excerpt__icontains=query)
            
            articles = Article.objects.filter(article_filters).order_by('-updated_at')[:20]
            results['articles'] = ArticleSerializer(
                articles, many=True, context={'request': request}
            ).data
        
        # Search videos
        if content_type in ['all', 'video']:
            videos = Video.objects.filter(base_filters & search_filters).order_by('-updated_at')[:20]
            results['videos'] = VideoSerializer(
                videos, many=True, context={'request': request}
            ).data
        
        # Search audio
        if content_type in ['all', 'audio']:
            audio = AudioContent.objects.filter(base_filters & search_filters).order_by('-updated_at')[:20]
            results['audio'] = AudioContentSerializer(
                audio, many=True, context={'request': request}
            ).data
        
        return Response({
            'query': query,
            'results': results,
            'total_results': sum(len(v) for v in results.values())
        })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def duplicate_content(request, content_type, content_id):
    """Duplicate existing content for editing"""
    model_map = {
        'article': Article,
        'video': Video,
        'audio': AudioContent,
    }
    
    if content_type not in model_map:
        return Response(
            {'error': 'Invalid content type'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    model = model_map[content_type]
    
    try:
        # Get original content
        original = get_object_or_404(model, id=content_id)
        
        # Check permissions
        if not (request.user == original.author or request.user.is_staff):
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Create duplicate
        duplicate = model.objects.get(id=content_id)
        duplicate.pk = None  # This will create a new instance
        duplicate.title = f"{original.title} (Copy)"
        if hasattr(duplicate, 'slug'):
            duplicate.slug = f"{original.slug}-copy-{timezone.now().strftime('%Y%m%d%H%M%S')}"
        duplicate.is_published = False
        duplicate.is_featured = False
        duplicate.view_count = 0
        duplicate.like_count = 0
        if hasattr(duplicate, 'play_count'):
            duplicate.play_count = 0
        duplicate.author = request.user
        duplicate.created_at = timezone.now()
        duplicate.updated_at = timezone.now()
        duplicate.published_at = None
        duplicate.save()
        
        # Return serialized duplicate
        serializer_map = {
            'article': ArticleSerializer,
            'video': VideoSerializer,
            'audio': AudioContentSerializer,
        }
        
        serializer = serializer_map[content_type](duplicate, context={'request': request})
        
        return Response({
            'message': f'{content_type.title()} duplicated successfully',
            'duplicate': serializer.data
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': f'Failed to duplicate content: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def content_analytics(request):
    """Get detailed analytics for user's content"""
    user = request.user
    
    # Time-based analytics (last 30 days)
    from datetime import datetime, timedelta
    thirty_days_ago = timezone.now() - timedelta(days=30)
    
    # User's content performance
    user_articles = Article.objects.filter(author=user)
    user_videos = Video.objects.filter(author=user)
    user_audio = AudioContent.objects.filter(author=user)
    
    analytics = {
        'overview': {
            'total_content': user_articles.count() + user_videos.count() + user_audio.count(),
            'total_views': (
                sum(user_articles.values_list('view_count', flat=True)) +
                sum(user_videos.values_list('view_count', flat=True)) +
                sum(user_audio.values_list('play_count', flat=True))
            ),
            'total_likes': (
                sum(user_articles.values_list('like_count', flat=True)) +
                sum(user_videos.values_list('like_count', flat=True)) +
                sum(user_audio.values_list('like_count', flat=True))
            ),
        },
        'top_performing': {
            'articles': ArticleSerializer(
                user_articles.order_by('-view_count')[:5], 
                many=True, 
                context={'request': request}
            ).data,
            'videos': VideoSerializer(
                user_videos.order_by('-view_count')[:5], 
                many=True, 
                context={'request': request}
            ).data,
            'audio': AudioContentSerializer(
                user_audio.order_by('-play_count')[:5], 
                many=True, 
                context={'request': request}
            ).data,
        },
        'recent_activity': {
            'articles_created': user_articles.filter(created_at__gte=thirty_days_ago).count(),
            'videos_created': user_videos.filter(created_at__gte=thirty_days_ago).count(),
            'audio_created': user_audio.filter(created_at__gte=thirty_days_ago).count(),
        }
    }
    
    return Response(analytics)
