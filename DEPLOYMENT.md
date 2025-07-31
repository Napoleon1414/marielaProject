# Deployment Guide

## Quick Start

1. **Prepare the application for deployment:**
   ```bash
   npm run deploy:prepare
   ```

2. **Deploy the `backend/` directory to your cloud platform**

## Supported Platforms

### DigitalOcean App Platform
1. Connect your GitHub repository
2. Set the source directory to `backend/`
3. Configure environment variables:
   - `NODE_ENV=production`
   - `PORT=8080`
   - `JWT_SECRET=your-secure-jwt-secret`

### Heroku
1. Create a new Heroku app
2. Set buildpack to `nodejs`
3. Deploy the `backend/` directory
4. Set environment variables in Heroku dashboard

### Google Cloud Run
1. Build and deploy using the provided Dockerfile:
   ```bash
   cd backend
   gcloud run deploy mariela-job-platform --source .
   ```

### AWS Elastic Beanstalk
1. Create a new Node.js environment
2. Upload the `backend/` directory
3. Configure environment variables

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment mode | Yes |
| `PORT` | Server port | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |

## Health Check

The application includes a health check endpoint at `/health` that returns:
```json
{
  "status": "OK",
  "timestamp": "2025-07-31T03:42:00.000Z",
  "environment": "production"
}
```

## Troubleshooting

### 504 Gateway Timeout
- Check that the application is binding to the correct port
- Verify environment variables are set correctly
- Check application logs for errors

### CORS Errors
- Update the CORS origin in `backend/server.js` with your domain
- Ensure the frontend is being served correctly

### Database Errors
- Verify the database files are copied to the correct location
- Check file permissions on the database directory

## Security Notes

1. **Change the JWT_SECRET** in production
2. **Update CORS origins** with your actual domain
3. **Use HTTPS** in production
4. **Consider using a production database** like PostgreSQL

## Monitoring

The application logs important events:
- Server startup
- Database initialization
- API requests (with rate limiting)
- Error messages

## Scaling

The application is designed to scale horizontally:
- Stateless API design
- SQLite database (consider PostgreSQL for high traffic)
- Rate limiting enabled
- Health checks for load balancers 