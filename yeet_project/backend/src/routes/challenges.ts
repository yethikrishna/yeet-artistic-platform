// YEET BY YETHIKRISHNA R - ARTISTIC CHALLENGES & RESIDENCIES
// Creative challenges, competitions, and residency listings system

import express, { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import {
  requireAuth,
  requireCircleLevel,
  AuthenticatedRequest
} from '../config/auth';
import { query as dbQuery, addCirclePoints } from '../config/database';
import { setCache, getCache, deleteCache } from '../config/redis';

const router = express.Router();

// =============================================================================
// CHALLENGE VALIDATION
// =============================================================================

const challengeValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('🎯 Challenge title is required and must be less than 255 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('📝 Challenge description must be 10-2000 characters'),
  body('challengeType')
    .isIn(['carnatic_composition', 'contemporary_music', 'poetry_slam', 'short_story', 'visual_art', 'photography', 'performance', 'collaboration', 'mixed_media', 'residency_application'])
    .withMessage('🎨 Challenge type must be artistic: carnatic_composition, contemporary_music, poetry_slam, short_story, visual_art, photography, performance, collaboration, mixed_media, residency_application'),
  body('difficulty')
    .isIn(['beginner', 'intermediate', 'advanced', 'master'])
    .withMessage('⭐ Difficulty must be: beginner, intermediate, advanced, master'),
  body('startDate')
    .isISO8601()
    .withMessage('📅 Start date must be valid ISO date'),
  body('endDate')
    .isISO8601()
    .withMessage('📅 End date must be valid ISO date'),
  body('minCircleLevel')
    .isIn(['beginner', 'apprentice', 'artist', 'master', 'virtuoso', 'creator'])
    .withMessage('🎯 Minimum circle level must be valid Creative Circle level'),
  body('maxParticipants')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('👥 Max participants must be 1-1000'),
  body('prizeDescription')
    .optional()
    .isLength({ max: 500 })
    .withMessage('🏆 Prize description must be less than 500 characters'),
  body('prizePoints')
    .optional()
    .isInt({ min: 0, max: 1000 })
    .withMessage('💎 Prize points must be 0-1000'),
  body('rules')
    .optional()
    .isArray()
    .withMessage('📋 Rules must be an array of strings'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('🏷️ Tags must be an array'),
  body('collaborationAllowed')
    .optional()
    .isBoolean()
    .withMessage('🤝 Collaboration allowed must be boolean'),
  body('submissionGuidelines')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('📋 Submission guidelines must be less than 1000 characters')
];

// =============================================================================
// GET ARTISTIC CHALLENGES
// =============================================================================

router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const type = req.query.type as string;
    const difficulty = req.query.difficulty as string;
    const status = req.query.status as string || 'active';
    const circle = req.user?.creativeCircle;
    const offset = (page - 1) * limit;

    // Check cache
    const cacheKey = `challenges:${status}:${type || 'all'}:${difficulty || 'all'}:${circle || 'all'}:${page}:${limit}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json({
        ...cached,
        terminalOutput: `🎯 Retrieved ${cached.challenges.length} artistic challenges from cache`
      });
    }

    // Build query
    let whereClause = 'WHERE 1=1';
    const queryParams: any[] = [];
    let paramIndex = 1;

    // Filter by status
    if (status === 'active') {
      whereClause += ` AND start_date <= CURRENT_TIMESTAMP AND end_date >= CURRENT_TIMESTAMP AND challenge_status = 'active'`;
    } else if (status === 'upcoming') {
      whereClause += ` AND start_date > CURRENT_TIMESTAMP AND challenge_status = 'active'`;
    } else if (status === 'completed') {
      whereClause += ` AND end_date < CURRENT_TIMESTAMP OR challenge_status = 'completed'`;
    }

    if (type) {
      whereClause += ` AND challenge_type = $${paramIndex}`;
      queryParams.push(type);
      paramIndex++;
    }

    if (difficulty) {
      whereClause += ` AND difficulty = $${paramIndex}`;
      queryParams.push(difficulty);
      paramIndex++;
    }

    // Filter by user's circle level access
    if (circle) {
      const circleOrder = ['beginner', 'apprentice', 'artist', 'master', 'virtuoso', 'creator'];
      const userCircleIndex = circleOrder.indexOf(circle);
      
      if (userCircleIndex >= 0) {
        const accessibleCircles = circleOrder.slice(0, userCircleIndex + 1);
        whereClause += ` AND min_circle_level = ANY($${paramIndex})`;
        queryParams.push(accessibleCircles);
        paramIndex++;
      }
    }

    // Get challenges with participation stats
    const challengesQuery = `
      SELECT 
        c.*,
        u.username as creator_username,
        u.display_name as creator_name,
        u.creative_circle as creator_circle,
        COALESCE(COUNT(DISTINCT cs.user_id), 0) as participant_count,
        COALESCE(COUNT(DISTINCT cs.user_id) FILTER (WHERE cs.submission_status = 'submitted'), 0) as submission_count,
        CASE 
          WHEN c.challenge_type IN ('carnatic_composition', 'contemporary_music') THEN '🎵'
          WHEN c.challenge_type IN ('poetry_slam', 'short_story') THEN '📚'
          WHEN c.challenge_type IN ('visual_art', 'photography') THEN '🎨'
          WHEN c.challenge_type = 'performance' THEN '🎭'
          WHEN c.challenge_type = 'residency_application' THEN '🏛️'
          ELSE '🌟'
        END as type_icon,
        CASE 
          WHEN c.start_date > CURRENT_TIMESTAMP THEN 'upcoming'
          WHEN c.end_date < CURRENT_TIMESTAMP OR c.challenge_status = 'completed' THEN 'completed'
          ELSE 'active'
        END as current_status,
        EXTRACT(DAYS FROM (c.end_date - CURRENT_TIMESTAMP)) as days_remaining
      FROM challenges c
      JOIN users u ON c.created_by = u.id
      LEFT JOIN challenge_submissions cs ON c.id = cs.challenge_id
      ${whereClause}
      GROUP BY c.id, u.username, u.display_name, u.creative_circle
      ORDER BY 
        CASE WHEN c.start_date <= CURRENT_TIMESTAMP AND c.end_date >= CURRENT_TIMESTAMP THEN 0 ELSE 1 END,
        c.featured DESC,
        c.start_date ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);

    const challengesResult = await dbQuery(challengesQuery, queryParams);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM challenges c
      ${whereClause}
    `;

    const countResult = await dbQuery(countQuery, queryParams.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);

    // Get challenge stats
    const statsQuery = `
      SELECT 
        challenge_type,
        COUNT(*) as total_challenges,
        COUNT(*) FILTER (WHERE start_date <= CURRENT_TIMESTAMP AND end_date >= CURRENT_TIMESTAMP) as active_challenges
      FROM challenges
      GROUP BY challenge_type
    `;

    const statsResult = await dbQuery(statsQuery, []);

    const response = {
      challenges: challengesResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      stats: {
        total: total,
        byType: statsResult.rows.reduce((acc: any, row: any) => {
          acc[row.challenge_type] = {
            total: parseInt(row.total_challenges),
            active: parseInt(row.active_challenges)
          };
          return acc;
        }, {})
      },
      terminalOutput: `🎯 Found ${challengesResult.rows.length} artistic challenges\n📊 Status: ${status}\n🎨 Total available: ${total}\n⭐ Your level: ${circle || 'guest'}`
    };

    // Cache the response
    await setCache(cacheKey, response, 1200); // 20 minutes

    res.json(response);

  } catch (error) {
    console.error('Challenges fetch error:', error);
    res.status(500).json({
      error: '❌ Challenges fetch failed',
      terminalOutput: 'ERROR: Unable to retrieve artistic challenges'
    });
  }
});

// =============================================================================
// GET SINGLE CHALLENGE
// =============================================================================

router.get('/:id', [
  param('id').isUUID().withMessage('Invalid challenge ID')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: '⚠️ Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;

    const result = await dbQuery(`
      SELECT 
        c.*,
        u.username as creator_username,
        u.display_name as creator_name,
        u.creative_circle as creator_circle,
        u.avatar_url as creator_avatar,
        COALESCE(COUNT(DISTINCT cs.user_id), 0) as participant_count,
        COALESCE(COUNT(DISTINCT cs.user_id) FILTER (WHERE cs.submission_status = 'submitted'), 0) as submission_count,
        CASE 
          WHEN c.challenge_type IN ('carnatic_composition', 'contemporary_music') THEN '🎵'
          WHEN c.challenge_type IN ('poetry_slam', 'short_story') THEN '📚'
          WHEN c.challenge_type IN ('visual_art', 'photography') THEN '🎨'
          WHEN c.challenge_type = 'performance' THEN '🎭'
          WHEN c.challenge_type = 'residency_application' THEN '🏛️'
          ELSE '🌟'
        END as type_icon,
        CASE 
          WHEN c.start_date > CURRENT_TIMESTAMP THEN 'upcoming'
          WHEN c.end_date < CURRENT_TIMESTAMP OR c.challenge_status = 'completed' THEN 'completed'
          ELSE 'active'
        END as current_status,
        EXTRACT(DAYS FROM (c.end_date - CURRENT_TIMESTAMP)) as days_remaining,
        EXTRACT(HOURS FROM (c.end_date - CURRENT_TIMESTAMP)) as hours_remaining
      FROM challenges c
      JOIN users u ON c.created_by = u.id
      LEFT JOIN challenge_submissions cs ON c.id = cs.challenge_id
      WHERE c.id = $1
      GROUP BY c.id, u.username, u.display_name, u.creative_circle, u.avatar_url
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: '🔍 Challenge not found',
        terminalOutput: 'ERROR: Artistic challenge not found'
      });
    }

    const challenge = result.rows[0];

    // Check if user can access this challenge
    if (req.user) {
      const circleOrder = ['beginner', 'apprentice', 'artist', 'master', 'virtuoso', 'creator'];
      const userCircleIndex = circleOrder.indexOf(req.user.creativeCircle);
      const requiredCircleIndex = circleOrder.indexOf(challenge.min_circle_level);

      if (userCircleIndex < requiredCircleIndex) {
        return res.status(403).json({
          error: '🔒 Circle level insufficient',
          message: `This challenge requires ${challenge.min_circle_level} level or higher`,
          userLevel: req.user.creativeCircle,
          requiredLevel: challenge.min_circle_level,
          terminalOutput: `❌ ACCESS DENIED: Requires ${challenge.min_circle_level} circle\n💡 Your level: ${req.user.creativeCircle}\n🎯 Keep creating to advance your circle!`
        });
      }

      // Check if user has already joined
      const participation = await dbQuery(`
        SELECT submission_status, submitted_at, portfolio_item_id
        FROM challenge_submissions
        WHERE challenge_id = $1 AND user_id = $2
      `, [id, req.user.userId]);

      challenge.userParticipation = participation.rows[0] || null;
    }

    // Get recent submissions (public ones)
    const recentSubmissions = await dbQuery(`
      SELECT 
        cs.id,
        cs.submission_status,
        cs.submitted_at,
        u.username,
        u.display_name,
        u.creative_circle,
        u.avatar_url,
        p.title as portfolio_title,
        p.portfolio_type,
        p.like_count,
        p.view_count
      FROM challenge_submissions cs
      JOIN users u ON cs.user_id = u.id
      LEFT JOIN portfolio_items p ON cs.portfolio_item_id = p.id
      WHERE cs.challenge_id = $1 AND cs.submission_status = 'submitted' AND (p.is_public = true OR p.is_public IS NULL)
      ORDER BY cs.submitted_at DESC
      LIMIT 10
    `, [id]);

    challenge.recentSubmissions = recentSubmissions.rows;

    res.json({
      challenge,
      terminalOutput: `${challenge.type_icon} "${challenge.title}"\n📊 Status: ${challenge.current_status}\n👥 Participants: ${challenge.participant_count}\n📝 Submissions: ${challenge.submission_count}\n⏰ Days remaining: ${Math.max(0, Math.floor(challenge.days_remaining || 0))}`
    });

  } catch (error) {
    console.error('Challenge fetch error:', error);
    res.status(500).json({
      error: '❌ Challenge fetch failed',
      terminalOutput: 'ERROR: Unable to retrieve challenge details'
    });
  }
});

