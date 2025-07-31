const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/job_platform.db');
const db = new sqlite3.Database(dbPath);

console.log('Updating database schema...');

// Add new columns to job_postings table if they don't exist
db.serialize(() => {
  // Add requirements column
  db.run("ALTER TABLE job_postings ADD COLUMN requirements TEXT", (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding requirements column:', err.message);
    } else {
      console.log('Requirements column added or already exists');
    }
  });

  // Add company_name column
  db.run("ALTER TABLE job_postings ADD COLUMN company_name TEXT", (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding company_name column:', err.message);
    } else {
      console.log('Company name column added or already exists');
    }
  });

  // Add status column
  db.run("ALTER TABLE job_postings ADD COLUMN status TEXT DEFAULT 'active'", (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding status column:', err.message);
    } else {
      console.log('Status column added or already exists');
    }
  });

  // Add applications_count column
  db.run("ALTER TABLE job_postings ADD COLUMN applications_count INTEGER DEFAULT 0", (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding applications_count column:', err.message);
    } else {
      console.log('Applications count column added or already exists');
    }
  });

  // Update existing job postings to have status 'active' if they don't have it
  db.run("UPDATE job_postings SET status = 'active' WHERE status IS NULL", (err) => {
    if (err) {
      console.error('Error updating existing job postings:', err.message);
    } else {
      console.log('Updated existing job postings with active status');
    }
  });

  // Update existing job postings to have applications_count = 0 if they don't have it
  db.run("UPDATE job_postings SET applications_count = 0 WHERE applications_count IS NULL", (err) => {
    if (err) {
      console.error('Error updating applications count:', err.message);
    } else {
      console.log('Updated existing job postings with applications count');
    }
  });

  // Close database after all operations
  setTimeout(() => {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database updated successfully!');
      }
    });
  }, 1000);
}); 