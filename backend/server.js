const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Database setup
const dbPath = process.env.NODE_ENV === 'production' 
  ? path.join(__dirname, 'database/job_platform.db')
  : path.join(__dirname, '../database/job_platform.db');
const db = new sqlite3.Database(dbPath);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-app-domain.com', 'http://localhost:4200'] 
    : 'http://localhost:4200',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json());

// Health check endpoint for deployment
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
  
  // Handle Angular routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Initialize database
const initDatabase = () => {
  const fs = require('fs');
  const schemaPath = process.env.NODE_ENV === 'production'
    ? path.join(__dirname, 'database/schema.sql')
    : path.join(__dirname, '../database/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  db.exec(schema, (err) => {
    if (err) {
      console.error('Error initializing database:', err);
    } else {
      console.log('Database initialized successfully');
    }
  });
};

// Ensure demo users exist on server start
const ensureDemoUsers = () => {
  db.get('SELECT * FROM users WHERE username = ? AND user_type = ?', ['admin', 'jobseeker'], (err, user) => {
    if (!user) {
      db.run('INSERT INTO users (username, email, password_hash, user_type) VALUES (?, ?, ?, ?)',
        ['admin', 'admin@example.com', '$2b$10$example_hash_for_admin', 'jobseeker'], function() {
          // After creating user, create profile
          db.run('INSERT INTO job_seeker_profiles (user_id, first_name, last_name, about_me, special_needs) VALUES (?, ?, ?, ?, ?)',
            [this.lastID, 'Demo', 'User', '', '']);
        });
    } else {
      // Ensure profile exists
      db.get('SELECT * FROM job_seeker_profiles WHERE user_id = ?', [user.id], (err2, profile) => {
        if (!profile) {
          db.run('INSERT INTO job_seeker_profiles (user_id, first_name, last_name, about_me, special_needs) VALUES (?, ?, ?, ?, ?)',
            [user.id, 'Demo', 'User', '', '']);
        }
      });
    }
  });
  db.get('SELECT * FROM users WHERE username = ? AND user_type = ?', ['admin2', 'employer'], (err, user) => {
    if (!user) {
      db.run('INSERT INTO users (username, email, password_hash, user_type) VALUES (?, ?, ?, ?)',
        ['admin2', 'admin2@example.com', '$2b$10$example_hash_for_admin2', 'employer'], function() {
          db.run('INSERT INTO employer_profiles (user_id, company_name, company_description, contact_person, phone, website) VALUES (?, ?, ?, ?, ?, ?)',
            [this.lastID, 'Demo Company', 'Demo employer profile', 'Admin2', '', '']);
        });
    } else {
      // Ensure employer profile exists
      db.get('SELECT * FROM employer_profiles WHERE user_id = ?', [user.id], (err2, profile) => {
        if (!profile) {
          db.run('INSERT INTO employer_profiles (user_id, company_name, company_description, contact_person, phone, website) VALUES (?, ?, ?, ?, ?, ?)',
            [user.id, 'Demo Company', 'Demo employer profile', 'Admin2', '', '']);
        }
      });
    }
  });
};

