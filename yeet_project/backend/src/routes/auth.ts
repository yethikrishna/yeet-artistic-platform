// YEET BY YETHIKRISHNA R - AUTHENTICATION ROUTES
// User authentication and Creative Circles management

import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  requireAuth,
  refreshUserTokens,
  AuthenticatedRequest,
  createUserSession,
  revokeUserSession,
  revokeAllUserSessions
} from '../config/auth';
import {
  createUser,
  findUserByEmail,
  findUserByUsername,
  updateUserLogin,
  addCirclePoints
} from '../config/database';
import { subscribeToNewsletter } from '../config/database';

const router = express.Router();

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('username')
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, number, and special character'),
  body('firstName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be 1-50 characters'),
  body('lastName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be 1-50 characters'),
  body('displayName')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Display name must be 1-100 characters'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
  body('artisticDisciplines')
    .optional()
    .isArray()
    .withMessage('Artistic disciplines must be an array'),
  body('subscribeNewsletter')
    .optional()
    .isBoolean()
    .withMessage('Newsletter subscription must be a boolean')
];

const loginValidation = [
  body('emailOrUsername')
    .notEmpty()
    .withMessage('Email or username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const refreshValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
];

// =============================================================================
// REGISTRATION ENDPOINT
// =============================================================================

router.post('/register', registerValidation, async (req: Request, res: Response) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Please check your input and try again',
        details: errors.array()
      });
    }

    const {
      email,
      username,
      password,
      firstName,
      lastName,
      displayName,
      bio,
      artisticDisciplines,
      subscribeNewsletter = true
    } = req.body;

    // Check if user already exists
    const existingEmail = await findUserByEmail(email);
    if (existingEmail) {
      return res.status(409).json({
        error: 'Email already registered',
        message: 'An account with this email address already exists'
      });
    }

    const existingUsername = await findUserByUsername(username);
    if (existingUsername) {
      return res.status(409).json({
        error: 'Username already taken',
        message: 'This username is already in use. Please choose another one'
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const userData = {
      email,
      username,
      passwordHash,
      firstName,
      lastName,
      displayName: displayName || `${firstName || ''} ${lastName || ''}`.trim() || username,
      bio
    };

    const newUser = await createUser(userData);

    // Subscribe to newsletter if requested
    if (subscribeNewsletter) {
      try {
        await subscribeToNewsletter(email, newUser.id, 'registration');
      } catch (error) {
        console.error('Newsletter subscription failed during registration:', error);
        // Don't fail registration if newsletter subscription fails
      }
    }

    // Generate tokens
    const tokenPayload = {
      userId: newUser.id,
      email: newUser.email,
      username: newUser.username,
      creativeCircle: newUser.creative_circle,
      circlePoints: newUser.circle_points
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Create session
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.connection.remoteAddress;
    await createUserSession(newUser.id, refreshToken, undefined, userAgent, ipAddress);

    // Award registration points
    await addCirclePoints(
      newUser.id,
      25,
      'account_setup',
      'Completed account registration and profile setup'
    );

    res.status(201).json({
      message: 'Account created successfully! Welcome to the Yeet creative community.',
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        displayName: userData.displayName,
        creativeCircle: newUser.creative_circle,
        circlePoints: newUser.circle_points + 25, // Include registration bonus
        newsletterSubscribed: subscribeNewsletter
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: '15m'
      },
      welcomeMessage: {
        title: 'Welcome to Your Creative Journey!',
        message: 'You\'ve joined the Yeet artistic community. Start by exploring challenges, building your portfolio, and connecting with fellow creators.',
        nextSteps: [
          'Complete your profile with artistic disciplines',
          'Upload your first portfolio item',
          'Join your first creative challenge',
          'Explore the terminal interface with /help'
        ]
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'An unexpected error occurred during registration. Please try again.'
    });
  }
});

// =============================================================================
// LOGIN ENDPOINT
// =============================================================================

router.post('/login', loginValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { emailOrUsername, password } = req.body;

    // Find user by email or username
    let user = await findUserByEmail(emailOrUsername);
    if (!user) {
      user = await findUserByUsername(emailOrUsername);
    }

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'No account found with those credentials'
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({
        error: 'Account inactive',
        message: 'Your account is not active. Please contact support if this is unexpected.'
      });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Incorrect password'
      });
    }

    // Update login information
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.connection.remoteAddress;
    await updateUserLogin(user.id, ipAddress);

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
      creativeCircle: user.creative_circle,
      circlePoints: user.circle_points
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Create session
    await createUserSession(user.id, refreshToken, undefined, userAgent, ipAddress);

    // Award login points (once per day)
    const lastLogin = user.last_login ? new Date(user.last_login) : null;
    const today = new Date();
    const isFirstLoginToday = !lastLogin || 
      lastLogin.toDateString() !== today.toDateString();

    if (isFirstLoginToday) {
      await addCirclePoints(
        user.id,
        5,
        'daily_login',
        'Daily platform engagement'
      );
    }

    res.json({
      message: `Welcome back, ${user.display_name || user.username}!`,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.display_name,
        firstName: user.first_name,
        lastName: user.last_name,
        bio: user.bio,
        creativeCircle: user.creative_circle,
        circleName: user.circle_name,
        circleColor: user.circle_color,
        circlePoints: user.circle_points + (isFirstLoginToday ? 5 : 0),
        avatarUrl: user.avatar_url,
        artisticDisciplines: user.artistic_disciplines,
        socialLinks: user.social_links,
        newsletterSubscribed: user.newsletter_subscribed,
        loginCount: user.login_count + 1,
        lastLogin: user.last_login
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: '15m'
      },
      terminalWelcome: {
        message: `Welcome to Yeet Terminal, ${user.username}`,
        circle: `Current Circle: ${user.circle_name} (${user.circle_points} points)`,
        commands: ['/help', '/portfolio', '/challenges', '/compose', '/collaborate']
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'An unexpected error occurred during login. Please try again.'
    });
  }
});

