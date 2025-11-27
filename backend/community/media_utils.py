"""
Utility functions for handling media files in chat messages
"""

import os
import mimetypes
from django.core.files.storage import default_storage
from django.conf import settings
from PIL import Image
import logging

logger = logging.getLogger(__name__)


def validate_media_file(file, media_type):
    """
    Validate uploaded media files based on type
    
    Args:
        file: Uploaded file object
        media_type: Type of media ('voice', 'video', 'image', 'file')
    
    Returns:
        dict: Validation result with success status and error message
    """
    max_sizes = {
        'voice': 10 * 1024 * 1024,  # 10MB
        'video': 50 * 1024 * 1024,  # 50MB
        'image': 5 * 1024 * 1024,   # 5MB
        'file': 20 * 1024 * 1024,   # 20MB
    }
    
    allowed_types = {
        'voice': ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4', 'video/webm', 'audio/x-wav', 'audio/vnd.wav'],
        'video': ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
        'image': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        'file': ['application/pdf', 'text/plain', 'application/msword', 
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    }
    
    # Check file size
    if file.size > max_sizes.get(media_type, 20 * 1024 * 1024):
        return {
            'success': False,
            'error': f'File size exceeds maximum allowed size for {media_type} files'
        }
    
    # Check MIME type
    mime_type, _ = mimetypes.guess_type(file.name)
    if not mime_type:
        mime_type = file.content_type
    
    if mime_type not in allowed_types.get(media_type, []):
        return {
            'success': False,
            'error': f'File type {mime_type} not allowed for {media_type} files'
        }
    
    return {'success': True, 'mime_type': mime_type}


def process_media_file(file, media_type):
    """
    Process uploaded media file and extract metadata
    
    Args:
        file: Uploaded file object
        media_type: Type of media ('voice', 'video', 'image', 'file')
    
    Returns:
        dict: Processing result with metadata
    """
    try:
        # Validate file first
        validation = validate_media_file(file, media_type)
        if not validation['success']:
            return validation
        
        metadata = {
            'success': True,
            'file_size': file.size,
            'mime_type': validation['mime_type'],
            'duration': None
        }
        
        # Process based on media type
        if media_type == 'image':
            metadata.update(process_image(file))
        elif media_type in ['voice', 'video']:
            metadata.update(process_audio_video(file, media_type))
        
        return metadata
        
    except Exception as e:
        logger.error(f"Error processing {media_type} file: {str(e)}")
        return {
            'success': False,
            'error': f'Error processing {media_type} file: {str(e)}'
        }


def process_image(file):
    """Process image file and extract metadata"""
    try:
        with Image.open(file) as img:
            return {
                'width': img.width,
                'height': img.height,
                'format': img.format
            }
    except Exception as e:
        logger.warning(f"Could not process image metadata: {str(e)}")
        return {}


def process_audio_video(file, media_type):
    """
    Process audio/video file and extract duration
    Note: This is a basic implementation. For production, consider using ffmpeg-python
    """
    try:
        # For now, we'll return basic metadata
        # In production, you might want to use libraries like mutagen for audio
        # or ffmpeg-python for video to extract duration and other metadata
        
        return {
            'duration': None,  # Would extract actual duration with proper library
            'format': file.name.split('.')[-1].lower() if '.' in file.name else None
        }
        
    except Exception as e:
        logger.warning(f"Could not process {media_type} metadata: {str(e)}")
        return {}


def generate_thumbnail(image_file, size=(150, 150)):
    """
    Generate thumbnail for image files
    
    Args:
        image_file: Image file object
        size: Tuple of (width, height) for thumbnail
    
    Returns:
        str: Path to generated thumbnail or None
    """
    try:
        with Image.open(image_file) as img:
            img.thumbnail(size, Image.Resampling.LANCZOS)
            
            # Generate thumbnail filename
            name, ext = os.path.splitext(image_file.name)
            thumbnail_name = f"{name}_thumb{ext}"
            
            # Save thumbnail
            thumbnail_path = os.path.join('chat/thumbnails/', thumbnail_name)
            
            # This is a simplified version - in production you'd save to storage
            return thumbnail_path
            
    except Exception as e:
        logger.error(f"Error generating thumbnail: {str(e)}")
        return None


def cleanup_old_media_files():
    """
    Cleanup old media files (can be run as a scheduled task)
    """
    try:
        # This would implement cleanup logic for old files
        # For example, delete files older than 30 days
        pass
    except Exception as e:
        logger.error(f"Error during media cleanup: {str(e)}")


def get_media_stats():
    """
    Get statistics about media usage
    """
    try:
        from .models import ChatMessage
        
        stats = {
            'total_messages': ChatMessage.objects.count(),
            'voice_messages': ChatMessage.objects.filter(message_type='voice').count(),
            'video_messages': ChatMessage.objects.filter(message_type='video').count(),
            'image_messages': ChatMessage.objects.filter(message_type='image').count(),
            'file_messages': ChatMessage.objects.filter(message_type='file').count(),
        }
        
        return stats
        
    except Exception as e:
        logger.error(f"Error getting media stats: {str(e)}")
        return {}
