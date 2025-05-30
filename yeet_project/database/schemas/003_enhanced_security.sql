-- YEET BY YETHIKRISHNA R - ENHANCED SECURITY SCHEMA
-- Multi-factor authentication, blockchain integration, artistic puzzles, and encrypted content

-- =============================================================================
-- MULTI-FACTOR AUTHENTICATION TABLES
-- =============================================================================

-- User MFA configuration
CREATE TABLE IF NOT EXISTS user_mfa_config (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    
    -- TOTP (Authenticator App) Configuration
    totp_secret VARCHAR(255),
    totp_enabled BOOLEAN DEFAULT FALSE,
    
    -- SMS Configuration
    sms_enabled BOOLEAN DEFAULT FALSE,
    phone_number VARCHAR(20),
    phone_verified BOOLEAN DEFAULT FALSE,
    
    -- Biometric Configuration
    biometric_enabled BOOLEAN DEFAULT FALSE,
    biometric_public_key TEXT,
    
    -- Backup Codes (hashed)
    backup_codes TEXT[] DEFAULT '{}',
    
    -- Usage Tracking
    last_used_method VARCHAR(20), -- 'totp', 'sms', 'biometric', 'backup'
    failed_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MFA challenge tracking
CREATE TABLE IF NOT EXISTS mfa_challenges (
    challenge_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    method VARCHAR(20) NOT NULL CHECK (method IN ('totp', 'sms', 'biometric', 'artistic_puzzle')),
    challenge TEXT NOT NULL, -- encrypted challenge data
    expires_at TIMESTAMP NOT NULL,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    solved BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- BLOCKCHAIN INTEGRATION TABLES
-- =============================================================================

-- User blockchain wallets
CREATE TABLE IF NOT EXISTS user_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    wallet_address VARCHAR(42) NOT NULL, -- Ethereum address format
    chain_id INTEGER NOT NULL DEFAULT 1, -- 1 = Ethereum mainnet
    wallet_type VARCHAR(20) DEFAULT 'custom' CHECK (wallet_type IN ('metamask', 'walletconnect', 'coinbase', 'custom')),
    
    -- Verification
    is_verified BOOLEAN DEFAULT FALSE,
    verification_signature TEXT,
    verification_message TEXT,
    
    -- Token Balances (cached)
    premium_token_balance DECIMAL(18,8) DEFAULT 0,
    last_sync_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Metadata
    ens_name VARCHAR(255), -- Ethereum Name Service
    wallet_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, wallet_address)
);

