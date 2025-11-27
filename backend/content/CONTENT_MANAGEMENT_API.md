# Content Management API Documentation

## Overview
This document describes the enhanced edit and delete functionality for the content management system in eduMindSolutions.

## Authentication
All content management endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Content Types
The system supports four main content types:
- **Articles**: Educational articles about mental health
- **Videos**: Video content for mental health education  
- **Audio**: Audio content like guided meditations and podcasts
- **Mental Health Resources**: Directory of mental health services

## Edit Functionality

### Edit Article
**Endpoint:** `PUT/PATCH /api/content/articles/<slug>/`

**Permissions:** 
- Authors can edit their own articles
- Admins can edit any article

**Request Body (JSON or FormData):**
```json
{
  "title": "Updated Article Title",
  "excerpt": "Updated brief summary",
  "content": "Updated article content",
  "category": 1,
  "tags": ["mental-health", "wellness"],
  "difficulty_level": "intermediate",
  "is_published": true,
  "is_featured": false
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Updated Article Title",
  "slug": "updated-article-title",
  "excerpt": "Updated brief summary",
  "content": "Updated article content",
  "category": 1,
  "category_name": "Anxiety",
  "tags": ["mental-health", "wellness"],
  "difficulty_level": "intermediate",
  "author": 1,
  "author_name": "John Doe",
  "featured_image": null,
  "estimated_read_time": 5,
  "view_count": 150,
  "like_count": 25,
  "is_published": true,
  "is_featured": false,
  "published_at": "2024-01-15T10:30:00Z",
  "created_at": "2024-01-10T09:00:00Z",
  "updated_at": "2024-01-15T14:45:00Z",
  "isLiked": false
}
```

### Edit Video
**Endpoint:** `PUT/PATCH /api/content/videos/<id>/`

**Permissions:** 
- Authors can edit their own videos
- Admins can edit any video

**Request Body:**
```json
{
  "title": "Updated Video Title",
  "description": "Updated video description",
  "video_url": "https://youtube.com/watch?v=updated_id",
  "duration_seconds": 600,
  "category": 2,
  "tags": ["meditation", "relaxation"],
  "difficulty_level": "beginner",
  "is_published": true,
  "is_featured": false
}
```

### Edit Audio Content
**Endpoint:** `PUT/PATCH /api/content/audio/<id>/`

**Permissions:** 
- Authors can edit their own audio content
- Admins can edit any audio content

**Request Body:**
```json
{
  "title": "Updated Audio Title",
  "description": "Updated audio description",
  "audio_type": "meditation",
  "audio_url": "https://example.com/updated_audio.mp3",
  "duration_seconds": 1200,
  "category": 3,
  "tags": ["guided-meditation", "sleep"],
  "is_published": true
}
```

### Edit Mental Health Resource
**Endpoint:** `PUT/PATCH /api/content/resources/<id>/`

**Permissions:** 
- Only admins can edit mental health resources

**Request Body:**
```json
{
  "name": "Updated Resource Name",
  "description": "Updated resource description",
  "resource_type": "therapist",
  "phone_number": "+1-555-0123",
  "email": "updated@example.com",
  "website": "https://updated-website.com",
  "address": "123 Updated St",
  "city": "Updated City",
  "state": "CA",
  "zip_code": "90210",
  "services_offered": ["individual-therapy", "group-therapy"],
  "specializations": ["anxiety", "depression"],
  "cost_level": "moderate",
  "is_verified": true
}
```

## Delete Functionality

### Delete Article
**Endpoint:** `DELETE /api/content/articles/<slug>/`

**Permissions:** 
- Authors can delete their own articles
- Admins can delete any article

**Query Parameters:**
- `hard_delete=true` (Admin only): Permanently delete the article

**Default Behavior:** Soft delete (unpublish the article)

**Response (Soft Delete):**
```json
{
  "message": "Article unpublished successfully"
}
```

**Response (Hard Delete - Admin only):**
```json
{
  "message": "Article permanently deleted successfully"
}
```

### Delete Video
**Endpoint:** `DELETE /api/content/videos/<id>/`

**Permissions:** 
- Authors can delete their own videos
- Admins can delete any video

**Query Parameters:**
- `hard_delete=true` (Admin only): Permanently delete the video

### Delete Audio Content
**Endpoint:** `DELETE /api/content/audio/<id>/`

