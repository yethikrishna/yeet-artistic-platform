// YEET BY YETHIKRISHNA R - GAMIFICATION ROUTES
// ART KEYS system, real-time elements, easter eggs, and progressive engagement rewards

import express, { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { requireAuth, requireCircleLevel, AuthenticatedRequest } from '../config/auth';
import { query as dbQuery, addCirclePoints } from '../config/database';
import GamificationService from '../config/gamification';

const router = express.Router();

// =============================================================================
// ART KEYS ENDPOINTS
// =============================================================================

/**
 * Get user's ART KEYS collection and progress
 */
router.get('/art-keys', [requireAuth], async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: '🔒 Authentication required',
        terminalOutput: 'ERROR: Please login to view your ART KEYS collection'
      });
    }

    // Get user's ART KEYS progress
    const progress = await GamificationService.evaluateArtKeyProgress(req.user.userId);
    
    // Get user's unlocked keys with details
    const unlockedResult = await dbQuery(`
      SELECT 
        uak.key_id,
        uak.unlocked_at,
        uak.usage_count,
        uak.last_used_at,
        uak.personalizations,
        uak.is_featured
      FROM user_art_keys uak
      WHERE uak.user_id = $1
      ORDER BY uak.unlocked_at DESC
    `, [req.user.userId]);

    // Enrich with full ART KEY data
    const unlockedKeys = unlockedResult.rows.map(userKey => {
      const fullKey = GamificationService.ART_KEYS_COLLECTION.find(
        key => key.keyId === userKey.key_id
      );
      return {
        ...fullKey,
        userProgress: userKey
      };
    });

    // Get available keys (ready to unlock)
    const availableKeys = progress.availableKeys.map(keyId => {
      const fullKey = GamificationService.ART_KEYS_COLLECTION.find(key => key.keyId === keyId);
      return {
        ...fullKey,
        progressPercentage: 100
      };
    });

    // Get keys in progress
    const inProgressKeys = GamificationService.ART_KEYS_COLLECTION
      .filter(key => {
        const progressPercent = progress.progressTowards[key.keyId];
        return progressPercent > 0 && progressPercent < 100 && !progress.unlockedKeys.includes(key.keyId);
      })
      .map(key => ({
        ...key,
        progressPercentage: progress.progressTowards[key.keyId] || 0
      }));

    res.json({
      unlockedKeys,
      availableKeys,
      inProgressKeys,
      totalKeys: GamificationService.ART_KEYS_COLLECTION.length,
      progress: progress.progressTowards,
      terminalOutput: `🔑 ART KEYS Collection\n✅ Unlocked: ${unlockedKeys.length}\n⏳ Available: ${availableKeys.length}\n🔄 In Progress: ${inProgressKeys.length}\n📊 Total Progress: ${Math.round((unlockedKeys.length / GamificationService.ART_KEYS_COLLECTION.length) * 100)}%`
    });

  } catch (error) {
    console.error('ART KEYS fetch error:', error);
    res.status(500).json({
      error: '❌ Failed to load ART KEYS collection',
      terminalOutput: 'ERROR: Failed to retrieve ART KEYS data'
    });
  }
});

/**
 * Unlock an available ART KEY
 */
router.post('/art-keys/:keyId/unlock', [
  requireAuth,
  param('keyId').isLength({ min: 1 }).withMessage('Valid key ID required')
], async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: '⚠️ Validation failed',
        details: errors.array(),
        terminalOutput: 'ERROR: Invalid ART KEY unlock request'
      });
    }

    if (!req.user) {
      return res.status(401).json({
        error: '🔒 Authentication required',
        terminalOutput: 'ERROR: Please login to unlock ART KEYS'
      });
    }

    const { keyId } = req.params;
    const result = await GamificationService.unlockArtKey(req.user.userId, keyId);

    if (result.success) {
      res.json({
        message: result.message,
        artKey: result.artKey,
        rewards: result.rewards,
        terminalOutput: `🎉 ART KEY UNLOCKED!\n✨ ${result.artKey?.keyName}\n🎨 ${result.artKey?.symbol}\n💎 +${result.rewards?.points} points\n🌟 ${result.artKey?.culturalSignificance}`
      });
    } else {
      res.status(400).json({
        error: result.message,
        terminalOutput: `❌ ART KEY unlock failed: ${result.message}`
      });
    }

  } catch (error) {
    console.error('ART KEY unlock error:', error);
    res.status(500).json({
      error: '❌ ART KEY unlock failed',
      terminalOutput: 'ERROR: Failed to unlock ART KEY'
    });
  }
});

