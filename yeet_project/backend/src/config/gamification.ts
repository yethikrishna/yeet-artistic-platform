// YEET BY YETHIKRISHNA R - GAMIFICATION ENGINE
// ART KEYS system, real-time elements, and progressive engagement rewards

import crypto from 'crypto';
import { query as dbQuery, addCirclePoints } from './database';

// =============================================================================
// ART KEYS SYSTEM - ARTISTIC PROTOCOL KEYS
// =============================================================================

export interface ArtKey {
  keyId: string;
  keyType: 'creation' | 'collaboration' | 'mastery' | 'wisdom' | 'harmony' | 'quantum';
  keyName: string;
  description: string;
  symbol: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythical';
  requiredActions: string[];
  unlockedBy: string;
  culturalSignificance: string;
  rewards: {
    points: number;
    circleAdvancement?: string;
    premiumAccess?: string[];
    specialAbilities?: string[];
  };
  prerequisites: string[];
  isSecret: boolean;
  discoveredAt?: Date;
}

export interface UserArtKey {
  userId: string;
  keyId: string;
  unlockedAt: Date;
  progressData: any;
  usageCount: number;
  lastUsedAt?: Date;
  personalizations: any;
}

/**
 * Core ART KEYS collection inspired by Yethikrishna R's artistic journey
 */
export const ART_KEYS_COLLECTION: ArtKey[] = [
  // CREATION KEYS - Artistic Expression
  {
    keyId: 'first_note',
    keyType: 'creation',
    keyName: 'First Note of Sa',
    description: 'Unlock the fundamental frequency of creation through Carnatic music',
    symbol: '🎵 ॐ',
    rarity: 'common',
    requiredActions: ['complete_carnatic_puzzle', 'upload_music_portfolio'],
    unlockedBy: 'Musical expression and understanding',
    culturalSignificance: 'Sa is the foundation note in Carnatic music, representing the eternal sound',
    rewards: {
      points: 100,
      premiumAccess: ['carnatic_masterclass_basic'],
      specialAbilities: ['melody_generation_hints']
    },
    prerequisites: [],
    isSecret: false
  },
  {
    keyId: 'quantum_observer',
    keyType: 'wisdom',
    keyName: 'Quantum Observer',
    description: 'Master the art of conscious observation from "The Quantum Lotus"',
    symbol: '🔮 👁️',
    rarity: 'rare',
    requiredActions: ['solve_quantum_cipher', 'read_quantum_content', 'meditation_challenge'],
    unlockedBy: 'Deep understanding of quantum consciousness principles',
    culturalSignificance: 'Based on the observer effect in quantum mechanics and consciousness studies',
    rewards: {
      points: 250,
      circleAdvancement: 'artist',
      premiumAccess: ['quantum_philosophy_texts', 'consciousness_tools'],
      specialAbilities: ['reality_shaping_insights', 'pattern_recognition_boost']
    },
    prerequisites: ['first_note'],
    isSecret: false
  },
  {
    keyId: 'precision_focus',
    keyType: 'mastery',
    keyName: 'Archer\'s Precision',
    description: 'Channel the mental discipline of competitive shooting into artistic practice',
    symbol: '🎯 🧘',
    rarity: 'epic',
    requiredActions: ['complete_precision_challenges', 'demonstrate_sustained_focus', 'achieve_flow_state'],
    unlockedBy: 'Mastery of mental focus and precision techniques',
    culturalSignificance: 'Inspired by the discipline required in competitive shooting and meditation',
    rewards: {
      points: 500,
      premiumAccess: ['precision_training_advanced', 'flow_state_tools'],
      specialAbilities: ['enhanced_focus_mode', 'precision_feedback_system']
    },
    prerequisites: ['quantum_observer'],
    isSecret: false
  },

  // COLLABORATION KEYS - Community Building
  {
    keyId: 'harmony_weaver',
    keyType: 'collaboration',
    keyName: 'Harmony Weaver',
    description: 'Create beautiful collaborative works that blend diverse artistic voices',
    symbol: '🤝 🎼',
    rarity: 'rare',
    requiredActions: ['complete_collaboration', 'mentor_newcomer', 'cross_cultural_project'],
    unlockedBy: 'Successful artistic collaboration and community building',
    culturalSignificance: 'Represents the universal language of art transcending boundaries',
    rewards: {
      points: 300,
      premiumAccess: ['collaboration_tools_advanced', 'cultural_exchange_programs'],
      specialAbilities: ['harmony_suggestions', 'collaboration_matchmaking']
    },
    prerequisites: ['first_note'],
    isSecret: false
  },
  {
    keyId: 'storyteller_sage',
    keyType: 'wisdom',
    keyName: 'Storyteller Sage',
    description: 'Master the art of narrative and share wisdom through creative expression',
    symbol: '📚 🌟',
    rarity: 'epic',
    requiredActions: ['publish_story', 'inspire_community', 'preserve_tradition'],
    unlockedBy: 'Creating impactful narratives that resonate with the community',
    culturalSignificance: 'Honors the tradition of oral storytelling and literary wisdom',
    rewards: {
      points: 400,
      circleAdvancement: 'master',
      premiumAccess: ['storytelling_workshops', 'literary_archives'],
      specialAbilities: ['narrative_structure_hints', 'cultural_context_insights']
    },
    prerequisites: ['harmony_weaver'],
    isSecret: false
  },

  // SECRET/LEGENDARY KEYS - Hidden achievements
  {
    keyId: 'lotus_bloom',
    keyType: 'quantum',
    keyName: 'Blooming Lotus of Infinite Possibilities',
    description: 'Achieve enlightenment through the perfect fusion of art, science, and spirituality',
    symbol: '🪷 ∞',
    rarity: 'legendary',
    requiredActions: ['master_all_disciplines', 'transcend_duality', 'inspire_transformation'],
    unlockedBy: 'Complete mastery and transcendence - the ultimate artistic achievement',
    culturalSignificance: 'The lotus represents purity emerging from muddy waters, achieving enlightenment',
    rewards: {
      points: 2000,
      circleAdvancement: 'creator',
      premiumAccess: ['all_premium_content', 'creator_tools_unlimited'],
      specialAbilities: ['reality_creation_mode', 'cosmic_inspiration_channel']
    },
    prerequisites: ['precision_focus', 'storyteller_sage', 'hidden_path_finder'],
    isSecret: true
  },
  {
    keyId: 'hidden_path_finder',
    keyType: 'wisdom',
    keyName: 'Hidden Path Finder',
    description: 'Discover the secret ways and easter eggs hidden throughout the platform',
    symbol: '🔍 ✨',
    rarity: 'mythical',
    requiredActions: ['find_all_easter_eggs', 'decode_hidden_messages', 'solve_meta_puzzle'],
    unlockedBy: 'Deep exploration and discovery of platform secrets',
    culturalSignificance: 'Represents the seeker\'s journey to uncover hidden knowledge',
    rewards: {
      points: 1000,
      premiumAccess: ['secret_archives', 'developer_insights'],
      specialAbilities: ['easter_egg_detector', 'hidden_content_access']
    },
    prerequisites: ['quantum_observer'],
    isSecret: true
  }
];

