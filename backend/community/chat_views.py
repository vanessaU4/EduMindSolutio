"""
API views for chat functionality with media support
"""

from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
import json
import logging

from .models import ChatRoom, ChatMessage, ChatRoomParticipant
from .serializers import ChatMessageSerializer, ChatRoomSerializer
from .media_utils import process_media_file

User = get_user_model()
logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def send_message(request, room_id):
    """
    Send a message to a chat room (text, voice, video, or file)
    """
    try:
        room = get_object_or_404(ChatRoom, id=room_id)
        
        # Check if user is participant
        if not room.participants.filter(id=request.user.id).exists():
            return Response(
                {'error': 'You are not a participant in this chat room'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        message_type = request.data.get('message_type', 'text')
        content = request.data.get('content', '')
        is_anonymous = request.data.get('is_anonymous', True)
        
        # Create base message
        message_data = {
            'room': room,
            'author': request.user,
            'message_type': message_type,
            'content': content,
            'is_anonymous': is_anonymous
        }
        
        # Handle different message types
        if message_type == 'text':
            if not content.strip():
                return Response(
                    {'error': 'Text content is required for text messages'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        elif message_type == 'voice':
            voice_file = request.FILES.get('voice_file')
            if not voice_file:
                return Response(
                    {'error': 'Voice file is required for voice messages'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Process voice file
            processing_result = process_media_file(voice_file, 'voice')
            if not processing_result['success']:
                return Response(
                    {'error': processing_result['error']},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            message_data.update({
                'voice_file': voice_file,
                'file_size': processing_result['file_size'],
                'mime_type': processing_result['mime_type'],
                'duration': processing_result.get('duration')
            })
            
        elif message_type == 'video':
            video_file = request.FILES.get('video_file')
            if not video_file:
                return Response(
                    {'error': 'Video file is required for video messages'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Process video file
            processing_result = process_media_file(video_file, 'video')
            if not processing_result['success']:
                return Response(
                    {'error': processing_result['error']},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            message_data.update({
                'video_file': video_file,
                'file_size': processing_result['file_size'],
                'mime_type': processing_result['mime_type'],
                'duration': processing_result.get('duration')
            })
            
        elif message_type == 'image':
            image_file = request.FILES.get('image_file')
            if not image_file:
                return Response(
                    {'error': 'Image file is required for image messages'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Process image file
            processing_result = process_media_file(image_file, 'image')
            if not processing_result['success']:
                return Response(
                    {'error': processing_result['error']},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            message_data.update({
                'image_file': image_file,
                'file_size': processing_result['file_size'],
                'mime_type': processing_result['mime_type']
            })
            
        elif message_type == 'file':
            attachment_file = request.FILES.get('attachment_file')
            if not attachment_file:
                return Response(
                    {'error': 'File is required for file messages'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Process file
            processing_result = process_media_file(attachment_file, 'file')
            if not processing_result['success']:
                return Response(
                    {'error': processing_result['error']},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            message_data.update({
                'attachment_file': attachment_file,
                'file_size': processing_result['file_size'],
                'mime_type': processing_result['mime_type']
            })
        
        # Create message
        with transaction.atomic():
            message = ChatMessage.objects.create(**message_data)
            
            # Update room last activity
            room.last_activity = timezone.now()
            room.save(update_fields=['last_activity'])
            
            # Update participant last seen
            participant, created = ChatRoomParticipant.objects.get_or_create(
                room=room,
                user=request.user,
                defaults={'is_active': True}
            )
            participant.last_seen = timezone.now()
            participant.save(update_fields=['last_seen'])
        
        # Serialize and return message
        serializer = ChatMessageSerializer(message)
        
        logger.info(f"Message sent: {message_type} message in room {room_id} by user {request.user.id}")
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Error sending message: {str(e)}")
        return Response(
            {'error': 'Failed to send message'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_messages(request, room_id):
    """
    Get messages for a chat room with pagination
    """
    try:
        room = get_object_or_404(ChatRoom, id=room_id)
        
        # Check if user is participant
        if not room.participants.filter(id=request.user.id).exists():
            return Response(
                {'error': 'You are not a participant in this chat room'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get pagination parameters
        page = int(request.GET.get('page', 1))
        page_size = int(request.GET.get('page_size', 50))
        offset = (page - 1) * page_size
        
        # Get messages
        messages = ChatMessage.objects.filter(room=room).order_by('-created_at')[offset:offset + page_size]
        messages = list(reversed(messages))  # Reverse to show oldest first
        
        serializer = ChatMessageSerializer(messages, many=True)
        
        return Response({
            'messages': serializer.data,
            'page': page,
            'page_size': page_size,
            'has_more': ChatMessage.objects.filter(room=room).count() > offset + page_size
        })
        
    except Exception as e:
        logger.error(f"Error getting messages: {str(e)}")
        return Response(
            {'error': 'Failed to get messages'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_media(request):
    """
    Upload media file and return file info (for preview before sending)
    """
    try:
        media_type = request.data.get('media_type')
        if not media_type or media_type not in ['voice', 'video', 'image', 'file']:
            return Response(
                {'error': 'Valid media_type is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        file_field_map = {
            'voice': 'voice_file',
            'video': 'video_file',
            'image': 'image_file',
            'file': 'attachment_file'
        }
        
        file_field = file_field_map[media_type]
        uploaded_file = request.FILES.get(file_field)
        
        if not uploaded_file:
            return Response(
                {'error': f'{file_field} is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Process file
        processing_result = process_media_file(uploaded_file, media_type)
        if not processing_result['success']:
            return Response(
                {'error': processing_result['error']},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Return file info for preview
        return Response({
            'success': True,
            'file_info': {
                'name': uploaded_file.name,
                'size': processing_result['file_size'],
                'mime_type': processing_result['mime_type'],
                'duration': processing_result.get('duration'),
                'media_type': media_type
            }
        })
        
    except Exception as e:
        logger.error(f"Error uploading media: {str(e)}")
        return Response(
            {'error': 'Failed to upload media'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_room_info(request, room_id):
    """
    Get chat room information including participants
    """
    try:
        room = get_object_or_404(ChatRoom, id=room_id)
        
        # Check if user is participant
        if not room.participants.filter(id=request.user.id).exists():
            return Response(
                {'error': 'You are not a participant in this chat room'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = ChatRoomSerializer(room)
        return Response(serializer.data)
        
    except Exception as e:
        logger.error(f"Error getting room info: {str(e)}")
        return Response(
            {'error': 'Failed to get room information'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
