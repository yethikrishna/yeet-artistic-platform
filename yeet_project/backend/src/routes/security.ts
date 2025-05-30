// YEET BY YETHIKRISHNA R - ENHANCED SECURITY ROUTES
// Multi-factor authentication, blockchain integration, artistic puzzles, and premium content

import express, { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { requireAuth, requireCircleLevel, AuthenticatedRequest } from '../config/auth';
import { query as dbQuery, addCirclePoints } from '../config/database';
import SecurityService from '../config/security';
import crypto from 'crypto';

const router = express.Router();

// =============================================================================
// MULTI-FACTOR AUTHENTICATION ENDPOINTS
// =============================================================================

/**
 * Setup TOTP (Time-based One-Time Password) for user
 */
router.post('/mfa/totp/setup', [
  requireAuth
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: '🔒 Authentication required',
        terminalOutput: 'ERROR: Please login to set up two-factor authentication'
      });
    }

    const { secret, qrCodeUrl, backupCodes } = await SecurityService.generateTOTPSecret(
      req.user.userId,
      req.user.email
    );

    res.json({
      message: '✅ TOTP setup initialized',
      qrCodeUrl,
      backupCodes,
      terminalOutput: `🔐 Two-Factor Authentication setup started\n📱 Scan QR code with authenticator app\n🔑 Save backup codes securely\n⚠️  Keep these codes safe - they can only be shown once!`
    });

  } catch (error) {
    console.error('TOTP setup error:', error);
    res.status(500).json({
      error: '❌ TOTP setup failed',
      terminalOutput: 'ERROR: Failed to initialize two-factor authentication'
    });
  }
});

/**
 * Enable TOTP after successful verification
 */
router.post('/mfa/totp/enable', [
  requireAuth,
  body('token').isLength({ min: 6, max: 8 }).withMessage('TOTP token must be 6-8 digits')
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: '⚠️ Invalid token format',
        details: errors.array(),
        terminalOutput: 'ERROR: Please provide a valid 6-digit authenticator code'
      });
    }

    if (!req.user) {
      return res.status(401).json({
        error: '🔒 Authentication required',
        terminalOutput: 'ERROR: Please login to enable two-factor authentication'
      });
    }

    const { token } = req.body;
    const isValid = await SecurityService.enableTOTP(req.user.userId, token);

    if (isValid) {
      res.json({
        message: '✅ Two-Factor Authentication enabled successfully',
        terminalOutput: `🔐 Two-Factor Authentication is now ACTIVE\n🛡️ Your account security has been enhanced\n💎 +25 security points awarded\n📱 You'll need your authenticator app for future logins`
      });
    } else {
      res.status(400).json({
        error: '❌ Invalid verification code',
        terminalOutput: 'ERROR: Authenticator code is incorrect or expired\nTry generating a new code from your app'
      });
    }

  } catch (error) {
    console.error('TOTP enable error:', error);
    res.status(500).json({
      error: '❌ TOTP enable failed',
      terminalOutput: 'ERROR: Failed to enable two-factor authentication'
    });
  }
});

/**
 * Verify TOTP during login
 */
router.post('/mfa/totp/verify', [
  body('userId').isUUID().withMessage('Valid user ID required'),
  body('token').isLength({ min: 6, max: 8 }).withMessage('TOTP token must be 6-8 digits')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: '⚠️ Validation failed',
        details: errors.array()
      });
    }

    const { userId, token } = req.body;
    const isValid = await SecurityService.verifyTOTP(userId, token);

    if (isValid) {
      res.json({
        message: '✅ Two-factor authentication verified',
        verified: true,
        terminalOutput: '🔐 Two-factor authentication verified successfully'
      });
    } else {
      res.status(400).json({
        error: '❌ Invalid authenticator code',
        verified: false,
        terminalOutput: 'ERROR: Authenticator code is incorrect or expired'
      });
    }

  } catch (error) {
    console.error('TOTP verify error:', error);
    res.status(500).json({
      error: '❌ TOTP verification failed',
      verified: false,
      terminalOutput: 'ERROR: Two-factor authentication verification failed'
    });
  }
});

/**
 * Send SMS verification code
 */
