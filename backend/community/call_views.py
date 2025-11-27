"""
API views for call functionality
"""

from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.utils import timezone
import logging

from .models import ChatRoom, Call, CallParticipant
from .serializers import ChatRoomSerializer

User = get_user_model()
logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_call_status(request, room_id):
    """
    Get current call status for a chat room
    """
    try:
        room = get_object_or_404(ChatRoom, id=room_id)
        
        # Check if user is participant in the room
        if not room.participants.filter(id=request.user.id).exists():
            return Response(
                {'error': 'You are not a participant in this chat room'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get active call in the room
        active_call = Call.objects.filter(
            room=room,
            status='active'
        ).first()
        
        if active_call:
            # Get participant list
            participants = []
            for participant in active_call.callparticipant_set.filter(left_at__isnull=True):
                participants.append(participant.user.display_name)
            
            return Response({
                'has_active_call': True,
                'call_id': active_call.id,
                'type': active_call.call_type,
                'status': active_call.status,
                'participants': participants,
                'started_at': active_call.started_at.isoformat(),
                'initiator': active_call.initiator.display_name
            })
        else:
            return Response({
                'has_active_call': False,
                'call_id': None,
                'type': None,
                'status': None,
                'participants': [],
                'started_at': None,
                'initiator': None
            })
            
    except Exception as e:
        logger.error(f"Error getting call status: {str(e)}")
        return Response(
            {'error': 'Failed to get call status'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def start_call(request, room_id):
    """
    Start a new call in a chat room
    """
    try:
        room = get_object_or_404(ChatRoom, id=room_id)
        
        # Check if user is participant in the room
        if not room.participants.filter(id=request.user.id).exists():
            return Response(
                {'error': 'You are not a participant in this chat room'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        call_type = request.data.get('type', 'audio')
        if call_type not in ['audio', 'video']:
            return Response(
                {'error': 'Invalid call type. Must be "audio" or "video"'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if there's already an active call
        existing_call = Call.objects.filter(
            room=room,
            status='active'
        ).first()
        
        if existing_call:
            return Response(
                {'error': 'There is already an active call in this room'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create new call
        call = Call.objects.create(
            room=room,
            call_type=call_type,
            status='active',
            initiator=request.user
        )
        
        # Add initiator as participant
        CallParticipant.objects.create(
            call=call,
            user=request.user
        )
        
        logger.info(f"Call started: {call_type} call in room {room_id} by user {request.user.id}")
        
        return Response({
            'call_id': call.id,
            'room_id': room.id,
            'type': call.call_type,
            'status': call.status,
            'participants': [request.user.display_name],
            'started_at': call.started_at.isoformat(),
            'initiator': call.initiator.display_name
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Error starting call: {str(e)}")
        return Response(
            {'error': 'Failed to start call'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def join_call(request, room_id):
    """
    Join an existing call in a chat room
    """
    try:
        room = get_object_or_404(ChatRoom, id=room_id)
        
        # Check if user is participant in the room
        if not room.participants.filter(id=request.user.id).exists():
            return Response(
                {'error': 'You are not a participant in this chat room'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get active call
        active_call = Call.objects.filter(
            room=room,
            status='active'
        ).first()
        
        if not active_call:
            return Response(
                {'error': 'No active call in this room'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if user is already in the call
        existing_participant = CallParticipant.objects.filter(
            call=active_call,
            user=request.user,
            left_at__isnull=True
        ).first()
        
        if existing_participant:
            return Response(
                {'error': 'You are already in this call'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Add user as participant
        CallParticipant.objects.create(
            call=active_call,
            user=request.user
        )
        
        # Get updated participant list
        participants = []
        for participant in active_call.callparticipant_set.filter(left_at__isnull=True):
            participants.append(participant.user.display_name)
        
        logger.info(f"User {request.user.id} joined call {active_call.id}")
        
        return Response({
            'call_id': active_call.id,
            'room_id': room.id,
            'type': active_call.call_type,
            'status': active_call.status,
            'participants': participants,
            'started_at': active_call.started_at.isoformat(),
            'initiator': active_call.initiator.display_name
        })
        
    except Exception as e:
        logger.error(f"Error joining call: {str(e)}")
        return Response(
            {'error': 'Failed to join call'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def leave_call(request, room_id):
    """
    Leave a call (without ending it for others)
    """
    try:
        room = get_object_or_404(ChatRoom, id=room_id)
        
        # Get active call
        active_call = Call.objects.filter(
            room=room,
            status='active'
        ).first()
        
        if not active_call:
            return Response(
                {'error': 'No active call in this room'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Find user's participation
        participant = CallParticipant.objects.filter(
            call=active_call,
            user=request.user,
            left_at__isnull=True
        ).first()
        
        if not participant:
            return Response(
                {'error': 'You are not in this call'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Mark as left
        participant.left_at = timezone.now()
        participant.save()
        
        # Check if this was the last participant
        remaining_participants = CallParticipant.objects.filter(
            call=active_call,
            left_at__isnull=True
        ).count()
        
        if remaining_participants == 0:
            # End the call if no participants left
            active_call.status = 'ended'
            active_call.ended_at = timezone.now()
            active_call.save()
        
        logger.info(f"User {request.user.id} left call {active_call.id}")
        
        return Response({'message': 'Left call successfully'})
        
    except Exception as e:
        logger.error(f"Error leaving call: {str(e)}")
        return Response(
            {'error': 'Failed to leave call'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def end_call(request, room_id):
    """
    End a call (only initiator or room admin can do this)
    """
    try:
        room = get_object_or_404(ChatRoom, id=room_id)
        
        # Get active call
        active_call = Call.objects.filter(
            room=room,
            status='active'
        ).first()
        
        if not active_call:
            return Response(
                {'error': 'No active call in this room'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if user can end the call (initiator or room creator)
        if request.user != active_call.initiator and request.user != room.creator:
            return Response(
                {'error': 'Only the call initiator or room creator can end the call'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # End the call
        active_call.status = 'ended'
        active_call.ended_at = timezone.now()
        active_call.save()
        
        # Mark all participants as left
        CallParticipant.objects.filter(
            call=active_call,
            left_at__isnull=True
        ).update(left_at=timezone.now())
        
        logger.info(f"Call {active_call.id} ended by user {request.user.id}")
        
        return Response({'message': 'Call ended successfully'})
        
    except Exception as e:
        logger.error(f"Error ending call: {str(e)}")
        return Response(
            {'error': 'Failed to end call'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
