from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import AudioContent, AudioLike, AudioView, AudioShare


class AudioLikeView(APIView):
    """Handle audio like/unlike functionality"""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            audio = get_object_or_404(AudioContent, pk=pk)
            user = request.user
            
            with transaction.atomic():
                # Check if user already liked this audio
                existing_like = AudioLike.objects.filter(user=user, audio=audio).first()
                
                if existing_like:
                    # Unlike: remove the like
                    existing_like.delete()
                    # Decrease like count
                    if audio.like_count > 0:
                        audio.like_count -= 1
                        audio.save(update_fields=['like_count'])
                    
                    return Response({
                        'liked': False,
                        'like_count': audio.like_count,
                        'message': 'Audio unliked successfully'
                    }, status=status.HTTP_200_OK)
                else:
                    # Like: create new like
                    AudioLike.objects.create(user=user, audio=audio)
                    # Increase like count
                    audio.like_count += 1
                    audio.save(update_fields=['like_count'])
                    
                    return Response({
                        'liked': True,
                        'like_count': audio.like_count,
                        'message': 'Audio liked successfully'
                    }, status=status.HTTP_200_OK)
                    
        except AudioContent.DoesNotExist:
            return Response({
                'error': 'Audio not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': f'An error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AudioViewView(APIView):
    """Track audio plays/views"""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            audio = get_object_or_404(AudioContent, pk=pk)
            user = request.user
            
            # Get client info
            ip_address = self.get_client_ip(request)
            user_agent = request.META.get('HTTP_USER_AGENT', '')
            
            with transaction.atomic():
                # Create view record
                AudioView.objects.create(
                    user=user,
                    audio=audio,
                    ip_address=ip_address,
                    user_agent=user_agent
                )
                
                # Increase play count
                audio.play_count += 1
                audio.save(update_fields=['play_count'])
            
            return Response({
                'message': 'Audio view recorded successfully',
                'play_count': audio.play_count
            }, status=status.HTTP_200_OK)
            
        except AudioContent.DoesNotExist:
            return Response({
                'error': 'Audio not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': f'An error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class AudioShareView(APIView):
    """Track audio shares"""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            audio = get_object_or_404(AudioContent, pk=pk)
            user = request.user
            
            # Get share method from request
            share_method = request.data.get('method', 'copy_link')
            
            # Validate share method
            valid_methods = ['native_share', 'copy_link', 'social_media', 'email']
            if share_method not in valid_methods:
                share_method = 'copy_link'
            
            # Get client info
            ip_address = self.get_client_ip(request)
            
            # Create share record
            AudioShare.objects.create(
                user=user,
                audio=audio,
                method=share_method,
                ip_address=ip_address
            )
            
            return Response({
                'message': 'Audio share recorded successfully',
                'method': share_method
            }, status=status.HTTP_200_OK)
            
        except AudioContent.DoesNotExist:
            return Response({
                'error': 'Audio not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'error': f'An error occurred: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
