// YEET BY YETHIKRISHNA R - ENHANCED SECURITY CONFIGURATION
// Multi-factor authentication, blockchain integration, and advanced security features

import crypto from 'crypto';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import bcrypt from 'bcrypt';
import { ethers } from 'ethers';
import { query as dbQuery } from './database';

// =============================================================================
// MULTI-FACTOR AUTHENTICATION (MFA) SYSTEM
// =============================================================================

export interface MFAConfig {
  userId: string;
  totpSecret?: string;
  totpEnabled: boolean;
  smsEnabled: boolean;
  biometricEnabled: boolean;
  backupCodes: string[];
  lastUsedMethod?: 'totp' | 'sms' | 'biometric' | 'backup';
  createdAt: Date;
  updatedAt: Date;
}

export interface MFAChallenge {
  challengeId: string;
  userId: string;
  method: 'totp' | 'sms' | 'biometric' | 'artistic_puzzle';
  challenge: string;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
}

/**
 * Generate TOTP secret for authenticator apps
 */
export async function generateTOTPSecret(userId: string, userEmail: string): Promise<{
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}> {
  const secret = speakeasy.generateSecret({
    name: `Yeet Platform (${userEmail})`,
    issuer: 'Yeet by Yethikrishna R',
    length: 32
  });

  // Generate backup codes
  const backupCodes = Array(8).fill(0).map(() => 
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );

  // Hash backup codes for storage
  const hashedBackupCodes = await Promise.all(
    backupCodes.map(code => bcrypt.hash(code, 12))
  );

  // Store MFA configuration
  await dbQuery(`
    INSERT INTO user_mfa_config (user_id, totp_secret, backup_codes, totp_enabled)
    VALUES ($1, $2, $3, false)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      totp_secret = $2,
      backup_codes = $3,
      updated_at = CURRENT_TIMESTAMP
  `, [userId, secret.base32, hashedBackupCodes]);

  // Generate QR code
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

  return {
    secret: secret.base32!,
    qrCodeUrl,
    backupCodes
  };
}

/**
 * Verify TOTP token
 */
export async function verifyTOTP(userId: string, token: string): Promise<boolean> {
  const result = await dbQuery(`
    SELECT totp_secret FROM user_mfa_config 
    WHERE user_id = $1 AND totp_enabled = true
  `, [userId]);

  if (result.rows.length === 0) {
    return false;
  }

  const secret = result.rows[0].totp_secret;
  
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 1
  });
}

/**
 * Enable TOTP after successful verification
 */
export async function enableTOTP(userId: string, token: string): Promise<boolean> {
  const result = await dbQuery(`
    SELECT totp_secret FROM user_mfa_config 
    WHERE user_id = $1
  `, [userId]);

  if (result.rows.length === 0) {
    return false;
  }

  const secret = result.rows[0].totp_secret;
  
  const isValid = speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 1
  });

  if (isValid) {
    await dbQuery(`
      UPDATE user_mfa_config 
      SET totp_enabled = true, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
    `, [userId]);

    // Award points for enabling MFA
    await dbQuery(`
      INSERT INTO circle_activities (user_id, activity_type, activity_description, points_earned, metadata)
      VALUES ($1, 'security_enhancement', 'Enabled Two-Factor Authentication', 25, $2)
    `, [userId, JSON.stringify({ method: 'totp', timestamp: new Date() })]);
  }

  return isValid;
}

/**
 * Generate SMS verification code
 */
export async function generateSMSCode(userId: string, phoneNumber: string): Promise<string> {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Store SMS challenge
  const challengeId = crypto.randomUUID();
  await dbQuery(`
    INSERT INTO mfa_challenges (challenge_id, user_id, method, challenge, expires_at, max_attempts)
    VALUES ($1, $2, 'sms', $3, $4, 3)
  `, [challengeId, userId, await bcrypt.hash(code, 10), expiresAt]);

  // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
  console.log(`SMS Code for ${phoneNumber}: ${code}`);

  return challengeId;
}

