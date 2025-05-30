-- YEET BY YETHIKRISHNA R - ARTISTIC FEATURES SCHEMA
-- Artistic portfolio enhancements, tools recommendations, and creative challenges

-- =============================================================================
-- PORTFOLIO ENHANCEMENTS FOR ARTISTIC CONTENT
-- =============================================================================

-- Add artistic-specific fields to portfolio_items
ALTER TABLE portfolio_items 
ADD COLUMN IF NOT EXISTS performance_location VARCHAR(255),
ADD COLUMN IF NOT EXISTS instruments TEXT[],
ADD COLUMN IF NOT EXISTS genre VARCHAR(100);

-- Update portfolio_type enum to include artistic categories
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'artistic_portfolio_type') THEN
        CREATE TYPE artistic_portfolio_type AS ENUM (
            'carnatic_music',
            'contemporary_music', 
            'creative_writing',
            'poetry',
            'visual_art',
            'photography',
            'performance',
            'collaboration',
            'mixed_media',
            'research',
            'education'
        );
    END IF;
END $$;

-- Create artistic tools recommendation system
CREATE TABLE IF NOT EXISTS artistic_tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recommended_by UUID REFERENCES users(id),
    
    -- Basic Information
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    
    -- Technical Details
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('web', 'windows', 'mac', 'linux', 'ios', 'android', 'cross_platform')),
    pricing VARCHAR(50) NOT NULL CHECK (pricing IN ('free', 'freemium', 'paid', 'subscription', 'one_time')),
    difficulty VARCHAR(50) NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'professional')),
    website VARCHAR(500),
    
    -- Access Control
    min_circle_level creative_circle,
    
    -- Content
    tags TEXT[],
    pros TEXT[],
    cons TEXT[],
    alternative_to UUID[],
    
    -- Metadata
    featured BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rejected', 'archived')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tool ratings and reviews
CREATE TABLE IF NOT EXISTS tool_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tool_id UUID REFERENCES artistic_tools(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tool_id, user_id)
);

-- Tool usage tracking
CREATE TABLE IF NOT EXISTS tool_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tool_id UUID REFERENCES artistic_tools(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tool_id, user_id)
);

-- =============================================================================
-- ENHANCED CHALLENGES SYSTEM
-- =============================================================================

-- Add artistic challenge types
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'artistic_challenge_type') THEN
        CREATE TYPE artistic_challenge_type AS ENUM (
            'carnatic_composition',
            'contemporary_music',
            'poetry_slam',
            'short_story',
            'visual_art',
            'photography',
            'performance',
            'collaboration',
            'mixed_media',
            'residency_application'
        );
    END IF;
END $$;

-- Update challenges table with artistic fields
ALTER TABLE challenges 
ADD COLUMN IF NOT EXISTS submission_guidelines TEXT,
ADD COLUMN IF NOT EXISTS collaboration_allowed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS location VARCHAR(255),
ADD COLUMN IF NOT EXISTS application_deadline TIMESTAMP;

-- Challenge submissions with portfolio integration
CREATE TABLE IF NOT EXISTS challenge_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    portfolio_item_id UUID REFERENCES portfolio_items(id) ON DELETE SET NULL,
    
    -- Submission Details
    submission_status VARCHAR(20) DEFAULT 'joined' CHECK (submission_status IN ('joined', 'submitted', 'evaluated', 'winner', 'withdrawn')),
    submission_note TEXT,
    submitted_at TIMESTAMP,
    
    -- Evaluation
    judge_score INTEGER CHECK (judge_score >= 0 AND judge_score <= 100),
    judge_feedback TEXT,
    evaluated_at TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(challenge_id, user_id)
);

-- =============================================================================
-- ARTISTIC PORTFOLIO INTERACTIONS
-- =============================================================================

-- Portfolio interactions (likes, shares, etc.)
CREATE TABLE IF NOT EXISTS portfolio_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_item_id UUID REFERENCES portfolio_items(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('like', 'share', 'comment', 'view', 'download')),
    interaction_data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(portfolio_item_id, user_id, interaction_type)
);

-- Add interaction counters to portfolio_items
ALTER TABLE portfolio_items 
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;

-- =============================================================================
-- ARTISTIC COMMUNITY FEATURES
-- =============================================================================