/**
 * Check if user has unlocked a specific ART KEY
 */
export async function checkArtKeyUnlocked(userId: string, keyId: string): Promise<boolean> {
  const result = await dbQuery(`
    SELECT key_id FROM user_art_keys 
    WHERE user_id = $1 AND key_id = $2
  `, [userId, keyId]);
  
  return result.rows.length > 0;
}

/**
 * Evaluate user's progress toward unlocking ART KEYS
 */
export async function evaluateArtKeyProgress(userId: string): Promise<{
  unlockedKeys: string[];
  availableKeys: string[];
  progressTowards: { [keyId: string]: number };
}> {
  // Get user's current ART KEYS
  const unlockedResult = await dbQuery(`
    SELECT key_id FROM user_art_keys WHERE user_id = $1
  `, [userId]);
  
  const unlockedKeys = unlockedResult.rows.map(row => row.key_id);

  // Get user's activities and achievements
  const activitiesResult = await dbQuery(`
    SELECT activity_type, activity_description, metadata, created_at
    FROM circle_activities 
    WHERE user_id = $1
    ORDER BY created_at DESC
  `, [userId]);

  const userActivities = activitiesResult.rows;
  const availableKeys: string[] = [];
  const progressTowards: { [keyId: string]: number } = {};

  // Evaluate each ART KEY
  for (const artKey of ART_KEYS_COLLECTION) {
    if (unlockedKeys.includes(artKey.keyId)) {
      continue; // Already unlocked
    }

    // Check prerequisites
    const hasPrerequisites = artKey.prerequisites.every(prereq => 
      unlockedKeys.includes(prereq)
    );

    if (!hasPrerequisites) {
      continue; // Prerequisites not met
    }

    // Calculate progress towards this key
    const progress = calculateKeyProgress(artKey, userActivities);
    progressTowards[artKey.keyId] = progress;

    if (progress >= 100) {
      availableKeys.push(artKey.keyId);
    }
  }

  return {
    unlockedKeys,
    availableKeys,
    progressTowards
  };
}

