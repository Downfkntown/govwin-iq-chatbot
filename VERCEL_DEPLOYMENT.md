# GovWin IQ Chatbot - Vercel Deployment Guide

## Overview
This guide covers deploying the GovWin IQ Customer Success Chatbot with 2-agent architecture to Vercel.

## Architecture
- **Serverless deployment** using `api/railway-single-deployment.js`
- **2-Agent System**:
  - Search & Navigation Agent: Guides users through GovWin's search tools
  - Customer Success Agent: Platform navigation, troubleshooting, escalation

## File Structure
```
govwin-iq-chatbot/
├── api/
│   └── index.js                      # Main serverless function
├── vercel.json                       # Vercel configuration
├── package.json                      # Dependencies and scripts
├── railway-single-deployment.js     # Original file (kept for reference)
└── VERCEL_DEPLOYMENT.md             # This guide
```

## Prerequisites
- GitHub account with repository access
- Vercel account
- Node.js 18+ for local testing (optional)

## Deployment Steps

### 1. Automatic GitHub Deployment
1. **Connect Repository to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Select your GitHub repository (`govwin-iq-chatbot`)
   - Click "Import"

2. **Configure Project Settings:**
   - **Framework Preset**: Node.js
   - **Build Command**: `npm run build`
   - **Output Directory**: Leave empty (uses default)
   - **Install Command**: `npm install`

3. **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=3000
   LOG_LEVEL=info
   ```

4. **Deploy:**
   - Click "Deploy"
   - Vercel will automatically build and deploy your application

### 2. Manual CLI Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project directory
vercel --prod
```

## Configuration Files

### vercel.json
```json
{
  "version": 2,
  "name": "govwin-iq-chatbot",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/api/index"
    }
  ],
  "functions": {
    "api/index.js": {
      "maxDuration": 30
    }
  }
}
```

## API Endpoints

### Health Check
```bash
GET https://your-deployment.vercel.app/api/v1/system/health
```

### System Status
```bash
GET https://your-deployment.vercel.app/api/v1/system/status
```

### Chat Message
```bash
POST https://your-deployment.vercel.app/api/v1/chat/message
Content-Type: application/json

{
  "message": "How do I search for federal opportunities?",
  "userId": "user123",
  "sessionId": "session456"
}
```

## Testing the 2-Agent Architecture

### Search & Navigation Agent Test
```bash
curl -X POST https://your-deployment.vercel.app/api/v1/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How do I search for federal opportunities?",
    "userId": "test_user"
  }'
```

Expected response: Search guidance with step-by-step instructions.

### Customer Success Agent Test
```bash
curl -X POST https://your-deployment.vercel.app/api/v1/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I am having trouble logging into my account",
    "userId": "test_user"
  }'
```

Expected response: Troubleshooting guidance with escalation options.

## Monitoring and Debugging

### Check Deployment Status
1. Visit Vercel Dashboard
2. Select your project
3. View "Functions" tab for performance metrics
4. Check "Settings" → "Environment Variables"

### View Logs
```bash
# Using Vercel CLI
vercel logs

# Or view in dashboard under "Functions" → "View Function Logs"
```

### Health Endpoint
Monitor system health at: `https://your-deployment.vercel.app/api/v1/system/health`

## Automatic Deployment Setup

### GitHub Integration
1. **Push to Deploy**: Any push to main branch will trigger automatic deployment
2. **Pull Request Previews**: Each PR creates a preview deployment
3. **Environment Variables**: Set in Vercel dashboard under Project Settings

### Branch Configuration
- **Production Branch**: `main`
- **Preview Branches**: All other branches

## Performance Considerations

- **Cold Starts**: First request may take 1-2 seconds
- **Function Duration**: Max 30 seconds per request
- **Memory Limit**: 1024MB default
- **Concurrent Executions**: Scales automatically

## Redis Configuration
The application includes fallback to in-memory storage when Redis is not available. For production with high traffic, consider:
- Vercel KV (Redis-compatible)
- External Redis provider (Redis Labs, AWS ElastiCache)

## Troubleshooting

### Common Issues
1. **Build Failures**: Check Node.js version compatibility
2. **Function Timeouts**: Reduce processing complexity
3. **Memory Issues**: Optimize agent responses

### Support Contacts
- Technical Issues: Check function logs in Vercel dashboard
- Deployment Issues: Verify vercel.json configuration
- Performance Issues: Monitor function metrics

## Success Criteria
✅ Health endpoint returns 200 OK
✅ Both agents respond correctly to their respective query types  
✅ Error handling works with escalation fallbacks
✅ Automatic deployment from GitHub works
✅ Function logs show successful initialization