-- Artistic residencies and opportunities
CREATE TABLE IF NOT EXISTS artistic_residencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organizer_id UUID REFERENCES users(id),
    
    -- Basic Information
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    organization VARCHAR(255),
    location VARCHAR(255) NOT NULL,
    
    -- Program Details
    duration_weeks INTEGER,
    stipend_amount DECIMAL(10,2),
    housing_provided BOOLEAN DEFAULT FALSE,
    studio_provided BOOLEAN DEFAULT FALSE,
    
    -- Eligibility
    min_circle_level creative_circle NOT NULL,
    disciplines TEXT[] NOT NULL,
    age_min INTEGER,
    age_max INTEGER,
    nationality_requirements TEXT[],
    
    -- Timeline
    application_start DATE NOT NULL,
    application_deadline DATE NOT NULL,
    program_start DATE,
    program_end DATE,
    
    -- Application Requirements
    required_documents TEXT[],
    portfolio_requirements TEXT,
    additional_requirements TEXT,
    
    -- Contact
    contact_email VARCHAR(255),
    website VARCHAR(500),
    
    -- Metadata
    featured BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed', 'archived')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Residency applications
CREATE TABLE IF NOT EXISTS residency_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    residency_id UUID REFERENCES artistic_residencies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Application Content
    personal_statement TEXT NOT NULL,
    project_proposal TEXT NOT NULL,
    portfolio_items UUID[] NOT NULL,
    cv_document_url VARCHAR(500),
    
    -- Status
    application_status VARCHAR(20) DEFAULT 'submitted' CHECK (application_status IN ('draft', 'submitted', 'under_review', 'accepted', 'rejected', 'waitlisted')),
    reviewer_notes TEXT,
    
    -- Metadata
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(residency_id, user_id)
);

-- =============================================================================
-- CREATIVE CIRCLES ENHANCEMENTS
-- =============================================================================

-- Activity tracking for circle progression
CREATE TABLE IF NOT EXISTS circle_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    activity_description TEXT,
    points_earned INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Circle promotions history
CREATE TABLE IF NOT EXISTS circle_promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    from_circle creative_circle,
    to_circle creative_circle NOT NULL,
    total_points INTEGER NOT NULL,
    promotion_reason TEXT,
    promoted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Artistic tools indexes
CREATE INDEX IF NOT EXISTS idx_artistic_tools_category ON artistic_tools(category);
CREATE INDEX IF NOT EXISTS idx_artistic_tools_platform ON artistic_tools(platform);
CREATE INDEX IF NOT EXISTS idx_artistic_tools_pricing ON artistic_tools(pricing);
CREATE INDEX IF NOT EXISTS idx_artistic_tools_difficulty ON artistic_tools(difficulty);
CREATE INDEX IF NOT EXISTS idx_artistic_tools_status ON artistic_tools(status);
CREATE INDEX IF NOT EXISTS idx_artistic_tools_featured ON artistic_tools(featured);

