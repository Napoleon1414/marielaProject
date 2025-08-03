-- Database schema for Mariela's Job Matching Platform
-- SQLite version for easy development

-- Users table (for both job seekers and employers)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    user_type TEXT NOT NULL CHECK (user_type IN ('jobseeker', 'employer')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Job seekers profile
CREATE TABLE IF NOT EXISTS job_seeker_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    about_me TEXT,
    special_needs TEXT,
    disability_type TEXT,
    custom_disability TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Skills table
CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    category TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Job seeker skills (many-to-many relationship)
CREATE TABLE IF NOT EXISTS job_seeker_skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_seeker_id INTEGER NOT NULL,
    skill_id INTEGER NOT NULL,
    proficiency_level INTEGER CHECK (proficiency_level BETWEEN 1 AND 5),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_seeker_id) REFERENCES job_seeker_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    UNIQUE(job_seeker_id, skill_id)
);

-- Employers profile
CREATE TABLE IF NOT EXISTS employer_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    company_name TEXT NOT NULL,
    company_description TEXT,
    contact_person TEXT,
    phone TEXT,
    website TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Job postings
CREATE TABLE IF NOT EXISTS job_postings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employer_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    location TEXT,
    job_type TEXT, -- full-time, part-time, remote, etc.
    salary_range TEXT,
    company_name TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'draft')),
    applications_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employer_id) REFERENCES employer_profiles(id) ON DELETE CASCADE
);

-- Saved candidates (for employers)
CREATE TABLE IF NOT EXISTS saved_candidates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employer_id INTEGER NOT NULL,
    job_seeker_id INTEGER NOT NULL,
    notes TEXT,
    match_score INTEGER,
    saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employer_id) REFERENCES employer_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (job_seeker_id) REFERENCES job_seeker_profiles(id) ON DELETE CASCADE,
    UNIQUE(employer_id, job_seeker_id)
);

-- Job applications
CREATE TABLE IF NOT EXISTS job_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_posting_id INTEGER NOT NULL,
    job_seeker_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
    cover_letter TEXT,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_posting_id) REFERENCES job_postings(id) ON DELETE CASCADE,
    FOREIGN KEY (job_seeker_id) REFERENCES job_seeker_profiles(id) ON DELETE CASCADE,
    UNIQUE(job_posting_id, job_seeker_id)
);

-- Messages between employers and job seekers
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0, -- SQLite boolean as integer
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default skills
INSERT OR IGNORE INTO skills (name, category) VALUES
('Comunicación', 'Soft Skills'),
('Resolución de Problemas', 'Soft Skills'),
('Trabajo en Equipo', 'Soft Skills'),
('Liderazgo', 'Soft Skills'),
('Creatividad', 'Soft Skills'),
('Adaptabilidad', 'Soft Skills'),
('Gestión del Tiempo', 'Soft Skills'),
('Pensamiento Crítico', 'Soft Skills'),
('Organización', 'Soft Skills'),
('Habilidades Técnicas', 'Técnico'),
('Inteligencia Emocional', 'Soft Skills'),
('Oratoria', 'Comunicación'),
('Gestión de Proyectos', 'Gestión'),
('Pensamiento Analítico', 'Soft Skills'),
('Atención al Cliente', 'Servicio'),
('Investigación', 'Técnico'),
('Análisis de Datos', 'Técnico'),
('Redacción', 'Comunicación'),
('Negociación', 'Negocios'),
('Toma de Decisiones', 'Soft Skills'),
('Resolución de Conflictos', 'Soft Skills'),
('Innovación', 'Soft Skills'),
('Planificación Estratégica', 'Gestión'),
('Gestión de Recursos', 'Gestión'),
('Control de Calidad', 'Técnico'),
('Gestión de Riesgos', 'Gestión'),
('Presupuestación', 'Finanzas'),
('Capacitación', 'Educación'),
('Mentoría', 'Educación'),
('Networking', 'Negocios'),
('Ventas', 'Negocios'),
('Marketing', 'Negocios'),
('Planificación de Eventos', 'Gestión'),
('Documentación', 'Técnico'),
('Multitarea', 'Soft Skills');

-- Eliminar habilidades en inglés (solo dejar en español)
DELETE FROM skills WHERE name IN (
  'Adaptability', 'Analytical Thinking', 'Budgeting', 'Communication', 'Conflict Resolution', 'Creativity', 'Critical Thinking', 'Customer Service', 'Data Analysis', 'Decision Making', 'Documentation', 'Emotional Intelligence', 'Event Planning', 'Innovation', 'Leadership', 'Marketing', 'Mentoring', 'Multitasking', 'Negotiation', 'Networking', 'Organization', 'Problem Solving', 'Project Management', 'Public Speaking', 'Quality Control', 'Research', 'Resource Management', 'Risk Management', 'Sales', 'Strategic Planning', 'Teamwork', 'Technical Skills', 'Time Management', 'Training', 'Writing'
);

-- Insert default users for testing
INSERT OR IGNORE INTO users (username, email, password_hash, user_type) VALUES
('admin', 'admin@example.com', '$2b$10$example_hash_for_admin', 'jobseeker'),
('admin2', 'admin2@example.com', '$2b$10$example_hash_for_admin2', 'employer');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_job_seeker_profiles_user_id ON job_seeker_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_employer_profiles_user_id ON employer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_job_seeker_skills_job_seeker_id ON job_seeker_skills(job_seeker_id);
CREATE INDEX IF NOT EXISTS idx_job_seeker_skills_skill_id ON job_seeker_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_employer_id ON job_postings(employer_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings(status);
CREATE INDEX IF NOT EXISTS idx_saved_candidates_employer_id ON saved_candidates(employer_id);
CREATE INDEX IF NOT EXISTS idx_saved_candidates_job_seeker_id ON saved_candidates(job_seeker_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_posting_id ON job_applications(job_posting_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_seeker_id ON job_applications(job_seeker_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id); 