/**
 * Calculate progress percentage towards unlocking an ART KEY
 */
function calculateKeyProgress(artKey: ArtKey, userActivities: any[]): number {
  const requiredActions = artKey.requiredActions;
  let completedActions = 0;

  for (const action of requiredActions) {
    const isCompleted = checkActionCompleted(action, userActivities);
    if (isCompleted) {
      completedActions++;
    }
  }

  return Math.round((completedActions / requiredActions.length) * 100);
}

/**
 * Check if a specific action has been completed
 */
function checkActionCompleted(action: string, userActivities: any[]): boolean {
  const actionChecks: { [key: string]: (activities: any[]) => boolean } = {
    'complete_carnatic_puzzle': (activities) => 
      activities.some(a => a.activity_type === 'artistic_puzzle' && 
                          a.metadata?.type === 'carnatic_sequence'),
    
    'upload_music_portfolio': (activities) =>
      activities.some(a => a.activity_type === 'portfolio_upload' && 
                          a.metadata?.category === 'music'),
    
    'solve_quantum_cipher': (activities) =>
      activities.some(a => a.activity_type === 'artistic_puzzle' && 
                          a.metadata?.type === 'quantum_cipher'),
    
    'complete_collaboration': (activities) =>
      activities.some(a => a.activity_type === 'collaboration_completed'),
    
    'mentor_newcomer': (activities) =>
      activities.some(a => a.activity_type === 'mentorship_provided'),
    
    // Add more action checks as needed
  };

  const checker = actionChecks[action];
  return checker ? checker(userActivities) : false;
}

/**
 * Unlock an ART KEY for a user
 */
export async function unlockArtKey(userId: string, keyId: string): Promise<{
  success: boolean;
  artKey?: ArtKey;
  message: string;
  rewards?: any;
}> {
  try {
    // Check if key exists and is available
    const artKey = ART_KEYS_COLLECTION.find(key => key.keyId === keyId);
    if (!artKey) {
      return { success: false, message: 'ART KEY not found' };
    }

    // Check if already unlocked
    const alreadyUnlocked = await checkArtKeyUnlocked(userId, keyId);
    if (alreadyUnlocked) {
      return { success: false, message: 'ART KEY already unlocked' };
    }

    // Verify progress and prerequisites
    const progress = await evaluateArtKeyProgress(userId);
    if (!progress.availableKeys.includes(keyId)) {
      return { success: false, message: 'Prerequisites not met for this ART KEY' };
    }

    // Unlock the key
    await dbQuery(`
      INSERT INTO user_art_keys (user_id, key_id, unlocked_at, progress_data, usage_count)
      VALUES ($1, $2, CURRENT_TIMESTAMP, $3, 0)
    `, [userId, keyId, JSON.stringify({ unlockedVia: 'automatic_evaluation' })]);

    // Award points and benefits
    await addCirclePoints(userId, artKey.rewards.points, 
      `Unlocked ART KEY: ${artKey.keyName}`, 
      { artKeyId: keyId, rarity: artKey.rarity });

    // Handle circle advancement
    if (artKey.rewards.circleAdvancement) {
      await dbQuery(`
        UPDATE users 
        SET creative_circle = $1 
        WHERE id = $2 AND creative_circle != $1
      `, [artKey.rewards.circleAdvancement, userId]);
    }

    // Grant premium access
    if (artKey.rewards.premiumAccess) {
      for (const accessType of artKey.rewards.premiumAccess) {
        await dbQuery(`
          INSERT INTO premium_access_tokens (user_id, access_level, content_types, metadata)
          VALUES ($1, 'premium', $2, $3)
        `, [userId, [accessType], { grantedBy: `art_key_${keyId}`, permanent: true }]);
      }
    }

    // Log achievement
    await dbQuery(`
      INSERT INTO circle_activities (user_id, activity_type, activity_description, points_earned, metadata)
      VALUES ($1, 'art_key_unlocked', $2, $3, $4)
    `, [
      userId, 
      `Unlocked ${artKey.rarity} ART KEY: ${artKey.keyName}`,
      artKey.rewards.points,
      { 
        artKeyId: keyId, 
        rarity: artKey.rarity, 
        symbol: artKey.symbol,
        culturalSignificance: artKey.culturalSignificance
      }
    ]);

    return {
      success: true,
      artKey,
      message: `🎉 ART KEY unlocked: ${artKey.keyName}`,
      rewards: artKey.rewards
    };

  } catch (error) {
    console.error('Error unlocking ART KEY:', error);
    return { success: false, message: 'Failed to unlock ART KEY' };
  }
}