/**
 * Use an ART KEY (activate its special abilities)
 */
router.post('/art-keys/:keyId/use', [
  requireAuth,
  param('keyId').isLength({ min: 1 }).withMessage('Valid key ID required'),
  body('context').optional().isString()
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
        terminalOutput: 'ERROR: Please login to use ART KEYS'
      });
    }

    const { keyId } = req.params;
    const { context } = req.body;

    // Check if user has this key
    const hasKey = await GamificationService.checkArtKeyUnlocked(req.user.userId, keyId);
    if (!hasKey) {
      return res.status(403).json({
        error: '🔒 ART KEY not unlocked',
        terminalOutput: 'ERROR: You must unlock this ART KEY before using it'
      });
    }

    // Update usage count
    await dbQuery(`
      UPDATE user_art_keys 
      SET usage_count = usage_count + 1, last_used_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND key_id = $2
    `, [req.user.userId, keyId]);

    // Get the ART KEY details
    const artKey = GamificationService.ART_KEYS_COLLECTION.find(key => key.keyId === keyId);
    
    if (!artKey) {
      return res.status(404).json({
        error: '❌ ART KEY not found',
        terminalOutput: 'ERROR: ART KEY not found in collection'
      });
    }

    // Simulate special ability activation
    const abilityEffects = activateArtKeyAbilities(artKey, context);

    res.json({
      message: `✨ ${artKey.keyName} activated`,
      artKey,
      abilityEffects,
      terminalOutput: `✨ ART KEY ACTIVATED: ${artKey.keyName}\n🎨 ${artKey.symbol}\n⚡ Special abilities: ${artKey.rewards.specialAbilities?.join(', ') || 'None'}\n${abilityEffects.description}`
    });

  } catch (error) {
    console.error('ART KEY use error:', error);
    res.status(500).json({
      error: '❌ ART KEY activation failed',
      terminalOutput: 'ERROR: Failed to activate ART KEY'
    });
  }
});

// =============================================================================
// REAL-TIME ELEMENTS ENDPOINTS
// =============================================================================

/**
 * Get active countdown timers
 */
router.get('/countdowns', async (req: Request, res: Response) => {
  try {
    const countdowns = await GamificationService.getActiveCountdowns();
    
    // Calculate time remaining for each countdown
    const now = new Date();
    const countdownsWithTime = countdowns.map(countdown => {
      const timeRemaining = countdown.targetDate.getTime() - now.getTime();
      const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

      return {
        ...countdown,
        timeRemaining: {
          total: Math.max(0, timeRemaining),
          days: Math.max(0, days),
          hours: Math.max(0, hours),
          minutes: Math.max(0, minutes),
          seconds: Math.max(0, seconds)
        },
        isExpired: timeRemaining <= 0
      };
    });

    res.json({
      countdowns: countdownsWithTime,
      activeCount: countdownsWithTime.filter(c => !c.isExpired).length,
      terminalOutput: `⏰ Active Countdowns: ${countdownsWithTime.filter(c => !c.isExpired).length}\n🎯 Upcoming events and challenges await!`
    });

  } catch (error) {
    console.error('Countdowns fetch error:', error);
    res.status(500).json({
      error: '❌ Failed to load countdowns',
      terminalOutput: 'ERROR: Failed to retrieve countdown data'
    });
  }
});