// =============================================================================
// CREATE ARTISTIC CHALLENGE (Requires Master level or higher)
// =============================================================================

router.post('/', [
  requireAuth,
  requireCircleLevel('master'),
  ...challengeValidation
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: '⚠️ Validation failed',
        details: errors.array(),
        terminalOutput: `ERROR: Challenge validation failed\n${errors.array().map(e => `- ${e.msg}`).join('\n')}`
      });
    }

    if (!req.user) {
      return res.status(401).json({
        error: '🔒 Authentication required',
        terminalOutput: 'ERROR: Please login to create challenges'
      });
    }

    const {
      title,
      description,
      challengeType,
      difficulty,
      startDate,
      endDate,
      minCircleLevel,
      maxParticipants,
      prizeDescription,
      prizePoints = 0,
      rules = [],
      tags = [],
      collaborationAllowed = false,
      submissionGuidelines
    } = req.body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start <= now) {
      return res.status(400).json({
        error: '📅 Invalid start date',
        message: 'Challenge start date must be in the future',
        terminalOutput: 'ERROR: Start date must be in the future'
      });
    }

    if (end <= start) {
      return res.status(400).json({
        error: '📅 Invalid end date',
        message: 'Challenge end date must be after start date',
        terminalOutput: 'ERROR: End date must be after start date'
      });
    }

    // Create challenge
    const result = await dbQuery(`
      INSERT INTO challenges (
        created_by, title, description, challenge_type, difficulty,
        start_date, end_date, min_circle_level, max_participants,
        prize_description, prize_points, rules, tags, collaboration_allowed,
        submission_guidelines, challenge_status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'active')
      RETURNING *
    `, [
      req.user.userId,
      title,
      description,
      challengeType,
      difficulty,
      start,
      end,
      minCircleLevel,
      maxParticipants,
      prizeDescription,
      prizePoints,
      rules,
      tags,
      collaborationAllowed,
      submissionGuidelines
    ]);

    const challenge = result.rows[0];

    // Award points for creating challenge
    await addCirclePoints(
      req.user.userId,
      25,
      'challenge_creation',
      `Created artistic challenge: ${title}`,
      { 
        challengeType, 
        challengeId: challenge.id,
        difficulty,
        prizePoints 
      }
    );

    // Get challenge type icon
    const getTypeIcon = (type: string) => {
      const icons: { [key: string]: string } = {
        'carnatic_composition': '🎵 ॐ',
        'contemporary_music': '🎵',
        'poetry_slam': '📜',
        'short_story': '📚',
        'visual_art': '🎨',
        'photography': '📸',
        'performance': '🎭',
        'collaboration': '🤝',
        'mixed_media': '🌈',
        'residency_application': '🏛️'
      };
      return icons[type] || '🌟';
    };

    res.status(201).json({
      message: '✅ Artistic challenge created successfully',
      challenge,
      pointsAwarded: 25,
      terminalOutput: `${getTypeIcon(challengeType)} Challenge "${title}" created!\n💎 +25 points for community leadership\n🎯 Difficulty: ${difficulty}\n👥 Min level: ${minCircleLevel}\n📅 Duration: ${Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))} days`
    });

  } catch (error) {
    console.error('Challenge creation error:', error);
    res.status(500).json({
      error: '❌ Challenge creation failed',
      terminalOutput: 'ERROR: Unable to create artistic challenge'
    });
  }
});