router.post('/mfa/sms/send', [
  requireAuth,
  body('phoneNumber').isMobilePhone().withMessage('Valid phone number required')
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: '⚠️ Invalid phone number',
        details: errors.array(),
        terminalOutput: 'ERROR: Please provide a valid phone number'
      });
    }

    if (!req.user) {
      return res.status(401).json({
        error: '🔒 Authentication required',
        terminalOutput: 'ERROR: Please login to set up SMS verification'
      });
    }

    const { phoneNumber } = req.body;
    const challengeId = await SecurityService.generateSMSCode(req.user.userId, phoneNumber);

    res.json({
      message: '📱 SMS verification code sent',
      challengeId,
      terminalOutput: `📱 SMS code sent to ${phoneNumber.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}\n⏰ Code expires in 10 minutes\n🔢 Enter the 6-digit code to verify`
    });

  } catch (error) {
    console.error('SMS send error:', error);
    res.status(500).json({
      error: '❌ SMS send failed',
      terminalOutput: 'ERROR: Failed to send SMS verification code'
    });
  }
});

/**
 * Verify SMS code
 */
router.post('/mfa/sms/verify', [
  body('challengeId').isUUID().withMessage('Valid challenge ID required'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('SMS code must be 6 digits')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: '⚠️ Validation failed',
        details: errors.array()
      });
    }

    const { challengeId, code } = req.body;
    const isValid = await SecurityService.verifySMSCode(challengeId, code);

    if (isValid) {
      res.json({
        message: '✅ SMS verification successful',
        verified: true,
        terminalOutput: '📱 SMS verification completed successfully'
      });
    } else {
      res.status(400).json({
        error: '❌ Invalid SMS code',
        verified: false,
        terminalOutput: 'ERROR: SMS code is incorrect, expired, or too many attempts'
      });
    }

  } catch (error) {
    console.error('SMS verify error:', error);
    res.status(500).json({
      error: '❌ SMS verification failed',
      verified: false,
      terminalOutput: 'ERROR: SMS verification failed'
    });
  }
});

/**
 * Verify backup code
 */
router.post('/mfa/backup/verify', [
  requireAuth,
  body('code').isLength({ min: 8, max: 8 }).withMessage('Backup code must be 8 characters')
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: '⚠️ Invalid backup code format',
        details: errors.array(),
        terminalOutput: 'ERROR: Backup code must be 8 characters'
      });
    }

    if (!req.user) {
      return res.status(401).json({
        error: '🔒 Authentication required',
        terminalOutput: 'ERROR: Please login to use backup code'
      });
    }

    const { code } = req.body;
    const isValid = await SecurityService.verifyBackupCode(req.user.userId, code.toUpperCase());

    if (isValid) {
      res.json({
        message: '✅ Backup code verified',
        verified: true,
        terminalOutput: '🔑 Backup code verified successfully\n⚠️  This code has been used and is no longer valid\n🔐 Consider regenerating backup codes for security'
      });
    } else {
      res.status(400).json({
        error: '❌ Invalid backup code',
        verified: false,
        terminalOutput: 'ERROR: Backup code is invalid or already used'
      });
    }

  } catch (error) {
    console.error('Backup code verify error:', error);
    res.status(500).json({
      error: '❌ Backup code verification failed',
      verified: false,
      terminalOutput: 'ERROR: Backup code verification failed'
    });
  }
});

// =============================================================================
// BLOCKCHAIN WALLET INTEGRATION
// =============================================================================

/**
 * Connect blockchain wallet to user account
 */
