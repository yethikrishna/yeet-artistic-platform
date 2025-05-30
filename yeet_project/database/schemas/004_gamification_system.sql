-- YEET BY YETHIKRISHNA R - GAMIFICATION SYSTEM SCHEMA
-- ART KEYS, real-time elements, easter eggs, and progressive engagement rewards

-- =============================================================================
-- ART KEYS SYSTEM TABLES
-- =============================================================================

-- User's unlocked ART KEYS
CREATE TABLE IF NOT EXISTS user_art_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    key_id VARCHAR(100) NOT NULL,
    
    -- Unlock Details
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress_data JSONB DEFAULT '{}',
    
    -- Usage Tracking
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP,
    
    -- Personalization
    personalizations JSONB DEFAULT '{}',
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    unlock_method VARCHAR(50), -- 'automatic', 'manual_grant', 'special_event'
    cultural_notes TEXT,
    personal_significance TEXT,
    
    -- Constraints
    UNIQUE(user_id, key_id),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ART KEY progress tracking
CREATE TABLE IF NOT EXISTS art_key_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    key_id VARCHAR(100) NOT NULL,
    
    -- Progress Details
    required_action VARCHAR(100) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completion_data JSONB DEFAULT '{}',
    completed_at TIMESTAMP,
    
    -- Progress Tracking
    attempts INTEGER DEFAULT 0,
    best_score DECIMAL(10,2),
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, key_id, required_action)
);