// Ensure demo job postings exist
const ensureDemoJobPostings = () => {
  // First, get the employer profile ID
  db.get('SELECT ep.id FROM employer_profiles ep JOIN users u ON ep.user_id = u.id WHERE u.username = ?', ['admin2'], (err, employerProfile) => {
    if (err) {
      console.error('Error getting employer profile:', err);
      return;
    }

    if (!employerProfile) {
      console.log('No employer profile found, skipping demo job postings');
      return;
    }

    // Check if demo job postings already exist
    db.get('SELECT COUNT(*) as count FROM job_postings WHERE employer_id = ? AND status = "active"', [employerProfile.id], (err, result) => {
      if (err) {
        console.error('Error checking job postings:', err);
        return;
      }

      if (result.count === 0) {
        console.log('Creating demo job postings...');
        
        // Create demo job postings
        const demoJobs = [
          {
            title: 'Desarrollador Frontend',
            description: 'Buscamos un desarrollador frontend con experiencia en Angular y React para unirse a nuestro equipo de desarrollo. Responsabilidades incluyen desarrollo de interfaces de usuario, optimización de rendimiento y colaboración con el equipo de diseño.',
            location: 'Buenos Aires, Argentina',
            job_type: 'Tiempo Completo',
            salary_range: '$2,000 - $3,500 USD',
            required_skills: 'Experiencia en Angular, React, TypeScript, HTML, CSS. Mínimo 2 años de experiencia. Habilidades de comunicación y trabajo en equipo.'
          },
          {
            title: 'Especialista en Marketing Digital',
            description: 'Responsable de desarrollar y ejecutar estrategias de marketing digital para aumentar la presencia en línea de la empresa. Incluye gestión de redes sociales, campañas publicitarias y análisis de datos.',
            location: 'Remoto',
            job_type: 'Tiempo Completo',
            salary_range: '$1,800 - $2,500 USD',
            required_skills: 'Experiencia en marketing digital, redes sociales, Google Ads. Conocimientos de análisis de datos. Creatividad y habilidades de comunicación.'
          },
          {
            title: 'Asistente Administrativo',
            description: 'Apoyo en tareas administrativas, manejo de documentación y atención al cliente. Incluye gestión de correos electrónicos, organización de archivos y soporte al equipo.',
            location: 'Córdoba, Argentina',
            job_type: 'Tiempo Parcial',
            salary_range: '$800 - $1,200 USD',
            required_skills: 'Experiencia en tareas administrativas, Excel, Word. Buena comunicación. Organización y atención al detalle.'
          },
          {
            title: 'Diseñador UX/UI',
            description: 'Diseñar interfaces de usuario intuitivas y atractivas para aplicaciones web y móviles. Trabajar en estrecha colaboración con desarrolladores y stakeholders para crear experiencias de usuario excepcionales.',
            location: 'Remoto',
            job_type: 'Tiempo Completo',
            salary_range: '$2,500 - $3,800 USD',
            required_skills: 'Experiencia en Figma, Adobe XD, diseño responsivo. Portfolio requerido. Habilidades de investigación de usuarios y prototipado.'
          },
          {
            title: 'Analista de Datos',
            description: 'Analizar datos para proporcionar insights valiosos que ayuden a tomar decisiones empresariales informadas. Crear reportes y dashboards para diferentes departamentos.',
            location: 'Buenos Aires, Argentina',
            job_type: 'Tiempo Completo',
            salary_range: '$2,200 - $3,000 USD',
            required_skills: 'Experiencia en análisis de datos, SQL, Excel, herramientas de BI. Pensamiento analítico y habilidades de presentación.'
          }
        ];

        demoJobs.forEach((job, index) => {
          db.run(
            `INSERT INTO job_postings 
             (employer_id, title, description, location, job_type, salary_range, requirements, status, company_name) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [employerProfile.id, job.title, job.description, job.location, job.job_type, job.salary_range, job.required_skills, 'active', 'Demo Company'],
            function(err) {
              if (err) {
                console.error(`Error creating demo job ${index + 1}:`, err);
              } else {
                console.log(`Demo job ${index + 1} created successfully`);
              }
            }
          );
        });
      } else {
        console.log('Demo job postings already exist');
      }
    });
  });
};

// API Routes

// Authentication
app.post('/api/auth/login', async (req, res) => {
  const { username, password, userType } = req.body;

  try {
    db.get(
      'SELECT * FROM users WHERE username = ? AND user_type = ?',
      [username, userType],
      async (err, user) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (!user) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Allow demo login for admin and admin2
        if ((username === 'admin' && password === 'admin' && userType === 'jobseeker') ||
            (username === 'admin2' && password === 'admin2' && userType === 'employer')) {
          const token = jwt.sign(
            { id: user.id, username: user.username, userType: user.user_type },
            JWT_SECRET,
            { expiresIn: '24h' }
          );

          return res.json({
            token,
            user: {
              id: user.id,
              username: user.username,
              userType: user.user_type
            }
          });
        }

        // For other users, check password hash
        const valid = await bcrypt.compare(password, user.password_hash);
        if (valid) {
          const token = jwt.sign(
            { id: user.id, username: user.username, userType: user.user_type },
            JWT_SECRET,
            { expiresIn: '24h' }
          );

          return res.json({
            token,
            user: {
              id: user.id,
              username: user.username,
              userType: user.user_type
            }
          });
        } else {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// User registration
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password, userType } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      'INSERT INTO users (username, email, password_hash, user_type) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, userType],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Username or email already exists' });
          }
          return res.status(500).json({ error: 'Database error' });
        }

        const token = jwt.sign(
          { id: this.lastID, username, userType },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.status(201).json({
          token,
          user: { id: this.lastID, username, userType }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Job Seeker Profile Routes
app.post('/api/job-seeker/profile', authenticateToken, (req, res) => {
  const { first_name, last_name, about_me, special_needs, disability_type, custom_disability } = req.body;
  const userId = req.user.id;

  // First, check if a profile already exists for this user
  db.get('SELECT id FROM job_seeker_profiles WHERE user_id = ?', [userId], (err, existingProfile) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (existingProfile) {
      // Update existing profile
      db.run(
        `UPDATE job_seeker_profiles 
         SET first_name = ?, last_name = ?, about_me = ?, special_needs = ?, disability_type = ?, custom_disability = ?
         WHERE user_id = ?`,
        [first_name, last_name, about_me, special_needs, disability_type, custom_disability, userId],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }
          res.json({ message: 'Profile updated successfully', id: existingProfile.id });
        }
      );
    } else {
      // Create new profile
      db.run(
        `INSERT INTO job_seeker_profiles 
         (user_id, first_name, last_name, about_me, special_needs, disability_type, custom_disability) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, first_name, last_name, about_me, special_needs, disability_type, custom_disability],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }
          res.json({ message: 'Profile created successfully', id: this.lastID });
        }
      );
    }
  });
});

