// YEET BY YETHIKRISHNA R - ARTISTIC PORTFOLIO ROUTES
// Comprehensive portfolio management with terminal interface integration

import express, { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  requireAuth,
  requireCircleLevel,
  AuthenticatedRequest
} from '../config/auth';
import { query as dbQuery, addCirclePoints } from '../config/database';
import { 
  setCache, 
  getCache, 
  deleteCache,
  invalidateUserPortfolio 
} from '../config/redis';

const router = express.Router();

// =============================================================================
// ARTISTIC FILE UPLOAD CONFIGURATION
// =============================================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads/portfolio';
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const extension = path.extname(file.originalname);
    cb(null, `portfolio-${uniqueSuffix}${extension}`);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    // Images for visual art
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
    // Audio for music
    'audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/ogg', 'audio/flac', 'audio/aac',
    // Video for performances
    'video/mp4', 'video/webm', 'video/mov', 'video/avi',
    // Documents for writing
    'application/pdf', 'text/plain', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // Sheet music
    'application/vnd.recordare.musicxml+xml', 'text/xml'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`🚫 File type ${file.mimetype} not supported for artistic portfolio`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800'), // 50MB for artistic content
    files: 10 // Maximum 10 files per upload for comprehensive portfolios
  }
});

// =============================================================================
// PORTFOLIO VALIDATION WITH ARTISTIC CATEGORIES
// =============================================================================

const portfolioValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('🎯 Title is required and must be less than 255 characters'),
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('📝 Description must be less than 2000 characters'),
  body('portfolioType')
    .isIn(['carnatic_music', 'contemporary_music', 'creative_writing', 'poetry', 'visual_art', 'photography', 'performance', 'collaboration', 'mixed_media', 'research', 'education'])
    .withMessage('🎨 Portfolio type must be artistic: carnatic_music, contemporary_music, creative_writing, poetry, visual_art, photography, performance, collaboration, mixed_media, research, education'),
  body('artisticTags')
    .optional()
    .isArray()
    .withMessage('🏷️ Artistic tags must be an array'),
  body('artisticTags.*')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('🏷️ Each artistic tag must be 1-50 characters'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('🌍 isPublic must be a boolean'),
  body('collaborators')
    .optional()
    .isArray()
    .withMessage('🤝 Collaborators must be an array of user IDs'),
  body('performanceLocation')
    .optional()
    .isLength({ max: 255 })
    .withMessage('📍 Performance location must be less than 255 characters'),
  body('instruments')
    .optional()
    .isArray()
    .withMessage('🎼 Instruments must be an array'),
  body('genre')
    .optional()
    .isLength({ max: 100 })
    .withMessage('🎵 Genre must be less than 100 characters')
];

// =============================================================================
// GET ARTISTIC PORTFOLIO
// =============================================================================