// =============================================================================
// REAL-TIME ELEMENTS SYSTEM
// =============================================================================

export interface CountdownTimer {
  timerId: string;
  name: string;
  description: string;
  targetDate: Date;
  type: 'challenge' | 'event' | 'release' | 'seasonal' | 'collaboration';
  isActive: boolean;
  rewards?: any;
  metadata: any;
}

export interface RealTimeStatus {
  statusId: string;
  category: 'user_activity' | 'platform_stats' | 'community_pulse' | 'artistic_flow';
  value: any;
  displayText: string;
  updatedAt: Date;
  expiresAt?: Date;
}

/**
 * Active countdown timers for the platform
 */
export const ACTIVE_COUNTDOWNS: CountdownTimer[] = [
  {
    timerId: 'spring_carnatic_festival',
    name: 'Spring Carnatic Festival',
    description: 'A celebration of traditional South Indian classical music',
    targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    type: 'event',
    isActive: true,
    rewards: {
      participation: 200,
      completion: 500,
      excellence: 1000
    },
    metadata: {
      theme: 'carnatic_spring',
      culturalContext: 'Celebrating the renewal of musical expression',
      participationRules: 'Submit original composition or interpretation'
    }
  },
  {
    timerId: 'quantum_consciousness_workshop',
    name: 'Quantum Consciousness Workshop',
    description: 'Deep dive into the intersection of quantum physics and consciousness',
    targetDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    type: 'challenge',
    isActive: true,
    rewards: {
      participation: 150,
      completion: 300,
      mastery: 750
    },
    metadata: {
      theme: 'quantum_exploration',
      requiredLevel: 'artist',
      basedOn: 'The Quantum Lotus philosophy'
    }
  },
  {
    timerId: 'precision_athletics_challenge',
    name: 'Precision & Focus Challenge',
    description: 'Apply athletic mental training to artistic practice',
    targetDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    type: 'challenge',
    isActive: true,
    rewards: {
      participation: 100,
      completion: 250,
      precision_master: 600
    },
    metadata: {
      theme: 'athletic_precision',
      focusAreas: ['concentration', 'flow_state', 'performance_optimization']
    }
  }
];

/**
 * Get active countdown timers
 */
export async function getActiveCountdowns(): Promise<CountdownTimer[]> {
  // In a real implementation, this would query the database
  return ACTIVE_COUNTDOWNS.filter(timer => 
    timer.isActive && timer.targetDate > new Date()
  );
}

/**
 * Get real-time platform status
 */
export async function getRealTimeStatus(): Promise<RealTimeStatus[]> {
  const now = new Date();
  
  // Get platform statistics
  const [userStats, activityStats, creativityStats] = await Promise.all([
    getUserStatistics(),
    getActivityStatistics(),
    getCreativityStatistics()
  ]);

  const statuses: RealTimeStatus[] = [
    {
      statusId: 'active_creators',
      category: 'platform_stats',
      value: userStats.activeCreators,
      displayText: `${userStats.activeCreators} creators online now`,
      updatedAt: now
    },
    {
      statusId: 'today_creations',
      category: 'community_pulse',
      value: activityStats.todayCreations,
      displayText: `${activityStats.todayCreations} new artworks created today`,
      updatedAt: now
    },
    {
      statusId: 'collective_harmony',
      category: 'artistic_flow',
      value: creativityStats.harmonyIndex,
      displayText: `Collective Harmony Index: ${creativityStats.harmonyIndex}/100`,
      updatedAt: now
    },
    {
      statusId: 'quantum_resonance',
      category: 'artistic_flow',
      value: creativityStats.quantumResonance,
      displayText: `Quantum Resonance: ${creativityStats.quantumResonance}% consciousness alignment`,
      updatedAt: now
    }
  ];

  return statuses;
}