router.post('/blockchain/connect-wallet', [
  requireAuth,
  body('walletAddress').isEthereumAddress().withMessage('Valid Ethereum address required'),
  body('signature').isLength({ min: 1 }).withMessage('Wallet signature required'),
  body('chainId').isInt({ min: 1 }).withMessage('Valid chain ID required')
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: '⚠️ Validation failed',
        details: errors.array(),
        terminalOutput: 'ERROR: Invalid wallet connection data'
      });
    }

    if (!req.user) {
      return res.status(401).json({
        error: '🔒 Authentication required',
        terminalOutput: 'ERROR: Please login to connect wallet'
      });
    }

    const { walletAddress, signature, chainId } = req.body;

    const success = await SecurityService.connectWallet(
      req.user.userId,
      walletAddress,
      signature,
      chainId
    );

    if (success) {
      res.json({
        message: '✅ Blockchain wallet connected successfully',
        walletAddress: walletAddress.toLowerCase(),
        chainId,
        terminalOutput: `🔗 Wallet connected successfully!\n💎 Address: ${walletAddress}\n⛓️  Chain ID: ${chainId}\n💰 +50 blockchain integration points awarded\n🚀 Premium features now available!`
      });
    } else {
      res.status(400).json({
        error: '❌ Wallet verification failed',
        terminalOutput: 'ERROR: Failed to verify wallet signature\nPlease ensure you signed the correct message'
      });
    }

  } catch (error) {
    console.error('Wallet connection error:', error);
    res.status(500).json({
      error: '❌ Wallet connection failed',
      terminalOutput: 'ERROR: Failed to connect blockchain wallet'
    });
  }
});

/**
 * Check user's premium access level
 */
router.get('/blockchain/premium-access', [requireAuth], async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: '🔒 Authentication required',
        terminalOutput: 'ERROR: Please login to check premium access'
      });
    }

    const contentType = req.query.contentType as string || 'general';
    const accessLevel = req.query.accessLevel as string || 'premium';

    const hasAccess = await SecurityService.checkPremiumAccess(
      req.user.userId,
      contentType,
      accessLevel
    );

    // Get user's connected wallets
    const walletsResult = await dbQuery(`
      SELECT wallet_address, chain_id, premium_token_balance, is_verified
      FROM user_wallets
      WHERE user_id = $1 AND is_verified = true
    `, [req.user.userId]);

    // Get user's premium tokens
    const tokensResult = await dbQuery(`
      SELECT access_level, content_types, expires_at, created_at
      FROM premium_access_tokens
      WHERE user_id = $1 AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
    `, [req.user.userId]);

    res.json({
      hasAccess,
      accessLevel,
      contentType,
      userCircle: req.user.creativeCircle,
      connectedWallets: walletsResult.rows,
      premiumTokens: tokensResult.rows,
      terminalOutput: `🔍 Premium Access Check:\n🎯 Content: ${contentType}\n📊 Level: ${accessLevel}\n✅ Access: ${hasAccess ? 'GRANTED' : 'DENIED'}\n🌟 Your Circle: ${req.user.creativeCircle}\n💰 Wallets: ${walletsResult.rows.length} connected`
    });

  } catch (error) {
    console.error('Premium access check error:', error);
    res.status(500).json({
      error: '❌ Premium access check failed',
      terminalOutput: 'ERROR: Failed to check premium access'
    });
  }
});

/**
 * Mint premium access token (for special events, purchases)
 */
router.post('/blockchain/mint-token', [
  requireAuth,
  requireCircleLevel('master'),
  body('targetUserId').isUUID().withMessage('Valid target user ID required'),
  body('accessLevel').isIn(['basic', 'premium', 'exclusive', 'creator']).withMessage('Valid access level required'),
  body('contentTypes').isArray().withMessage('Content types array required')
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: '⚠️ Validation failed',
        details: errors.array(),
        terminalOutput: 'ERROR: Invalid token minting parameters'
      });
    }

    if (!req.user) {
      return res.status(401).json({
        error: '🔒 Authentication required',
        terminalOutput: 'ERROR: Please login to mint premium tokens'
      });
    }

    const { targetUserId, accessLevel, contentTypes, expiresAt, metadata = {} } = req.body;

    const tokenId = await SecurityService.mintPremiumToken(
      targetUserId,
      accessLevel,
      contentTypes,
      expiresAt ? new Date(expiresAt) : undefined,
      { ...metadata, mintedBy: req.user.userId, mintedAt: new Date() }
    );

    res.json({
      message: '✅ Premium access token minted successfully',
      tokenId,
      accessLevel,
      contentTypes,
      terminalOutput: `🪙 Premium token minted successfully!\n🎯 Token ID: ${tokenId}\n📊 Access Level: ${accessLevel}\n🎨 Content Types: ${contentTypes.join(', ')}\n⏰ Expires: ${expiresAt || 'Never'}`
    });

  } catch (error) {
    console.error('Token minting error:', error);
    res.status(500).json({
      error: '❌ Token minting failed',
      terminalOutput: 'ERROR: Failed to mint premium access token'
    });
  }
});

