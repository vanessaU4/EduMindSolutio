# EduMindSolutions - Mental Health Platform

## 🚀 Overview

EduMindSolutions is a comprehensive mental health platform focused on youth mental health services (ages 13-23). The platform supports role-based access control with healthcare professionals, users, and administrators, complete assessment management, and real-time analytics.

## 🏗️ Architecture

- **Backend**: Django 5.2.4 + Django REST Framework
- **Authentication**: JWT (JSON Web Tokens)
- **Database**: SQLite (development) / PostgreSQL (production ready)
- **Roles**: User, Guide, Admin
- **Apps**: accounts, assessments, wellness, community, crisis, content

## 🔧 Quick Start

### 1. Installation

```bash
# Clone the repository
git clone <repository-url>
cd edumindsolutions

# Create virtual environment
python -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate

# Install dependencies
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers

# Run migrations
python manage.py migrate

# Start server
python manage.py runserver
```

### 2. Base URL

```
http://localhost:8000/api
```

### 3. Authentication

Include JWT token in headers:

```
Authorization: Bearer <your_access_token>
```

## 📋 Complete API Reference

### 🔐 Authentication & User Management

#### Register User

```http
POST /api/accounts/register/
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securepassword123",
  "first_name": "John",
  "last_name": "Doe",
  "role": "user"
}
```

**Response (201):**

```json
{
  "detail": "Account created successfully.",
  "user": {
    "email": "user@example.com",
    "username": "johndoe",
    "first_name": "John",
    "last_name": "Doe",
    "role": "user"
  }
}
```

#### Login

```http
POST /api/accounts/login/
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200):**

```json
{
  "detail": "Login successful.",
  "token": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  },
  "user": {
    "email": "user@example.com",
    "username": "johndoe",
    "first_name": "John",
    "last_name": "Doe",
    "role": "user"
  }
}
```

#### Refresh Token

```http
POST /api/accounts/token/refresh/
```

**Request Body:**

```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### List Users

```http
GET /api/accounts/users/
```

**Response (200):**

```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "first_name": "John",
    "last_name": "Doe",
    "role": "user",
    "is_active": true,
    "date_joined": "2025-01-08T10:30:00Z"
  }
]
```

### 📝 Reviews & Sentiment Analysis

#### List Reviews

```http
GET /api/assessments/reviews/
```

**Query Parameters:**

- `user_role`: Filter by 'user', 'guide', or 'admin'
- `sentiment`: Filter by 'positive', 'negative', 'neutral'
- `rating`: Filter by rating (1-5)
- `search`: Search in comments and usernames
- `page`: Page number for pagination

**Example:**

```http
GET /api/assessments/reviews/?user_role=user&sentiment=positive&rating=5&page=1
```

**Response (200):**

```json
{
  "count": 150,
  "next": "http://localhost:8000/api/assessments/reviews/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "username": "john_user",
      "user_email": "john@example.com",
      "user_role": "user",
      "comment": "Great platform for mental health support!",
      "sentiment": "positive",
      "rating": 5,
      "source_url": "https://example.com/user-experience",
      "is_verified": false,
      "created_at": "2025-01-08T10:30:00Z",
      "updated_at": "2025-01-08T10:30:00Z"
    }
  ]
}
```

#### Create Review

```http
POST /api/assessments/reviews/
```

**Request Body:**

```json
{
  "comment": "Excellent mental health resources and support!",
  "sentiment": "positive",
  "rating": 5,
  "source_url": "https://example.com/assessment/123"
}
```

**Response (201):**

```json
{
  "message": "Review posted successfully.",
  "review": {
    "id": 15,
    "username": "johndoe",
    "user_email": "john@example.com",
    "user_role": "user",
    "comment": "Excellent mental health resources and support!",
    "sentiment": "positive",
    "rating": 5,
    "source_url": "https://example.com/assessment/123",
    "is_verified": false,
    "created_at": "2025-01-08T12:45:00Z",
    "updated_at": "2025-01-08T12:45:00Z"
  }
}
```

#### Update Review

```http
PATCH /api/assessments/reviews/15/
```

**Request Body:**

```json
{
  "comment": "Updated: This platform keeps getting better!",
  "rating": 5
}
```

#### Delete Review

```http
DELETE /api/assessments/reviews/15/
```

#### Get User's Reviews

```http
GET /api/assessments/my-reviews/
```

#### Get Reviews by Role

```http
GET /api/assessments/reviews/role/user/
GET /api/assessments/reviews/role/guide/
GET /api/assessments/reviews/role/admin/
```

#### Review Statistics

```http
GET /api/assessments/reviews/stats/
```

**Response (200):**

```json
{
  "total_reviews": 150,
  "average_rating": 4.2,
  "sentiment_distribution": [
    { "sentiment": "positive", "count": 80 },
    { "sentiment": "neutral", "count": 45 },
    { "sentiment": "negative", "count": 25 }
  ],
  "role_distribution": [
    { "user_role": "user", "count": 120 },
    { "user_role": "guide", "count": 25 },
    { "user_role": "admin", "count": 5 }
  ],
  "rating_distribution": [
    { "rating": 1, "count": 5 },
    { "rating": 2, "count": 10 },
    { "rating": 3, "count": 25 },
    { "rating": 4, "count": 60 },
    { "rating": 5, "count": 50 }
  ]
}
```

### 🏥 System Health & Monitoring

#### Basic Health Check

```http
GET /health/
```

**Response (200):**