// Helper functions for real-time statistics
async function getUserStatistics() {
  const result = await dbQuery(`
    SELECT 
      COUNT(*) FILTER (WHERE last_active > NOW() - INTERVAL '15 minutes') as active_creators,
      COUNT(*) as total_users
    FROM users
  `);
  
  return {
    activeCreators: parseInt(result.rows[0]?.active_creators || '0'),
    totalUsers: parseInt(result.rows[0]?.total_users || '0')
  };
}

async function getActivityStatistics() {
  const result = await dbQuery(`
    SELECT 
      COUNT(*) FILTER (WHERE created_at > CURRENT_DATE) as today_creations,
      COUNT(*) FILTER (WHERE created_at > CURRENT_DATE - INTERVAL '7 days') as week_creations
    FROM portfolio_items
  `);
  
  return {
    todayCreations: parseInt(result.rows[0]?.today_creations || '0'),
    weekCreations: parseInt(result.rows[0]?.week_creations || '0')
  };
}

async function getCreativityStatistics() {
  // Calculate artistic harmony based on collaboration and engagement metrics
  const harmonyResult = await dbQuery(`
    SELECT 
      AVG(rating) as avg_rating,
      COUNT(*) as total_interactions
    FROM portfolio_interactions 
    WHERE created_at > CURRENT_DATE - INTERVAL '24 hours'
  `);

  const puzzleResult = await dbQuery(`
    SELECT 
      COUNT(*) FILTER (WHERE is_correct = true) as solved_puzzles,
      COUNT(*) as total_attempts
    FROM puzzle_attempts 
    WHERE created_at > CURRENT_DATE - INTERVAL '24 hours'
  `);

  const avgRating = parseFloat(harmonyResult.rows[0]?.avg_rating || '0');
  const successRate = puzzleResult.rows[0]?.total_attempts > 0 
    ? (parseInt(puzzleResult.rows[0]?.solved_puzzles || '0') / parseInt(puzzleResult.rows[0]?.total_attempts || '1')) * 100 
    : 0;

  return {
    harmonyIndex: Math.round((avgRating / 5) * 100),
    quantumResonance: Math.round(successRate)
  };
}

// =============================================================================
// EASTER EGGS AND HIDDEN FEATURES
// =============================================================================

export interface EasterEgg {
  eggId: string;
  name: string;
  description: string;
  triggerMethod: 'konami_code' | 'text_sequence' | 'click_pattern' | 'time_based' | 'quantum_alignment';
  trigger: string;
  reward: {
    points: number;
    specialContent?: string;
    artKeyProgress?: string;
    secretMessage?: string;
  };
  culturalReference: string;
  discoveryHint: string;
  isActive: boolean;
}