**Permissions:** 
- Authors can delete their own audio content
- Admins can delete any audio content

**Query Parameters:**
- `hard_delete=true` (Admin only): Permanently delete the audio content

### Delete Mental Health Resource
**Endpoint:** `DELETE /api/content/resources/<id>/`

**Permissions:** 
- Only admins can delete mental health resources

**Query Parameters:**
- `hard_delete=true` (Superuser only): Permanently delete the resource

**Default Behavior:** Mark as unverified instead of deleting

## Advanced Content Management Features

### Content Management Dashboard
**Endpoint:** `GET /api/content/management/dashboard/`

**Description:** Get comprehensive statistics and recent activity for content management.

**Response:**
```json
{
  "user_content": {
    "articles": {
      "total": 15,
      "published": 12,
      "draft": 3,
      "total_views": 1250,
      "total_likes": 89
    },
    "videos": {
      "total": 8,
      "published": 6,
      "draft": 2,
      "total_views": 2100,
      "total_likes": 156
    },
    "audio": {
      "total": 5,
      "published": 4,
      "draft": 1,
      "total_plays": 890,
      "total_likes": 67
    }
  },
  "recent_content": {
    "articles": [...],
    "videos": [...],
    "audio": [...]
  },
  "admin_stats": {
    // Only visible to admins
  }
}
```

### Bulk Content Actions
**Endpoint:** `POST /api/content/management/bulk-action/`

**Description:** Perform bulk actions on multiple content items.

**Request Body:**
```json
{
  "action": "publish", // "publish", "unpublish", "delete"
  "content_type": "article", // "article", "video", "audio"
  "content_ids": [1, 2, 3, 4, 5],
  "hard_delete": false // Only for delete action, admin only
}
```

**Response:**
```json
{
  "message": "Successfully published 5 article(s)",
  "updated_count": 5
}
```

### Advanced Content Search
**Endpoint:** `GET /api/content/management/search/`

**Query Parameters:**
- `q`: Search query
- `type`: Content type filter ("all", "article", "video", "audio")
- `author`: Filter by author username
- `published_only`: Show only published content (default: true)

**Example:** `GET /api/content/management/search/?q=anxiety&type=article&author=johndoe`

### Duplicate Content
**Endpoint:** `POST /api/content/management/duplicate/<content_type>/<content_id>/`

**Description:** Create a copy of existing content for editing.

**Example:** `POST /api/content/management/duplicate/article/123/`

**Response:**
```json
{
  "message": "Article duplicated successfully",
  "duplicate": {
    // Serialized duplicate content
  }
}
```

### Content Analytics
**Endpoint:** `GET /api/content/management/analytics/`

**Description:** Get detailed analytics for user's content performance.

**Response:**
```json
{
  "overview": {
    "total_content": 28,
    "total_views": 4240,
    "total_likes": 312
  },
  "top_performing": {
    "articles": [...],
    "videos": [...],
    "audio": [...]
  },
  "recent_activity": {
    "articles_created": 3,
    "videos_created": 1,
    "audio_created": 2
  }
}
```

## Error Responses

### Permission Denied
```json
{
  "error": "You can only edit your own articles or be an admin."
}
```

### Validation Error
```json
{
  "error": "Invalid content_type"
}
```

### Not Found
```json
{
  "error": "No content found or insufficient permissions"
}
```

## Permission Levels

1. **Anonymous Users**: Can only view published content
2. **Authenticated Users**: Can create, edit, and delete their own content
3. **Staff/Admin Users**: Can edit and delete any content, access admin statistics
4. **Superusers**: Can perform hard deletes on mental health resources

## Data Integrity Features

- **Soft Delete**: By default, delete operations unpublish content rather than permanently removing it
- **Hard Delete**: Only available to admins/superusers with explicit parameter
- **Audit Trail**: All updates include timestamp tracking
- **Permission Validation**: Strict permission checks prevent unauthorized access
- **Bulk Operations**: Efficient handling of multiple content items
- **Content Duplication**: Easy content copying for iterative editing

## Best Practices

1. Always use soft delete unless permanent removal is absolutely necessary
2. Use bulk operations for managing multiple content items efficiently
3. Leverage the dashboard for content performance insights
4. Use content duplication for creating variations of successful content
5. Regularly check analytics to understand content performance
6. Use appropriate permission levels for different user roles