// =============================================================================
// ARTISTIC PUZZLE CHALLENGES
// =============================================================================

/**
 * Get available artistic puzzles for user
 */
router.get('/puzzles', [requireAuth], async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: '🔒 Authentication required',
        terminalOutput: 'ERROR: Please login to access artistic puzzles'
      });
    }

    const type = req.query.type as string;
    const difficulty = req.query.difficulty as string;
    const circleOrder = ['beginner', 'apprentice', 'artist', 'master', 'virtuoso', 'creator'];
    const userCircleIndex = circleOrder.indexOf(req.user.creativeCircle);

    let whereClause = 'WHERE active = true';
    const queryParams: any[] = [];
    let paramIndex = 1;

    // Filter by user's circle access
    const accessibleCircles = circleOrder.slice(0, userCircleIndex + 1);
    whereClause += ` AND required_circle = ANY($${paramIndex})`;
    queryParams.push(accessibleCircles);
    paramIndex++;

    if (type) {
      whereClause += ` AND puzzle_type = $${paramIndex}`;
      queryParams.push(type);
      paramIndex++;
    }

    if (difficulty) {
      whereClause += ` AND difficulty = $${paramIndex}`;
      queryParams.push(difficulty);
      paramIndex++;
    }

    const puzzlesResult = await dbQuery(`
      SELECT 
        puzzle_id, puzzle_type, difficulty, required_circle,
        challenge_data, hints, time_limit, cultural_context,
        educational_value, inspiration_source, tags, featured
      FROM artistic_puzzles
      ${whereClause}
      ORDER BY featured DESC, difficulty ASC, created_at DESC
      LIMIT 20
    `, queryParams);

    // Get user's puzzle attempts
    const attemptsResult = await dbQuery(`
      SELECT puzzle_id, is_correct, points_awarded, created_at
      FROM puzzle_attempts
      WHERE user_id = $1
    `, [req.user.userId]);

    const userAttempts = attemptsResult.rows.reduce((acc: any, attempt: any) => {
      acc[attempt.puzzle_id] = attempt;
      return acc;
    }, {});

    const puzzles = puzzlesResult.rows.map(puzzle => ({
      ...puzzle,
      userAttempt: userAttempts[puzzle.puzzle_id] || null,
      typeIcon: getPuzzleTypeIcon(puzzle.puzzle_type)
    }));

    res.json({
      puzzles,
      userCircle: req.user.creativeCircle,
      availableCount: puzzles.length,
      terminalOutput: `🧩 Found ${puzzles.length} artistic puzzles\n🎨 Types: Carnatic, Quantum, Rhythm, Literary\n⭐ Your level: ${req.user.creativeCircle}\n🔓 Accessible puzzles loaded`
    });

  } catch (error) {
    console.error('Puzzles fetch error:', error);
    res.status(500).json({
      error: '❌ Puzzles fetch failed',
      terminalOutput: 'ERROR: Failed to load artistic puzzles'
    });
  }
});

/**
 * Generate new artistic puzzle
 */