/**
 * Verify SMS code
 */
export async function verifySMSCode(challengeId: string, code: string): Promise<boolean> {
  const result = await dbQuery(`
    SELECT challenge, attempts, max_attempts, expires_at, user_id
    FROM mfa_challenges 
    WHERE challenge_id = $1 AND method = 'sms' AND expires_at > CURRENT_TIMESTAMP
  `, [challengeId]);

  if (result.rows.length === 0) {
    return false;
  }

  const challenge = result.rows[0];
  
  if (challenge.attempts >= challenge.max_attempts) {
    return false;
  }

  // Increment attempt count
  await dbQuery(`
    UPDATE mfa_challenges 
    SET attempts = attempts + 1 
    WHERE challenge_id = $1
  `, [challengeId]);

  const isValid = await bcrypt.compare(code, challenge.challenge);

  if (isValid) {
    // Delete challenge after successful verification
    await dbQuery(`DELETE FROM mfa_challenges WHERE challenge_id = $1`, [challengeId]);
    
    // Update last used method
    await dbQuery(`
      UPDATE user_mfa_config 
      SET last_used_method = 'sms', updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
    `, [challenge.user_id]);
  }

  return isValid;
}

/**
 * Verify backup code
 */
export async function verifyBackupCode(userId: string, code: string): Promise<boolean> {
  const result = await dbQuery(`
    SELECT backup_codes FROM user_mfa_config 
    WHERE user_id = $1
  `, [userId]);

  if (result.rows.length === 0) {
    return false;
  }

  const backupCodes = result.rows[0].backup_codes;
  
  for (let i = 0; i < backupCodes.length; i++) {
    if (await bcrypt.compare(code, backupCodes[i])) {
      // Remove used backup code
      backupCodes.splice(i, 1);
      
      await dbQuery(`
        UPDATE user_mfa_config 
        SET backup_codes = $1, last_used_method = 'backup', updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $2
      `, [backupCodes, userId]);

      return true;
    }
  }

  return false;
}

// =============================================================================
// BLOCKCHAIN INTEGRATION FOR PREMIUM ACCESS
// =============================================================================

export interface BlockchainWallet {
  userId: string;
  walletAddress: string;
  chainId: number;
  walletType: 'metamask' | 'walletconnect' | 'coinbase' | 'custom';
  premiumTokenBalance: number;
  lastSyncAt: Date;
  isVerified: boolean;
}

export interface PremiumAccessToken {
  tokenId: string;
  userId: string;
  accessLevel: 'basic' | 'premium' | 'exclusive' | 'creator';
  contentTypes: string[];
  expiresAt?: Date;
  transferable: boolean;
  metadata: any;
}

/**
 * Verify wallet ownership through signature
 */
export async function verifyWalletOwnership(
  walletAddress: string,
  signature: string,
  message: string
): Promise<boolean> {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
  } catch (error) {
    console.error('Wallet verification error:', error);
    return false;
  }
}

/**
 * Connect wallet to user account
 */
export async function connectWallet(
  userId: string,
  walletAddress: string,
  signature: string,
  chainId: number = 1
): Promise<boolean> {
  const message = `Connect wallet to Yeet Platform\nAddress: ${walletAddress}\nTimestamp: ${Date.now()}`;
  
  const isValid = await verifyWalletOwnership(walletAddress, signature, message);
  
  if (!isValid) {
    return false;
  }

  // Store wallet connection
  await dbQuery(`
    INSERT INTO user_wallets (user_id, wallet_address, chain_id, wallet_type, is_verified)
    VALUES ($1, $2, $3, 'custom', true)
    ON CONFLICT (user_id, wallet_address) 
    DO UPDATE SET 
      is_verified = true,
      last_sync_at = CURRENT_TIMESTAMP
  `, [userId, walletAddress.toLowerCase(), chainId]);

  // Award points for wallet connection
  await dbQuery(`
    INSERT INTO circle_activities (user_id, activity_type, activity_description, points_earned, metadata)
    VALUES ($1, 'blockchain_integration', 'Connected blockchain wallet', 50, $2)
  `, [userId, JSON.stringify({ walletAddress, chainId })]);

  return true;
}