/**
 * Get real-time platform status
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const status = await GamificationService.getRealTimeStatus();
    
    res.json({
      status,
      lastUpdated: new Date(),
      terminalOutput: `📊 Platform Status Updated\n${status.map(s => s.displayText).join('\n')}`
    });

  } catch (error) {
    console.error('Status fetch error:', error);
    res.status(500).json({
      error: '❌ Failed to load platform status',
      terminalOutput: 'ERROR: Failed to retrieve platform status'
    });
  }
});

/**
 * Join a countdown timer event
 */
router.post('/countdowns/:timerId/join', [
  requireAuth,
  param('timerId').isUUID().withMessage('Valid timer ID required'),
  body('participationType').optional().isIn(['participant', 'organizer']).withMessage('Valid participation type required')
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
        terminalOutput: 'ERROR: Please login to join countdown events'
      });
    }

    const { timerId } = req.params;
    const { participationType = 'participant' } = req.body;

    // Check if timer exists and is active
    const timerResult = await dbQuery(`
      SELECT name, description, target_date, type, rewards
      FROM countdown_timers 
      WHERE timer_id = $1 AND is_active = true AND target_date > CURRENT_TIMESTAMP
    `, [timerId]);

    if (timerResult.rows.length === 0) {
      return res.status(404).json({
        error: '❌ Countdown timer not found or expired',
        terminalOutput: 'ERROR: Timer not available for participation'
      });
    }

    const timer = timerResult.rows[0];

    // Check if already joined
    const existingResult = await dbQuery(`
      SELECT id FROM timer_participants 
      WHERE timer_id = $1 AND user_id = $2
    `, [timerId, req.user.userId]);

    if (existingResult.rows.length > 0) {
      return res.status(400).json({
        error: '⚠️ Already joined this countdown event',
        terminalOutput: 'INFO: You are already participating in this event'
      });
    }

    // Join the timer
    await dbQuery(`
      INSERT INTO timer_participants (timer_id, user_id, participation_type, joined_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
    `, [timerId, req.user.userId, participationType]);

    // Award participation points
    const participationPoints = timer.rewards?.participation || 50;
    await addCirclePoints(req.user.userId, participationPoints, 
      `Joined countdown event: ${timer.name}`,
      { timerId, participationType });

    res.json({
      message: `🎉 Successfully joined: ${timer.name}`,
      timer,
      participationType,
      pointsAwarded: participationPoints,
      terminalOutput: `🎯 COUNTDOWN EVENT JOINED!\n✨ ${timer.name}\n🎨 Type: ${timer.type}\n💎 +${participationPoints} participation points\n⏰ Event ends: ${new Date(timer.target_date).toLocaleDateString()}`
    });

  } catch (error) {
    console.error('Timer join error:', error);
    res.status(500).json({
      error: '❌ Failed to join countdown event',
      terminalOutput: 'ERROR: Failed to join countdown event'
    });
  }
});

// =============================================================================
// EASTER EGGS ENDPOINTS
// =============================================================================

/**
 * Trigger an easter egg
 */
router.post('/easter-eggs/trigger', [
  requireAuth,
  body('triggerType').isIn(['konami_code', 'text_sequence', 'click_pattern', 'time_based', 'quantum_alignment']).withMessage('Valid trigger type required'),
  body('triggerData').isObject().withMessage('Trigger data required')
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
        terminalOutput: 'ERROR: Please login to discover easter eggs'
      });
    }

    const { triggerType, triggerData } = req.body;

    const result = await GamificationService.checkEasterEggTrigger(
      req.user.userId,
      triggerType,
      triggerData
    );

    if (result.triggered) {
      res.json({
        triggered: true,
        easterEgg: result.easterEgg,
        message: result.message,
        terminalOutput: `🥚 EASTER EGG DISCOVERED!\n✨ ${result.easterEgg?.name}\n🎨 ${result.easterEgg?.symbol || '🥚'}\n💭 ${result.easterEgg?.reward.secretMessage}\n🏛️ Cultural Context: ${result.easterEgg?.culturalReference}`
      });
    } else {
      res.json({
        triggered: false,
        message: 'No easter egg found with this trigger',
        terminalOutput: '🔍 No hidden secrets found... keep exploring!'
      });
    }

  } catch (error) {
    console.error('Easter egg trigger error:', error);
    res.status(500).json({
      error: '❌ Easter egg check failed',
      terminalOutput: 'ERROR: Failed to check for easter eggs'
    });
  }
});