router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: '🔒 Authentication required',
        terminalOutput: 'ERROR: Please login to access your artistic portfolio'
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const type = req.query.type as string;
    const isPublic = req.query.public === 'true';
    const offset = (page - 1) * limit;

    // Check cache first
    const cacheKey = `portfolio:${req.user.userId}:${page}:${limit}:${type || 'all'}:${isPublic}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json({
        ...cached,
        terminalOutput: `🎨 Retrieved ${cached.items.length} portfolio items from cache`
      });
    }

    // Build query for artistic content
    let whereClause = 'WHERE user_id = $1';
    const queryParams: any[] = [req.user.userId];
    let paramIndex = 2;

    if (type) {
      whereClause += ` AND portfolio_type = $${paramIndex}`;
      queryParams.push(type);
      paramIndex++;
    }

    if (isPublic !== undefined) {
      whereClause += ` AND is_public = $${paramIndex}`;
      queryParams.push(isPublic);
      paramIndex++;
    }

    // Get portfolio items with artistic metrics
    const portfolioQuery = `
      SELECT 
        p.*,
        COALESCE(
          json_agg(
            json_build_object(
              'type', pi.interaction_type,
              'count', pi.interaction_count
            )
          ) FILTER (WHERE pi.interaction_type IS NOT NULL), 
          '[]'
        ) as interactions,
        CASE 
          WHEN p.portfolio_type IN ('carnatic_music', 'contemporary_music') THEN '🎵'
          WHEN p.portfolio_type IN ('creative_writing', 'poetry') THEN '📚'
          WHEN p.portfolio_type IN ('visual_art', 'photography') THEN '🎨'
          WHEN p.portfolio_type = 'performance' THEN '🎭'
          ELSE '🌟'
        END as type_icon
      FROM portfolio_items p
      LEFT JOIN (
        SELECT 
          portfolio_item_id,
          interaction_type,
          COUNT(*) as interaction_count
        FROM portfolio_interactions
        GROUP BY portfolio_item_id, interaction_type
      ) pi ON p.id = pi.portfolio_item_id
      ${whereClause}
      GROUP BY p.id
      ORDER BY p.featured DESC, p.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);

    const portfolioResult = await dbQuery(portfolioQuery, queryParams);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM portfolio_items
      ${whereClause}
    `;

    const countResult = await dbQuery(countQuery, queryParams.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);

    // Get artistic stats
    const statsQuery = `
      SELECT 
        portfolio_type,
        COUNT(*) as count,
        SUM(like_count) as total_likes,
        SUM(view_count) as total_views
      FROM portfolio_items
      WHERE user_id = $1
      GROUP BY portfolio_type
    `;

    const statsResult = await dbQuery(statsQuery, [req.user.userId]);

    const response = {
      items: portfolioResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      stats: {
        totalItems: total,
        publicItems: portfolioResult.rows.filter((item: any) => item.is_public).length,
        privateItems: portfolioResult.rows.filter((item: any) => !item.is_public).length,
        byType: statsResult.rows.reduce((acc: any, row: any) => {
          acc[row.portfolio_type] = {
            count: parseInt(row.count),
            totalLikes: parseInt(row.total_likes) || 0,
            totalViews: parseInt(row.total_views) || 0
          };
          return acc;
        }, {})
      },
      terminalOutput: `🎨 Retrieved ${portfolioResult.rows.length} artistic works\n📊 Total portfolio: ${total} items\n🌟 Circle: ${req.user.creativeCircle}`
    };

    // Cache the response
    await setCache(cacheKey, response, 1800); // 30 minutes

    res.json(response);

  } catch (error) {
    console.error('Portfolio fetch error:', error);
    res.status(500).json({
      error: '❌ Portfolio fetch failed',
      terminalOutput: 'ERROR: Unable to retrieve artistic portfolio'
    });
  }
});

// =============================================================================
// CREATE ARTISTIC PORTFOLIO ITEM
// =============================================================================

router.post('/', [
  requireAuth,
  upload.array('files', 10),
  ...portfolioValidation
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: '⚠️ Validation failed',
        details: errors.array(),
        terminalOutput: `ERROR: Portfolio validation failed\n${errors.array().map(e => `- ${e.msg}`).join('\n')}`
      });
    }

    if (!req.user) {
      return res.status(401).json({
        error: '🔒 Authentication required',
        terminalOutput: 'ERROR: Please login to create portfolio items'
      });
    }

    const {
      title,
      description,
      portfolioType,
      artisticTags = [],
      isPublic = true,
      collaborators = [],
      performanceLocation,
      instruments = [],
      genre
    } = req.body;

    const files = req.files as Express.Multer.File[];
    const mediaUrls = files ? files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/uploads/portfolio/${file.filename}`,
      uploadedAt: new Date().toISOString()
    })) : [];

    // Check user's portfolio limit based on Creative Circle
    const circleInfo = await dbQuery(`
      SELECT features FROM creative_circles_config 
      WHERE circle = $1
    `, [req.user.creativeCircle]);

    const features = circleInfo.rows[0]?.features || {};
    const portfolioLimit = features.portfolio_unlimited ? null : (features.portfolio_limit || 5);

    if (portfolioLimit) {
      const existingCount = await dbQuery(`
        SELECT COUNT(*) as count FROM portfolio_items WHERE user_id = $1
      `, [req.user.userId]);

      if (parseInt(existingCount.rows[0].count) >= portfolioLimit) {
        return res.status(403).json({
          error: '📊 Portfolio limit reached',
          message: `Your ${req.user.creativeCircle} circle allows maximum ${portfolioLimit} portfolio items`,
          currentLimit: portfolioLimit,
          currentCount: parseInt(existingCount.rows[0].count),
          terminalOutput: `❌ LIMIT REACHED: ${req.user.creativeCircle} circle max: ${portfolioLimit} items\n💡 Upgrade your Creative Circle for more portfolio space!`
        });
      }
    }

    // Create artistic portfolio item
    const result = await dbQuery(`
      INSERT INTO portfolio_items (
        user_id, title, description, portfolio_type, media_urls, 
        tags, is_public, collaborators, performance_location, instruments, genre
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      req.user.userId,
      title,
      description,
      portfolioType,
      JSON.stringify(mediaUrls),
      artisticTags,
      isPublic,
      collaborators,
      performanceLocation,
      instruments,
      genre
    ]);

    const portfolioItem = result.rows[0];

    // Award points based on portfolio type and content quality
    let basePoints = 15;
    let bonusPoints = 0;
    let bonusReason = '';

    // Bonus for multimedia content
    if (mediaUrls.length > 1) {
      bonusPoints += 5;
      bonusReason += ' +5 multimedia';
    }

    // Bonus for collaborative work
    if (collaborators.length > 0) {
      bonusPoints += 10;
      bonusReason += ' +10 collaboration';
    }

    // Bonus for Carnatic music (reflecting Yethikrishna's background)
    if (portfolioType === 'carnatic_music') {
      bonusPoints += 5;
      bonusReason += ' +5 traditional arts';
    }

    const totalPoints = basePoints + bonusPoints;

    await addCirclePoints(
      req.user.userId,
      totalPoints,
      'portfolio_creation',
      `Created ${portfolioType} portfolio: ${title}`,
      { 
        portfolioType, 
        itemId: portfolioItem.id,
        mediaCount: mediaUrls.length,
        collaboratorCount: collaborators.length
      }
    );

    // Invalidate cache
    await invalidateUserPortfolio(req.user.userId);

    // Get portfolio type icon
    const getTypeIcon = (type: string) => {
      const icons: { [key: string]: string } = {
        'carnatic_music': '🎵 ॐ',
        'contemporary_music': '🎵',
        'creative_writing': '📚',
        'poetry': '📜',
        'visual_art': '🎨',
        'photography': '📸',
        'performance': '🎭',
        'collaboration': '🤝',
        'mixed_media': '🌈',
        'research': '🔬',
        'education': '🎓'
      };
      return icons[type] || '🌟';
    };

    res.status(201).json({
      message: '✅ Artistic portfolio item created successfully',
      portfolioItem,
      pointsAwarded: totalPoints,
      terminalOutput: `${getTypeIcon(portfolioType)} "${title}" added to portfolio!\n💎 +${totalPoints} points awarded${bonusReason}\n🎨 Files uploaded: ${mediaUrls.length}\n📊 Portfolio items: ${parseInt(result.rows[0].id ? '1' : '0')} total`
    });

  } catch (error) {
    console.error('Portfolio creation error:', error);
    res.status(500).json({
      error: '❌ Portfolio creation failed',
      terminalOutput: 'ERROR: Unable to create artistic portfolio item'
    });
  }
});

// =============================================================================
// GET PUBLIC ARTISTIC FEED
// =============================================================================

router.get('/feed/public', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const type = req.query.type as string;
    const circle = req.query.circle as string;
    const genre = req.query.genre as string;
    const offset = (page - 1) * limit;

    // Build query
    let whereClause = 'WHERE p.is_public = true';
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (type) {
      whereClause += ` AND p.portfolio_type = $${paramIndex}`;
      queryParams.push(type);
      paramIndex++;
    }

    if (circle) {
      whereClause += ` AND u.creative_circle = $${paramIndex}`;
      queryParams.push(circle);
      paramIndex++;
    }

    if (genre) {
      whereClause += ` AND p.genre ILIKE $${paramIndex}`;
      queryParams.push(`%${genre}%`);
      paramIndex++;
    }

    // Get public artistic feed
    const result = await dbQuery(`
      SELECT 
        p.*,
        u.username,
        u.display_name,
        u.creative_circle,
        u.avatar_url,
        CASE 
          WHEN p.portfolio_type IN ('carnatic_music', 'contemporary_music') THEN '🎵'
          WHEN p.portfolio_type IN ('creative_writing', 'poetry') THEN '📚'
          WHEN p.portfolio_type IN ('visual_art', 'photography') THEN '🎨'
          WHEN p.portfolio_type = 'performance' THEN '🎭'
          ELSE '🌟'
        END as type_icon,
        COALESCE(
          json_agg(
            json_build_object(
              'type', pi.interaction_type,
              'count', pi.interaction_count
            )
          ) FILTER (WHERE pi.interaction_type IS NOT NULL), 
          '[]'
        ) as interactions
      FROM portfolio_items p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN (
        SELECT 
          portfolio_item_id,
          interaction_type,
          COUNT(*) as interaction_count
        FROM portfolio_interactions
        GROUP BY portfolio_item_id, interaction_type
      ) pi ON p.id = pi.portfolio_item_id
      ${whereClause}
      GROUP BY p.id, u.username, u.display_name, u.creative_circle, u.avatar_url
      ORDER BY p.featured DESC, p.like_count DESC, p.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...queryParams, limit, offset]);

    // Get total count
    const countResult = await dbQuery(`
      SELECT COUNT(*) as total
      FROM portfolio_items p
      JOIN users u ON p.user_id = u.id
      ${whereClause}
    `, queryParams);

    const total = parseInt(countResult.rows[0].total);

    res.json({
      items: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      terminalOutput: `🌍 Public artistic feed: ${result.rows.length} works displayed\n🎨 Total available: ${total} artistic pieces`
    });

  } catch (error) {
    console.error('Public portfolio feed error:', error);
    res.status(500).json({
      error: '❌ Portfolio feed fetch failed',
      terminalOutput: 'ERROR: Unable to retrieve public artistic feed'
    });
  }
});

