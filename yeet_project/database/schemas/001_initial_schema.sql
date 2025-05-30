-- YEET BY YETHIKRISHNA R - INITIAL DATABASE SCHEMA
-- Creative Community Platform Database Structure

-- =============================================================================
-- EXTENSIONS AND ENUMS
-- =============================================================================

-- Enable necessary PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Creative Circles Tier Enumeration
CREATE TYPE creative_circle AS ENUM (
    'beginner',    -- Level 1: Green - Basic access
    'apprentice',  -- Level 2: Blue - Enhanced access
    'artist',      -- Level 3: Coral - Advanced access
    'master',      -- Level 4: Gold - Premium access
    'virtuoso',    -- Level 5: Teal - Elite access
    'creator'      -- Level 6: Silver - Maximum access
);

-- User Status Enumeration
CREATE TYPE user_status AS ENUM (
    'pending_verification',
    'active',
    'suspended',
    'deactivated'
);

-- Portfolio Item Types
CREATE TYPE portfolio_type AS ENUM (
    'music',
    'writing',
    'visual_art',
    'performance',
    'collaboration',
    'other'
);

-- Challenge Status
CREATE TYPE challenge_status AS ENUM (
    'draft',
    'active',
    'completed',
    'archived'
);

-- =============================================================================
-- CORE USER MANAGEMENT
-- =============================================================================

-- Users table with Creative Circles integration
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    display_name VARCHAR(100),
    bio TEXT,
    
    -- Creative Circles System
    creative_circle creative_circle DEFAULT 'beginner',
    circle_points INTEGER DEFAULT 0,
    
    -- Profile Information
    avatar_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    social_links JSONB DEFAULT '{}',
    artistic_disciplines TEXT[],
    
    -- Status and Verification
    status user_status DEFAULT 'pending_verification',
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    email_verification_expires TIMESTAMP,
    
    -- Security
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    
    -- Newsletter and Communication
    newsletter_subscribed BOOLEAN DEFAULT TRUE,
    newsletter_token VARCHAR(255) UNIQUE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    login_count INTEGER DEFAULT 0
);

-- User Sessions for terminal interface
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    terminal_session_id VARCHAR(255),
    user_agent TEXT,
    ip_address INET,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- CREATIVE CIRCLES SYSTEM
-- =============================================================================

-- Creative Circles Configuration
CREATE TABLE creative_circles_config (
    circle creative_circle PRIMARY KEY,
    display_name VARCHAR(50) NOT NULL,
    color_code VARCHAR(7) NOT NULL,
    min_points INTEGER NOT NULL,
    max_points INTEGER,
    features JSONB DEFAULT '{}',
    permissions JSONB DEFAULT '{}',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Creative Circles Configuration
INSERT INTO creative_circles_config (circle, display_name, color_code, min_points, max_points, features, permissions, description) VALUES
('beginner', 'Beginner', '#90EE90', 0, 99, 
 '{"portfolio_limit": 5, "challenge_participation": true, "basic_collaboration": true}',
 '{"can_create_challenges": false, "can_mentor": false, "can_access_premium": false}',
 'Welcome to your creative journey! Explore basic features and start building your portfolio.'),
('apprentice', 'Apprentice', '#87CEEB', 100, 299,
 '{"portfolio_limit": 15, "advanced_challenges": true, "community_forums": true}',
 '{"can_create_challenges": false, "can_mentor": false, "can_access_premium": false}',
 'Growing artist with access to enhanced features and community participation.'),
('artist', 'Artist', '#FF7F7F', 300, 699,
 '{"portfolio_limit": 50, "collaboration_tools": true, "advanced_portfolio": true}',
 '{"can_create_challenges": true, "can_mentor": false, "can_access_premium": true}',
 'Established artist with collaboration tools and advanced creative features.'),
('master', 'Master', '#FFD700', 700, 1499,
 '{"portfolio_unlimited": true, "mentorship_opportunities": true, "premium_resources": true}',
 '{"can_create_challenges": true, "can_mentor": true, "can_access_premium": true}',
 'Master artist with mentorship capabilities and premium resource access.'),
('virtuoso', 'Virtuoso', '#40E0D0', 1500, 2999,
 '{"exclusive_content": true, "masterclass_access": true, "featured_showcase": true}',
 '{"can_create_challenges": true, "can_mentor": true, "can_access_premium": true, "can_host_events": true}',
 'Elite artist with exclusive content access and event hosting capabilities.'),
('creator', 'Creator', '#C0C0C0', 3000, null,
 '{"platform_access": true, "founder_communication": true, "platform_input": true}',
 '{"can_create_challenges": true, "can_mentor": true, "can_access_premium": true, "can_host_events": true, "can_moderate": true}',
 'Platform creator with full access and direct founder communication privileges.');

-- User Circle Progress Tracking
CREATE TABLE circle_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    points_earned INTEGER NOT NULL,
    activity_type VARCHAR(100) NOT NULL,
    activity_description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- PORTFOLIO SYSTEM
-- =============================================================================

-- Portfolio Items
CREATE TABLE portfolio_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    portfolio_type portfolio_type NOT NULL,
    
    -- Media and Content
    media_urls JSONB DEFAULT '[]',
    content_text TEXT,
    tags TEXT[],
    
    -- Visibility and Sharing
    is_public BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,
    featured_order INTEGER,
    
    -- Collaboration
    collaborators UUID[],
    collaboration_details JSONB DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0
);