-- Tool ratings indexes
CREATE INDEX IF NOT EXISTS idx_tool_ratings_tool_id ON tool_ratings(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_ratings_user_id ON tool_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_tool_ratings_rating ON tool_ratings(rating);

-- Challenge submissions indexes
CREATE INDEX IF NOT EXISTS idx_challenge_submissions_challenge_id ON challenge_submissions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_submissions_user_id ON challenge_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_submissions_status ON challenge_submissions(submission_status);

-- Portfolio interactions indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_interactions_item_id ON portfolio_interactions(portfolio_item_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_interactions_user_id ON portfolio_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_interactions_type ON portfolio_interactions(interaction_type);

-- Portfolio artistic fields indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_items_genre ON portfolio_items(genre);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_instruments ON portfolio_items USING GIN(instruments);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_location ON portfolio_items(performance_location);

-- Circle activities indexes
CREATE INDEX IF NOT EXISTS idx_circle_activities_user_id ON circle_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_circle_activities_type ON circle_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_circle_activities_created_at ON circle_activities(created_at);

-- Residency indexes
CREATE INDEX IF NOT EXISTS idx_residencies_location ON artistic_residencies(location);
CREATE INDEX IF NOT EXISTS idx_residencies_disciplines ON artistic_residencies USING GIN(disciplines);
CREATE INDEX IF NOT EXISTS idx_residencies_deadline ON artistic_residencies(application_deadline);
CREATE INDEX IF NOT EXISTS idx_residencies_status ON artistic_residencies(status);

-- =============================================================================
-- TRIGGERS FOR AUTOMATED UPDATES
-- =============================================================================

-- Update portfolio interaction counters
CREATE OR REPLACE FUNCTION update_portfolio_counters()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment counter
        IF NEW.interaction_type = 'like' THEN
            UPDATE portfolio_items SET like_count = like_count + 1 WHERE id = NEW.portfolio_item_id;
        ELSIF NEW.interaction_type = 'view' THEN
            UPDATE portfolio_items SET view_count = view_count + 1 WHERE id = NEW.portfolio_item_id;
        ELSIF NEW.interaction_type = 'share' THEN
            UPDATE portfolio_items SET share_count = share_count + 1 WHERE id = NEW.portfolio_item_id;
        ELSIF NEW.interaction_type = 'comment' THEN
            UPDATE portfolio_items SET comment_count = comment_count + 1 WHERE id = NEW.portfolio_item_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrement counter
        IF OLD.interaction_type = 'like' THEN
            UPDATE portfolio_items SET like_count = GREATEST(0, like_count - 1) WHERE id = OLD.portfolio_item_id;
        ELSIF OLD.interaction_type = 'share' THEN
            UPDATE portfolio_items SET share_count = GREATEST(0, share_count - 1) WHERE id = OLD.portfolio_item_id;
        ELSIF OLD.interaction_type = 'comment' THEN
            UPDATE portfolio_items SET comment_count = GREATEST(0, comment_count - 1) WHERE id = OLD.portfolio_item_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for portfolio counters
DROP TRIGGER IF EXISTS portfolio_interaction_counter_trigger ON portfolio_interactions;
CREATE TRIGGER portfolio_interaction_counter_trigger
    AFTER INSERT OR DELETE ON portfolio_interactions
    FOR EACH ROW EXECUTE FUNCTION update_portfolio_counters();

-- Circle activity tracking function
CREATE OR REPLACE FUNCTION track_circle_activity()
RETURNS TRIGGER AS $$
BEGIN
    -- Track circle promotions
    IF TG_OP = 'UPDATE' AND OLD.creative_circle != NEW.creative_circle THEN
        INSERT INTO circle_promotions (user_id, from_circle, to_circle, total_points, promotion_reason)
        VALUES (NEW.id, OLD.creative_circle, NEW.creative_circle, NEW.circle_points, 'Automatic promotion based on points');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for circle promotions
DROP TRIGGER IF EXISTS circle_promotion_trigger ON users;
CREATE TRIGGER circle_promotion_trigger
    AFTER UPDATE OF creative_circle ON users
    FOR EACH ROW EXECUTE FUNCTION track_circle_activity();

-- =============================================================================
-- SAMPLE DATA FOR ARTISTIC FEATURES
-- =============================================================================

-- Sample artistic tools
INSERT INTO artistic_tools (
    name, description, category, platform, pricing, difficulty, 
    website, tags, pros, cons, status, featured
) VALUES 
(
    'Reaper', 
    'Professional Digital Audio Workstation with advanced MIDI and audio editing capabilities. Excellent for Carnatic music production and contemporary compositions.',
    'music_production',
    'cross_platform',
    'paid',
    'intermediate',
    'https://www.reaper.fm',
    ARRAY['daw', 'midi', 'audio_editing', 'carnatic', 'recording'],
    ARRAY['Affordable licensing', 'Highly customizable', 'Excellent MIDI support', 'Great for Indian classical music'],
    ARRAY['Steep learning curve', 'Interface can be complex for beginners'],
    'active',
    true
),
(
    'Scrivener',
    'Professional writing software designed for long-form writing projects. Perfect for novelists, researchers, and creative writers working on complex manuscripts.',
    'writing',
    'cross_platform', 
    'paid',
    'intermediate',
    'https://www.literatureandlatte.com/scrivener',
    ARRAY['writing', 'novel', 'research', 'manuscript', 'organization'],
    ARRAY['Excellent organization features', 'Research integration', 'Flexible formatting'],
    ARRAY['Can be overwhelming', 'Requires time to learn'],
    'active',
    true
),
(
    'MuseScore',
    'Free and open-source music notation software. Excellent for creating Carnatic music scores and contemporary compositions.',
    'sheet_music',
    'cross_platform',
    'free',
    'beginner',
    'https://musescore.org',
    ARRAY['notation', 'score', 'carnatic', 'free', 'composition'],
    ARRAY['Completely free', 'Good notation features', 'Community support'],
    ARRAY['Limited advanced features', 'Some export limitations'],
    'active',
    false
),
(
    'GIMP',
    'Free and powerful image editing software for visual artists and photographers.',
    'photo_editing',
    'cross_platform',
    'free', 
    'intermediate',
    'https://www.gimp.org',
    ARRAY['photo_editing', 'graphics', 'free', 'open_source'],
    ARRAY['Completely free', 'Powerful features', 'Active community'],
    ARRAY['Complex interface', 'Steep learning curve'],
    'active',
    false
);

-- Sample artistic challenges
INSERT INTO challenges (
    created_by, title, description, challenge_type, difficulty,
    start_date, end_date, min_circle_level, prize_points,
    rules, tags, collaboration_allowed, submission_guidelines
)
SELECT 
    u.id,
    'Monsoon Raga Composition',
    'Compose an original Carnatic music piece inspired by the monsoon season. Express the beauty, power, and emotions of rain through traditional ragas and innovative arrangements.',
    'carnatic_composition',
    'intermediate',
    CURRENT_TIMESTAMP + INTERVAL '2 days',
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    'apprentice',
    100,
    ARRAY[
        'Composition must be original and previously unpublished',
        'Duration should be between 3-8 minutes',
        'Must incorporate at least one traditional monsoon raga',
        'Include both composition and performance recording',
        'Provide brief explanation of raga choice and inspiration'
    ],
    ARRAY['carnatic', 'composition', 'monsoon', 'raga', 'traditional'],
    false,
    'Submit both notation (if available) and audio recording. Include a 200-word description of your creative process and raga selection.'
FROM users u WHERE u.username = 'yethikrishnar';

INSERT INTO challenges (
    created_by, title, description, challenge_type, difficulty,
    start_date, end_date, min_circle_level, prize_points,
    rules, tags, collaboration_allowed, submission_guidelines
)
SELECT 
    u.id,
    'Quantum Poetry Slam',
    'Write and perform a poem that explores the intersection of science and spirituality, inspired by concepts from quantum physics and ancient wisdom traditions.',
    'poetry_slam',
    'advanced',
    CURRENT_TIMESTAMP + INTERVAL '5 days',
    CURRENT_TIMESTAMP + INTERVAL '25 days',
    'artist',
    150,
    ARRAY[
        'Poem must be original and between 2-5 minutes when performed',
        'Must incorporate both scientific and spiritual themes',
        'Performance can be live or recorded video',
        'Spoken word style preferred but not mandatory',
        'Include written version of the poem'
    ],
    ARRAY['poetry', 'quantum', 'science', 'spirituality', 'performance'],
    true,
    'Submit both written poem and performance video. Collaboration with musicians or visual artists is encouraged.'
FROM users u WHERE u.username = 'yethikrishnar';

-- Sample residency opportunity
INSERT INTO artistic_residencies (
    organizer_id, name, description, organization, location,
    duration_weeks, housing_provided, studio_provided,
    min_circle_level, disciplines, application_start, application_deadline,
    program_start, program_end, contact_email, status, featured
)
SELECT 
    u.id,
    'Himalayan Arts Residency',
    'A transformative 4-week residency in the foothills of the Himalayas, focusing on the intersection of traditional arts and contemporary expression. Perfect for musicians, writers, and visual artists seeking inspiration in nature.',
    'Himalayan Cultural Foundation',
    'Dharamshala, Himachal Pradesh, India',
    4,
    true,
    true,
    'artist',
    ARRAY['carnatic_music', 'contemporary_music', 'creative_writing', 'visual_art', 'photography'],
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '60 days',
    CURRENT_DATE + INTERVAL '90 days', 
    CURRENT_DATE + INTERVAL '118 days',
    'applications@himalayanarts.org',
    'active',
    true
FROM users u WHERE u.username = 'yethikrishnar';

-- =============================================================================
-- SCHEMA VERSION UPDATE
-- =============================================================================

INSERT INTO schema_version (version, description) VALUES 
('002', 'Artistic features: enhanced portfolio with musical fields, tools recommendation system, artistic challenges, residencies, and Creative Circles activity tracking');

-- =============================================================================
-- PERMISSIONS AND SECURITY
-- =============================================================================

-- Grant appropriate permissions (adjust based on your user setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO yeet_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO yeet_app_user;

-- Table comments for documentation
COMMENT ON TABLE artistic_tools IS 'Artistic tools and software recommendations with community ratings';
COMMENT ON TABLE tool_ratings IS 'User ratings and reviews for artistic tools';
COMMENT ON TABLE tool_usage IS 'Tracking which users have used which tools';
COMMENT ON TABLE challenge_submissions IS 'User submissions to artistic challenges and competitions';
COMMENT ON TABLE portfolio_interactions IS 'User interactions with portfolio items (likes, views, shares)';
COMMENT ON TABLE artistic_residencies IS 'Artistic residency and opportunity listings';
COMMENT ON TABLE residency_applications IS 'User applications to artistic residencies';
COMMENT ON TABLE circle_activities IS 'Activity tracking for Creative Circles progression';
COMMENT ON TABLE circle_promotions IS 'History of user promotions between Creative Circles levels';

-- Success message
SELECT 'Artistic features schema successfully applied!' as status;