// Cleanup endpoint to remove duplicate profiles (requires authentication)
app.delete('/api/cleanup-duplicates', authenticateToken, (req, res) => {
  // Only allow employers or admins to cleanup duplicates
  if (req.user.userType !== 'employer' && req.user.userType !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  console.log('Cleaning up duplicate profiles...');
  db.run(`
    DELETE FROM job_seeker_profiles 
    WHERE id NOT IN (
      SELECT MIN(id) 
      FROM job_seeker_profiles 
      GROUP BY user_id
    )
  `, function(err) {
    if (err) {
      console.error('Error cleaning up duplicates:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    console.log(`Cleaned up ${this.changes} duplicate profiles`);
    res.json({ message: `Cleaned up ${this.changes} duplicate profiles` });
  });
});

app.get('/api/job-seeker/profile', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.get(
    'SELECT * FROM job_seeker_profiles WHERE user_id = ?',
    [userId],
    (err, profile) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(profile || {});
    }
  );
});

// Skills Routes
app.get('/api/skills', (req, res) => {
  db.all('SELECT * FROM skills ORDER BY name', (err, skills) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(skills);
  });
});

app.post('/api/job-seeker/skills', authenticateToken, (req, res) => {
  const { skills } = req.body; // Array of skill IDs
  const userId = req.user.id;

  // First, get the job seeker profile ID
  db.get('SELECT id FROM job_seeker_profiles WHERE user_id = ?', [userId], (err, profile) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Delete existing skills
    db.run('DELETE FROM job_seeker_skills WHERE job_seeker_id = ?', [profile.id], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      // Insert new skills
      const stmt = db.prepare('INSERT INTO job_seeker_skills (job_seeker_id, skill_id) VALUES (?, ?)');
      skills.forEach(skillId => {
        stmt.run([profile.id, skillId]);
      });
      stmt.finalize((err) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'Skills saved successfully' });
      });
    });
  });
});

app.get('/api/job-seeker/skills', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.all(
    `SELECT s.* FROM skills s
     JOIN job_seeker_skills jss ON s.id = jss.skill_id
     JOIN job_seeker_profiles jsp ON jss.job_seeker_id = jsp.id
     WHERE jsp.user_id = ?`,
    [userId],
    (err, skills) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(skills);
    }
  );
});

// Candidates Routes (for employers)
app.get('/api/candidates', authenticateToken, (req, res) => {
  if (req.user.userType !== 'employer') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { search, sortBy = 'matchScore' } = req.query;
  const userId = req.user.id;
  let query = `
    SELECT 
      jsp.id,
      jsp.user_id,
      jsp.first_name,
      jsp.last_name,
      jsp.about_me,
      jsp.special_needs,
      jsp.disability_type,
      jsp.custom_disability,
      u.username,
      u.email,
      GROUP_CONCAT(s.name) as skills,
      CASE WHEN sc.id IS NOT NULL THEN 1 ELSE 0 END as saved
    FROM job_seeker_profiles jsp
    JOIN users u ON jsp.user_id = u.id
    LEFT JOIN job_seeker_skills jss ON jsp.id = jss.job_seeker_id
    LEFT JOIN skills s ON jss.skill_id = s.id
    LEFT JOIN employer_profiles ep ON ep.user_id = ?
    LEFT JOIN saved_candidates sc ON sc.job_seeker_id = jsp.id AND sc.employer_id = ep.id
  `;

  const params = [userId];
  if (search) {
    query += ' WHERE (s.name LIKE ? OR jsp.first_name LIKE ? OR jsp.last_name LIKE ? OR u.username LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  query += ' GROUP BY jsp.id';

  if (sortBy === 'name') {
    query += ' ORDER BY jsp.first_name, jsp.last_name';
  } else {
    query += ' ORDER BY jsp.id DESC'; // Default sort
  }

  db.all(query, params, (err, candidates) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    const candidatesWithScores = candidates.map(candidate => ({
      ...candidate,
      user_id: candidate.user_id,
      name: `${candidate.first_name} ${candidate.last_name}`,
      skills: candidate.skills ? candidate.skills.split(',') : [],
      matchScore: Math.floor(Math.random() * 30) + 70, // Random score between 70-100
      saved: !!candidate.saved
    }));

    res.json(candidatesWithScores);
  });
});

