-- Create an ENUM for status to keep data clean
CREATE TYPE applicant_status AS ENUM (
    'WAITLISTED', 
    'ACTIVE', 
    'HIRED', 
    'REJECTED', 
    'DECAYED'
);

-- 1. Jobs Table (Requirement #1)
CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    active_capacity INTEGER DEFAULT 5,
    decay_window_hours INTEGER DEFAULT 24,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Applicants Table (Requirement #2, #4, #7)
CREATE TABLE applicants (
    id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    status applicant_status DEFAULT 'WAITLISTED',
    queue_position INTEGER, -- Null if status is ACTIVE/HIRED/REJECTED
    promoted_at TIMESTAMP,   -- Used for Inactivity Decay (Req #7)
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Audit Logs Table (Requirement #6)
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    applicant_id INTEGER REFERENCES applicants(id) ON DELETE CASCADE,
    previous_status applicant_status,
    new_status applicant_status,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);