-- Premium access tokens (blockchain-based)
CREATE TABLE IF NOT EXISTS premium_access_tokens (
    token_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Access Configuration
    access_level VARCHAR(20) NOT NULL CHECK (access_level IN ('basic', 'premium', 'exclusive', 'creator')),
    content_types TEXT[] NOT NULL, -- e.g., ['carnatic_music', 'quantum_texts', 'exclusive_tools']
    
    -- Token Details
    blockchain_token_id VARCHAR(100), -- NFT token ID if applicable
    contract_address VARCHAR(42), -- Smart contract address
    token_uri TEXT, -- IPFS or HTTP URI for token metadata
    
    -- Validity
    expires_at TIMESTAMP,
    transferable BOOLEAN DEFAULT FALSE,
    revoked BOOLEAN DEFAULT FALSE,
    
    -- Usage Tracking
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blockchain transaction log
CREATE TABLE IF NOT EXISTS blockchain_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    transaction_hash VARCHAR(66) NOT NULL UNIQUE, -- Ethereum tx hash
    chain_id INTEGER NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- 'token_purchase', 'access_grant', 'wallet_verification'
    
    -- Transaction Details
    from_address VARCHAR(42),
    to_address VARCHAR(42),
    value_wei DECIMAL(78,0), -- Wei amount (for ETH transactions)
    gas_used INTEGER,
    gas_price DECIMAL(20,0),
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed', 'reverted')),
    confirmations INTEGER DEFAULT 0,
    
    -- Associated Data
    token_id UUID REFERENCES premium_access_tokens(token_id),
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    block_timestamp TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- ARTISTIC PUZZLE SYSTEM
-- =============================================================================

-- Artistic security puzzles
CREATE TABLE IF NOT EXISTS artistic_puzzles (
    puzzle_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Puzzle Classification
    puzzle_type VARCHAR(30) NOT NULL CHECK (puzzle_type IN ('carnatic_sequence', 'quantum_cipher', 'rhythm_pattern', 'literary_code', 'shooting_precision', 'collaborative_harmony')),
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('novice', 'apprentice', 'virtuoso', 'master')),
    required_circle creative_circle NOT NULL,
    
    -- Puzzle Content
    challenge_data JSONB NOT NULL, -- The puzzle challenge
    solution_hash VARCHAR(64) NOT NULL, -- SHA-256 hash of solution
    hints TEXT[] DEFAULT '{}',
    
    -- Constraints
    time_limit INTEGER DEFAULT 300, -- seconds
    max_attempts INTEGER DEFAULT 3,
    
    -- Artistic Context
    cultural_context TEXT, -- e.g., "Based on Carnatic raga Shankarabharanam"
    educational_value TEXT,
    inspiration_source TEXT, -- e.g., "From 'The Quantum Lotus' Chapter 3"
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    featured BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Puzzle attempt tracking
CREATE TABLE IF NOT EXISTS puzzle_attempts (
    attempt_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    puzzle_id UUID REFERENCES artistic_puzzles(puzzle_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Attempt Details
    user_solution TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    time_taken INTEGER, -- seconds
    hints_used INTEGER DEFAULT 0,
    
    -- Scoring
    points_awarded INTEGER DEFAULT 0,
    bonus_points INTEGER DEFAULT 0, -- for exceptional solutions
    completion_rank INTEGER, -- rank among all solvers
    
    -- Analysis
    solution_method TEXT, -- how they solved it
    artistic_insight TEXT, -- any artistic understanding demonstrated
    
    -- Metadata
    attempt_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Puzzle leaderboards
CREATE TABLE IF NOT EXISTS puzzle_leaderboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    puzzle_id UUID REFERENCES artistic_puzzles(puzzle_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Performance Metrics
    best_time INTEGER NOT NULL, -- fastest solve time in seconds
    total_attempts INTEGER DEFAULT 1,
    total_points INTEGER NOT NULL,
    artistic_style_points INTEGER DEFAULT 0, -- bonus for creative approach
    
    -- Rankings
    time_rank INTEGER,
    points_rank INTEGER,
    overall_rank INTEGER,
    
    -- Achievements
    first_solver BOOLEAN DEFAULT FALSE,
    perfect_solve BOOLEAN DEFAULT FALSE, -- solved without hints
    creative_solution BOOLEAN DEFAULT FALSE, -- recognized for creativity
    
    -- Timestamps
    first_solved_at TIMESTAMP NOT NULL,
    last_attempt_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(puzzle_id, user_id)
);

-- =============================================================================
-- ENCRYPTED CONTENT SYSTEM
-- =============================================================================

-- Encrypted content metadata
CREATE TABLE IF NOT EXISTS encrypted_content (
    content_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Content Classification
    content_type VARCHAR(50) NOT NULL, -- 'carnatic_composition', 'quantum_text', 'exclusive_tool', 'masterclass_video'
    content_category VARCHAR(30) NOT NULL, -- 'music', 'literature', 'education', 'tools'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Access Control
    access_level VARCHAR(20) NOT NULL CHECK (access_level IN ('basic', 'premium', 'exclusive', 'creator')),
    required_circle creative_circle,
    required_tokens INTEGER DEFAULT 0, -- blockchain tokens required
    
    -- Encryption Details
    encryption_algorithm VARCHAR(50) DEFAULT 'aes-256-gcm',
    content_size_bytes BIGINT,
    checksum_sha256 VARCHAR(64),
    
    -- File Storage
    encrypted_file_path TEXT,
    storage_provider VARCHAR(20) DEFAULT 'local', -- 'local', 's3', 'ipfs'
    
    -- Usage Tracking
    download_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP,
    
    -- Artistic Metadata
    artistic_tags TEXT[] DEFAULT '{}',
    cultural_significance TEXT,
    educational_level VARCHAR(20), -- 'beginner', 'intermediate', 'advanced', 'master'
    
    -- Availability
    is_public BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP, -- for temporary content
    
    -- Metadata
    content_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content encryption keys (stored securely)
CREATE TABLE IF NOT EXISTS content_encryption_keys (
    content_id UUID PRIMARY KEY REFERENCES encrypted_content(content_id) ON DELETE CASCADE,
    
    -- Encryption Keys (should be encrypted at rest in production)
    encryption_key_encrypted TEXT NOT NULL, -- Encrypted with master key
    initialization_vector TEXT NOT NULL,
    auth_tag TEXT, -- for authenticated encryption
    key_derivation_salt TEXT,
    
    -- Key Management
    key_version INTEGER DEFAULT 1,
    algorithm VARCHAR(50) NOT NULL,
    key_rotation_date TIMESTAMP,
    
    -- Access Control
    key_access_log JSONB DEFAULT '[]', -- log of key access
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    rotated_at TIMESTAMP
);

-- Content access log
CREATE TABLE IF NOT EXISTS content_access_log (
    access_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES encrypted_content(content_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Access Details
    access_type VARCHAR(20) NOT NULL CHECK (access_type IN ('view', 'download', 'stream', 'decrypt')),
    access_granted BOOLEAN NOT NULL,
    denial_reason TEXT, -- if access was denied
    
    -- Access Method
    access_method VARCHAR(30), -- 'circle_level', 'token_payment', 'special_grant'
    tokens_used INTEGER DEFAULT 0,
    
    -- Technical Details
    ip_address INET,
    user_agent TEXT,
    request_headers JSONB,
    
    -- Performance
    decrypt_time_ms INTEGER,
    transfer_time_ms INTEGER,
    
    -- Metadata
    access_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- SECURITY AUDIT AND MONITORING
-- =============================================================================

-- Security events log
CREATE TABLE IF NOT EXISTS security_events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Event Classification
    event_type VARCHAR(50) NOT NULL, -- 'login_attempt', 'mfa_challenge', 'wallet_connection', 'puzzle_solve', 'premium_access'
    event_category VARCHAR(30) NOT NULL, -- 'authentication', 'authorization', 'blockchain', 'artistic_challenge'
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    
    -- Event Details
    event_description TEXT NOT NULL,
    success BOOLEAN,
    failure_reason TEXT,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(100),
    request_path TEXT,
    
    -- Risk Assessment
    risk_score INTEGER DEFAULT 0, -- 0-100 risk score
    anomaly_detected BOOLEAN DEFAULT FALSE,
    geolocation JSONB, -- country, city, etc.
    
    -- Response Actions
    action_taken VARCHAR(50), -- 'none', 'locked_account', 'required_mfa', 'flagged_review'
    automated_response BOOLEAN DEFAULT FALSE,
    
    -- Additional Data
    event_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Suspicious activity patterns
CREATE TABLE IF NOT EXISTS suspicious_patterns (
    pattern_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Pattern Details
    pattern_type VARCHAR(50) NOT NULL, -- 'unusual_login_time', 'multiple_failed_mfa', 'rapid_puzzle_solving'
    pattern_description TEXT NOT NULL,
    confidence_score DECIMAL(5,2), -- 0.00 to 100.00
    
    -- Detection
    first_detected_at TIMESTAMP NOT NULL,
    last_detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    detection_count INTEGER DEFAULT 1,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'false_positive', 'under_review')),
    reviewed_by UUID REFERENCES users(id),
    review_notes TEXT,
    
    -- Associated Events
    related_events UUID[] DEFAULT '{}',
    
    -- Metadata
    pattern_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- MFA indexes
CREATE INDEX IF NOT EXISTS idx_user_mfa_config_user_id ON user_mfa_config(user_id);
CREATE INDEX IF NOT EXISTS idx_mfa_challenges_user_id ON mfa_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_mfa_challenges_expires_at ON mfa_challenges(expires_at);
CREATE INDEX IF NOT EXISTS idx_mfa_challenges_method ON mfa_challenges(method);

-- Blockchain indexes
CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wallets_address ON user_wallets(wallet_address);
CREATE INDEX IF NOT EXISTS idx_premium_tokens_user_id ON premium_access_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_premium_tokens_level ON premium_access_tokens(access_level);
CREATE INDEX IF NOT EXISTS idx_blockchain_transactions_user_id ON blockchain_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_transactions_hash ON blockchain_transactions(transaction_hash);

-- Puzzle indexes
CREATE INDEX IF NOT EXISTS idx_artistic_puzzles_type ON artistic_puzzles(puzzle_type);
CREATE INDEX IF NOT EXISTS idx_artistic_puzzles_difficulty ON artistic_puzzles(difficulty);
CREATE INDEX IF NOT EXISTS idx_artistic_puzzles_circle ON artistic_puzzles(required_circle);
CREATE INDEX IF NOT EXISTS idx_puzzle_attempts_puzzle_id ON puzzle_attempts(puzzle_id);
CREATE INDEX IF NOT EXISTS idx_puzzle_attempts_user_id ON puzzle_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_puzzle_leaderboards_puzzle_id ON puzzle_leaderboards(puzzle_id);

-- Content indexes
CREATE INDEX IF NOT EXISTS idx_encrypted_content_type ON encrypted_content(content_type);
CREATE INDEX IF NOT EXISTS idx_encrypted_content_access_level ON encrypted_content(access_level);
CREATE INDEX IF NOT EXISTS idx_encrypted_content_circle ON encrypted_content(required_circle);
CREATE INDEX IF NOT EXISTS idx_content_access_log_content_id ON content_access_log(content_id);
CREATE INDEX IF NOT EXISTS idx_content_access_log_user_id ON content_access_log(user_id);

-- Security indexes
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at);
CREATE INDEX IF NOT EXISTS idx_suspicious_patterns_user_id ON suspicious_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_suspicious_patterns_status ON suspicious_patterns(status);

-- =============================================================================
-- TRIGGERS FOR AUTOMATED SECURITY MONITORING
-- =============================================================================

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event()
RETURNS TRIGGER AS $$
BEGIN
    -- Log MFA events
    IF TG_TABLE_NAME = 'mfa_challenges' THEN
        INSERT INTO security_events (
            user_id, event_type, event_category, event_description, 
            success, event_metadata
        )
        VALUES (
            NEW.user_id,
            'mfa_challenge_created',
            'authentication',
            'MFA challenge created for method: ' || NEW.method,
            true,
            json_build_object('method', NEW.method, 'challenge_id', NEW.challenge_id)
        );
    END IF;
    
    -- Log wallet connections
    IF TG_TABLE_NAME = 'user_wallets' AND NEW.is_verified = true THEN
        INSERT INTO security_events (
            user_id, event_type, event_category, event_description, 
            success, event_metadata
        )
        VALUES (
            NEW.user_id,
            'wallet_connected',
            'blockchain',
            'Blockchain wallet connected: ' || NEW.wallet_address,
            true,
            json_build_object('wallet_address', NEW.wallet_address, 'chain_id', NEW.chain_id)
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for security event logging
CREATE TRIGGER mfa_challenge_security_trigger
    AFTER INSERT ON mfa_challenges
    FOR EACH ROW EXECUTE FUNCTION log_security_event();

CREATE TRIGGER wallet_connection_security_trigger
    AFTER UPDATE ON user_wallets
    FOR EACH ROW EXECUTE FUNCTION log_security_event();

-- Function to detect suspicious patterns
CREATE OR REPLACE FUNCTION detect_suspicious_activity()
RETURNS TRIGGER AS $$
DECLARE
    failed_attempts INTEGER;
    rapid_attempts INTEGER;
BEGIN
    -- Check for multiple failed MFA attempts
    IF NEW.solved = false THEN
        SELECT COUNT(*) INTO failed_attempts
        FROM mfa_challenges
        WHERE user_id = NEW.user_id 
          AND solved = false 
          AND created_at > CURRENT_TIMESTAMP - INTERVAL '1 hour';
        
        IF failed_attempts >= 5 THEN
            INSERT INTO suspicious_patterns (
                user_id, pattern_type, pattern_description, confidence_score
            )
            VALUES (
                NEW.user_id,
                'multiple_failed_mfa',
                'Multiple failed MFA attempts detected',
                95.0
            )
            ON CONFLICT (user_id, pattern_type) DO UPDATE SET
                detection_count = suspicious_patterns.detection_count + 1,
                last_detected_at = CURRENT_TIMESTAMP;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for suspicious activity detection
CREATE TRIGGER suspicious_activity_trigger
    AFTER INSERT ON mfa_challenges
    FOR EACH ROW EXECUTE FUNCTION detect_suspicious_activity();

-- =============================================================================
-- SAMPLE DATA FOR ENHANCED SECURITY
-- =============================================================================

-- Sample artistic puzzles
INSERT INTO artistic_puzzles (
    puzzle_type, difficulty, required_circle, challenge_data, solution_hash,
    hints, time_limit, cultural_context, educational_value, inspiration_source,
    tags, featured, active
) VALUES 
(
    'carnatic_sequence',
    'apprentice',
    'apprentice',
    '{"raga": "Shankarabharanam", "partialSequence": ["Sa", "Ri", "Ga", "Ma"], "instruction": "Complete this Shankarabharanam raga sequence in the tradition of Carnatic music"}',
    'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', -- SHA-256 of "Pa-Dha-Ni-Sa"
    ARRAY['This raga follows the natural scale progression', 'Consider the ascending melodic pattern', 'Shankarabharanam is the foundational raga'],
    300,
    'Based on Carnatic raga Shankarabharanam, the foundational scale of South Indian classical music',
    'Understanding basic raga structure and melodic progression in Carnatic tradition',
    'Traditional Carnatic music pedagogy and Yethikrishna R''s musical background',
    ARRAY['carnatic', 'raga', 'melody', 'traditional'],
    true,
    true
),
(
    'quantum_cipher',
    'virtuoso',
    'artist',
    '{"encryptedText": "Gur dhnaghz ybghf oybhzf va fhcrecbfvgvba bs nyy cbffvovyvgvrf", "quantumHint": "Apply quantum principles to decode the wisdom", "literaryContext": "From The Quantum Lotus philosophical tradition"}',
    '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5', -- SHA-256 of solution
    ARRAY['Consider the observer effect in quantum mechanics', 'The lotus represents awakening consciousness', 'Superposition contains all possible states'],
    600,
    'Inspired by quantum consciousness philosophy and lotus symbolism',
    'Integration of quantum physics concepts with consciousness studies',
    'From "The Quantum Lotus" by Yethikrishna R - exploring consciousness and quantum reality',
    ARRAY['quantum', 'consciousness', 'cipher', 'philosophy'],
    true,
    true
),
(
    'rhythm_pattern',
    'master',
    'master',
    '{"tala": "Adi Tala", "pattern": ["dha", "dhi", "mi", "dha", "dha", "dhi", "?", "?"], "missingBeats": [6, 7], "instruction": "Complete this Adi Tala pattern maintaining proper mathematical precision"}',
    '1a79a4d60de6718e8e5b326e338ae533e88c5c75d9f0a3e91b3bb0b1b9c4b1be', -- SHA-256 of solution
    ARRAY['Adi Tala has 8 beats per cycle', 'Maintain the subdivisions and accents', 'Consider the mathematical relationships in the pattern'],
    240,
    'Adi Tala - the foundational rhythmic cycle in Carnatic music with 8 beats',
    'Understanding mathematical precision in rhythm and the relationship between time and musical expression',
    'Traditional Carnatic rhythm pedagogy and Yethikrishna R''s understanding of musical mathematics',
    ARRAY['rhythm', 'tala', 'mathematics', 'precision'],
    false,
    true
);

-- Sample encrypted content
INSERT INTO encrypted_content (
    content_type, content_category, title, description, access_level, 
    required_circle, artistic_tags, cultural_significance, educational_level,
    is_public, featured, active
) VALUES 
(
    'carnatic_masterclass',
    'music',
    'Advanced Raga Exposition Techniques',
    'Exclusive masterclass on advanced techniques for raga exposition in Carnatic music, featuring traditional methods and contemporary innovations.',
    'premium',
    'artist',
    ARRAY['carnatic', 'raga', 'masterclass', 'advanced'],
    'Preserving and advancing the ancient tradition of Carnatic music through modern pedagogical methods',
    'advanced',
    false,
    true,
    true
),
(
    'quantum_philosophy_text',
    'literature',
    'The Quantum Lotus: Chapter Excerpts',
    'Exclusive excerpts from "The Quantum Lotus" exploring the intersection of quantum physics and consciousness studies.',
    'exclusive',
    'virtuoso',
    ARRAY['quantum', 'philosophy', 'consciousness', 'literature'],
    'Bridging ancient wisdom and modern physics through contemplative literature',
    'master',
    false,
    true,
    true
),
(
    'precision_training_guide',
    'education',
    'Athletic Precision: Mental Focus Techniques',
    'Advanced mental focus and precision training techniques derived from competitive shooting sports, applicable to artistic practice.',
    'premium',
    'master',
    ARRAY['precision', 'focus', 'athletics', 'mental_training'],
    'Applying athletic discipline and precision to artistic excellence',
    'intermediate',
    false,
    false,
    true
);

-- =============================================================================
-- SECURITY PERMISSIONS AND CLEANUP
-- =============================================================================

-- Grant appropriate permissions (adjust based on your user setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO yeet_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO yeet_app_user;

-- Add table comments for documentation
COMMENT ON TABLE user_mfa_config IS 'Multi-factor authentication configuration for enhanced security';
COMMENT ON TABLE mfa_challenges IS 'Active MFA challenges and verification attempts';
COMMENT ON TABLE user_wallets IS 'Blockchain wallet connections for premium access control';
COMMENT ON TABLE premium_access_tokens IS 'Blockchain-based premium access tokens and NFTs';
COMMENT ON TABLE artistic_puzzles IS 'Artistic security challenges aligned with Yethikrishna R creative identity';
COMMENT ON TABLE puzzle_attempts IS 'User attempts at solving artistic security puzzles';
COMMENT ON TABLE encrypted_content IS 'Premium artistic content with encryption for secure delivery';
COMMENT ON TABLE content_encryption_keys IS 'Encryption keys for premium content (encrypted at rest)';
COMMENT ON TABLE security_events IS 'Comprehensive security event logging and monitoring';
COMMENT ON TABLE suspicious_patterns IS 'Automated detection of suspicious user activity patterns';

-- Schema version update
INSERT INTO schema_version (version, description) VALUES 
('003', 'Enhanced security: Multi-factor authentication, blockchain integration, artistic puzzles, and encrypted content delivery');

-- Success message
SELECT 'Enhanced security schema successfully applied!' as status,
       'MFA, blockchain, artistic puzzles, and encrypted content systems are now available' as details;