/**
 * Check premium access based on blockchain tokens
 */
export async function checkPremiumAccess(
  userId: string,
  contentType: string,
  requiredLevel: string = 'premium'
): Promise<boolean> {
  // Check user's Creative Circle level first
  const userResult = await dbQuery(`
    SELECT creative_circle FROM users WHERE id = $1
  `, [userId]);

  if (userResult.rows.length === 0) {
    return false;
  }

  const userCircle = userResult.rows[0].creative_circle;
  const circleOrder = ['beginner', 'apprentice', 'artist', 'master', 'virtuoso', 'creator'];
  const requiredIndex = circleOrder.indexOf(requiredLevel);
  const userIndex = circleOrder.indexOf(userCircle);

  // If user's circle level is sufficient, grant access
  if (userIndex >= requiredIndex) {
    return true;
  }

  // Check blockchain-based access tokens
  const tokenResult = await dbQuery(`
    SELECT * FROM premium_access_tokens 
    WHERE user_id = $1 
      AND access_level = $2 
      AND content_types && ARRAY[$3]
      AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
  `, [userId, requiredLevel, contentType]);

  return tokenResult.rows.length > 0;
}

/**
 * Mint premium access token (for special events, purchases, etc.)
 */
export async function mintPremiumToken(
  userId: string,
  accessLevel: string,
  contentTypes: string[],
  expiresAt?: Date,
  metadata: any = {}
): Promise<string> {
  const tokenId = crypto.randomUUID();

  await dbQuery(`
    INSERT INTO premium_access_tokens (
      token_id, user_id, access_level, content_types, 
      expires_at, transferable, metadata
    )
    VALUES ($1, $2, $3, $4, $5, false, $6)
  `, [tokenId, userId, accessLevel, contentTypes, expiresAt, metadata]);

  return tokenId;
}

// =============================================================================
// ARTISTIC PUZZLE-BASED SECURITY CHALLENGES
// =============================================================================

export interface ArtisticPuzzle {
  puzzleId: string;
  type: 'carnatic_sequence' | 'quantum_cipher' | 'rhythm_pattern' | 'literary_code';
  difficulty: 'novice' | 'apprentice' | 'virtuoso' | 'master';
  challenge: any;
  solution: string;
  hints: string[];
  timeLimit: number; // in seconds
  circleLevel: string;
  metadata: any;
}

/**
 * Generate Carnatic music sequence puzzle
 */
export function generateCarnaticPuzzle(difficulty: string): ArtisticPuzzle {
  const swaras = ['Sa', 'Ri', 'Ga', 'Ma', 'Pa', 'Dha', 'Ni'];
  const ragas = {
    novice: ['Bilahari', 'Hamsadhwani'],
    apprentice: ['Shankarabharanam', 'Kalyani'],
    virtuoso: ['Todi', 'Bhairavi'],
    master: ['Varali', 'Simhendramadhyamam']
  };

  const selectedRagas = ragas[difficulty as keyof typeof ragas];
  const ragaName = selectedRagas[Math.floor(Math.random() * selectedRagas.length)];
  
  // Generate sequence based on raga
  const sequence = generateRagaSequence(ragaName, difficulty);
  const solution = sequence.join('-');

  return {
    puzzleId: crypto.randomUUID(),
    type: 'carnatic_sequence',
    difficulty: difficulty as any,
    challenge: {
      raga: ragaName,
      partialSequence: sequence.slice(0, -2),
      instruction: `Complete this ${ragaName} raga sequence in the tradition of Carnatic music`
    },
    solution,
    hints: [
      `This raga is traditionally performed in ${getRagaScale(ragaName)}`,
      `Listen to the melodic pattern and emotional content (rasa)`
    ],
    timeLimit: difficulty === 'master' ? 300 : 180,
    circleLevel: difficulty,
    metadata: { ragaFamily: getRagaFamily(ragaName) }
  };
}