-- ART KEY collections and themes
CREATE TABLE IF NOT EXISTS art_key_collections (
    collection_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    theme VARCHAR(100),
    
    -- Collection Properties
    key_ids TEXT[] NOT NULL,
    completion_reward JSONB DEFAULT '{}',
    cultural_context TEXT,
    
    -- Availability
    is_active BOOLEAN DEFAULT TRUE,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    
    -- Requirements
    required_circle creative_circle,
    prerequisites TEXT[] DEFAULT '{}',
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- REAL-TIME ELEMENTS TABLES
-- =============================================================================

-- Countdown timers for events and challenges
CREATE TABLE IF NOT EXISTS countdown_timers (
    timer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Timer Configuration
    target_date TIMESTAMP NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('challenge', 'event', 'release', 'seasonal', 'collaboration')),
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Display Properties
    display_format VARCHAR(50) DEFAULT 'dhms', -- days, hours, minutes, seconds
    theme VARCHAR(100),
    icon VARCHAR(20),
    color_scheme VARCHAR(50),
    
    -- Rewards and Incentives
    rewards JSONB DEFAULT '{}',
    participation_requirements JSONB DEFAULT '{}',
    
    -- Cultural Context
    cultural_significance TEXT,
    traditional_references TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Real-time platform status indicators
CREATE TABLE IF NOT EXISTS realtime_status (
    status_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(50) NOT NULL CHECK (category IN ('user_activity', 'platform_stats', 'community_pulse', 'artistic_flow')),
    
    -- Status Data
    status_key VARCHAR(100) NOT NULL,
    value JSONB NOT NULL,
    display_text TEXT NOT NULL,
    
    -- Display Properties
    priority INTEGER DEFAULT 0,
    color VARCHAR(20),
    icon VARCHAR(20),
    animation VARCHAR(50),
    
    -- Lifecycle
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP,
    refresh_interval INTEGER DEFAULT 60, -- seconds
    
    -- Metadata
    source VARCHAR(100), -- where this status comes from
    last_calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    calculation_method TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(category, status_key)
);

-- User participation in countdown events
CREATE TABLE IF NOT EXISTS timer_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timer_id UUID REFERENCES countdown_timers(timer_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Participation Details
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    participation_type VARCHAR(50) DEFAULT 'participant', -- 'participant', 'organizer', 'judge'
    
    -- Progress Tracking
    submission_data JSONB DEFAULT '{}',
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    completion_status VARCHAR(50) DEFAULT 'in_progress',
    
    -- Rewards Earned
    points_earned INTEGER DEFAULT 0,
    rewards_received JSONB DEFAULT '{}',
    
    -- Social Features
    team_id UUID,
    collaboration_partners UUID[],
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    UNIQUE(timer_id, user_id)
);

-- =============================================================================
-- EASTER EGGS SYSTEM
-- =============================================================================

-- Available easter eggs
CREATE TABLE IF NOT EXISTS easter_eggs (
    egg_id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Trigger Configuration
    trigger_method VARCHAR(50) NOT NULL CHECK (trigger_method IN ('konami_code', 'text_sequence', 'click_pattern', 'time_based', 'quantum_alignment')),
    trigger_data JSONB NOT NULL,
    
    -- Reward Configuration
    reward_points INTEGER DEFAULT 0,
    special_content TEXT,
    art_key_progress VARCHAR(100),
    secret_message TEXT,
    
    -- Cultural and Educational Context
    cultural_reference TEXT,
    discovery_hint TEXT,
    educational_value TEXT,
    
    -- Availability
    is_active BOOLEAN DEFAULT TRUE,
    discovery_count INTEGER DEFAULT 0,
    max_discoveries INTEGER, -- null = unlimited
    
    -- Seasonal/Event Based
    active_from TIMESTAMP,
    active_until TIMESTAMP,
    
    -- Difficulty and Rarity
    difficulty_level VARCHAR(20) DEFAULT 'medium',
    rarity VARCHAR(20) DEFAULT 'common',
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User's discovered easter eggs
CREATE TABLE IF NOT EXISTS user_easter_eggs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    egg_id VARCHAR(100) REFERENCES easter_eggs(egg_id) ON DELETE CASCADE,
    
    -- Discovery Details
    discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    trigger_data JSONB,
    discovery_context JSONB DEFAULT '{}',
    
    -- Location and Method
    discovered_on_page VARCHAR(255),
    user_agent TEXT,
    ip_address INET,
    
    -- Social Sharing
    shared_discovery BOOLEAN DEFAULT FALSE,
    discovery_story TEXT,
    
    -- Verification
    verified BOOLEAN DEFAULT TRUE,
    verification_data JSONB,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    UNIQUE(user_id, egg_id)
);

-- Easter egg discovery leaderboard
CREATE TABLE IF NOT EXISTS easter_egg_leaderboard (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Discovery Stats
    total_discovered INTEGER DEFAULT 0,
    rare_discoveries INTEGER DEFAULT 0,
    first_discoveries INTEGER DEFAULT 0, -- eggs they discovered first
    
    -- Timing Stats
    fastest_discovery_time INTEGER, -- seconds
    discovery_streak INTEGER DEFAULT 0,
    last_discovery_at TIMESTAMP,
    
    -- Community Recognition
    discovery_rank INTEGER,
    explorer_level VARCHAR(50) DEFAULT 'novice',
    special_titles TEXT[] DEFAULT '{}',
    
    -- Metadata
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- ACHIEVEMENTS SYSTEM
-- =============================================================================

-- Available achievements
CREATE TABLE IF NOT EXISTS achievements (
    achievement_id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Classification
    category VARCHAR(50) NOT NULL CHECK (category IN ('creation', 'collaboration', 'learning', 'community', 'mastery', 'exploration')),
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
    
    -- Requirements
    requirements JSONB NOT NULL,
    prerequisites TEXT[] DEFAULT '{}',
    progress_steps TEXT[] DEFAULT '{}',
    
    -- Rewards
    points INTEGER DEFAULT 0,
    circle_advancement creative_circle,
    special_abilities TEXT[] DEFAULT '{}',
    premium_access TEXT[] DEFAULT '{}',
    cosmetics TEXT[] DEFAULT '{}',
    
    -- Cultural Context
    cultural_context TEXT,
    icon VARCHAR(20),
    badge_design JSONB,
    
    -- Availability
    is_active BOOLEAN DEFAULT TRUE,
    is_secret BOOLEAN DEFAULT FALSE,
    earn_count INTEGER DEFAULT 0,
    
    -- Seasonal/Limited
    available_from TIMESTAMP,
    available_until TIMESTAMP,
    max_earners INTEGER, -- null = unlimited
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User's earned achievements
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id VARCHAR(100) REFERENCES achievements(achievement_id) ON DELETE CASCADE,
    
    -- Achievement Details
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress_data JSONB DEFAULT '{}',
    completion_method VARCHAR(100),
    
    -- Recognition
    is_featured BOOLEAN DEFAULT FALSE,
    public_display BOOLEAN DEFAULT TRUE,
    personal_notes TEXT,
    
    -- Social Features
    shared_publicly BOOLEAN DEFAULT FALSE,
    celebration_data JSONB DEFAULT '{}',
    
    -- Verification
    verified BOOLEAN DEFAULT TRUE,
    verification_data JSONB,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    UNIQUE(user_id, achievement_id)
);

-- Achievement progress tracking
CREATE TABLE IF NOT EXISTS achievement_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id VARCHAR(100) REFERENCES achievements(achievement_id) ON DELETE CASCADE,
    
    -- Progress Details
    requirement_key VARCHAR(100) NOT NULL,
    current_progress INTEGER DEFAULT 0,
    required_progress INTEGER NOT NULL,
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Tracking
    last_progress_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    milestones_reached TEXT[] DEFAULT '{}',
    
    -- Metadata
    progress_data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, achievement_id, requirement_key)
);