// =============================================================================
// TOKEN REFRESH ENDPOINT
// =============================================================================

router.post('/refresh', refreshValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { refreshToken } = req.body;

    try {
      const tokens = await refreshUserTokens(refreshToken);
      
      res.json({
        message: 'Tokens refreshed successfully',
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: '15m'
        },
        user: tokens.user
      });
    } catch (error) {
      return res.status(401).json({
        error: 'Token refresh failed',
        message: error instanceof Error ? error.message : 'Invalid refresh token'
      });
    }

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Token refresh failed',
      message: 'An unexpected error occurred during token refresh'
    });
  }
});

// =============================================================================
// LOGOUT ENDPOINT
// =============================================================================

router.post('/logout', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      // Revoke the current session
      try {
        await revokeUserSession(token);
      } catch (error) {
        console.error('Session revocation error:', error);
        // Continue with logout even if session revocation fails
      }
    }

    res.json({
      message: 'Logged out successfully',
      terminalMessage: 'Terminal session ended. Thank you for creating with Yeet!'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: 'An unexpected error occurred during logout'
    });
  }
});

// =============================================================================
// LOGOUT ALL SESSIONS ENDPOINT
// =============================================================================

router.post('/logout-all', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User information not found'
      });
    }

    // Revoke all user sessions
    await revokeAllUserSessions(req.user.userId);

    res.json({
      message: 'All sessions terminated successfully',
      note: 'You have been logged out from all devices and browsers'
    });

  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({
      error: 'Logout all failed',
      message: 'An unexpected error occurred while terminating sessions'
    });
  }
});

// =============================================================================
// USER PROFILE ENDPOINT
// =============================================================================

router.get('/profile', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User information not found'
      });
    }

    // Get updated user information
    const user = await findUserByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User account no longer exists'
      });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.display_name,
        firstName: user.first_name,
        lastName: user.last_name,
        bio: user.bio,
        creativeCircle: user.creative_circle,
        circleName: user.circle_name,
        circleColor: user.circle_color,
        circlePoints: user.circle_points,
        avatarUrl: user.avatar_url,
        portfolioUrl: user.portfolio_url,
        artisticDisciplines: user.artistic_disciplines,
        socialLinks: user.social_links,
        newsletterSubscribed: user.newsletter_subscribed,
        emailVerified: user.email_verified,
        twoFactorEnabled: user.two_factor_enabled,
        status: user.status,
        createdAt: user.created_at,
        lastLogin: user.last_login,
        loginCount: user.login_count
      },
      circleProgress: {
        current: user.circle_points,
        nextLevel: user.circle_name,
        // Add logic for next level requirements
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      error: 'Profile fetch failed',
      message: 'Unable to retrieve user profile'
    });
  }
});

// =============================================================================
// PASSWORD RESET REQUEST
// =============================================================================

router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email } = req.body;

    // Always return success for security (don't reveal if email exists)
    res.json({
      message: 'If an account with that email exists, password reset instructions have been sent.',
      note: 'Please check your email and follow the instructions to reset your password.'
    });

    // TODO: Implement actual password reset email sending
    // This would involve generating a secure token, storing it in the database,
    // and sending an email with reset instructions

  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      error: 'Password reset request failed',
      message: 'Unable to process password reset request'
    });
  }
});

// =============================================================================
// EMAIL VERIFICATION
// =============================================================================

router.post('/verify-email', [
  body('token').notEmpty().withMessage('Verification token is required')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    // TODO: Implement email verification logic
    res.json({
      message: 'Email verification feature coming soon',
      note: 'This feature will be implemented in a future update'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      error: 'Email verification failed',
      message: 'Unable to verify email address'
    });
  }
});

export default router;