export const EASTER_EGGS: EasterEgg[] = [
  {
    eggId: 'quantum_konami',
    name: 'Quantum Konami Sequence',
    description: 'The classic konami code unlocks quantum consciousness insights',
    triggerMethod: 'konami_code',
    trigger: '↑↑↓↓←→←→BA',
    reward: {
      points: 150,
      specialContent: 'quantum_consciousness_mantra',
      artKeyProgress: 'quantum_observer',
      secretMessage: 'The observer collapses the wave function of infinite possibilities into reality'
    },
    culturalReference: 'Gaming culture meets quantum philosophy',
    discoveryHint: 'Some sequences transcend games and enter the realm of consciousness',
    isActive: true
  },
  {
    eggId: 'carnatic_sa_meditation',
    name: 'Infinite Sa Meditation',
    description: 'Type "Sa Sa Sa Sa Sa" to enter a meditative trance',
    triggerMethod: 'text_sequence',
    trigger: 'Sa Sa Sa Sa Sa',
    reward: {
      points: 100,
      specialContent: 'carnatic_sa_drone',
      artKeyProgress: 'first_note',
      secretMessage: 'Sa is the eternal sound, the foundation of all music and creation'
    },
    culturalReference: 'Carnatic music fundamental frequency and meditation practice',
    discoveryHint: 'The foundational note holds infinite power when repeated with devotion',
    isActive: true
  },
  {
    eggId: 'precision_triple_click',
    name: 'Archer\'s Triple Focus',
    description: 'Triple-click the center of any target to activate precision mode',
    triggerMethod: 'click_pattern',
    trigger: 'triple_click_center',
    reward: {
      points: 75,
      specialContent: 'precision_focus_visualization',
      artKeyProgress: 'precision_focus',
      secretMessage: 'In the stillness between heartbeats, the arrow finds its true path'
    },
    culturalReference: 'Athletic shooting precision and mindfulness practice',
    discoveryHint: 'The center holds the key to perfect concentration',
    isActive: true
  },
  {
    eggId: 'lotus_midnight_bloom',
    name: 'Midnight Lotus Bloom',
    description: 'Visit the platform exactly at midnight to witness the quantum lotus bloom',
    triggerMethod: 'time_based',
    trigger: '00:00:00',
    reward: {
      points: 300,
      specialContent: 'midnight_lotus_animation',
      artKeyProgress: 'lotus_bloom',
      secretMessage: 'In the darkest hour, the lotus blooms with infinite light'
    },
    culturalReference: 'Lotus symbolism and quantum consciousness philosophy',
    discoveryHint: 'Some transformations happen when the world sleeps',
    isActive: true
  },
  {
    eggId: 'hidden_path_sequence',
    name: 'The Hidden Path Revelation',
    description: 'Navigate through secret areas in a specific sequence',
    triggerMethod: 'quantum_alignment',
    trigger: 'security->portfolio->challenges->circles->home',
    reward: {
      points: 500,
      specialContent: 'hidden_path_map',
      artKeyProgress: 'hidden_path_finder',
      secretMessage: 'The path reveals itself only to those who seek with pure intention'
    },
    culturalReference: 'Spiritual journey and seeker\'s path',
    discoveryHint: 'The journey matters more than the destination, but the sequence unlocks understanding',
    isActive: true
  }
];

/**
 * Check if an easter egg has been triggered
 */
export async function checkEasterEggTrigger(
  userId: string, 
  triggerType: string, 
  triggerData: any
): Promise<{ triggered: boolean; easterEgg?: EasterEgg; message?: string }> {
  
  const matchingEggs = EASTER_EGGS.filter(egg => 
    egg.isActive && egg.triggerMethod === triggerType
  );

  for (const egg of matchingEggs) {
    let triggered = false;

    switch (triggerType) {
      case 'konami_code':
        triggered = triggerData.sequence === egg.trigger;
        break;
      case 'text_sequence':
        triggered = triggerData.text === egg.trigger;
        break;
      case 'time_based':
        const currentTime = new Date().toTimeString().split(' ')[0];
        triggered = currentTime === egg.trigger;
        break;
      case 'click_pattern':
      case 'quantum_alignment':
        triggered = triggerData.pattern === egg.trigger;
        break;
    }

    if (triggered) {
      // Check if already discovered
      const alreadyDiscovered = await dbQuery(`
        SELECT egg_id FROM user_easter_eggs 
        WHERE user_id = $1 AND egg_id = $2
      `, [userId, egg.eggId]);

      if (alreadyDiscovered.rows.length === 0) {
        // Record discovery
        await dbQuery(`
          INSERT INTO user_easter_eggs (user_id, egg_id, discovered_at, trigger_data)
          VALUES ($1, $2, CURRENT_TIMESTAMP, $3)
        `, [userId, egg.eggId, triggerData]);

        // Award points
        await addCirclePoints(userId, egg.reward.points, 
          `Discovered Easter Egg: ${egg.name}`,
          { eggId: egg.eggId, culturalReference: egg.culturalReference });

        // Progress ART KEY if applicable
        if (egg.reward.artKeyProgress) {
          await dbQuery(`
            INSERT INTO circle_activities (user_id, activity_type, activity_description, points_earned, metadata)
            VALUES ($1, 'easter_egg_discovery', $2, $3, $4)
          `, [
            userId,
            `Discovered ${egg.name} - progress toward ${egg.reward.artKeyProgress}`,
            egg.reward.points,
            { eggId: egg.eggId, artKeyProgress: egg.reward.artKeyProgress }
          ]);
        }

        return {
          triggered: true,
          easterEgg: egg,
          message: `🥚 Easter Egg Discovered: ${egg.name}! ${egg.reward.secretMessage}`
        };
      } else {
        return {
          triggered: true,
          message: `You've already discovered this easter egg: ${egg.name}`
        };
      }
    }
  }

  return { triggered: false };
}