// Saved Candidates Routes
app.post('/api/saved-candidates', authenticateToken, (req, res) => {
  if (req.user.userType !== 'employer') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { job_seeker_id, notes, match_score } = req.body;
  const userId = req.user.id;

  // Get employer profile ID
  db.get('SELECT id FROM employer_profiles WHERE user_id = ?', [userId], (err, profile) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!profile) {
      return res.status(404).json({ error: 'Employer profile not found' });
    }

    db.run(
      'INSERT OR REPLACE INTO saved_candidates (employer_id, job_seeker_id, notes, match_score) VALUES (?, ?, ?, ?)',
      [profile.id, job_seeker_id, notes, match_score],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'Candidate saved successfully' });
      }
    );
  });
});

app.get('/api/saved-candidates', authenticateToken, (req, res) => {
  if (req.user.userType !== 'employer') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const userId = req.user.id;

  db.all(
    `SELECT 
      sc.*,
      jsp.first_name,
      jsp.last_name,
      jsp.about_me,
      jsp.special_needs,
      jsp.disability_type,
      jsp.custom_disability,
      GROUP_CONCAT(s.name) as skills
    FROM saved_candidates sc
    JOIN job_seeker_profiles jsp ON sc.job_seeker_id = jsp.id
    JOIN employer_profiles ep ON sc.employer_id = ep.id
    LEFT JOIN job_seeker_skills jss ON jsp.id = jss.job_seeker_id
    LEFT JOIN skills s ON jss.skill_id = s.id
    WHERE ep.user_id = ?
    GROUP BY sc.id`,
    [userId],
    (err, savedCandidates) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      const formattedCandidates = savedCandidates.map(candidate => ({
        ...candidate,
        name: `${candidate.first_name} ${candidate.last_name}`,
        skills: candidate.skills ? candidate.skills.split(',') : []
      }));

      res.json(formattedCandidates);
    }
  );
});

app.delete('/api/saved-candidates/:candidateId', authenticateToken, (req, res) => {
  if (req.user.userType !== 'employer') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { candidateId } = req.params;
  const userId = req.user.id;

  db.run(
    `DELETE FROM saved_candidates 
     WHERE job_seeker_id = ? AND employer_id = (
       SELECT id FROM employer_profiles WHERE user_id = ?
     )`,
    [candidateId, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Candidate removed from saved list' });
    }
  );
});

// Job Recommendations
app.get('/api/job-recommendations', authenticateToken, (req, res) => {
  if (req.user.userType !== 'jobseeker') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const userId = req.user.id;

  // Get user's profile and skills in one query
  db.get(
    `SELECT 
      jsp.id as profile_id,
      jsp.first_name,
      jsp.last_name,
      jsp.about_me,
      jsp.special_needs,
      jsp.disability_type,
      jsp.custom_disability,
      GROUP_CONCAT(s.name) as skill_names
    FROM job_seeker_profiles jsp
    LEFT JOIN job_seeker_skills jss ON jsp.id = jss.job_seeker_id
    LEFT JOIN skills s ON jss.skill_id = s.id
    WHERE jsp.user_id = ?
    GROUP BY jsp.id`,
    [userId],
    (err, userData) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!userData) {
        return res.json([]);
      }

      const skillNames = userData.skill_names ? userData.skill_names.split(',') : [];

      // Mock job recommendations based on skills
      const recommendations = [
        {
          title: 'Data Entry Specialist',
          description: 'Enter and verify data in computer systems, ensuring accuracy and completeness.',
          matchScore: skillNames.includes('Organization') ? 85 : 70,
          skills: ['Organization', 'Attention to Detail', 'Data Analysis'],
          whyGood: ['Can be done remotely', 'Flexible hours', 'Clear, structured tasks']
        },
        {
          title: 'Content Writer',
          description: 'Create and edit written content for various platforms and purposes.',
          matchScore: skillNames.includes('Writing') ? 80 : 65,
          skills: ['Writing', 'Creativity', 'Research'],
          whyGood: ['Remote work possible', 'Flexible schedule', 'Independent work environment']
        },
        {
          title: 'Customer Service Representative',
          description: 'Assist customers with inquiries, complaints, and support needs.',
          matchScore: skillNames.includes('Communication') ? 75 : 60,
          skills: ['Communication', 'Customer Service', 'Problem Solving'],
          whyGood: ['Structured environment', 'Clear guidelines', 'Supportive team environment']
        }
      ];

      res.json(recommendations);
    }
  );
});

