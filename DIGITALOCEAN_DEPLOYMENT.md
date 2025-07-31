# DigitalOcean App Platform Deployment Guide

## Quick Fix for 504 Gateway Timeout

### 1. Environment Variables
Set these in your DigitalOcean App Platform dashboard:

```
NODE_ENV=production
PORT=8080
JWT_SECRET=your-super-secure-production-secret-key-here
```

### 2. Build Command
Set the build command to:
```bash
npm run deploy:prepare
```

### 3. Run Command
Set the run command to:
```bash
npm start
```

### 4. Source Directory
Set the source directory to: `backend/`

## Troubleshooting Steps

### Step 1: Check Application Logs
1. Go to your DigitalOcean App Platform dashboard
2. Click on your app
3. Go to the "Runtime Logs" tab
4. Look for any error messages

### Step 2: Verify Health Check
Your app should respond to: `https://hammerhead-app-s89yi.ondigitalocean.app/health`

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-07-31T03:42:00.000Z",
  "environment": "production"
}
```

### Step 3: Check Database Files
Make sure these files are in the `backend/database/` directory:
- `schema.sql`
- `job_platform.db`

### Step 4: Verify Port Binding
The app should bind to port 8080 (DigitalOcean's default)

## Common Issues and Solutions

### Issue: 504 Gateway Timeout
**Cause:** Application not starting or not binding to correct port
**Solution:**
1. Check environment variables are set correctly
2. Verify the app is binding to `0.0.0.0:8080`
3. Check application logs for startup errors

### Issue: CORS Errors
**Cause:** Frontend can't access backend API
**Solution:**
1. CORS is already configured for your domain
2. Make sure both frontend and backend are deployed

### Issue: Database Errors
**Cause:** SQLite database files missing or corrupted
**Solution:**
1. Run `npm run deploy:prepare` to copy database files
2. Check file permissions on database directory

### Issue: Angular Routes Not Working
**Cause:** Angular routing not configured properly
**Solution:**
1. Make sure static files are in `backend/public/`
2. Verify the catch-all route is at the end of all routes

## Deployment Checklist

- [ ] Environment variables set (NODE_ENV, PORT, JWT_SECRET)
- [ ] Build command: `npm run deploy:prepare`
- [ ] Run command: `npm start`
- [ ] Source directory: `backend/`
- [ ] Health check endpoint: `/health`
- [ ] Database files copied to `backend/database/`
- [ ] Static files copied to `backend/public/`
- [ ] CORS configured for your domain
- [ ] Angular routing handler added

## Testing Your Deployment

1. **Health Check:**
   ```bash
   curl https://hammerhead-app-s89yi.ondigitalocean.app/health
   ```

2. **API Test:**
   ```bash
   curl https://hammerhead-app-s89yi.ondigitalocean.app/api/skills
   ```

3. **Frontend Test:**
   Visit: `https://hammerhead-app-s89yi.ondigitalocean.app/`

## Monitoring

- Check "Runtime Logs" in DigitalOcean dashboard
- Monitor "Metrics" tab for performance
- Set up alerts for health check failures

## Rollback Plan

If deployment fails:
1. Check the previous deployment version
2. Review logs for specific errors
3. Fix issues and redeploy
4. Consider using a staging environment first 