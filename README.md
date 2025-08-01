# Mariela's Job Matching Platform

A comprehensive job matching platform designed specifically for people with disabilities, connecting job seekers with inclusive employers.

## Features

### For Job Seekers
- **Profile Management**: Create detailed profiles with skills, disabilities, and special needs
- **Skills Assessment**: Select from 35+ skills with proficiency levels
- **Job Recommendations**: Get personalized job recommendations based on your profile
- **About Me Section**: Write about yourself with a 250-word limit
- **Special Needs Documentation**: Document accessibility requirements

### For Employers
- **Candidate Discovery**: Browse and search through qualified candidates
- **Advanced Filtering**: Filter by skills, disabilities, and other criteria
- **Save Candidates**: Save promising candidates for later review
- **Contact System**: Direct messaging with candidates
- **Match Scoring**: AI-powered matching algorithm

## Technology Stack

### Frontend
- **Angular 17** - Modern frontend framework
- **TypeScript** - Type-safe development
- **CSS3** - Modern styling with responsive design

### Backend (Database)
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **SQLite** - Lightweight database (can be upgraded to PostgreSQL for production)
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Database Schema

The platform uses a comprehensive database schema with the following main tables:

- **users** - User accounts and authentication
- **job_seeker_profiles** - Detailed job seeker information
- **employer_profiles** - Employer and company information
- **skills** - Available skills with categories
- **job_seeker_skills** - Many-to-many relationship for skills
- **job_postings** - Job opportunities
- **saved_candidates** - Employers' saved candidate lists
- **job_applications** - Application tracking
- **messages** - Communication between users

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Angular CLI (`npm install -g @angular/cli`)

### Available Scripts

The project includes several convenient scripts for development:

- `npm run dev` - Start both frontend and backend in parallel
- `npm run dev:frontend` - Start only the frontend
- `npm run dev:backend` - Start only the backend
- `npm run install:all` - Install dependencies for both frontend and backend
- `npm run start:prod` - Build and serve production version with backend

### 1. Clone the Repository
```bash
git clone <repository-url>
cd mariela-job-platform
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Setup Backend
```bash
cd backend
npm install
```

### 4. Initialize Database
```bash
# The database will be automatically created when you start the server
# The schema is in database/schema.sql
```

### 5. Install All Dependencies (Optional)
```bash
# Install both frontend and backend dependencies in one command
npm run install:all
```

### 6. Start Both Frontend and Backend (Recommended)
```bash
# Start both frontend and backend in parallel with one command
npm run dev
```

This will start:
- Frontend on `http://localhost:4200`
- Backend on `http://localhost:3001`

### Alternative: Start Services Separately
```bash
# Start only the backend
npm run dev:backend

# Start only the frontend (in a new terminal)
npm run dev:frontend
```

## Database Options

### Development (Recommended)
- **SQLite**: Lightweight, no server setup required
- Perfect for development and testing
- Database file: `database/job_platform.db`

### Production Options

#### PostgreSQL (Recommended)
```bash
# Install PostgreSQL
# Update backend/server.js to use PostgreSQL
npm install pg
```

#### MongoDB
```bash
# Install MongoDB
# Update backend/server.js to use MongoDB
npm install mongodb
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Job Seeker
- `GET /api/job-seeker/profile` - Get profile
- `POST /api/job-seeker/profile` - Save profile
- `GET /api/job-seeker/skills` - Get user skills
- `POST /api/job-seeker/skills` - Save skills
- `GET /api/job-recommendations` - Get job recommendations

### Employer
- `GET /api/candidates` - Get all candidates
- `GET /api/saved-candidates` - Get saved candidates
- `POST /api/saved-candidates` - Save a candidate
- `DELETE /api/saved-candidates/:id` - Remove saved candidate

### General
- `GET /api/skills` - Get all available skills
- `GET /api/health` - Health check

## Default Users

For testing purposes, the following users are pre-configured:

### Job Seeker
- Username: `admin`
- Password: `admin`

### Employer
- Username: `admin2`
- Password: `admin2`

## Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
```

## Database Migration (Production)

For production deployment, consider using a migration tool:

```bash
# Install migration tool
npm install -g db-migrate

# Create migration
db-migrate create initial-schema

# Run migrations
db-migrate up
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Rate Limiting**: Prevents abuse with express-rate-limit
- **CORS Protection**: Configured for Angular development
- **Helmet**: Security headers with helmet middleware
- **Input Validation**: Server-side validation for all inputs

## Performance Optimizations

- **Database Indexes**: Optimized queries with proper indexing
- **Connection Pooling**: Efficient database connections
- **Caching**: Implement Redis for session caching (production)
- **CDN**: Static asset delivery (production)

## Deployment

### Quick Deployment (Recommended)

1. **Prepare for deployment:**
   ```bash
   npm run deploy:prepare
   ```

2. **Deploy to your cloud platform:**
   - Upload the `backend/` directory to your cloud platform
   - Set environment variables:
     - `NODE_ENV=production`
     - `PORT=8080`
     - `JWT_SECRET=your-secure-jwt-secret`

### Manual Deployment

#### Frontend (Angular)
```bash
npm run build
# Deploy dist/demo/ folder to your web server
```

#### Backend (Node.js)
```bash
cd backend
npm install --production
NODE_ENV=production PORT=8080 node server.js
```

#### Docker Deployment
```bash
cd backend
docker build -t mariela-job-platform .
docker run -p 8080:8080 mariela-job-platform
```

### Cloud Platform Configuration

#### Environment Variables
- `NODE_ENV=production`
- `PORT=8080` (or your platform's port)
- `JWT_SECRET=your-secure-jwt-secret`

#### Health Check Endpoint
The backend includes a health check at `/health` for cloud platforms.

#### CORS Configuration
Update the CORS origin in `backend/server.js` with your domain:
```javascript
origin: ['https://your-domain.com', 'http://localhost:4200']
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team.

## Roadmap

- [ ] Real-time messaging system
- [ ] Advanced job matching algorithm
- [ ] Video interview integration
- [ ] Accessibility compliance audit
- [ ] Mobile app development
- [ ] Multi-language support
- [ ] Analytics dashboard
- [ ] Integration with job boards 