// =============================================================================
// JOIN CHALLENGE
// =============================================================================

router.post('/:id/join', [
  requireAuth,
  param('id').isUUID().withMessage('Invalid challenge ID')
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
        terminalOutput: 'ERROR: Please login to join challenges'
      });
    }

    const { id } = req.params;

    // Get challenge details
    const challengeResult = await dbQuery(`
      SELECT 
        title, challenge_type, min_circle_level, max_participants,
        start_date, end_date, challenge_status,
        COALESCE(COUNT(DISTINCT cs.user_id), 0) as current_participants
      FROM challenges c
      LEFT JOIN challenge_submissions cs ON c.id = cs.challenge_id
      WHERE c.id = $1
      GROUP BY c.id, c.title, c.challenge_type, c.min_circle_level, c.max_participants, c.start_date, c.end_date, c.challenge_status
    `, [id]);

    if (challengeResult.rows.length === 0) {
      return res.status(404).json({
        error: '🔍 Challenge not found',
        terminalOutput: 'ERROR: Artistic challenge not found'
      });
    }

    const challenge = challengeResult.rows[0];

    // Check challenge status
    if (challenge.challenge_status !== 'active') {
      return res.status(400).json({
        error: '🚫 Challenge not active',
        message: 'This challenge is no longer accepting participants',
        terminalOutput: 'ERROR: Challenge is not currently active'
      });
    }

    // Check timing
    const now = new Date();
    const startDate = new Date(challenge.start_date);
    const endDate = new Date(challenge.end_date);

    if (now > endDate) {
      return res.status(400).json({
        error: '⏰ Challenge ended',
        message: 'This challenge has already ended',
        terminalOutput: 'ERROR: Challenge submission period has ended'
      });
    }

    // Check circle level access
    const circleOrder = ['beginner', 'apprentice', 'artist', 'master', 'virtuoso', 'creator'];
    const userCircleIndex = circleOrder.indexOf(req.user.creativeCircle);
    const requiredCircleIndex = circleOrder.indexOf(challenge.min_circle_level);

    if (userCircleIndex < requiredCircleIndex) {
      return res.status(403).json({
        error: '🔒 Circle level insufficient',
        message: `This challenge requires ${challenge.min_circle_level} level or higher`,
        userLevel: req.user.creativeCircle,
        requiredLevel: challenge.min_circle_level,
        terminalOutput: `❌ ACCESS DENIED: Requires ${challenge.min_circle_level} circle\n💡 Your level: ${req.user.creativeCircle}`
      });
    }

    // Check participant limit
    if (challenge.max_participants && parseInt(challenge.current_participants) >= challenge.max_participants) {
      return res.status(400).json({
        error: '👥 Challenge full',
        message: 'This challenge has reached its participant limit',
        terminalOutput: `ERROR: Challenge full (${challenge.max_participants} participants)`
      });
    }

    // Check if already joined
    const existingParticipation = await dbQuery(`
      SELECT id FROM challenge_submissions
      WHERE challenge_id = $1 AND user_id = $2
    `, [id, req.user.userId]);

    if (existingParticipation.rows.length > 0) {
      return res.status(400).json({
        error: '✅ Already joined',
        message: 'You have already joined this challenge',
        terminalOutput: 'INFO: You are already participating in this challenge'
      });
    }

    // Join challenge
    await dbQuery(`
      INSERT INTO challenge_submissions (challenge_id, user_id, submission_status)
      VALUES ($1, $2, 'joined')
    `, [id, req.user.userId]);

    // Award points for joining
    await addCirclePoints(
      req.user.userId,
      5,
      'challenge_joined',
      `Joined artistic challenge: ${challenge.title}`,
      { challengeId: id, challengeType: challenge.challenge_type }
    );

    const getTypeIcon = (type: string) => {
      const icons: { [key: string]: string } = {
        'carnatic_composition': '🎵 ॐ',
        'contemporary_music': '🎵',
        'poetry_slam': '📜',
        'short_story': '📚',
        'visual_art': '🎨',
        'photography': '📸',
        'performance': '🎭',
        'residency_application': '🏛️'
      };
      return icons[type] || '🌟';
    };

    res.json({
      message: '🎉 Successfully joined artistic challenge',
      pointsAwarded: 5,
      terminalOutput: `${getTypeIcon(challenge.challenge_type)} Joined "${challenge.title}"!\n💎 +5 points for participation\n🎯 Good luck with your artistic creation!\n⏰ Deadline: ${endDate.toLocaleDateString()}`
    });

  } catch (error) {
    console.error('Challenge join error:', error);
    res.status(500).json({
      error: '❌ Challenge join failed',
      terminalOutput: 'ERROR: Unable to join artistic challenge'
    });
  }
});