-- =============================================================================
-- GAMIFICATION ANALYTICS AND INSIGHTS
-- =============================================================================

-- User engagement metrics
CREATE TABLE IF NOT EXISTS user_engagement_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Time-based Metrics
    metric_date DATE NOT NULL,
    session_count INTEGER DEFAULT 0,
    total_session_time INTEGER DEFAULT 0, -- seconds
    
    -- Activity Metrics
    actions_performed INTEGER DEFAULT 0,
    features_used TEXT[] DEFAULT '{}',
    pages_visited TEXT[] DEFAULT '{}',
    
    -- Gamification Engagement
    art_keys_progress INTEGER DEFAULT 0,
    achievements_earned INTEGER DEFAULT 0,
    easter_eggs_found INTEGER DEFAULT 0,
    challenges_participated INTEGER DEFAULT 0,
    
    -- Social Engagement
    collaborations_initiated INTEGER DEFAULT 0,
    community_interactions INTEGER DEFAULT 0,
    mentoring_sessions INTEGER DEFAULT 0,
    
    -- Creative Output
    portfolio_uploads INTEGER DEFAULT 0,
    creative_expressions INTEGER DEFAULT 0,
    cultural_contributions INTEGER DEFAULT 0,
    
    -- Engagement Quality
    depth_score DECIMAL(5,2) DEFAULT 0,
    quality_score DECIMAL(5,2) DEFAULT 0,
    cultural_resonance_score DECIMAL(5,2) DEFAULT 0,
    
    -- Metadata
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, metric_date)
);

-- Gamification effectiveness tracking
CREATE TABLE IF NOT EXISTS gamification_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- System Metrics
    metric_type VARCHAR(50) NOT NULL, -- 'art_keys', 'achievements', 'easter_eggs', 'timers'
    metric_key VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,2) NOT NULL,
    
    -- Context
    time_period VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly'
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    
    -- Segmentation
    user_segment VARCHAR(50), -- 'new_users', 'active_users', 'power_users'
    circle_level creative_circle,
    cultural_background VARCHAR(100),
    
    -- Additional Dimensions
    dimensions JSONB DEFAULT '{}',
    
    -- Metadata
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    calculation_method VARCHAR(100),
    
    UNIQUE(metric_type, metric_key, time_period, period_start, user_segment, circle_level)
);

-- Real-time leaderboards
CREATE TABLE IF NOT EXISTS leaderboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    leaderboard_type VARCHAR(50) NOT NULL, -- 'art_keys', 'achievements', 'creativity', 'collaboration'
    
    -- User Ranking
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rank INTEGER NOT NULL,
    score DECIMAL(15,2) NOT NULL,
    
    -- Time Period
    period_type VARCHAR(20) NOT NULL, -- 'all_time', 'monthly', 'weekly', 'daily'
    period_start TIMESTAMP,
    period_end TIMESTAMP,
    
    -- Additional Metrics
    secondary_score DECIMAL(15,2),
    tertiary_score DECIMAL(15,2),
    achievement_count INTEGER DEFAULT 0,
    
    -- Recognition
    badge VARCHAR(50), -- 'gold', 'silver', 'bronze', 'rising_star'
    special_recognition TEXT,
    
    -- Metadata
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(leaderboard_type, period_type, period_start, user_id)
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- ART KEYS indexes
CREATE INDEX IF NOT EXISTS idx_user_art_keys_user_id ON user_art_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_art_keys_key_id ON user_art_keys(key_id);
CREATE INDEX IF NOT EXISTS idx_user_art_keys_unlocked_at ON user_art_keys(unlocked_at);
CREATE INDEX IF NOT EXISTS idx_art_key_progress_user_id ON art_key_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_art_key_progress_key_id ON art_key_progress(key_id);

