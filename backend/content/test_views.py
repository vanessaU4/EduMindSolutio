from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import permissions
from .models import Article, ArticleLike, Video, VideoLike

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def test_database_connection(request):
    """Test endpoint to verify database connection and models"""
    try:
        # Test basic queries
        article_count = Article.objects.count()
        video_count = Video.objects.count()
        
        # Test if ArticleLike table exists
        try:
            article_like_count = ArticleLike.objects.count()
            article_like_table_exists = True
            article_like_error = None
        except Exception as e:
            article_like_count = 0
            article_like_table_exists = False
            article_like_error = str(e)
            
        # Test if VideoLike table exists
        try:
            video_like_count = VideoLike.objects.count()
            video_like_table_exists = True
            video_like_error = None
        except Exception as e:
            video_like_count = 0
            video_like_table_exists = False
            video_like_error = str(e)
            
        return Response({
            'status': 'success',
            'database_connected': True,
            'article_count': article_count,
            'video_count': video_count,
            'article_like_count': article_like_count,
            'article_like_table_exists': article_like_table_exists,
            'article_like_error': article_like_error,
            'video_like_count': video_like_count,
            'video_like_table_exists': video_like_table_exists,
            'video_like_error': video_like_error,
            'user': request.user.username if request.user else 'Anonymous'
        })
        
    except Exception as e:
        return Response({
            'status': 'error',
            'database_connected': False,
            'error': str(e)
        }, status=500)