/**
 * Get user's discovered easter eggs
 */
router.get('/easter-eggs/discovered', [requireAuth], async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: '🔒 Authentication required',
        terminalOutput: 'ERROR: Please login to view discovered easter eggs'
      });
    }

    const discoveredResult = await dbQuery(`
      SELECT 
        uee.egg_id,
        uee.discovered_at,
        uee.discovery_context,
        ee.name,
        ee.description,
        ee.cultural_reference,
        ee.reward_points,
        ee.secret_message
      FROM user_easter_eggs uee
      JOIN easter_eggs ee ON uee.egg_id = ee.egg_id
      WHERE uee.user_id = $1
      ORDER BY uee.discovered_at DESC
    `, [req.user.userId]);

    const discovered = discoveredResult.rows;
    
    // Get total easter eggs count
    const totalResult = await dbQuery(`
      SELECT COUNT(*) as total FROM easter_eggs WHERE is_active = true
    `);
    
    const totalEggs = parseInt(totalResult.rows[0]?.total || '0');
    const discoveredCount = discovered.length;
    const discoveryPercentage = totalEggs > 0 ? Math.round((discoveredCount / totalEggs) * 100) : 0;

    res.json({
      discovered,
      discoveredCount,
      totalEggs,
      discoveryPercentage,
      terminalOutput: `🥚 Easter Egg Collection\n✅ Discovered: ${discoveredCount}/${totalEggs}\n📊 Progress: ${discoveryPercentage}%\n🔍 Keep exploring to find more hidden secrets!`
    });

  } catch (error) {
    console.error('Easter eggs fetch error:', error);
    res.status(500).json({
      error: '❌ Failed to load discovered easter eggs',
      terminalOutput: 'ERROR: Failed to retrieve easter egg collection'
    });
  }
});

/**
 * Get easter egg discovery hints
 */
router.get('/easter-eggs/hints', [requireAuth], async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: '🔒 Authentication required',
        terminalOutput: 'ERROR: Please login to view easter egg hints'
      });
    }

    // Get undiscovered easter eggs
    const undiscoveredResult = await dbQuery(`
      SELECT ee.discovery_hint, ee.cultural_reference, ee.difficulty_level
      FROM easter_eggs ee
      WHERE ee.is_active = true
        AND ee.egg_id NOT IN (
          SELECT uee.egg_id FROM user_easter_eggs uee WHERE uee.user_id = $1
        )
      ORDER BY ee.difficulty_level, RANDOM()
      LIMIT 5
    `, [req.user.userId]);

    const hints = undiscoveredResult.rows.map(row => ({
      hint: row.discovery_hint,
      culturalContext: row.cultural_reference,
      difficulty: row.difficulty_level
    }));

    res.json({
      hints,
      terminalOutput: `💡 Easter Egg Hints\n${hints.map((h, i) => `${i + 1}. ${h.hint}`).join('\n')}\n🎨 Each discovery reveals cultural wisdom and hidden knowledge!`
    });

  } catch (error) {
    console.error('Easter egg hints error:', error);
    res.status(500).json({
      error: '❌ Failed to load easter egg hints',
      terminalOutput: 'ERROR: Failed to retrieve hints'
    });
  }
});

// =============================================================================
// ACHIEVEMENTS ENDPOINTS
// =============================================================================

/**
 * Get user's achievements
 */
