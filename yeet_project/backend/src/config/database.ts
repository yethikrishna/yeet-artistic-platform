// YEET BY YETHIKRISHNA R - DATABASE CONFIGURATION
// PostgreSQL database connection and configuration

import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// =============================================================================
// DATABASE CONFIGURATION
// =============================================================================

const databaseConfig: PoolConfig = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME || 'yeet_db',
  user: process.env.DATABASE_USER || 'yeet_user',
  password: process.env.DATABASE_PASSWORD || 'yeet_password',
  
  // Connection pool settings
  min: 2,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  
  // SSL configuration for production
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
};

// Create connection pool
let pool: Pool;

// =============================================================================
// DATABASE CONNECTION FUNCTIONS
// =============================================================================

export async function connectDatabase(): Promise<Pool> {
  try {
    pool = new Pool(databaseConfig);
    
    // Test the connection
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    
    console.log('✅ Database connected at:', result.rows[0].now);
    
    // Setup connection event handlers
    pool.on('connect', () => {
      console.log('📊 New database client connected');
    });
    
    pool.on('error', (err) => {
      console.error('❌ Database pool error:', err);
    });
    
    return pool;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

export function getDatabase(): Pool {
  if (!pool) {
    throw new Error('Database not initialized. Call connectDatabase() first.');
  }
  return pool;
}

// =============================================================================
// DATABASE UTILITY FUNCTIONS
// =============================================================================

// Execute a query with error handling
export async function query(text: string, params?: any[]): Promise<any> {
  const client = await pool.connect();
  try {
    const start = Date.now();
    const result = await client.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.DEBUG_SQL_QUERIES === 'true') {
      console.log('🔍 SQL Query executed:', { text, duration, rows: result.rowCount });
    }
    
    return result;
  } catch (error) {
    console.error('❌ Database query error:', error);
    console.error('📝 Query:', text);
    console.error('📊 Params:', params);
    throw error;
  } finally {
    client.release();
  }
}

// Transaction helper
export async function transaction<T>(
  callback: (client: any) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// =============================================================================
// CREATIVE CIRCLES DATABASE FUNCTIONS
// =============================================================================

// Get Creative Circles configuration
export async function getCreativeCirclesConfig() {
  const result = await query(`
    SELECT circle, display_name, color_code, min_points, max_points, 
           features, permissions, description
    FROM creative_circles_config
    ORDER BY min_points ASC
  `);
  
  return result.rows;
}

// Get user's current circle information
export async function getUserCircleInfo(userId: string) {
  const result = await query(`
    SELECT u.creative_circle, u.circle_points,
           ccc.display_name, ccc.color_code, ccc.features, ccc.permissions,
           ccc.min_points, ccc.max_points
    FROM users u
    JOIN creative_circles_config ccc ON u.creative_circle = ccc.circle
    WHERE u.id = $1
  `, [userId]);
  
  return result.rows[0];
}

// Add circle points to user
export async function addCirclePoints(
  userId: string, 
  points: number, 
  activityType: string, 
  description?: string,
  metadata?: object
) {
  return await transaction(async (client) => {
    // Add points to user
    await client.query(`
      UPDATE users 
      SET circle_points = circle_points + $1 
      WHERE id = $2
    `, [points, userId]);
    
    // Log the activity
    await client.query(`
      INSERT INTO circle_progress (user_id, points_earned, activity_type, activity_description, metadata)
      VALUES ($1, $2, $3, $4, $5)
    `, [userId, points, activityType, description, JSON.stringify(metadata || {})]);
    
    // Get updated user info (trigger will handle circle promotion)
    const result = await client.query(`
      SELECT creative_circle, circle_points FROM users WHERE id = $1
    `, [userId]);
    
    return result.rows[0];
  });
}

// =============================================================================
// USER MANAGEMENT FUNCTIONS
// =============================================================================

// Create new user
export async function createUser(userData: {
  email: string;
  username: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  bio?: string;
}) {
  const result = await query(`
    INSERT INTO users (
      email, username, password_hash, first_name, last_name, 
      display_name, bio, newsletter_token
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id, email, username, creative_circle, circle_points, created_at
  `, [
    userData.email,
    userData.username,
    userData.passwordHash,
    userData.firstName,
    userData.lastName,
    userData.displayName,
    userData.bio,
    generateNewsletterToken()
  ]);
  
  // Award welcome points
  await addCirclePoints(
    result.rows[0].id,
    10,
    'account_creation',
    'Welcome to Yeet! Account successfully created.'
  );
  
  return result.rows[0];
}

// Find user by email
export async function findUserByEmail(email: string) {
  const result = await query(`
    SELECT u.*, ccc.display_name as circle_name, ccc.color_code as circle_color
    FROM users u
    LEFT JOIN creative_circles_config ccc ON u.creative_circle = ccc.circle
    WHERE u.email = $1
  `, [email]);
  
  return result.rows[0];
}

// Find user by username
export async function findUserByUsername(username: string) {
  const result = await query(`
    SELECT u.*, ccc.display_name as circle_name, ccc.color_code as circle_color
    FROM users u
    LEFT JOIN creative_circles_config ccc ON u.creative_circle = ccc.circle
    WHERE u.username = $1
  `, [username]);
  
  return result.rows[0];
}

// Update user login information
export async function updateUserLogin(userId: string, ipAddress?: string) {
  await query(`
    UPDATE users 
    SET last_login = CURRENT_TIMESTAMP, login_count = login_count + 1
    WHERE id = $1
  `, [userId]);
  
  // Log the login activity
  await query(`
    INSERT INTO activity_logs (user_id, activity_type, ip_address)
    VALUES ($1, 'user_login', $2)
  `, [userId, ipAddress]);
}

// =============================================================================
// NEWSLETTER FUNCTIONS
// =============================================================================

// Subscribe to newsletter
export async function subscribeToNewsletter(
  email: string, 
  userId?: string, 
  source: string = 'website'
) {
  const subscriptionToken = generateNewsletterToken();
  
  const result = await query(`
    INSERT INTO newsletter_subscribers (email, user_id, subscription_token, source)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (email) DO UPDATE SET
      unsubscribed_at = NULL,
      subscription_token = $3,
      source = $4
    RETURNING id, email, subscribed_at
  `, [email, userId, subscriptionToken, source]);
  
  return result.rows[0];
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// Generate unique newsletter token
function generateNewsletterToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) +
         Date.now().toString(36);
}

// Health check for database
export async function healthCheck(): Promise<boolean> {
  try {
    const result = await query('SELECT 1 as health_check');
    return result.rows[0].health_check === 1;
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return false;
  }
}

// =============================================================================
// GRACEFUL SHUTDOWN
// =============================================================================

export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    console.log('✅ Database connections closed');
  }
}

process.on('SIGTERM', closeDatabase);
process.on('SIGINT', closeDatabase);