// Get all users (for admin purposes)
app.get('/api/users', authenticateToken, (req, res) => {
  // Only allow employers or admins to view users
  if (req.user.userType !== 'employer' && req.user.userType !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  db.all('SELECT id, username, email, user_type, created_at FROM users ORDER BY created_at DESC', (err, users) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(users);
  });
});

// Development endpoint to get all users (no auth required in dev)
if (process.env.NODE_ENV === 'development') {
  app.get('/api/dev/users', (req, res) => {
    db.all('SELECT id, username, email, user_type, created_at FROM users ORDER BY created_at DESC', (err, users) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(users);
    });
  });

  // Development endpoint to get all job postings (no auth required in dev)
  app.get('/api/dev/job-postings', (req, res) => {
    db.all(`
      SELECT 
        jp.*,
        ep.company_name,
        ep.company_description
       FROM job_postings jp
       JOIN employer_profiles ep ON jp.employer_id = ep.id
       ORDER BY jp.created_at DESC
    `, (err, jobPostings) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(jobPostings);
    });
  });
}

// Job Postings Endpoints

// Get all active job postings for job seekers
app.get('/api/job-postings/active', (req, res) => {
  // Get all active job postings with employer information
  db.all(
    `SELECT 
      jp.*,
      ep.company_name,
      ep.company_description
     FROM job_postings jp
     JOIN employer_profiles ep ON jp.employer_id = ep.id
     WHERE jp.status = 'active'
     ORDER BY jp.created_at DESC`,
    (err, jobPostings) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      // Transform the data to match the frontend interface
      const transformedJobs = jobPostings.map(job => ({
        id: job.id,
        employer_id: job.employer_id,
        title: job.title,
        description: job.description,
        requirements: job.requirements || job.required_skills || '',
        location: job.location,
        salary_range: job.salary_range,
        job_type: job.job_type,
        status: job.status || 'active',
        created_at: job.created_at,
        updated_at: job.updated_at,
        company_name: job.company_name,
        company_description: job.company_description,
        applications_count: job.applications_count || 0,
        skills: job.skills ? JSON.parse(job.skills) : []
      }));

      res.json(transformedJobs);
    }
  );
});