router.post('/puzzles/generate', [
  requireAuth,
  body('type').isIn(['carnatic_sequence', 'quantum_cipher', 'rhythm_pattern', 'literary_code']).withMessage('Valid puzzle type required'),
  body('difficulty').isIn(['novice', 'apprentice', 'virtuoso', 'master']).withMessage('Valid difficulty required')
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: '⚠️ Validation failed',
        details: errors.array(),
        terminalOutput: 'ERROR: Invalid puzzle generation parameters'
      });
    }

    if (!req.user) {
      return res.status(401).json({
        error: '🔒 Authentication required',
        terminalOutput: 'ERROR: Please login to generate puzzles'
      });
    }

    const { type, difficulty } = req.body;

    // Check if user can access this difficulty level
    const circleOrder = ['beginner', 'apprentice', 'artist', 'master', 'virtuoso', 'creator'];
    const difficultyToCircle = {
      'novice': 'beginner',
      'apprentice': 'apprentice', 
      'virtuoso': 'artist',
      'master': 'master'
    };

    const requiredCircle = difficultyToCircle[difficulty as keyof typeof difficultyToCircle];
    const userCircleIndex = circleOrder.indexOf(req.user.creativeCircle);
    const requiredIndex = circleOrder.indexOf(requiredCircle);

    if (userCircleIndex < requiredIndex) {
      return res.status(403).json({
        error: '🔒 Insufficient circle level',
        message: `${difficulty} puzzles require ${requiredCircle} level or higher`,
        terminalOutput: `❌ ACCESS DENIED: ${difficulty} puzzles require ${requiredCircle} level\n💡 Your level: ${req.user.creativeCircle}\n🎯 Keep creating to advance your circle!`
      });
    }

    let puzzle;
    switch (type) {
      case 'carnatic_sequence':
        puzzle = SecurityService.generateCarnaticPuzzle(difficulty);
        break;
      case 'quantum_cipher':
        puzzle = SecurityService.generateQuantumCipher(difficulty);
        break;
      case 'rhythm_pattern':
        puzzle = SecurityService.generateRhythmPuzzle(difficulty);
        break;
      default:
        return res.status(400).json({
          error: '❌ Unsupported puzzle type',
          terminalOutput: 'ERROR: Puzzle type not implemented'
        });
    }

    // Store puzzle in database
    await dbQuery(`
      INSERT INTO artistic_puzzles (
        puzzle_id, puzzle_type, difficulty, required_circle,
        challenge_data, solution_hash, hints, time_limit,
        cultural_context, educational_value, inspiration_source, tags
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `, [
      puzzle.puzzleId,
      puzzle.type,
      puzzle.difficulty,
      requiredCircle,
      puzzle.challenge,
      crypto.createHash('sha256').update(puzzle.solution).digest('hex'),
      puzzle.hints,
      puzzle.timeLimit,
      puzzle.metadata.culturalContext || '',
      puzzle.metadata.educationalValue || '',
      puzzle.metadata.inspirationSource || '',
      puzzle.metadata.tags || []
    ]);

    res.json({
      puzzleId: puzzle.puzzleId,
      type: puzzle.type,
      difficulty: puzzle.difficulty,
      challenge: puzzle.challenge,
      hints: puzzle.hints,
      timeLimit: puzzle.timeLimit,
      typeIcon: getPuzzleTypeIcon(puzzle.type),
      terminalOutput: `🧩 New ${difficulty} ${type.replace('_', ' ')} puzzle generated!\n⏰ Time limit: ${puzzle.timeLimit} seconds\n💡 Hints available: ${puzzle.hints.length}\n🎯 Good luck solving this artistic challenge!`
    });

  } catch (error) {
    console.error('Puzzle generation error:', error);
    res.status(500).json({
      error: '❌ Puzzle generation failed',
      terminalOutput: 'ERROR: Failed to generate artistic puzzle'
    });
  }
});

/**
 * Submit solution to artistic puzzle
 */
router.post('/puzzles/:puzzleId/solve', [
  requireAuth,
  param('puzzleId').isUUID().withMessage('Valid puzzle ID required'),
  body('solution').isLength({ min: 1 }).withMessage('Solution required')
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: '⚠️ Validation failed',
        details: errors.array(),
        terminalOutput: 'ERROR: Invalid puzzle solution submission'
      });
    }

    if (!req.user) {
      return res.status(401).json({
        error: '🔒 Authentication required',
        terminalOutput: 'ERROR: Please login to submit puzzle solutions'
      });
    }

    const { puzzleId } = req.params;
    const { solution } = req.body;

    const result = await SecurityService.verifyArtisticPuzzle(puzzleId, solution, req.user.userId);

    if (result.success) {
      res.json({
        message: '🎉 Puzzle solved successfully!',
        success: true,
        pointsAwarded: result.pointsAwarded,
        feedback: result.feedback,
        terminalOutput: `${result.feedback}\n💎 +${result.pointsAwarded} points awarded\n🧩 Puzzle completed successfully!\n🎨 Your artistic understanding is growing`
      });
    } else {
      res.status(400).json({
        error: '❌ Incorrect solution',
        success: false,
        feedback: result.feedback,
        terminalOutput: `${result.feedback}\n🤔 Keep exploring the artistic principles\n💡 Consider the cultural context and hints`
      });
    }

  } catch (error) {
    console.error('Puzzle solve error:', error);
    res.status(500).json({
      error: '❌ Puzzle solving failed',
      success: false,
      terminalOutput: 'ERROR: Failed to submit puzzle solution'
    });
  }
});

