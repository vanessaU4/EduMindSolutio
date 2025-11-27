# Deployment Guide

This guide explains how to set up automatic deployment to Render (backend) and Vercel (frontend) when you push to GitHub.

## Overview

- **Frontend**: Deployed to Vercel automatically
- **Backend**: Deployed to Render automatically
- **Trigger**: Push to `main` or `master` branch

## Prerequisites

### 1. Vercel Setup

1. **Create Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Import Project**: Import your GitHub repository
3. **Configure Project**:
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

### 2. Render Setup

1. **Create Render Account**: Sign up at [render.com](https://render.com)
2. **Create Web Service**:
   - Connect your GitHub repository
   - Environment: `Docker`
   - Root Directory: `backend`
   - Use existing `render.yaml` configuration

### 3. GitHub Repository Secrets

Add the following secrets to your GitHub repository (Settings → Secrets and variables → Actions):

#### For Vercel Deployment:
```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
```

#### For Render Deployment:
```
RENDER_DEPLOY_HOOK_URL=your_render_deploy_hook_url
```

## Getting Required Values

### Vercel Secrets

1. **VERCEL_TOKEN**:
   - Go to Vercel Dashboard → Settings → Tokens
   - Create a new token
   - Copy the token value

2. **VERCEL_ORG_ID**:
   - Go to Vercel Dashboard → Settings → General
   - Copy the "Team ID" (for personal accounts, this is your user ID)

3. **VERCEL_PROJECT_ID**:
   - Go to your project in Vercel Dashboard
   - Go to Settings → General
   - Copy the "Project ID"

### Render Secrets

1. **RENDER_DEPLOY_HOOK_URL**:
   - Go to your Render service dashboard
   - Go to Settings → Deploy Hook
   - Copy the deploy hook URL

## Configuration Files

### Frontend Configuration (`frontend/vercel.json`)
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "env": {
    "VITE_API_URL": "https://your-backend-url.onrender.com/api"
  }
}
```

### Backend Configuration (`backend/render.yaml`)
```yaml
services:
  - type: web
    name: edumind-backend
    env: docker
    dockerfilePath: ./Dockerfile
    dockerContext: .
    buildCommand: docker build -t edumind-backend .
    startCommand: >
      /bin/sh -c "python manage.py migrate &&
      python manage.py collectstatic --noinput &&
      gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT --workers 3"
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
      - key: SECRET_KEY
        generateValue: true
      - key: DEBUG
        value: false
      - key: ALLOWED_HOSTS
        sync: false
      - key: DATABASE_URL
        fromDatabase:
          name: edumind-db
          property: connectionString
      - key: CORS_ALLOWED_ORIGINS
        value: "https://your-frontend-url.vercel.app"
    autoDeploy: true
    healthCheckPath: /health/

databases:
  - name: edumind-db
    databaseName: edumindsolutions
    user: edumind
    plan: free
```

## Deployment Workflow

The GitHub Actions workflow (`.github/workflows/deploy.yml`) includes three jobs:

1. **deploy-frontend**: Builds and deploys frontend to Vercel
2. **deploy-backend**: Triggers deployment to Render
3. **build-images**: Builds Docker images for backup/other deployments

## Environment Variables

### Backend Environment Variables (Render)

Set these in your Render service dashboard:

```bash
SECRET_KEY=your_secret_key
DEBUG=False
ALLOWED_HOSTS=your-backend-url.onrender.com
DATABASE_URL=postgresql://... (auto-generated)
CORS_ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
```

### Frontend Environment Variables (Vercel)

Set these in your Vercel project dashboard:

```bash
VITE_API_URL=https://your-backend-url.onrender.com/api
```

## Manual Deployment

### Deploy Frontend to Vercel
```bash
cd frontend
npm install
npm run build
npx vercel --prod
```

### Deploy Backend to Render
```bash
# Render deploys automatically from GitHub
# Or trigger via deploy hook:
curl -X POST "https://api.render.com/deploy/srv-xxxxx?key=xxxxx"
```

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check build logs in Vercel/Render dashboard
   - Ensure all dependencies are in `package.json`/`requirements.txt`
   - Verify environment variables are set correctly

2. **CORS Errors**:
   - Update `CORS_ALLOWED_ORIGINS` in backend
   - Ensure frontend URL is correct in backend settings

3. **Database Issues**:
   - Check database connection in Render
   - Verify migrations are running correctly
   - Check `DATABASE_URL` environment variable

### Logs and Monitoring

- **Vercel**: Check deployment logs in Vercel dashboard
- **Render**: Check service logs in Render dashboard
- **GitHub Actions**: Check workflow runs in GitHub repository

## Security Considerations

1. **Environment Variables**: Never commit secrets to version control
2. **CORS**: Configure CORS properly for production
3. **HTTPS**: Both Vercel and Render provide HTTPS by default
4. **Database**: Use strong passwords and connection encryption

## Performance Optimization

1. **Frontend**:
   - Enable Vercel's Edge Network
   - Use Vercel Analytics for monitoring
   - Optimize bundle size with tree shaking

2. **Backend**:
   - Use Render's auto-scaling features
   - Configure proper health checks
   - Use database connection pooling

## Monitoring and Alerts

1. **Vercel**: Set up deployment notifications
2. **Render**: Configure service alerts
3. **GitHub**: Enable workflow notifications
4. **Health Checks**: Monitor `/health/` endpoint

## Next Steps

1. Set up the required secrets in GitHub
2. Update the URLs in configuration files
3. Push to main branch to trigger first deployment
4. Monitor deployment logs for any issues
5. Test the deployed application

## Support

- **Vercel Documentation**: https://vercel.com/docs
- **Render Documentation**: https://render.com/docs
- **GitHub Actions**: https://docs.github.com/en/actions