-- Portfolio Views and Interactions
CREATE TABLE portfolio_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_item_id UUID REFERENCES portfolio_items(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    interaction_type VARCHAR(50) NOT NULL, -- 'view', 'like', 'share', 'comment'
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- CHALLENGE SYSTEM
-- =============================================================================

-- Creative Challenges
CREATE TABLE challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    challenge_type VARCHAR(100) NOT NULL, -- 'harmonic', 'literary', 'fusion', 'precision'
    
    -- Challenge Configuration
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    max_participants INTEGER,
    min_circle_level creative_circle DEFAULT 'beginner',
    
    -- Rewards and Recognition
    rewards JSONB DEFAULT '{}',
    prize_pool DECIMAL(10,2),
    
    -- Status and Visibility
    status challenge_status DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    participant_count INTEGER DEFAULT 0
);

-- Challenge Submissions
CREATE TABLE challenge_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    portfolio_item_id UUID REFERENCES portfolio_items(id),
    
    -- Submission Details
    submission_text TEXT,
    submission_media JSONB DEFAULT '[]',
    
    -- Judging and Results
    score DECIMAL(5,2),
    judge_feedback TEXT,
    rank INTEGER,
    
    -- Status
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    judged_at TIMESTAMP,
    
    UNIQUE(challenge_id, user_id) -- One submission per user per challenge
);

-- =============================================================================
-- NEWSLETTER AND COMMUNICATION
-- =============================================================================

-- Newsletter Subscribers (can include non-users)
CREATE TABLE newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Subscription Details
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP,
    subscription_token VARCHAR(255) UNIQUE NOT NULL,
    
    -- Preferences
    preferences JSONB DEFAULT '{}',
    source VARCHAR(100), -- 'website', 'social_media', 'referral'
    
    -- Analytics
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    last_opened TIMESTAMP
);

-- Newsletter Campaigns
CREATE TABLE newsletter_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content_html TEXT NOT NULL,
    content_text TEXT,
    
    -- Scheduling and Status
    scheduled_at TIMESTAMP,
    sent_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'sent'
    
    -- Analytics
    sent_count INTEGER DEFAULT 0,
    open_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

-- =============================================================================
-- COLLABORATION SYSTEM
-- =============================================================================

-- Collaboration Projects
CREATE TABLE collaborations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    project_type VARCHAR(100), -- 'music', 'writing', 'mixed_media'
    
    -- Participants
    creator_id UUID REFERENCES users(id) NOT NULL,
    participants UUID[],
    invited_users UUID[],
    
    -- Project Status
    status VARCHAR(50) DEFAULT 'planning', -- 'planning', 'active', 'completed', 'archived'
    privacy_level VARCHAR(50) DEFAULT 'private', -- 'private', 'circle_only', 'public'
    
    -- Resources
    workspace_data JSONB DEFAULT '{}',
    shared_files JSONB DEFAULT '[]',
    
    -- Timeline
    start_date TIMESTAMP,
    target_completion TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- TERMINAL INTERFACE SYSTEM
-- =============================================================================

-- Terminal Command History
CREATE TABLE terminal_commands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255),
    command VARCHAR(500) NOT NULL,
    output TEXT,
    success BOOLEAN DEFAULT TRUE,
    execution_time INTEGER, -- milliseconds
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Terminal Achievements and Easter Eggs
CREATE TABLE terminal_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_code VARCHAR(100) NOT NULL,
    achievement_name VARCHAR(255) NOT NULL,
    description TEXT,
    points_awarded INTEGER DEFAULT 0,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, achievement_code)
);

-- =============================================================================
-- SYSTEM LOGS AND ANALYTICS
-- =============================================================================

-- Platform Activity Logs
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    activity_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100), -- 'user', 'portfolio', 'challenge', 'collaboration'
    entity_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_creative_circle ON users(creative_circle);