router.get('/achievements', [requireAuth], async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: '🔒 Authentication required',
        terminalOutput: 'ERROR: Please login to view achievements'
      });
    }

    // Get user's earned achievements
    const earnedResult = await dbQuery(`
      SELECT 
        ua.achievement_id,
        ua.earned_at,
        ua.is_featured,
        a.name,
        a.description,
        a.category,
        a.difficulty,
        a.points,
        a.cultural_context,
        a.icon
      FROM user_achievements ua
      JOIN achievements a ON ua.achievement_id = a.achievement_id
      WHERE ua.user_id = $1
      ORDER BY ua.earned_at DESC
    `, [req.user.userId]);

    // Get available achievements (not yet earned)
    const availableResult = await dbQuery(`
      SELECT 
        achievement_id,
        name,
        description,
        category,
        difficulty,
        points,
        cultural_context,
        icon,
        requirements
      FROM achievements
      WHERE is_active = true
        AND is_secret = false
        AND achievement_id NOT IN (
          SELECT achievement_id FROM user_achievements WHERE user_id = $1
        )
      ORDER BY difficulty, category
    `, [req.user.userId]);

    // Check for new achievements
    const newAchievements = await GamificationService.checkAchievements(req.user.userId);

    const earned = earnedResult.rows;
    const available = availableResult.rows;
    const totalAchievements = earned.length + available.length;
    const completionPercentage = totalAchievements > 0 ? Math.round((earned.length / totalAchievements) * 100) : 0;

    res.json({
      earned,
      available,
      newAchievements,
      stats: {
        earnedCount: earned.length,
        availableCount: available.length,
        totalCount: totalAchievements,
        completionPercentage
      },
      terminalOutput: `🏆 Achievement Progress\n✅ Earned: ${earned.length}\n⏳ Available: ${available.length}\n📊 Completion: ${completionPercentage}%${newAchievements.length > 0 ? `\n🎉 NEW: ${newAchievements.length} achievements unlocked!` : ''}`
    });

  } catch (error) {
    console.error('Achievements fetch error:', error);
    res.status(500).json({
      error: '❌ Failed to load achievements',
      terminalOutput: 'ERROR: Failed to retrieve achievements data'
    });
  }
});

/**
 * Get achievement progress details
 */
router.get('/achievements/:achievementId/progress', [
  requireAuth,
  param('achievementId').isLength({ min: 1 }).withMessage('Valid achievement ID required')
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
        terminalOutput: 'ERROR: Please login to view achievement progress'
      });
    }

    const { achievementId } = req.params;

    // Get achievement details
    const achievementResult = await dbQuery(`
      SELECT * FROM achievements WHERE achievement_id = $1 AND is_active = true
    `, [achievementId]);

    if (achievementResult.rows.length === 0) {
      return res.status(404).json({
        error: '❌ Achievement not found',
        terminalOutput: 'ERROR: Achievement not found or inactive'
      });
    }

    const achievement = achievementResult.rows[0];

    // Get user's progress
    const progressResult = await dbQuery(`
      SELECT * FROM achievement_progress 
      WHERE user_id = $1 AND achievement_id = $2
    `, [req.user.userId, achievementId]);

    const progress = progressResult.rows;

    // Calculate overall progress
    const requirements = achievement.requirements;
    const totalRequirements = requirements.length;
    const completedRequirements = progress.filter(p => p.progress_percentage >= 100).length;
    const overallProgress = totalRequirements > 0 ? Math.round((completedRequirements / totalRequirements) * 100) : 0;

    res.json({
      achievement,
      progress,
      overallProgress,
      completedRequirements,
      totalRequirements,
      terminalOutput: `📊 Achievement Progress: ${achievement.name}\n🎯 Overall: ${overallProgress}%\n✅ Completed: ${completedRequirements}/${totalRequirements} requirements\n🎨 Cultural Context: ${achievement.cultural_context}`
    });

  } catch (error) {
    console.error('Achievement progress error:', error);
    res.status(500).json({
      error: '❌ Failed to load achievement progress',
      terminalOutput: 'ERROR: Failed to retrieve progress data'
    });
  }
});