// Create a new job posting
app.post('/api/job-postings', authenticateToken, (req, res) => {
  if (req.user.userType !== 'employer') {
    return res.status(403).json({ error: 'Only employers can create job postings' });
  }

  const { title, description, requirements, location, job_type, salary_range, status, skills } = req.body;
  
  if (!title || !description || !requirements || !location || !job_type || !salary_range) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // First, get the employer profile ID
  db.get('SELECT id FROM employer_profiles WHERE user_id = ?', [req.user.id], (err, employerProfile) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!employerProfile) {
      return res.status(404).json({ error: 'Employer profile not found' });
    }

    // Create the job posting
    db.run(
      `INSERT INTO job_postings 
       (employer_id, title, description, location, job_type, salary_range, requirements, status, company_name, skills) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [employerProfile.id, title, description, location, job_type, salary_range, requirements, status || 'active', 'Demo Company', skills ? JSON.stringify(skills) : null],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        res.status(201).json({
          id: this.lastID,
          employer_id: employerProfile.id,
          title,
          description,
          requirements,
          location,
          job_type,
          salary_range,
          status: status || 'active',
          skills: skills || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          applications_count: 0
        });
      }
    );
  });
});

// Get all job postings for the current employer
app.get('/api/employer/job-postings', authenticateToken, (req, res) => {
  if (req.user.userType !== 'employer') {
    return res.status(403).json({ error: 'Only employers can view their job postings' });
  }

  // Get the employer profile ID
  db.get('SELECT id FROM employer_profiles WHERE user_id = ?', [req.user.id], (err, employerProfile) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!employerProfile) {
      return res.json([]);
    }

    // Get job postings with application count
    db.all(
      `SELECT 
        jp.*,
        COUNT(ja.id) as applications_count
       FROM job_postings jp
       LEFT JOIN job_applications ja ON jp.id = ja.job_posting_id
       WHERE jp.employer_id = ?
       GROUP BY jp.id
       ORDER BY jp.created_at DESC`,
      [employerProfile.id],
      (err, jobPostings) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        // Transform the data to match the frontend interface
        const transformedJobs = jobPostings.map(job => ({
          id: job.id,
          employer_id: job.employer_id,
          title: job.title,
          description: job.description,
          requirements: job.requirements || job.required_skills || '',
          location: job.location,
          salary_range: job.salary_range,
          job_type: job.job_type,
          status: job.status || (job.is_active ? 'active' : 'closed'),
          created_at: job.created_at,
          updated_at: job.updated_at,
          applications_count: job.applications_count || 0,
          skills: job.skills ? JSON.parse(job.skills) : []
        }));

        res.json(transformedJobs);
      }
    );
  });
});

// Update a job posting
app.put('/api/job-postings/:id', authenticateToken, (req, res) => {
  if (req.user.userType !== 'employer') {
    return res.status(403).json({ error: 'Only employers can update job postings' });
  }

  const jobId = parseInt(req.params.id, 10);
  const { title, description, requirements, location, job_type, salary_range, status, skills } = req.body;

  // First, verify the job posting belongs to the current employer
  db.get(
    `SELECT jp.* FROM job_postings jp
     JOIN employer_profiles ep ON jp.employer_id = ep.id
     WHERE jp.id = ? AND ep.user_id = ?`,
    [jobId, req.user.id],
    (err, jobPosting) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!jobPosting) {
        return res.status(404).json({ error: 'Job posting not found' });
      }

      // Update the job posting
      db.run(
        `UPDATE job_postings 
         SET title = ?, description = ?, location = ?, job_type = ?, 
             salary_range = ?, requirements = ?, status = ?, updated_at = CURRENT_TIMESTAMP, skills = ?
         WHERE id = ?`,
        [title, description, location, job_type, salary_range, requirements, status || 'active', skills ? JSON.stringify(skills) : null, jobId],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          res.json({
            id: jobId,
            employer_id: jobPosting.employer_id,
            title,
            description,
            requirements,
            location,
            job_type,
            salary_range,
            status: status || 'active',
            skills: skills || [],
            created_at: jobPosting.created_at,
            updated_at: new Date().toISOString(),
            applications_count: 0
          });
        }
      );
    }
  );
});

// Toggle job posting status (active/closed)
app.patch('/api/job-postings/:id/status', authenticateToken, (req, res) => {
  if (req.user.userType !== 'employer') {
    return res.status(403).json({ error: 'Only employers can update job posting status' });
  }

  const jobId = parseInt(req.params.id, 10);
  const { status } = req.body;

  if (!status || !['active', 'closed'].includes(status)) {
    return res.status(400).json({ error: 'Status must be "active" or "closed"' });
  }

  // First, verify the job posting belongs to the current employer
  db.get(
    `SELECT jp.* FROM job_postings jp
     JOIN employer_profiles ep ON jp.employer_id = ep.id
     WHERE jp.id = ? AND ep.user_id = ?`,
    [jobId, req.user.id],
    (err, jobPosting) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!jobPosting) {
        return res.status(404).json({ error: 'Job posting not found' });
      }

      // Update the job posting status
      db.run(
        `UPDATE job_postings 
         SET is_active = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [status === 'active' ? 1 : 0, jobId],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          res.json({
            id: jobId,
            employer_id: jobPosting.employer_id,
            title: jobPosting.title,
            description: jobPosting.description,
            requirements: jobPosting.required_skills || '',
            location: jobPosting.location,
            salary_range: jobPosting.salary_range,
            job_type: jobPosting.job_type,
            status: status,
            created_at: jobPosting.created_at,
            updated_at: new Date().toISOString(),
            applications_count: 0
          });
        }
      );
    }
  );
});

// Delete a job posting
app.delete('/api/job-postings/:id', authenticateToken, (req, res) => {
  if (req.user.userType !== 'employer') {
    return res.status(403).json({ error: 'Only employers can delete job postings' });
  }

  const jobId = parseInt(req.params.id, 10);

  // First, verify the job posting belongs to the current employer
  db.get(
    `SELECT jp.* FROM job_postings jp
     JOIN employer_profiles ep ON jp.employer_id = ep.id
     WHERE jp.id = ? AND ep.user_id = ?`,
    [jobId, req.user.id],
    (err, jobPosting) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!jobPosting) {
        return res.status(404).json({ error: 'Job posting not found' });
      }

      // Delete the job posting
      db.run('DELETE FROM job_postings WHERE id = ?', [jobId], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        res.json({ message: 'Job posting deleted successfully' });
      });
    }
  );
});

