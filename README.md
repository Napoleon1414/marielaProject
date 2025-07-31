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

### 5. Start the Backend Server
```bash
cd backend
npm run dev
```
The server will start on `http://localhost:3001`

### 6. Start the Frontend
```bash
# In a new terminal, from the root directory
ng serve
```
The application will be available at `http://localhost:4200`

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

### Frontend (Angular)
```bash
ng build --prod
# Deploy dist/ folder to your web server
```

### Backend (Node.js)
```bash
# Use PM2 for production process management
npm install -g pm2
pm2 start server.js --name "mariela-job-platform"
```

### Database (Production)
- Use PostgreSQL or MongoDB for production
- Set up automated backups
- Configure connection pooling
- Implement read replicas for scaling

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