// =============================================================================
// PREMIUM CONTENT ACCESS
// =============================================================================

/**
 * Request access to encrypted premium content
 */
router.get('/premium/content/:contentId', [
  requireAuth,
  param('contentId').isUUID().withMessage('Valid content ID required')
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: '⚠️ Validation failed',
        details: errors.array()
      });
    }

    if (!req.user) {
      return res.status(401).json({
        error: '🔒 Authentication required',
        terminalOutput: 'ERROR: Please login to access premium content'
      });
    }

    const { contentId } = req.params;

    const result = await SecurityService.decryptPremiumContent(contentId, req.user.userId);

    if (result.success && result.content) {
      // Log successful access
      await dbQuery(`
        INSERT INTO content_access_log (
          content_id, user_id, access_type, access_granted, access_method
        )
        VALUES ($1, $2, 'decrypt', true, 'circle_level')
      `, [contentId, req.user.userId]);

      // Return content (in production, you might stream this or provide a secure download link)
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="premium-content-${contentId}"`);
      res.send(result.content);

    } else {
      // Log denied access
      await dbQuery(`
        INSERT INTO content_access_log (
          content_id, user_id, access_type, access_granted, denial_reason
        )
        VALUES ($1, $2, 'decrypt', false, $3)
      `, [contentId, req.user.userId, result.error]);

      res.status(403).json({
        error: '🔒 Access denied',
        reason: result.error,
        terminalOutput: `❌ ACCESS DENIED: ${result.error}\n💡 Upgrade your Creative Circle or acquire premium tokens\n🎯 Check /security/blockchain/premium-access for details`
      });
    }

  } catch (error) {
    console.error('Premium content access error:', error);
    res.status(500).json({
      error: '❌ Content access failed',
      terminalOutput: 'ERROR: Failed to access premium content'
    });
  }
});

/**
 * List available premium content for user
 */
router.get('/premium/content', [requireAuth], async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: '🔒 Authentication required',
        terminalOutput: 'ERROR: Please login to view premium content'
      });
    }

    const contentType = req.query.contentType as string;
    const category = req.query.category as string;
    
    let whereClause = 'WHERE active = true';
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (contentType) {
      whereClause += ` AND content_type = $${paramIndex}`;
      queryParams.push(contentType);
      paramIndex++;
    }

    if (category) {
      whereClause += ` AND content_category = $${paramIndex}`;
      queryParams.push(category);
      paramIndex++;
    }

    const contentResult = await dbQuery(`
      SELECT 
        content_id, content_type, content_category, title, description,
        access_level, required_circle, artistic_tags, cultural_significance,
        educational_level, is_public, featured
      FROM encrypted_content
      ${whereClause}
      ORDER BY featured DESC, created_at DESC
      LIMIT 50
    `, queryParams);

    // Check access for each content item
    const contentWithAccess = await Promise.all(
      contentResult.rows.map(async (content: any) => {
        const hasAccess = await SecurityService.checkPremiumAccess(
          req.user!.userId,
          content.content_type,
          content.access_level
        );

        return {
          ...content,
          hasAccess,
          accessMethod: hasAccess ? 'circle_level' : 'upgrade_required'
        };
      })
    );

    const accessibleCount = contentWithAccess.filter(c => c.hasAccess).length;
    const totalCount = contentWithAccess.length;

    res.json({
      content: contentWithAccess,
      stats: {
        total: totalCount,
        accessible: accessibleCount,
        restricted: totalCount - accessibleCount
      },
      userCircle: req.user.creativeCircle,
      terminalOutput: `🎨 Premium Content Library\n📊 Total items: ${totalCount}\n✅ Accessible: ${accessibleCount}\n🔒 Restricted: ${totalCount - accessibleCount}\n⭐ Your level: ${req.user.creativeCircle}`
    });

  } catch (error) {
    console.error('Premium content list error:', error);
    res.status(500).json({
      error: '❌ Content listing failed',
      terminalOutput: 'ERROR: Failed to list premium content'
    });
  }
});

// =============================================================================
// SECURITY STATUS AND MONITORING
// =============================================================================

/**
 * Get user security status
 */
router.get('/status', [requireAuth], async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: '🔒 Authentication required',
        terminalOutput: 'ERROR: Please login to check security status'
      });
    }

    // Get MFA status
    const mfaResult = await dbQuery(`
      SELECT totp_enabled, sms_enabled, biometric_enabled, last_used_method
      FROM user_mfa_config
      WHERE user_id = $1
    `, [req.user.userId]);

    // Get connected wallets
    const walletsResult = await dbQuery(`
      SELECT COUNT(*) as wallet_count
      FROM user_wallets
      WHERE user_id = $1 AND is_verified = true
    `, [req.user.userId]);

    // Get security events (recent)
    const eventsResult = await dbQuery(`
      SELECT event_type, success, created_at
      FROM security_events
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 10
    `, [req.user.userId]);

    // Get puzzle solving stats
    const puzzleResult = await dbQuery(`
      SELECT 
        COUNT(*) as total_attempts,
        COUNT(*) FILTER (WHERE is_correct = true) as successful_solves,
        SUM(points_awarded) as total_points
      FROM puzzle_attempts
      WHERE user_id = $1
    `, [req.user.userId]);

    const mfaConfig = mfaResult.rows[0] || {
      totp_enabled: false,
      sms_enabled: false,
      biometric_enabled: false,
      last_used_method: null
    };

    const securityScore = calculateSecurityScore(
      mfaConfig,
      parseInt(walletsResult.rows[0].wallet_count),
      parseInt(puzzleResult.rows[0].successful_solves || '0')
    );

    res.json({
      securityScore,
      mfa: mfaConfig,
      walletCount: parseInt(walletsResult.rows[0].wallet_count),
      recentEvents: eventsResult.rows,
      puzzleStats: puzzleResult.rows[0],
      recommendations: generateSecurityRecommendations(mfaConfig, securityScore),
      terminalOutput: `🛡️ Security Status Report\n📊 Security Score: ${securityScore}/100\n🔐 2FA: ${mfaConfig.totp_enabled ? 'ENABLED' : 'DISABLED'}\n💰 Wallets: ${walletsResult.rows[0].wallet_count} connected\n🧩 Puzzles solved: ${puzzleResult.rows[0].successful_solves || 0}`
    });

  } catch (error) {
    console.error('Security status error:', error);
    res.status(500).json({
      error: '❌ Security status check failed',
      terminalOutput: 'ERROR: Failed to get security status'
    });
  }
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getPuzzleTypeIcon(type: string): string {
  const icons: { [key: string]: string } = {
    'carnatic_sequence': '🎵 ॐ',
    'quantum_cipher': '🔮',
    'rhythm_pattern': '🥁',
    'literary_code': '📚',
    'shooting_precision': '🎯',
    'collaborative_harmony': '🤝'
  };
  return icons[type] || '🧩';
}

function calculateSecurityScore(mfaConfig: any, walletCount: number, puzzlesSolved: number): number {
  let score = 20; // Base score for account creation

  // MFA bonuses
  if (mfaConfig.totp_enabled) score += 30;
  if (mfaConfig.sms_enabled) score += 15;
  if (mfaConfig.biometric_enabled) score += 20;

  // Blockchain integration bonus
  if (walletCount > 0) score += 10;
  if (walletCount > 1) score += 5;

  // Artistic engagement bonus
  score += Math.min(puzzlesSolved * 2, 20);

  return Math.min(score, 100);
}

function generateSecurityRecommendations(mfaConfig: any, securityScore: number): string[] {
  const recommendations: string[] = [];

  if (!mfaConfig.totp_enabled) {
    recommendations.push('🔐 Enable Two-Factor Authentication for enhanced security');
  }

  if (securityScore < 50) {
    recommendations.push('🛡️ Consider connecting a blockchain wallet for premium features');
  }

  if (securityScore < 80) {
    recommendations.push('🧩 Solve artistic puzzles to improve your security understanding');
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ Your security configuration is excellent!');
  }

  return recommendations;
}

export default router;