// Get applications for a specific job posting
app.get('/api/job-postings/:id/applications', authenticateToken, (req, res) => {
  if (req.user.userType !== 'employer') {
    return res.status(403).json({ error: 'Only employers can view job applications' });
  }

  const jobId = parseInt(req.params.id, 10);

  // First, verify the job posting belongs to the current employer
  db.get(
    `SELECT jp.* FROM job_postings jp
     JOIN employer_profiles ep ON jp.employer_id = ep.id
     WHERE jp.id = ? AND ep.user_id = ?`,
    [jobId, req.user.id],
    (err, jobPosting) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!jobPosting) {
        return res.status(404).json({ error: 'Job posting not found' });
      }

      // Get applications for this job posting
      db.all(
        `SELECT 
          ja.*,
          jsp.first_name,
          jsp.last_name,
          u.username,
          u.email
         FROM job_applications ja
         JOIN job_seeker_profiles jsp ON ja.job_seeker_id = jsp.id
         JOIN users u ON jsp.user_id = u.id
         WHERE ja.job_posting_id = ?
         ORDER BY ja.applied_at DESC`,
        [jobId],
        (err, applications) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          const transformedApplications = applications.map(app => ({
            id: app.id,
            job_posting_id: app.job_posting_id,
            job_seeker_id: app.job_seeker_id,
            job_seeker_name: `${app.first_name} ${app.last_name}`,
            status: app.status,
            applied_at: app.applied_at,
            cover_letter: app.cover_letter,
            username: app.username,
            email: app.email
          }));

          res.json(transformedApplications);
        }
      );
    }
  );
});

// Update application status
app.patch('/api/applications/:id/status', authenticateToken, (req, res) => {
  if (req.user.userType !== 'employer') {
    return res.status(403).json({ error: 'Only employers can update application status' });
  }

  const applicationId = parseInt(req.params.id, 10);
  const { status } = req.body;

  if (!status || !['pending', 'reviewed', 'accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  // First, verify the application belongs to a job posting owned by the current employer
  db.get(
    `SELECT ja.* FROM job_applications ja
     JOIN job_postings jp ON ja.job_posting_id = jp.id
     JOIN employer_profiles ep ON jp.employer_id = ep.id
     WHERE ja.id = ? AND ep.user_id = ?`,
    [applicationId, req.user.id],
    (err, application) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!application) {
        return res.status(404).json({ error: 'Application not found' });
      }

      // Update the application status
      db.run(
        `UPDATE job_applications 
         SET status = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [status, applicationId],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          res.json({
            id: applicationId,
            job_posting_id: application.job_posting_id,
            job_seeker_id: application.job_seeker_id,
            status: status,
            applied_at: application.applied_at,
            updated_at: new Date().toISOString()
          });
        }
      );
    }
  );
});

// Apply to a job posting
app.post('/api/job-postings/:id/apply', authenticateToken, (req, res) => {
  if (req.user.userType !== 'jobseeker') {
    return res.status(403).json({ error: 'Only job seekers can apply to jobs' });
  }

  const jobId = parseInt(req.params.id, 10);
  const { cover_letter } = req.body;

  // First, verify the job posting exists and is active
  db.get(
    'SELECT * FROM job_postings WHERE id = ? AND status = "active"',
    [jobId],
    (err, jobPosting) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!jobPosting) {
        return res.status(404).json({ error: 'Job posting not found or not active' });
      }

      // Get the job seeker profile for the current user
      db.get(
        'SELECT id FROM job_seeker_profiles WHERE user_id = ?',
        [req.user.id],
        (err, jobSeekerProfile) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          if (!jobSeekerProfile) {
            return res.status(400).json({ error: 'Job seeker profile not found. Please complete your profile first.' });
          }

          // Check if user has already applied to this job
          db.get(
            'SELECT id FROM job_applications WHERE job_posting_id = ? AND job_seeker_id = ?',
            [jobId, jobSeekerProfile.id],
            (err, existingApplication) => {
              if (err) {
                return res.status(500).json({ error: 'Database error' });
              }

              if (existingApplication) {
                return res.status(400).json({ error: 'You have already applied to this job' });
              }

              // Create the application
              db.run(
                `INSERT INTO job_applications 
                 (job_posting_id, job_seeker_id, status, cover_letter, applied_at, updated_at)
                 VALUES (?, ?, 'pending', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                [jobId, jobSeekerProfile.id, cover_letter || ''],
                function(err) {
                  if (err) {
                    return res.status(500).json({ error: 'Database error' });
                  }

                  // Update the applications count for the job posting
                  db.run(
                    'UPDATE job_postings SET applications_count = applications_count + 1 WHERE id = ?',
                    [jobId],
                    (err) => {
                      if (err) {
                        console.error('Error updating applications count:', err);
                      }
                    }
                  );

                  res.json({
                    message: 'Application submitted successfully',
                    application_id: this.lastID,
                    job_posting_id: jobId,
                    status: 'pending'
                  });
                }
              );
            }
          );
        }
      );
    }
  );
});

