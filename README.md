# EduMindSolutions - Mental Health Platform

![CI/CD Pipeline](https://github.com/your-username/eduMindSolutions/workflows/CI/CD%20Pipeline/badge.svg)
![Coverage](https://img.shields.io/badge/coverage-80%25-green)
![Security](https://img.shields.io/badge/security-passing-brightgreen)
![Maintenance](https://img.shields.io/badge/maintenance-active-brightgreen)

## 🌟 Overview

EduMindSolutions is a comprehensive mental health platform designed specifically for youth aged 13-23. The platform provides clinical assessments, peer support, crisis intervention services, and educational resources to support young people's mental health journey.
## LINK TO THE DEPLOYED APP:

https://edu-mind-solutions.vercel.app/

### Key Features

- 🏥 **Clinical Assessments** - Professional mental health evaluations and tracking
- 👥 **Peer Support Community** - Safe spaces for peer-to-peer support and forums
- 🚨 **Crisis Intervention** - 24/7 crisis support and emergency resources
- 📚 **Educational Content** - Mental health resources, articles, and multimedia content
- 🔒 **HIPAA Compliant** - Secure, privacy-focused healthcare platform
- 📱 **Responsive Design** - Works seamlessly across all devices
- 🎯 **Role-Based Access** - Different interfaces for patients and healthcare professionals

## 🏗️ Technical Overview

### Backend (Django REST API)
- **Framework**: Django 5.1.7 + Django REST Framework
- **Authentication**: JWT (JSON Web Tokens)
- **Database**: SQLite (development) / PostgreSQL (production)
- **Security**: HIPAA-compliant data handling and encryption

### Frontend (React TypeScript)
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 7.0.4
- **UI Library**: Radix UI + Tailwind CSS
- **State Management**: Redux Toolkit + React Query
- **Routing**: React Router DOM

### Key Applications

| Application | Purpose | Features |
|-------------|---------|----------|
| **accounts** | User management | Registration, authentication, role-based access |
| **assessments** | Clinical evaluations | Mental health assessments, progress tracking |
| **community** | Peer support | Forums, chat rooms, peer matching |
| **content** | Educational resources | Articles, videos, audio content |
| **crisis** | Emergency support | Crisis hotlines, emergency contacts |
| **wellness** | Health tracking | Mood tracking, wellness goals |

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Git

### Backend Setup

```bash
# Clone the repository
git clone <repository-url>
cd eduMindSolutions/backend

# Create virtual environment
python -m venv env

# Activate virtual environment
# Windows:
env\Scripts\activate
# Linux/Mac:
source env/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Admin Panel**: http://localhost:8000/admin