// =============================================================================
// SUBMIT TO CHALLENGE
// =============================================================================

router.post('/:id/submit', [
  requireAuth,
  param('id').isUUID().withMessage('Invalid challenge ID'),
  body('portfolioItemId')
    .isUUID()
    .withMessage('Portfolio item ID must be valid UUID'),
  body('submissionNote')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Submission note must be less than 500 characters')
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
        terminalOutput: 'ERROR: Please login to submit to challenges'
      });
    }

    const { id } = req.params;
    const { portfolioItemId, submissionNote } = req.body;

    // Check if user has joined this challenge
    const participationResult = await dbQuery(`
      SELECT cs.id, cs.submission_status, c.title, c.challenge_type, c.end_date, c.challenge_status
      FROM challenge_submissions cs
      JOIN challenges c ON cs.challenge_id = c.id
      WHERE cs.challenge_id = $1 AND cs.user_id = $2
    `, [id, req.user.userId]);

    if (participationResult.rows.length === 0) {
      return res.status(400).json({
        error: '🚫 Not participating',
        message: 'You must join the challenge before submitting',
        terminalOutput: 'ERROR: Please join the challenge first using the /join command'
      });
    }

    const participation = participationResult.rows[0];

    // Check timing
    const endDate = new Date(participation.end_date);
    const now = new Date();

    if (now > endDate) {
      return res.status(400).json({
        error: '⏰ Submission deadline passed',
        message: 'The submission deadline for this challenge has passed',
        terminalOutput: `ERROR: Submission deadline was ${endDate.toLocaleDateString()}`
      });
    }

    // Check challenge status
    if (participation.challenge_status !== 'active') {
      return res.status(400).json({
        error: '🚫 Challenge not active',
        message: 'This challenge is no longer accepting submissions',
        terminalOutput: 'ERROR: Challenge is not currently accepting submissions'
      });
    }

    // Verify portfolio item ownership and appropriateness
    const portfolioResult = await dbQuery(`
      SELECT title, portfolio_type, is_public
      FROM portfolio_items
      WHERE id = $1 AND user_id = $2
    `, [portfolioItemId, req.user.userId]);

    if (portfolioResult.rows.length === 0) {
      return res.status(404).json({
        error: '🔍 Portfolio item not found',
        message: 'Portfolio item not found or you do not own it',
        terminalOutput: 'ERROR: Portfolio item not found or not owned by you'
      });
    }

    const portfolioItem = portfolioResult.rows[0];

    // Update submission
    await dbQuery(`
      UPDATE challenge_submissions
      SET 
        portfolio_item_id = $1,
        submission_status = 'submitted',
        submitted_at = CURRENT_TIMESTAMP,
        submission_note = $2
      WHERE id = $3
    `, [portfolioItemId, submissionNote, participation.id]);

    // Award points for submission
    await addCirclePoints(
      req.user.userId,
      15,
      'challenge_submission',
      `Submitted to challenge: ${participation.title}`,
      { 
        challengeId: id, 
        portfolioItemId,
        challengeType: participation.challenge_type 
      }
    );

    const getTypeIcon = (type: string) => {
      const icons: { [key: string]: string } = {
        'carnatic_composition': '🎵 ॐ',
        'contemporary_music': '🎵',
        'poetry_slam': '📜',
        'short_story': '📚',
        'visual_art': '🎨',
        'photography': '📸',
        'performance': '🎭'
      };
      return icons[type] || '🌟';
    };

    res.json({
      message: '🎉 Submission successful',
      pointsAwarded: 15,
      terminalOutput: `${getTypeIcon(participation.challenge_type)} Submitted "${portfolioItem.title}" to "${participation.title}"!\n💎 +15 points for creative submission\n🎯 Good luck in the challenge!\n🌟 Your work is now part of the competition`
    });

  } catch (error) {
    console.error('Challenge submission error:', error);
    res.status(500).json({
      error: '❌ Submission failed',
      terminalOutput: 'ERROR: Unable to submit to artistic challenge'
    });
  }
});