// =============================================================================
// LEADERBOARDS ENDPOINTS
// =============================================================================

/**
 * Get leaderboards
 */
router.get('/leaderboards', [
  query('type').optional().isIn(['art_keys', 'achievements', 'creativity', 'collaboration']).withMessage('Valid leaderboard type'),
  query('period').optional().isIn(['all_time', 'monthly', 'weekly', 'daily']).withMessage('Valid time period')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: '⚠️ Validation failed',
        details: errors.array()
      });
    }

    const leaderboardType = req.query.type as string || 'creativity';
    const period = req.query.period as string || 'monthly';

    // Get current period boundaries
    const now = new Date();
    let periodStart: Date;
    
    switch (period) {
      case 'daily':
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        const dayOfWeek = now.getDay();
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
        break;
      case 'monthly':
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        periodStart = new Date(0); // All time
    }

    // Get leaderboard data
    const leaderboardResult = await dbQuery(`
      SELECT 
        l.rank,
        l.score,
        l.secondary_score,
        l.badge,
        u.username,
        u.creative_circle,
        u.profile_data
      FROM leaderboards l
      JOIN users u ON l.user_id = u.id
      WHERE l.leaderboard_type = $1 
        AND l.period_type = $2
        AND ($3 = '1970-01-01'::date OR l.period_start >= $3)
      ORDER BY l.rank
      LIMIT 50
    `, [leaderboardType, period, periodStart]);

    const leaderboard = leaderboardResult.rows.map(row => ({
      rank: row.rank,
      username: row.username,
      creativeCircle: row.creative_circle,
      score: row.score,
      secondaryScore: row.secondary_score,
      badge: row.badge,
      avatar: row.profile_data?.avatar || '🎨'
    }));

    res.json({
      leaderboard,
      type: leaderboardType,
      period,
      periodStart,
      totalEntries: leaderboard.length,
      terminalOutput: `🏆 ${leaderboardType.toUpperCase()} LEADERBOARD (${period.toUpperCase()})\n${leaderboard.slice(0, 5).map((entry, index) => `${index + 1}. ${entry.username} - ${entry.score} pts`).join('\n')}\n📊 Showing top ${leaderboard.length} artists`
    });

  } catch (error) {
    console.error('Leaderboards fetch error:', error);
    res.status(500).json({
      error: '❌ Failed to load leaderboards',
      terminalOutput: 'ERROR: Failed to retrieve leaderboard data'
    });
  }
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Simulate ART KEY special ability activation
 */
function activateArtKeyAbilities(artKey: any, context?: string): any {
  const abilities = artKey.rewards.specialAbilities || [];
  
  const abilityEffects = {
    description: '',
    effects: [],
    duration: 3600000, // 1 hour in milliseconds
    context: context || 'general'
  };

  abilities.forEach((ability: string) => {
    switch (ability) {
      case 'melody_generation_hints':
        abilityEffects.effects.push({
          type: 'musical_enhancement',
          description: 'Enhanced melodic composition suggestions',
          icon: '🎵'
        });
        break;
      case 'reality_shaping_insights':
        abilityEffects.effects.push({
          type: 'quantum_awareness',
          description: 'Heightened awareness of quantum possibilities',
          icon: '🔮'
        });
        break;
      case 'enhanced_focus_mode':
        abilityEffects.effects.push({
          type: 'precision_boost',
          description: 'Athletic-grade mental focus activated',
          icon: '🎯'
        });
        break;
      case 'harmony_suggestions':
        abilityEffects.effects.push({
          type: 'collaboration_enhancement',
          description: 'Improved collaboration matchmaking and suggestions',
          icon: '🤝'
        });
        break;
      default:
        abilityEffects.effects.push({
          type: 'general_enhancement',
          description: ability.replace(/_/g, ' '),
          icon: '✨'
        });
    }
  });

  abilityEffects.description = `${abilityEffects.effects.length} special abilities activated for the next hour`;
  
  return abilityEffects;
}

export default router;