// =============================================================================
// PROGRESSIVE ENGAGEMENT REWARDS
// =============================================================================

export interface Achievement {
  achievementId: string;
  name: string;
  description: string;
  category: 'creation' | 'collaboration' | 'learning' | 'community' | 'mastery' | 'exploration';
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  requirements: string[];
  rewards: {
    points: number;
    circleAdvancement?: string;
    specialAbilities?: string[];
    premiumAccess?: string[];
    cosmetics?: string[];
  };
  culturalContext: string;
  icon: string;
  progressSteps: string[];
  isSecret: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    achievementId: 'first_steps_sa',
    name: 'First Steps in Sa',
    description: 'Begin your musical journey with the fundamental note',
    category: 'creation',
    difficulty: 'bronze',
    requirements: ['upload_first_musical_piece'],
    rewards: {
      points: 50,
      specialAbilities: ['musical_notation_helper']
    },
    culturalContext: 'Sa represents the beginning of all musical expression in Carnatic tradition',
    icon: '🎵',
    progressSteps: ['Create account', 'Upload first musical content'],
    isSecret: false
  },
  {
    achievementId: 'quantum_apprentice',
    name: 'Quantum Apprentice',
    description: 'Grasp the basic principles of quantum consciousness',
    category: 'learning',
    difficulty: 'silver',
    requirements: ['read_quantum_content', 'solve_basic_quantum_puzzle'],
    rewards: {
      points: 150,
      premiumAccess: ['quantum_basics_course'],
      specialAbilities: ['quantum_insight_mode']
    },
    culturalContext: 'Based on "The Quantum Lotus" philosophy of consciousness exploration',
    icon: '🔮',
    progressSteps: ['Engage with quantum content', 'Solve quantum puzzle', 'Demonstrate understanding'],
    isSecret: false
  },
  {
    achievementId: 'community_harmonizer',
    name: 'Community Harmonizer',
    description: 'Bring artists together in beautiful collaboration',
    category: 'collaboration',
    difficulty: 'gold',
    requirements: ['complete_3_collaborations', 'mentor_2_newcomers', 'organize_community_event'],
    rewards: {
      points: 400,
      circleAdvancement: 'master',
      specialAbilities: ['collaboration_insights', 'community_pulse_reading'],
      cosmetics: ['harmonizer_badge', 'collaboration_aura']
    },
    culturalContext: 'Celebrating the Indian tradition of guru-shishya parampara and collective creation',
    icon: '🤝',
    progressSteps: ['Collaborate with others', 'Guide newcomers', 'Build community'],
    isSecret: false
  },
  {
    achievementId: 'precision_master',
    name: 'Precision Master',
    description: 'Achieve perfect focus and precision in artistic practice',
    category: 'mastery',
    difficulty: 'platinum',
    requirements: ['complete_precision_challenges', 'maintain_streak_30_days', 'teach_precision_technique'],
    rewards: {
      points: 800,
      premiumAccess: ['advanced_precision_tools', 'flow_state_training'],
      specialAbilities: ['precision_mode', 'flow_state_indicator'],
      cosmetics: ['masters_focus_aura', 'precision_badge']
    },
    culturalContext: 'Inspired by the mental discipline required in competitive shooting and meditation',
    icon: '🎯',
    progressSteps: ['Develop focus', 'Maintain consistency', 'Share knowledge'],
    isSecret: false
  },
  {
    achievementId: 'lotus_enlightened',
    name: 'Lotus Enlightened',
    description: 'Achieve the highest state of artistic and spiritual integration',
    category: 'mastery',
    difficulty: 'diamond',
    requirements: ['unlock_all_art_keys', 'inspire_100_creators', 'create_masterpiece'],
    rewards: {
      points: 2000,
      circleAdvancement: 'creator',
      specialAbilities: ['enlightenment_mode', 'cosmic_inspiration'],
      premiumAccess: ['all_premium_content'],
      cosmetics: ['lotus_crown', 'enlightenment_aura', 'cosmic_signature']
    },
    culturalContext: 'The ultimate flowering of consciousness represented by the blooming lotus',
    icon: '🪷',
    progressSteps: ['Master all arts', 'Inspire others', 'Create transcendent work'],
    isSecret: false
  }
];