// =============================================================================
// LIKE ARTISTIC WORK
// =============================================================================

router.post('/:id/like', [
  requireAuth,
  param('id').isUUID().withMessage('Invalid portfolio item ID')
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
        terminalOutput: 'ERROR: Please login to interact with artistic works'
      });
    }

    const { id } = req.params;

    // Check if portfolio item exists and is public
    const itemCheck = await dbQuery(`
      SELECT user_id, is_public, title, portfolio_type FROM portfolio_items WHERE id = $1
    `, [id]);

    if (itemCheck.rows.length === 0) {
      return res.status(404).json({
        error: '🔍 Portfolio item not found',
        terminalOutput: 'ERROR: Artistic work not found'
      });
    }

    const item = itemCheck.rows[0];
    if (!item.is_public && item.user_id !== req.user.userId) {
      return res.status(403).json({
        error: '🔒 Access denied',
        terminalOutput: 'ERROR: Cannot interact with private artistic works'
      });
    }

    // Check if already liked
    const existingLike = await dbQuery(`
      SELECT id FROM portfolio_interactions 
      WHERE portfolio_item_id = $1 AND user_id = $2 AND interaction_type = 'like'
    `, [id, req.user.userId]);

    let action: string;
    let pointsChange = 0;

    const getTypeIcon = (type: string) => {
      const icons: { [key: string]: string } = {
        'carnatic_music': '🎵',
        'contemporary_music': '🎵',
        'creative_writing': '📚',
        'poetry': '📜',
        'visual_art': '🎨',
        'photography': '📸',
        'performance': '🎭'
      };
      return icons[type] || '🌟';
    };

    if (existingLike.rows.length > 0) {
      // Unlike
      await dbQuery(`
        DELETE FROM portfolio_interactions 
        WHERE portfolio_item_id = $1 AND user_id = $2 AND interaction_type = 'like'
      `, [id, req.user.userId]);

      await dbQuery(`
        UPDATE portfolio_items 
        SET like_count = GREATEST(0, like_count - 1)
        WHERE id = $1
      `, [id]);

      action = 'unliked';
    } else {
      // Like
      await dbQuery(`
        INSERT INTO portfolio_interactions (portfolio_item_id, user_id, interaction_type)
        VALUES ($1, $2, 'like')
      `, [id, req.user.userId]);

      await dbQuery(`
        UPDATE portfolio_items 
        SET like_count = like_count + 1
        WHERE id = $1
      `, [id]);

      // Award points to portfolio owner (if not self-like)
      if (item.user_id !== req.user.userId) {
        await addCirclePoints(
          item.user_id,
          3,
          'portfolio_liked',
          `Artistic work "${item.title}" received appreciation`,
          { itemId: id, likedBy: req.user.userId, portfolioType: item.portfolio_type }
        );
        pointsChange = 3;
      }

      action = 'liked';
    }

    res.json({
      message: `Artistic work ${action} successfully`,
      action,
      pointsAwarded: pointsChange,
      terminalOutput: action === 'liked' 
        ? `❤️ ${getTypeIcon(item.portfolio_type)} Appreciated "${item.title}"${pointsChange > 0 ? '\n💎 Artist earned +3 points for appreciation!' : ''}`
        : `💔 Removed appreciation for "${item.title}"`
    });

  } catch (error) {
    console.error('Portfolio like error:', error);
    res.status(500).json({
      error: '❌ Like operation failed',
      terminalOutput: 'ERROR: Unable to process appreciation'
    });
  }
});

export default router;
