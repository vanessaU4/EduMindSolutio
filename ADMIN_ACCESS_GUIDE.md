# Admin Access Guide

## Django Admin Panel (Recommended for Content Management)

**URL**: http://localhost:8000/admin/
**Username**: admin
**Password**: EduMind2024!

### Content Management in Django Admin:
- **Articles**: http://localhost:8000/admin/content/article/
- **Videos**: http://localhost:8000/admin/content/video/
- **Audio Content**: http://localhost:8000/admin/content/audiocontent/
- **Mental Health Resources**: http://localhost:8000/admin/content/mentalhealthresource/

### Why Use Django Admin:
- ✅ Direct database access - no data clearing issues
- ✅ Robust form validation
- ✅ Built-in file upload handling
- ✅ Automatic data persistence
- ✅ No caching issues

## Frontend Admin Panel (For Dashboard/Analytics)

**URL**: http://localhost:3000/admin/content
**Note**: This is for viewing analytics and bulk operations, not recommended for creating content

### Known Issues with Frontend Admin:
- ❌ Cache clearing on form submission
- ❌ Complex form validation
- ❌ File upload issues
- ❌ Data may appear to clear after save

## Recommendation

**For Content Creation/Editing**: Use Django Admin (http://localhost:8000/admin/)
**For Analytics/Monitoring**: Use Frontend Admin (http://localhost:3000/admin/content)