/**
 * Check and award achievements for user
 */
export async function checkAchievements(userId: string): Promise<Achievement[]> {
  const newAchievements: Achievement[] = [];

  // Get user's current achievements
  const existingResult = await dbQuery(`
    SELECT achievement_id FROM user_achievements WHERE user_id = $1
  `, [userId]);
  
  const existingAchievements = existingResult.rows.map(row => row.achievement_id);

  // Get user activities and stats
  const userStats = await getUserAchievementStats(userId);

  for (const achievement of ACHIEVEMENTS) {
    if (existingAchievements.includes(achievement.achievementId)) {
      continue; // Already achieved
    }

    // Check if requirements are met
    const requirementsMet = checkAchievementRequirements(achievement, userStats);
    
    if (requirementsMet) {
      // Award achievement
      await dbQuery(`
        INSERT INTO user_achievements (user_id, achievement_id, earned_at, progress_data)
        VALUES ($1, $2, CURRENT_TIMESTAMP, $3)
      `, [userId, achievement.achievementId, JSON.stringify(userStats)]);

      // Award points and benefits
      await addCirclePoints(userId, achievement.rewards.points, 
        `Achievement Unlocked: ${achievement.name}`,
        { achievementId: achievement.achievementId, difficulty: achievement.difficulty });

      // Handle other rewards
      if (achievement.rewards.circleAdvancement) {
        await dbQuery(`
          UPDATE users 
          SET creative_circle = $1 
          WHERE id = $2
        `, [achievement.rewards.circleAdvancement, userId]);
      }

      newAchievements.push(achievement);
    }
  }

  return newAchievements;
}

async function getUserAchievementStats(userId: string): Promise<any> {
  const [portfolioStats, collaborationStats, puzzleStats, activityStats] = await Promise.all([
    dbQuery(`SELECT COUNT(*) as portfolio_count FROM portfolio_items WHERE user_id = $1`, [userId]),
    dbQuery(`SELECT COUNT(*) as collaboration_count FROM collaborations WHERE participants @> $1`, [JSON.stringify([userId])]),
    dbQuery(`SELECT COUNT(*) as puzzles_solved FROM puzzle_attempts WHERE user_id = $1 AND is_correct = true`, [userId]),
    dbQuery(`SELECT COUNT(*) as total_activities FROM circle_activities WHERE user_id = $1`, [userId])
  ]);

  return {
    portfolioCount: parseInt(portfolioStats.rows[0]?.portfolio_count || '0'),
    collaborationCount: parseInt(collaborationStats.rows[0]?.collaboration_count || '0'),
    puzzlesSolved: parseInt(puzzleStats.rows[0]?.puzzles_solved || '0'),
    totalActivities: parseInt(activityStats.rows[0]?.total_activities || '0')
  };
}

function checkAchievementRequirements(achievement: Achievement, userStats: any): boolean {
  // This would contain specific logic for each achievement
  // For now, simplified example
  const requirementCheckers: { [key: string]: (stats: any) => boolean } = {
    'upload_first_musical_piece': (stats) => stats.portfolioCount > 0,
    'solve_basic_quantum_puzzle': (stats) => stats.puzzlesSolved > 0,
    'complete_3_collaborations': (stats) => stats.collaborationCount >= 3,
    // Add more requirement checkers
  };

  return achievement.requirements.every(req => {
    const checker = requirementCheckers[req];
    return checker ? checker(userStats) : false;
  });
}

export default {
  ART_KEYS_COLLECTION,
  ACTIVE_COUNTDOWNS,
  EASTER_EGGS,
  ACHIEVEMENTS,
  checkArtKeyUnlocked,
  evaluateArtKeyProgress,
  unlockArtKey,
  getActiveCountdowns,
  getRealTimeStatus,
  checkEasterEggTrigger,
  checkAchievements
};
