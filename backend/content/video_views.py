from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import Video, VideoLike, VideoView, VideoShare
from .serializers import VideoSerializer


class VideoLikeView(APIView):
    """Handle video likes/unlikes"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            video = get_object_or_404(Video, pk=pk, is_published=True)
            user = request.user
            
            with transaction.atomic():
                # Check if user already liked this video
                try:
                    like = VideoLike.objects.get(user=user, video=video)
                    # User already liked, so unlike
                    like.delete()
                    video.like_count = max(0, video.like_count - 1)
                    video.save(update_fields=['like_count'])
                    liked = False
                except VideoLike.DoesNotExist:
                    # User hasn't liked, so like
                    VideoLike.objects.create(user=user, video=video)
                    video.like_count += 1
                    video.save(update_fields=['like_count'])
                    liked = True
                
                # Return updated video data
                return Response({
                    'id': video.id,
                    'title': video.title,
                    'like_count': video.like_count,
                    'isLiked': liked,
                    'message': 'Like status updated successfully'
                }, status=status.HTTP_200_OK)
                
        except Video.DoesNotExist:
            return Response(
                {'error': 'Video not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            import traceback
            print(f"Error in VideoLikeView: {e}")
            print(traceback.format_exc())
            return Response(
                {'error': f'Failed to update like status: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class VideoViewView(APIView):
    """Track video views"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            video = get_object_or_404(Video, pk=pk, is_published=True)
            user = request.user
            
            # Get client IP and user agent
            ip_address = self.get_client_ip(request)
            user_agent = request.META.get('HTTP_USER_AGENT', '')
            
            # Create view record
            VideoView.objects.create(
                user=user,
                video=video,
                ip_address=ip_address,
                user_agent=user_agent
            )
            
            # Update view count
            video.view_count += 1
            video.save(update_fields=['view_count'])
            
            return Response({
                'message': 'View tracked successfully',
                'view_count': video.view_count
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            import traceback
            print(f"Error in VideoViewView: {e}")
            print(traceback.format_exc())
            return Response(
                {'error': f'Failed to track view: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class VideoShareView(APIView):
    """Track video shares"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            video = get_object_or_404(Video, pk=pk, is_published=True)
            user = request.user
            
            # Get share method from request data
            method = request.data.get('method', 'copy_link')
            
            # Validate method
            valid_methods = [choice[0] for choice in VideoShare.SHARE_METHOD_CHOICES]
            if method not in valid_methods:
                method = 'copy_link'
            
            # Get client IP
            ip_address = self.get_client_ip(request)
            
            # Create share record
            VideoShare.objects.create(
                user=user,
                video=video,
                method=method,
                ip_address=ip_address
            )
            
            return Response({
                'message': 'Share tracked successfully',
                'method': method
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            import traceback
            print(f"Error in VideoShareView: {e}")
            print(traceback.format_exc())
            return Response(
                {'error': f'Failed to track share: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