-- Real-time elements indexes
CREATE INDEX IF NOT EXISTS idx_countdown_timers_active ON countdown_timers(is_active, target_date);
CREATE INDEX IF NOT EXISTS idx_countdown_timers_type ON countdown_timers(type);
CREATE INDEX IF NOT EXISTS idx_realtime_status_category ON realtime_status(category);
CREATE INDEX IF NOT EXISTS idx_realtime_status_active ON realtime_status(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_timer_participants_timer_user ON timer_participants(timer_id, user_id);

-- Easter eggs indexes
CREATE INDEX IF NOT EXISTS idx_easter_eggs_active ON easter_eggs(is_active);
CREATE INDEX IF NOT EXISTS idx_easter_eggs_trigger_method ON easter_eggs(trigger_method);
CREATE INDEX IF NOT EXISTS idx_user_easter_eggs_user_id ON user_easter_eggs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_easter_eggs_discovered_at ON user_easter_eggs(discovered_at);

-- Achievements indexes
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_difficulty ON achievements(difficulty);
CREATE INDEX IF NOT EXISTS idx_achievements_active ON achievements(is_active);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_earned_at ON user_achievements(earned_at);
CREATE INDEX IF NOT EXISTS idx_achievement_progress_user_id ON achievement_progress(user_id);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_user_engagement_metrics_user_date ON user_engagement_metrics(user_id, metric_date);
CREATE INDEX IF NOT EXISTS idx_gamification_analytics_type_period ON gamification_analytics(metric_type, time_period, period_start);
CREATE INDEX IF NOT EXISTS idx_leaderboards_type_period ON leaderboards(leaderboard_type, period_type, rank);

-- =============================================================================
-- TRIGGERS FOR AUTOMATED GAMIFICATION
-- =============================================================================

-- Function to update user engagement metrics
CREATE OR REPLACE FUNCTION update_engagement_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update daily engagement metrics when user performs activities
    INSERT INTO user_engagement_metrics (user_id, metric_date, actions_performed)
    VALUES (NEW.user_id, CURRENT_DATE, 1)
    ON CONFLICT (user_id, metric_date) 
    DO UPDATE SET 
        actions_performed = user_engagement_metrics.actions_performed + 1,
        calculated_at = CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check ART KEY progress after activities
CREATE OR REPLACE FUNCTION check_art_key_progress()
RETURNS TRIGGER AS $$
DECLARE
    activity_type TEXT;
    user_id_val UUID;
BEGIN
    activity_type := NEW.activity_type;
    user_id_val := NEW.user_id;
    
    -- Update ART KEY progress based on activity
    IF activity_type = 'portfolio_upload' THEN
        UPDATE art_key_progress 
        SET completed = true, completed_at = CURRENT_TIMESTAMP
        WHERE user_id = user_id_val 
          AND required_action = 'upload_music_portfolio'
          AND NOT completed;
    END IF;
    
    IF activity_type = 'artistic_puzzle' AND (NEW.metadata->>'correct')::boolean = true THEN
        UPDATE art_key_progress 
        SET completed = true, completed_at = CURRENT_TIMESTAMP
        WHERE user_id = user_id_val 
          AND required_action = 'complete_carnatic_puzzle'
          AND NOT completed;
    END IF;
    
    -- Add more progress checks as needed
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update leaderboards
CREATE OR REPLACE FUNCTION update_leaderboards()
RETURNS TRIGGER AS $$
BEGIN
    -- Update various leaderboard rankings when points are earned
    -- This is a simplified version - real implementation would be more complex
    
    -- Recalculate monthly creativity leaderboard
    WITH monthly_scores AS (
        SELECT 
            user_id,
            SUM(points_earned) as total_points,
            ROW_NUMBER() OVER (ORDER BY SUM(points_earned) DESC) as rank
        FROM circle_activities 
        WHERE created_at >= date_trunc('month', CURRENT_DATE)
        GROUP BY user_id
    )
    INSERT INTO leaderboards (leaderboard_type, user_id, rank, score, period_type, period_start, period_end)
    SELECT 
        'creativity',
        user_id,
        rank,
        total_points,
        'monthly',
        date_trunc('month', CURRENT_DATE),
        date_trunc('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day'
    FROM monthly_scores
    ON CONFLICT (leaderboard_type, period_type, period_start, user_id)
    DO UPDATE SET 
        rank = EXCLUDED.rank,
        score = EXCLUDED.score,
        last_updated = CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER engagement_metrics_trigger
    AFTER INSERT ON circle_activities
    FOR EACH ROW EXECUTE FUNCTION update_engagement_metrics();

CREATE TRIGGER art_key_progress_trigger
    AFTER INSERT ON circle_activities
    FOR EACH ROW EXECUTE FUNCTION check_art_key_progress();

CREATE TRIGGER leaderboard_update_trigger
    AFTER INSERT ON circle_activities
    FOR EACH ROW EXECUTE FUNCTION update_leaderboards();

-- =============================================================================
-- INITIAL DATA FOR GAMIFICATION SYSTEM
-- =============================================================================

-- Insert easter eggs from the gamification config
INSERT INTO easter_eggs (
    egg_id, name, description, trigger_method, trigger_data,
    reward_points, special_content, art_key_progress, secret_message,
    cultural_reference, discovery_hint, is_active
) VALUES 
(
    'quantum_konami',
    'Quantum Konami Sequence',
    'The classic konami code unlocks quantum consciousness insights',
    'konami_code',
    '{"sequence": "↑↑↓↓←→←→BA"}',
    150,
    'quantum_consciousness_mantra',
    'quantum_observer',
    'The observer collapses the wave function of infinite possibilities into reality',
    'Gaming culture meets quantum philosophy',
    'Some sequences transcend games and enter the realm of consciousness',
    true
),
(
    'carnatic_sa_meditation',
    'Infinite Sa Meditation',
    'Type "Sa Sa Sa Sa Sa" to enter a meditative trance',
    'text_sequence',
    '{"text": "Sa Sa Sa Sa Sa"}',
    100,
    'carnatic_sa_drone',
    'first_note',
    'Sa is the eternal sound, the foundation of all music and creation',
    'Carnatic music fundamental frequency and meditation practice',
    'The foundational note holds infinite power when repeated with devotion',
    true
),
(
    'precision_triple_click',
    'Archer''s Triple Focus',
    'Triple-click the center of any target to activate precision mode',
    'click_pattern',
    '{"pattern": "triple_click_center"}',
    75,
    'precision_focus_visualization',
    'precision_focus',
    'In the stillness between heartbeats, the arrow finds its true path',
    'Athletic shooting precision and mindfulness practice',
    'The center holds the key to perfect concentration',
    true
),
(
    'lotus_midnight_bloom',
    'Midnight Lotus Bloom',
    'Visit the platform exactly at midnight to witness the quantum lotus bloom',
    'time_based',
    '{"time": "00:00:00"}',
    300,
    'midnight_lotus_animation',
    'lotus_bloom',
    'In the darkest hour, the lotus blooms with infinite light',
    'Lotus symbolism and quantum consciousness philosophy',
    'Some transformations happen when the world sleeps',
    true
),
(
    'hidden_path_sequence',
    'The Hidden Path Revelation',
    'Navigate through secret areas in a specific sequence',
    'quantum_alignment',
    '{"pattern": "security->portfolio->challenges->circles->home"}',
    500,
    'hidden_path_map',
    'hidden_path_finder',
    'The path reveals itself only to those who seek with pure intention',
    'Spiritual journey and seeker''s path',
    'The journey matters more than the destination, but the sequence unlocks understanding',
    true
);

-- Insert initial achievements
INSERT INTO achievements (
    achievement_id, name, description, category, difficulty,
    requirements, points, cultural_context, icon, is_active
) VALUES 
(
    'first_steps_sa',
    'First Steps in Sa',
    'Begin your musical journey with the fundamental note',
    'creation',
    'bronze',
    '["upload_first_musical_piece"]',
    50,
    'Sa represents the beginning of all musical expression in Carnatic tradition',
    '🎵',
    true
),
(
    'quantum_apprentice',
    'Quantum Apprentice',
    'Grasp the basic principles of quantum consciousness',
    'learning',
    'silver',
    '["read_quantum_content", "solve_basic_quantum_puzzle"]',
    150,
    'Based on "The Quantum Lotus" philosophy of consciousness exploration',
    '🔮',
    true
),
(
    'community_harmonizer',
    'Community Harmonizer',
    'Bring artists together in beautiful collaboration',
    'collaboration',
    'gold',
    '["complete_3_collaborations", "mentor_2_newcomers", "organize_community_event"]',
    400,
    'Celebrating the Indian tradition of guru-shishya parampara and collective creation',
    '🤝',
    true
),
(
    'precision_master',
    'Precision Master',
    'Achieve perfect focus and precision in artistic practice',
    'mastery',
    'platinum',
    '["complete_precision_challenges", "maintain_streak_30_days", "teach_precision_technique"]',
    800,
    'Inspired by the mental discipline required in competitive shooting and meditation',
    '🎯',
    true
),
(
    'lotus_enlightened',
    'Lotus Enlightened',
    'Achieve the highest state of artistic and spiritual integration',
    'mastery',
    'diamond',
    '["unlock_all_art_keys", "inspire_100_creators", "create_masterpiece"]',
    2000,
    'The ultimate flowering of consciousness represented by the blooming lotus',
    '🪷',
    true
);

-- Insert sample countdown timers
INSERT INTO countdown_timers (
    timer_id, name, description, target_date, type, rewards, cultural_significance, metadata
) VALUES 
(
    uuid_generate_v4(),
    'Spring Carnatic Festival',
    'A celebration of traditional South Indian classical music',
    CURRENT_TIMESTAMP + INTERVAL '7 days',
    'event',
    '{"participation": 200, "completion": 500, "excellence": 1000}',
    'Celebrating the renewal of musical expression in traditional Carnatic forms',
    '{"theme": "carnatic_spring", "culturalContext": "Celebrating the renewal of musical expression"}'
),
(
    uuid_generate_v4(),
    'Quantum Consciousness Workshop',
    'Deep dive into the intersection of quantum physics and consciousness',
    CURRENT_TIMESTAMP + INTERVAL '3 days',
    'challenge',
    '{"participation": 150, "completion": 300, "mastery": 750}',
    'Based on "The Quantum Lotus" exploration of consciousness and reality',
    '{"theme": "quantum_exploration", "requiredLevel": "artist", "basedOn": "The Quantum Lotus philosophy"}'
),
(
    uuid_generate_v4(),
    'Precision & Focus Challenge',
    'Apply athletic mental training to artistic practice',
    CURRENT_TIMESTAMP + INTERVAL '5 days',
    'challenge',
    '{"participation": 100, "completion": 250, "precision_master": 600}',
    'Integrating competitive shooting mental discipline with artistic excellence',
    '{"theme": "athletic_precision", "focusAreas": ["concentration", "flow_state", "performance_optimization"]}'
);

-- =============================================================================
-- PERFORMANCE OPTIMIZATION AND MAINTENANCE
-- =============================================================================

-- Function to clean up expired data
CREATE OR REPLACE FUNCTION cleanup_gamification_data()
RETURNS void AS $$
BEGIN
    -- Clean up expired real-time status
    DELETE FROM realtime_status 
    WHERE expires_at IS NOT NULL AND expires_at < CURRENT_TIMESTAMP;
    
    -- Clean up old engagement metrics (keep last 90 days)
    DELETE FROM user_engagement_metrics 
    WHERE metric_date < CURRENT_DATE - INTERVAL '90 days';
    
    -- Clean up old analytics data (keep last 1 year)
    DELETE FROM gamification_analytics 
    WHERE period_end < CURRENT_TIMESTAMP - INTERVAL '1 year';
    
    -- Archive old leaderboard data
    DELETE FROM leaderboards 
    WHERE period_end IS NOT NULL 
      AND period_end < CURRENT_TIMESTAMP - INTERVAL '3 months'
      AND period_type IN ('daily', 'weekly');
    
    -- Update statistics
    ANALYZE user_art_keys;
    ANALYZE user_achievements;
    ANALYZE user_easter_eggs;
    ANALYZE user_engagement_metrics;
END;
$$ LANGUAGE plpgsql;

-- Schema version update
INSERT INTO schema_version (version, description) VALUES 
('004', 'Gamification system: ART KEYS, real-time elements, easter eggs, achievements, and engagement analytics');

-- Success message
SELECT 'Gamification system schema successfully applied!' as status,
       'ART KEYS, countdown timers, easter eggs, achievements, and analytics systems are now available' as details;