/**
 * Generate quantum-literary cipher puzzle
 */
export function generateQuantumCipher(difficulty: string): ArtisticPuzzle {
  const quantumTerms = ['superposition', 'entanglement', 'observer', 'collapse', 'quantum'];
  const lotusWisdom = ['awareness', 'enlightenment', 'lotus', 'meditation', 'consciousness'];
  
  const message = difficulty === 'master' 
    ? "The quantum lotus blooms in superposition of all possibilities"
    : "Awareness observes the dance of consciousness";

  const cipher = encryptQuantumCipher(message, difficulty);

  return {
    puzzleId: crypto.randomUUID(),
    type: 'quantum_cipher',
    difficulty: difficulty as any,
    challenge: {
      encryptedText: cipher.encrypted,
      quantumHint: "Apply quantum principles to decode the wisdom",
      literaryContext: "From 'The Quantum Lotus' philosophical tradition"
    },
    solution: message,
    hints: [
      "Consider the observer effect in quantum mechanics",
      "The lotus represents awakening consciousness",
      "Superposition contains all possible states"
    ],
    timeLimit: difficulty === 'master' ? 600 : 300,
    circleLevel: difficulty,
    metadata: { 
      cipherType: cipher.method,
      philosophicalSchool: 'quantum_consciousness'
    }
  };
}

/**
 * Generate rhythm pattern puzzle
 */
export function generateRhythmPuzzle(difficulty: string): ArtisticPuzzle {
  const talas = {
    novice: ['Adi Tala'],
    apprentice: ['Rupaka', 'Jhampa'],
    virtuoso: ['Ata', 'Eka'],
    master: ['Sankeerna', 'Misra Chapu']
  };

  const selectedTalas = talas[difficulty as keyof typeof talas];
  const tala = selectedTalas[Math.floor(Math.random() * selectedTalas.length)];
  
  const pattern = generateTalaPattern(tala, difficulty);

  return {
    puzzleId: crypto.randomUUID(),
    type: 'rhythm_pattern',
    difficulty: difficulty as any,
    challenge: {
      tala: tala,
      pattern: pattern.sequence,
      missingBeats: pattern.missing,
      instruction: `Complete this ${tala} pattern maintaining proper mathematical precision`
    },
    solution: pattern.solution,
    hints: [
      `${tala} has ${pattern.totalBeats} beats per cycle`,
      "Maintain the subdivisions and accents",
      "Consider the mathematical relationships in the pattern"
    ],
    timeLimit: difficulty === 'master' ? 240 : 120,
    circleLevel: difficulty,
    metadata: { 
      talaFamily: getTalaFamily(tala),
      totalBeats: pattern.totalBeats
    }
  };
}

/**
 * Verify artistic puzzle solution
 */
export async function verifyArtisticPuzzle(
  puzzleId: string,
  userSolution: string,
  userId: string
): Promise<{ success: boolean; pointsAwarded: number; feedback: string }> {
  const result = await dbQuery(`
    SELECT * FROM artistic_puzzles WHERE puzzle_id = $1
  `, [puzzleId]);

  if (result.rows.length === 0) {
    return { success: false, pointsAwarded: 0, feedback: "Puzzle not found" };
  }

  const puzzle = result.rows[0];
  const isCorrect = verifyPuzzleSolution(puzzle, userSolution);

  if (isCorrect) {
    const points = calculatePuzzlePoints(puzzle.difficulty, puzzle.type);
    
    // Award points
    await dbQuery(`
      INSERT INTO circle_activities (user_id, activity_type, activity_description, points_earned, metadata)
      VALUES ($1, 'artistic_puzzle', $2, $3, $4)
    `, [
      userId,
      `Solved ${puzzle.type} puzzle`,
      points,
      JSON.stringify({ puzzleId, difficulty: puzzle.difficulty, type: puzzle.type })
    ]);

    return {
      success: true,
      pointsAwarded: points,
      feedback: generateArtisticFeedback(puzzle.type, puzzle.difficulty)
    };
  }

  return {
    success: false,
    pointsAwarded: 0,
    feedback: "Incorrect solution. Consider the artistic principles and try again."
  };
}