// =============================================================================
// GET RESIDENCY OPPORTUNITIES
// =============================================================================

router.get('/residencies', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const location = req.query.location as string;
    const type = req.query.type as string;
    const offset = (page - 1) * limit;

    // Build query for residency opportunities
    let whereClause = `WHERE challenge_type = 'residency_application' AND challenge_status = 'active'`;
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (location) {
      whereClause += ` AND (location ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      queryParams.push(`%${location}%`);
      paramIndex++;
    }

    if (type) {
      whereClause += ` AND tags && ARRAY[$${paramIndex}]`;
      queryParams.push(type);
      paramIndex++;
    }

    const residenciesQuery = `
      SELECT 
        c.*,
        u.username as organizer_username,
        u.display_name as organizer_name,
        COALESCE(COUNT(DISTINCT cs.user_id), 0) as applicant_count,
        EXTRACT(DAYS FROM (c.end_date - CURRENT_TIMESTAMP)) as days_remaining
      FROM challenges c
      JOIN users u ON c.created_by = u.id
      LEFT JOIN challenge_submissions cs ON c.id = cs.challenge_id
      ${whereClause}
      GROUP BY c.id, u.username, u.display_name
      ORDER BY c.featured DESC, c.start_date ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);

    const result = await dbQuery(residenciesQuery, queryParams);

    res.json({
      residencies: result.rows,
      pagination: {
        page,
        limit,
        total: result.rows.length,
        hasNext: result.rows.length === limit,
        hasPrev: page > 1
      },
      terminalOutput: `🏛️ Found ${result.rows.length} artistic residency opportunities\n🌍 Apply to expand your creative horizons`
    });

  } catch (error) {
    console.error('Residencies fetch error:', error);
    res.status(500).json({
      error: '❌ Residencies fetch failed',
      terminalOutput: 'ERROR: Unable to retrieve residency opportunities'
    });
  }
});

export default router;
