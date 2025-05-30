// YEET BY YETHIKRISHNA R - AUTHENTICATION CONFIGURATION
// JWT and authentication system setup

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { query } from './database';

// =============================================================================
// JWT CONFIGURATION
// =============================================================================

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '15m';
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '7d';

export interface AuthTokenPayload {
  userId: string;
  email: string;
  username: string;
  creativeCircle: string;
  circlePoints: number;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
  terminalSession?: string;
}

// =============================================================================
// PASSWORD UTILITIES
// =============================================================================

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// =============================================================================
// JWT TOKEN UTILITIES
// =============================================================================

export function generateAccessToken(payload: Omit<AuthTokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
    issuer: 'yeet-platform',
    audience: 'yeet-users'
  });
}

export function generateRefreshToken(payload: Omit<AuthTokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRE,
    issuer: 'yeet-platform',
    audience: 'yeet-users'
  });
}

export function verifyAccessToken(token: string): AuthTokenPayload {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'yeet-platform',
      audience: 'yeet-users'
    }) as AuthTokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Access token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid access token');
    } else {
      throw new Error('Token verification failed');
    }
  }
}

export function verifyRefreshToken(token: string): AuthTokenPayload {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'yeet-platform',
      audience: 'yeet-users'
    }) as AuthTokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    } else {
      throw new Error('Refresh token verification failed');
    }
  }
}

// =============================================================================
// SESSION MANAGEMENT
// =============================================================================

export async function createUserSession(
  userId: string,
  sessionToken: string,
  terminalSessionId?: string,
  userAgent?: string,
  ipAddress?: string
): Promise<void> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  await query(`
    INSERT INTO user_sessions (
      user_id, session_token, terminal_session_id, user_agent, ip_address, expires_at
    ) VALUES ($1, $2, $3, $4, $5, $6)
  `, [userId, sessionToken, terminalSessionId, userAgent, ipAddress, expiresAt]);
}

export async function validateUserSession(sessionToken: string): Promise<boolean> {
  const result = await query(`
    SELECT id FROM user_sessions 
    WHERE session_token = $1 AND expires_at > CURRENT_TIMESTAMP
  `, [sessionToken]);
  
  if (result.rows.length > 0) {
    // Update last activity
    await query(`
      UPDATE user_sessions 
      SET last_activity = CURRENT_TIMESTAMP 
      WHERE session_token = $1
    `, [sessionToken]);
    
    return true;
  }
  
  return false;
}

export async function revokeUserSession(sessionToken: string): Promise<void> {
  await query(`
    DELETE FROM user_sessions WHERE session_token = $1
  `, [sessionToken]);
}

export async function revokeAllUserSessions(userId: string): Promise<void> {
  await query(`
    DELETE FROM user_sessions WHERE user_id = $1
  `, [userId]);
}

// =============================================================================
// AUTHENTICATION MIDDLEWARE
// =============================================================================

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No valid authorization token provided',
        code: 'NO_TOKEN'
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const payload = verifyAccessToken(token);
    
    // Attach user information to request
    req.user = payload;
    
    // Extract terminal session if provided
    const terminalSession = req.headers['x-terminal-session'] as string;
    if (terminalSession) {
      req.terminalSession = terminalSession;
    }
    
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Authentication failed',
      message: error instanceof Error ? error.message : 'Invalid token',
      code: 'INVALID_TOKEN'
    });
  }
}

// =============================================================================
// CREATIVE CIRCLES AUTHORIZATION
// =============================================================================

export interface CirclePermissions {
  canCreateChallenges: boolean;
  canMentor: boolean;
  canAccessPremium: boolean;
  canHostEvents: boolean;
  canModerate: boolean;
}