// Get job seeker's applications
app.get('/api/job-seeker/applications', authenticateToken, (req, res) => {
  if (req.user.userType !== 'jobseeker') {
    return res.status(403).json({ error: 'Only job seekers can view their applications' });
  }

  // Get the job seeker profile for the current user
  db.get(
    'SELECT id FROM job_seeker_profiles WHERE user_id = ?',
    [req.user.id],
    (err, jobSeekerProfile) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!jobSeekerProfile) {
        return res.status(400).json({ error: 'Job seeker profile not found' });
      }

      // Get all applications for this job seeker
      db.all(
        `SELECT 
          ja.*,
          jp.title as job_title,
          jp.company_name,
          jp.location,
          jp.salary_range,
          jp.job_type
         FROM job_applications ja
         JOIN job_postings jp ON ja.job_posting_id = jp.id
         WHERE ja.job_seeker_id = ?
         ORDER BY ja.applied_at DESC`,
        [jobSeekerProfile.id],
        (err, applications) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          const transformedApplications = applications.map(app => ({
            id: app.id,
            job_posting_id: app.job_posting_id,
            job_seeker_id: app.job_seeker_id,
            job_title: app.job_title,
            company_name: app.company_name,
            location: app.location,
            salary_range: app.salary_range,
            job_type: app.job_type,
            status: app.status,
            applied_at: app.applied_at,
            cover_letter: app.cover_letter
          }));

          res.json(transformedApplications);
        }
      );
    }
  );
});

// Get job seeker profile by ID (for employers)
app.get('/api/job-seeker/profile/:id', authenticateToken, (req, res) => {
  if (req.user.userType !== 'employer') {
    return res.status(403).json({ error: 'Only employers can view job seeker profiles' });
  }

  const jobSeekerId = parseInt(req.params.id, 10);

  db.get(
    'SELECT * FROM job_seeker_profiles WHERE id = ?',
    [jobSeekerId],
    (err, profile) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!profile) {
        return res.status(404).json({ error: 'Job seeker profile not found' });
      }

      res.json(profile);
    }
  );
});

// Get job seeker skills by ID (for employers)
app.get('/api/job-seeker/skills/:id', authenticateToken, (req, res) => {
  if (req.user.userType !== 'employer') {
    return res.status(403).json({ error: 'Only employers can view job seeker skills' });
  }

  const jobSeekerId = parseInt(req.params.id, 10);

  db.all(
    `SELECT s.* FROM skills s
     JOIN job_seeker_skills jss ON s.id = jss.skill_id
     WHERE jss.job_seeker_id = ?
     ORDER BY s.name`,
    [jobSeekerId],
    (err, skills) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json(skills);
    }
  );
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  initDatabase();
  ensureDemoUsers();
  // Add a delay to ensure users are created before job postings
  setTimeout(() => {
    ensureDemoJobPostings();
  }, 2000);
});

module.exports = app; 

// Messaging Endpoints
// Send a message
app.post('/api/messages', authenticateToken, (req, res) => {
  const senderId = req.user.id;
  const { receiver_id, subject, message } = req.body;
  if (!receiver_id || !message) {
    return res.status(400).json({ error: 'receiver_id and message are required' });
  }
  db.run(
    'INSERT INTO messages (sender_id, receiver_id, subject, message) VALUES (?, ?, ?, ?)',
    [senderId, receiver_id, subject || '', message],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Message sent', id: this.lastID });
    }
  );
});

// Get all conversations for the current user (inbox)
app.get('/api/messages/inbox', authenticateToken, (req, res) => {
  const userId = req.user.id;
  // Get the latest message from each unique sender/receiver pair
  db.all(
    `SELECT m.*, u.username as sender_username, u2.username as receiver_username
     FROM messages m
     JOIN users u ON m.sender_id = u.id
     JOIN users u2 ON m.receiver_id = u2.id
     WHERE m.receiver_id = ? OR m.sender_id = ?
     ORDER BY m.sent_at DESC`,
    [userId, userId],
    (err, messages) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      // Group by conversation partner
      const conversations = {};
      messages.forEach(msg => {
        const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
        if (!conversations[partnerId]) {
          conversations[partnerId] = {
            partnerId,
            senderName: msg.sender_id === userId ? msg.receiver_username : msg.sender_username,
            lastMessage: msg.message,
            lastTimestamp: msg.sent_at
          };
        }
      });
      res.json(Object.values(conversations));
    }
  );
});

// Get all messages in a conversation between current user and another user
app.get('/api/messages/conversation/:userId', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const partnerId = parseInt(req.params.userId, 10);
  db.all(
    `SELECT m.*, u.username as sender_username, u2.username as receiver_username
     FROM messages m
     JOIN users u ON m.sender_id = u.id
     JOIN users u2 ON m.receiver_id = u2.id
     WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
     ORDER BY m.sent_at ASC`,
    [userId, partnerId, partnerId, userId],
    (err, messages) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(messages.map(msg => ({
        senderId: msg.sender_id,
        senderName: msg.sender_username,
        text: msg.message,
        timestamp: msg.sent_at
      })));
    }
  );
}); 