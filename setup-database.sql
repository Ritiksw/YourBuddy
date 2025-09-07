-- Buddy App Database Setup Script
-- Run this script to create all necessary tables

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS goal_tags CASCADE;
DROP TABLE IF EXISTS check_ins CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS buddy_relationships CASCADE;
DROP TABLE IF EXISTS user_devices CASCADE;
DROP TABLE IF EXISTS goals CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create Users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Goals table
CREATE TABLE goals (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(20) NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'HABIT',
    difficulty VARCHAR(20) DEFAULT 'MEDIUM',
    status VARCHAR(20) DEFAULT 'ACTIVE',
    start_date DATE NOT NULL,
    target_date DATE NOT NULL,
    target_value INTEGER,
    target_unit VARCHAR(50),
    current_progress INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT true,
    max_buddies INTEGER DEFAULT 1,
    requires_location BOOLEAN DEFAULT false,
    location VARCHAR(255),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Create Goal Tags table
CREATE TABLE goal_tags (
    goal_id BIGINT NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL,
    PRIMARY KEY (goal_id, tag)
);

-- Create Buddy Relationships table
CREATE TABLE buddy_relationships (
    id BIGSERIAL PRIMARY KEY,
    requester_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    buddy_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_id BIGINT REFERENCES goals(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(requester_id, buddy_id, goal_id)
);

-- Create Chat Messages table
CREATE TABLE chat_messages (
    id BIGSERIAL PRIMARY KEY,
    sender_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_id BIGINT REFERENCES goals(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'TEXT',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Check-ins table
CREATE TABLE check_ins (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_id BIGINT NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
    progress_value INTEGER NOT NULL,
    notes TEXT,
    mood VARCHAR(20),
    location VARCHAR(255),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    check_in_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create User Devices table for push notifications
CREATE TABLE user_devices (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_token VARCHAR(500) NOT NULL,
    device_type VARCHAR(20) NOT NULL,
    device_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, device_token)
);

-- Create indexes for better performance
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_category ON goals(category);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_goals_start_date ON goals(start_date);
CREATE INDEX idx_goals_target_date ON goals(target_date);
CREATE INDEX idx_goals_is_public ON goals(is_public);

CREATE INDEX idx_buddy_relationships_requester ON buddy_relationships(requester_id);
CREATE INDEX idx_buddy_relationships_buddy ON buddy_relationships(buddy_id);
CREATE INDEX idx_buddy_relationships_goal ON buddy_relationships(goal_id);
CREATE INDEX idx_buddy_relationships_status ON buddy_relationships(status);

CREATE INDEX idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_receiver ON chat_messages(receiver_id);
CREATE INDEX idx_chat_messages_goal ON chat_messages(goal_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

CREATE INDEX idx_check_ins_user_id ON check_ins(user_id);
CREATE INDEX idx_check_ins_goal_id ON check_ins(goal_id);
CREATE INDEX idx_check_ins_date ON check_ins(check_in_date);

CREATE INDEX idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX idx_user_devices_token ON user_devices(device_token);

-- Insert default test user
INSERT INTO users (username, email, password, first_name, last_name, role, enabled) 
VALUES (
    'testuser', 
    'test@buddy.com', 
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', -- password123
    'Test', 
    'User', 
    'USER', 
    true
);

-- Add sample goals for testing
INSERT INTO goals (user_id, title, description, category, type, difficulty, start_date, target_date, target_value, target_unit, current_progress, is_public, max_buddies)
VALUES 
(
    (SELECT id FROM users WHERE username = 'testuser'),
    'Daily Morning Run',
    'Run 5km every morning to build endurance and start the day with energy',
    'FITNESS',
    'HABIT',
    'MEDIUM',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '60 days',
    60,
    'days',
    15,
    true,
    3
),
(
    (SELECT id FROM users WHERE username = 'testuser'),
    'Learn Spanish',
    'Complete Spanish language course and practice conversation daily',
    'EDUCATION',
    'LEARNING',
    'HARD',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '90 days',
    100,
    'lessons',
    25,
    true,
    2
),
(
    (SELECT id FROM users WHERE username = 'testuser'),
    'Read 12 Books This Year',
    'Read one book per month to expand knowledge and improve focus',
    'HOBBY',
    'CHALLENGE',
    'EASY',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '365 days',
    12,
    'books',
    3,
    true,
    5
);

-- Verify the setup
SELECT 'Database setup completed successfully!' as message;
SELECT 'Users created:' as info, COUNT(*) as count FROM users;
SELECT 'Goals created:' as info, COUNT(*) as count FROM goals;

-- Show sample data
SELECT 'Sample user data:' as info;
SELECT id, username, email, first_name, last_name FROM users LIMIT 5;

SELECT 'Sample goal data:' as info;  
SELECT id, title, category, difficulty, status, current_progress, start_date, target_date FROM goals LIMIT 5; 