CREATE INDEX idx_users_newsletter_token ON users(newsletter_token);

-- Session indexes
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

-- Portfolio indexes
CREATE INDEX idx_portfolio_items_user_id ON portfolio_items(user_id);
CREATE INDEX idx_portfolio_items_type ON portfolio_items(portfolio_type);
CREATE INDEX idx_portfolio_items_public ON portfolio_items(is_public);
CREATE INDEX idx_portfolio_items_featured ON portfolio_items(featured, featured_order);

-- Challenge indexes
CREATE INDEX idx_challenges_status ON challenges(status);
CREATE INDEX idx_challenges_dates ON challenges(start_date, end_date);
CREATE INDEX idx_challenge_submissions_challenge ON challenge_submissions(challenge_id);
CREATE INDEX idx_challenge_submissions_user ON challenge_submissions(user_id);

-- Newsletter indexes
CREATE INDEX idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_subscribers_token ON newsletter_subscribers(subscription_token);

-- Analytics indexes
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_type ON activity_logs(activity_type);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- =============================================================================
-- FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_portfolio_items_updated_at BEFORE UPDATE ON portfolio_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON challenges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_collaborations_updated_at BEFORE UPDATE ON collaborations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically promote users based on points
CREATE OR REPLACE FUNCTION check_circle_promotion()
RETURNS TRIGGER AS $$
DECLARE
    new_circle creative_circle;
BEGIN
    -- Calculate new circle based on total points
    SELECT circle INTO new_circle
    FROM creative_circles_config
    WHERE NEW.circle_points >= min_points 
    AND (max_points IS NULL OR NEW.circle_points <= max_points)
    ORDER BY min_points DESC
    LIMIT 1;
    
    -- Update user's circle if it has changed
    IF new_circle IS NOT NULL AND new_circle != NEW.creative_circle THEN
        NEW.creative_circle = new_circle;
        
        -- Log the promotion
        INSERT INTO activity_logs (user_id, activity_type, details)
        VALUES (NEW.id, 'circle_promotion', 
                jsonb_build_object('old_circle', OLD.creative_circle, 'new_circle', new_circle, 'points', NEW.circle_points));
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic circle promotion
CREATE TRIGGER check_user_circle_promotion BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION check_circle_promotion();

-- =============================================================================
-- INITIAL DATA SEEDING
-- =============================================================================

-- Create default admin user (Yethikrishna R)
INSERT INTO users (
    email, username, password_hash, first_name, last_name, display_name,
    bio, creative_circle, circle_points, status, email_verified,
    artistic_disciplines, social_links
) VALUES (
    'yethikrishna@yeetplatform.com',
    'yethikrishnar',
    '$2b$12$placeholder_hash_will_be_updated', -- Will be updated with actual hash
    'Yethikrishna',
    'R',
    'Yethikrishna R',
    'Multi-disciplinary artist: Carnatic vocalist, athletic shooter, and author of "The Quantum Lotus". Student by birth, singer by life.',
    'creator',
    5000,
    'active',
    true,
    ARRAY['carnatic_music', 'vocals', 'shooting_sports', 'writing', 'literature'],
    '{"instagram": "@yethikrishnar", "latest_song": "Aanchal"}'
);

-- Create sample terminal achievements
INSERT INTO terminal_achievements (user_id, achievement_code, achievement_name, description, points_awarded)
SELECT 
    id as user_id,
    'first_login' as achievement_code,
    'Welcome to Yeet!' as achievement_name,
    'Successfully logged into the platform for the first time' as description,
    10 as points_awarded
FROM users WHERE username = 'yethikrishnar';

-- =============================================================================
-- SCHEMA VALIDATION AND COMMENTS
-- =============================================================================

-- Add table comments for documentation
COMMENT ON TABLE users IS 'Main user accounts with Creative Circles progression system';
COMMENT ON TABLE creative_circles_config IS 'Configuration for the 6-tier Creative Circles access system';
COMMENT ON TABLE portfolio_items IS 'User portfolio items for showcasing artistic work';
COMMENT ON TABLE challenges IS 'Creative challenges and competitions for community engagement';
COMMENT ON TABLE newsletter_subscribers IS 'Newsletter subscription management for community building';
COMMENT ON TABLE collaborations IS 'Real-time collaboration projects between users';
COMMENT ON TABLE terminal_commands IS 'Terminal interface command history and analytics';

-- Schema version tracking
CREATE TABLE schema_version (
    version VARCHAR(20) PRIMARY KEY,
    description TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO schema_version (version, description) VALUES 
('001', 'Initial schema with Creative Circles system, portfolio management, and terminal interface support');