```json
{
  "status": "healthy",
  "database": "healthy",
  "debug_mode": true,
  "version": "1.0.0",
  "services": {
    "accounts": "active",
    "assessments": "active",
    "wellness": "active",
    "community": "active",
    "crisis": "active",
    "content": "active"
  }
}
```

#### Detailed Health Check

```http
GET /health/detailed/
```

**Response (200):**

```json
{
  "status": "healthy",
  "database": {
    "status": "healthy",
    "connection": "active"
  },
  "metrics": {
    "total_reviews": 150,
    "total_users": 45,
    "total_assessments": 89
  },
  "system": {
    "debug_mode": true,
    "version": "1.0.0",
    "database_engine": "django.db.backends.sqlite3"
  },
  "services": {
    "accounts": "active",
    "assessments": "active",
    "wellness": "active",
    "community": "active",
    "crisis": "active",
    "content": "active"
  }
}
```

## 🔒 Authentication & Permissions

### User Roles

- **user**: Youth users (13-23) seeking mental health support
- **guide**: Licensed healthcare providers and counselors
- **admin**: System administrators

### Permission Levels

1. **Public**: View public resources, crisis information
2. **Authenticated**: Access assessments, community features, wellness tools
3. **Owner**: Update/delete own content and reviews
4. **Role-specific**: Guides can moderate content, admins have full access

### JWT Token Usage

```javascript
// Include in request headers
headers: {
  'Authorization': 'Bearer ' + accessToken,
  'Content-Type': 'application/json'
}
```

### Token Lifecycle

- **Access Token**: 30 minutes lifetime
- **Refresh Token**: 1 day lifetime
- **Auto-rotation**: Enabled for security

## ❌ Error Responses

### 400 Bad Request

```json
{
  "message": "Validation error",
  "errors": {
    "rating": ["Rating must be between 1 and 5."],
    "email": ["Enter a valid email address."]
  }
}
```

### 401 Unauthorized

```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden

```json
{
  "detail": "Only guides can moderate content."
}
```

### 404 Not Found

```json
{
  "detail": "Review not found."
}
```

### 500 Internal Server Error

```json
{
  "error": true,
  "message": "An error occurred",
  "details": "Internal server error details"
}
```

## 📊 Pagination

All list endpoints support pagination:

```json
{
  "count": 150,
  "next": "http://localhost:8000/api/assessments/reviews/?page=3",
  "previous": "http://localhost:8000/api/assessments/reviews/?page=1",
  "results": [...]
}
```

**Query Parameters:**

- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 20, max: 100)

## 🧪 Testing Examples

### Using curl

#### Complete User Journey

```bash
# 1. Register a user
curl -X POST http://localhost:8000/api/accounts/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "user123",
    "password": "securepass123",
    "first_name": "John",
    "last_name": "User",
    "role": "user"
  }'

# 2. Register a guide
curl -X POST http://localhost:8000/api/accounts/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "guide@example.com",
    "username": "guide123",
    "password": "securepass123",
    "first_name": "Jane",
    "last_name": "Guide",
    "role": "guide"
  }'

# 3. Login as user
curl -X POST http://localhost:8000/api/accounts/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123"
  }'

# 4. Create a review (replace TOKEN with actual token)
curl -X POST http://localhost:8000/api/assessments/reviews/ \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "comment": "Great platform for mental health support!",
    "sentiment": "positive",
    "rating": 5
  }'

# 5. Get review statistics
curl -X GET http://localhost:8000/api/assessments/reviews/stats/

# 6. Check system health
curl -X GET http://localhost:8000/health/
```

## 📋 API Endpoint Summary

| Category           | Endpoints        | Description                                |
| ------------------ | ---------------- | ------------------------------------------ |
| **Authentication** | 5 endpoints      | User registration, login, token management |
| **Reviews**        | 7 endpoints      | Complete CRUD, filtering, statistics       |
| **Assessments**    | 8 endpoints      | Mental health assessments and tracking     |
| **Community**      | 6 endpoints      | Forums, peer support, chat features       |
| **Wellness**       | 5 endpoints      | Mood tracking, challenges, achievements    |
| **Crisis**         | 4 endpoints      | Crisis support and safety planning         |
| **Content**        | 6 endpoints      | Educational resources and materials        |
| **Health**         | 2 endpoints      | System monitoring                          |
| **Total**          | **43 endpoints** | Complete mental health platform            |

## 🚀 Production Deployment

### Environment Variables

```bash
# Required for production
DEBUG=False
SECRET_KEY=your-super-secret-key-here
DATABASE_URL=postgresql://user:password@localhost:5432/edumindsolutions_db
ALLOWED_HOSTS=yourdomain.com,api.yourdomain.com

# Optional
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

### Docker Deployment

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
RUN python manage.py collectstatic --noinput

EXPOSE 8000
CMD ["gunicorn", "edumindsolutions.wsgi:application", "--bind", "0.0.0.0:8000"]
```

## 📞 Support & Documentation

- **Health Check**: `GET /health/` for system status
- **API Version**: 1.0.0
- **Status**: Production Ready ✅
- **Last Updated**: January 2025

### Key Features

✅ Complete CRUD operations
✅ Role-based access control
✅ JWT authentication
✅ Pagination & filtering
✅ Real-time analytics
✅ System monitoring
✅ HIPAA compliance
✅ Crisis intervention tools
✅ Mental health assessments
✅ Community support features

---

**EduMindSolutions - Empowering youth mental health through technology! 🧠💙**