export function requireCircleLevel(minLevel: string) {
  const circleHierarchy = {
    'beginner': 1,
    'apprentice': 2,
    'artist': 3,
    'master': 4,
    'virtuoso': 5,
    'creator': 6
  };
  
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to access this resource'
      });
    }
    
    const userLevel = circleHierarchy[req.user.creativeCircle as keyof typeof circleHierarchy];
    const requiredLevel = circleHierarchy[minLevel as keyof typeof circleHierarchy];
    
    if (!userLevel || !requiredLevel || userLevel < requiredLevel) {
      return res.status(403).json({
        error: 'Insufficient circle level',
        message: `This feature requires ${minLevel} level or higher. Your current level: ${req.user.creativeCircle}`,
        requiredLevel: minLevel,
        currentLevel: req.user.creativeCircle
      });
    }
    
    next();
  };
}

export function requirePermission(permission: keyof CirclePermissions) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to access this resource'
      });
    }
    
    try {
      // Get user's circle permissions
      const result = await query(`
        SELECT permissions FROM creative_circles_config 
        WHERE circle = $1
      `, [req.user.creativeCircle]);
      
      if (result.rows.length === 0) {
        return res.status(500).json({
          error: 'Circle configuration error',
          message: 'Unable to verify permissions'
        });
      }
      
      const permissions = result.rows[0].permissions;
      const permissionKey = {
        canCreateChallenges: 'can_create_challenges',
        canMentor: 'can_mentor',
        canAccessPremium: 'can_access_premium',
        canHostEvents: 'can_host_events',
        canModerate: 'can_moderate'
      }[permission];
      
      if (!permissions[permissionKey]) {
        return res.status(403).json({
          error: 'Permission denied',
          message: `Your current Creative Circle (${req.user.creativeCircle}) does not have ${permission} permission`,
          requiredPermission: permission
        });
      }
      
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        error: 'Permission verification failed',
        message: 'Unable to verify permissions'
      });
    }
  };
}

// =============================================================================
// OPTIONAL AUTHENTICATION MIDDLEWARE
// =============================================================================

export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyAccessToken(token);
      req.user = payload;
    }
    
    // Always continue, whether authenticated or not
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
}

// =============================================================================
// SETUP FUNCTION
// =============================================================================

export async function setupAuthentication(app: any): Promise<void> {
  // Add authentication-related middleware or routes here if needed
  console.log('✅ Authentication system configured');
  console.log(`   • JWT Access Token Expiry: ${JWT_EXPIRE}`);
  console.log(`   • JWT Refresh Token Expiry: ${JWT_REFRESH_EXPIRE}`);
  console.log(`   • Password Hashing: bcrypt with 12 salt rounds`);
  console.log(`   • Session Management: Database-backed sessions`);
  console.log(`   • Creative Circles: 6-tier authorization system`);
}

// =============================================================================
// RATE LIMITING BY CIRCLE LEVEL
// =============================================================================

export function getCircleRateLimit(creativeCircle: string): number {
  const baseLimits = {
    'beginner': 50,
    'apprentice': 75,
    'artist': 100,
    'master': 150,
    'virtuoso': 200,
    'creator': 300
  };
  
  return baseLimits[creativeCircle as keyof typeof baseLimits] || 50;
}

// =============================================================================
// TOKEN REFRESH UTILITY
// =============================================================================

export async function refreshUserTokens(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
  user: AuthTokenPayload;
}> {
  try {
    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    
    // Get updated user data from database
    const result = await query(`
      SELECT id, email, username, creative_circle, circle_points
      FROM users WHERE id = $1 AND status = 'active'
    `, [payload.userId]);
    
    if (result.rows.length === 0) {
      throw new Error('User not found or inactive');
    }
    
    const userData = result.rows[0];
    const newPayload: Omit<AuthTokenPayload, 'iat' | 'exp'> = {
      userId: userData.id,
      email: userData.email,
      username: userData.username,
      creativeCircle: userData.creative_circle,
      circlePoints: userData.circle_points
    };
    
    return {
      accessToken: generateAccessToken(newPayload),
      refreshToken: generateRefreshToken(newPayload),
      user: newPayload
    };
  } catch (error) {
    throw new Error('Token refresh failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}
