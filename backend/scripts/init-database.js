const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../../database/job_platform.db');
const schemaPath = path.join(__dirname, '../../database/schema.sql');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

console.log('Initializing database...');

// Read and execute schema
const schema = fs.readFileSync(schemaPath, 'utf8');

db.exec(schema, (err) => {
  if (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }

  console.log('Database schema created successfully');

  // Insert sample data
  insertSampleData();
});

function insertSampleData() {
  console.log('Inserting sample data...');

  // Insert sample job seekers
  const sampleJobSeekers = [
    {
      username: 'john_doe',
      email: 'john.doe@example.com',
      password_hash: '$2b$10$example_hash',
      user_type: 'jobseeker',
      first_name: 'John',
      last_name: 'Doe',
      about_me: 'Experienced customer service professional with strong communication skills and a passion for helping others.',
      special_needs: 'Visual impairment - requires screen reader and high contrast interface',
      disability_type: 'Visual Impairment'
    },
    {
      username: 'jane_smith',
      email: 'jane.smith@example.com',
      password_hash: '$2b$10$example_hash',
      user_type: 'jobseeker',
      first_name: 'Jane',
      last_name: 'Smith',
      about_me: 'Detail-oriented data analyst with experience in research and organization. I enjoy working with numbers and finding patterns in data.',
      special_needs: 'Mobility assistance required - wheelchair accessible workspace needed',
      disability_type: 'Physical Disability'
    },
    {
      username: 'mike_johnson',
      email: 'mike.johnson@example.com',
      password_hash: '$2b$10$example_hash',
      user_type: 'jobseeker',
      first_name: 'Mike',
      last_name: 'Johnson',
      about_me: 'Creative writer with excellent time management skills. I love telling stories and creating engaging content.',
      special_needs: 'Quiet workspace preferred due to sensory sensitivity',
      disability_type: 'Autism Spectrum Disorder'
    }
  ];

  // Insert sample employers
  const sampleEmployers = [
    {
      username: 'tech_corp',
      email: 'hr@techcorp.com',
      password_hash: '$2b$10$example_hash',
      user_type: 'employer',
      company_name: 'TechCorp Solutions',
      company_description: 'Innovative technology company focused on inclusive hiring practices',
      contact_person: 'Sarah Wilson',
      phone: '555-0123',
      website: 'https://techcorp.com'
    },
    {
      username: 'inclusive_retail',
      email: 'careers@inclusiveretail.com',
      password_hash: '$2b$10$example_hash',
      user_type: 'employer',
      company_name: 'Inclusive Retail Partners',
      company_description: 'Retail chain committed to diversity and accessibility in the workplace',
      contact_person: 'David Chen',
      phone: '555-0456',
      website: 'https://inclusiveretail.com'
    }
  ];

  // Insert users and profiles
  let completed = 0;
  const total = sampleJobSeekers.length + sampleEmployers.length;

  sampleJobSeekers.forEach((seeker, index) => {
    db.run(
      'INSERT INTO users (username, email, password_hash, user_type) VALUES (?, ?, ?, ?)',
      [seeker.username, seeker.email, seeker.password_hash, seeker.user_type],
      function(err) {
        if (err) {
          console.error('Error inserting user:', err);
        } else {
          const userId = this.lastID;
          db.run(
            'INSERT INTO job_seeker_profiles (user_id, first_name, last_name, about_me, special_needs, disability_type) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, seeker.first_name, seeker.last_name, seeker.about_me, seeker.special_needs, seeker.disability_type],
            function(err) {
              if (err) {
                console.error('Error inserting profile:', err);
              }
              completed++;
              if (completed === total) {
                console.log('Sample data inserted successfully');
                db.close();
              }
            }
          );
        }
      }
    );
  });

  sampleEmployers.forEach((employer, index) => {
    db.run(
      'INSERT INTO users (username, email, password_hash, user_type) VALUES (?, ?, ?, ?)',
      [employer.username, employer.email, employer.password_hash, employer.user_type],
      function(err) {
        if (err) {
          console.error('Error inserting user:', err);
        } else {
          const userId = this.lastID;
          db.run(
            'INSERT INTO employer_profiles (user_id, company_name, company_description, contact_person, phone, website) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, employer.company_name, employer.company_description, employer.contact_person, employer.phone, employer.website],
            function(err) {
              if (err) {
                console.error('Error inserting profile:', err);
              }
              completed++;
              if (completed === total) {
                console.log('Sample data inserted successfully');
                db.close();
              }
            }
          );
        }
      }
    );
  });
}

console.log('Database initialization script completed'); 