// =============================================================================
// CONTENT ENCRYPTION FOR PREMIUM RESOURCES
// =============================================================================

export interface EncryptedContent {
  contentId: string;
  encryptedData: string;
  encryptionMethod: 'aes-256-gcm' | 'chacha20-poly1305';
  accessLevel: string;
  contentType: string;
  metadata: any;
}

/**
 * Encrypt premium content
 */
export async function encryptPremiumContent(
  content: Buffer | string,
  contentType: string,
  accessLevel: string,
  metadata: any = {}
): Promise<EncryptedContent> {
  const contentId = crypto.randomUUID();
  const algorithm = 'aes-256-gcm';
  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipher(algorithm, key);
  cipher.setAAD(Buffer.from(contentId));

  let encrypted = cipher.update(content, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  // Store encryption key securely (in production, use HSM or secure key management)
  await dbQuery(`
    INSERT INTO content_encryption_keys (content_id, encryption_key, iv, auth_tag, algorithm)
    VALUES ($1, $2, $3, $4, $5)
  `, [contentId, key.toString('hex'), iv.toString('hex'), authTag.toString('hex'), algorithm]);

  const encryptedContent: EncryptedContent = {
    contentId,
    encryptedData: encrypted,
    encryptionMethod: algorithm,
    accessLevel,
    contentType,
    metadata
  };

  // Store encrypted content metadata
  await dbQuery(`
    INSERT INTO encrypted_content (content_id, access_level, content_type, metadata, created_at)
    VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
  `, [contentId, accessLevel, contentType, metadata]);

  return encryptedContent;
}

/**
 * Decrypt premium content for authorized users
 */
export async function decryptPremiumContent(
  contentId: string,
  userId: string
): Promise<{ success: boolean; content?: Buffer; error?: string }> {
  // Check user access
  const accessResult = await dbQuery(`
    SELECT access_level, content_type FROM encrypted_content WHERE content_id = $1
  `, [contentId]);

  if (accessResult.rows.length === 0) {
    return { success: false, error: "Content not found" };
  }

  const { access_level, content_type } = accessResult.rows[0];
  const hasAccess = await checkPremiumAccess(userId, content_type, access_level);

  if (!hasAccess) {
    return { success: false, error: "Insufficient access level" };
  }

  // Get encryption keys
  const keyResult = await dbQuery(`
    SELECT encryption_key, iv, auth_tag, algorithm FROM content_encryption_keys 
    WHERE content_id = $1
  `, [contentId]);

  if (keyResult.rows.length === 0) {
    return { success: false, error: "Encryption keys not found" };
  }

  const { encryption_key, iv, auth_tag, algorithm } = keyResult.rows[0];

  try {
    const decipher = crypto.createDecipher(algorithm, Buffer.from(encryption_key, 'hex'));
    decipher.setAAD(Buffer.from(contentId));
    decipher.setAuthTag(Buffer.from(auth_tag, 'hex'));

    // Get encrypted content (this would typically come from file storage)
    const encryptedResult = await dbQuery(`
      SELECT encrypted_data FROM encrypted_content WHERE content_id = $1
    `, [contentId]);

    let decrypted = decipher.update(encryptedResult.rows[0].encrypted_data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return { success: true, content: Buffer.from(decrypted) };
  } catch (error) {
    console.error('Decryption error:', error);
    return { success: false, error: "Decryption failed" };
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function generateRagaSequence(ragaName: string, difficulty: string): string[] {
  // Simplified raga sequences - in production, use comprehensive raga database
  const sequences: { [key: string]: string[] } = {
    'Bilahari': ['Sa', 'Ri', 'Ga', 'Pa', 'Dha', 'Sa'],
    'Shankarabharanam': ['Sa', 'Ri', 'Ga', 'Ma', 'Pa', 'Dha', 'Ni', 'Sa']
  };
  
  return sequences[ragaName] || ['Sa', 'Ri', 'Ga', 'Ma', 'Pa'];
}

function getRagaScale(ragaName: string): string {
  // Simplified mapping
  return "appropriate scale for this melodic framework";
}

function getRagaFamily(ragaName: string): string {
  return "Carnatic raga family";
}

function encryptQuantumCipher(message: string, difficulty: string): { encrypted: string; method: string } {
  // Simple cipher for demonstration - use more sophisticated methods in production
  const shift = difficulty === 'master' ? 13 : 7;
  const encrypted = message.split('').map(char => {
    if (char.match(/[a-z]/i)) {
      const code = char.charCodeAt(0);
      const base = code >= 65 && code <= 90 ? 65 : 97;
      return String.fromCharCode(((code - base + shift) % 26) + base);
    }
    return char;
  }).join('');

  return { encrypted, method: `quantum_shift_${shift}` };
}

function generateTalaPattern(tala: string, difficulty: string): { 
  sequence: string[]; 
  missing: number[]; 
  solution: string; 
  totalBeats: number 
} {
  // Simplified tala patterns
  const patterns: { [key: string]: string[] } = {
    'Adi Tala': ['dha', 'dhi', 'mi', 'dha', 'dha', 'dhi', 'mi', 'dha'],
    'Rupaka': ['dhi', 'mi', 'dha', 'dha']
  };

  const pattern = patterns[tala] || ['dha', 'dhi', 'mi'];
  const missing = [pattern.length - 2, pattern.length - 1];
  
  return {
    sequence: pattern.slice(0, -2).concat(['?', '?']),
    missing,
    solution: pattern.slice(-2).join('-'),
    totalBeats: pattern.length
  };
}

function getTalaFamily(tala: string): string {
  return "Traditional Carnatic tala system";
}

function verifyPuzzleSolution(puzzle: any, userSolution: string): boolean {
  return puzzle.solution.toLowerCase() === userSolution.toLowerCase();
}

function calculatePuzzlePoints(difficulty: string, type: string): number {
  const basePoints = {
    novice: 10,
    apprentice: 25,
    virtuoso: 50,
    master: 100
  };

  const typeMultiplier = {
    carnatic_sequence: 1.5,
    quantum_cipher: 2.0,
    rhythm_pattern: 1.3,
    literary_code: 1.8
  };

  return Math.floor(
    (basePoints[difficulty as keyof typeof basePoints] || 10) * 
    (typeMultiplier[type as keyof typeof typeMultiplier] || 1.0)
  );
}

function generateArtisticFeedback(type: string, difficulty: string): string {
  const feedback = {
    carnatic_sequence: "🎵 Excellent understanding of raga structure and melodic progression!",
    quantum_cipher: "🔮 Your quantum consciousness is expanding - well decoded!",
    rhythm_pattern: "🥁 Perfect mathematical precision in your rhythmic understanding!",
    literary_code: "📚 Your literary insight reveals deep textual comprehension!"
  };

  return feedback[type as keyof typeof feedback] || "Well done on solving this artistic challenge!";
}

export default {
  generateTOTPSecret,
  verifyTOTP,
  enableTOTP,
  generateSMSCode,
  verifySMSCode,
  verifyBackupCode,
  verifyWalletOwnership,
  connectWallet,
  checkPremiumAccess,
  mintPremiumToken,
  generateCarnaticPuzzle,
  generateQuantumCipher,
  generateRhythmPuzzle,
  verifyArtisticPuzzle,
  encryptPremiumContent,
  decryptPremiumContent
};
