// YEET BY YETHIKRISHNA R - MAIN SERVER
// Artistic Community Platform Backend Server

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';

// Internal imports
import { connectDatabase } from './config/database';
import { setupRedis } from './config/redis';
import { setupAuthentication } from './config/auth';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { validateApiKey } from './middleware/validateApiKey';

// Route imports
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import portfolioRoutes from './routes/portfolio';
import challengeRoutes from './routes/challenges';
import newsletterRoutes from './routes/newsletter';
import collaborationRoutes from './routes/collaborations';
import terminalRoutes from './routes/terminal';
import circleRoutes from './routes/circles';
import toolsRoutes from './routes/tools';
import securityRoutes from './routes/security';
import gamificationRoutes from './routes/gamification';

// Socket handlers
import { setupSocketHandlers } from './services/socketService';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// =============================================================================
// SECURITY AND MIDDLEWARE SETUP
// =============================================================================

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Terminal-Session']
}));

// Compression for better performance
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100 requests per window
  message: {
    error: 'Too many requests from this IP, please try again later.',
    type: 'rate_limit_exceeded',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Too many requests. Please slow down and try again later.',
      retryAfter: Math.ceil((req.rateLimit?.resetTime || Date.now() + 900000) / 1000)
    });
  }
});

// Apply rate limiting to API routes
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// =============================================================================
// API ROUTES
// =============================================================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API status endpoint with Creative Circles info
app.get('/api/status', (req, res) => {
  res.json({
    platform: 'Yeet by Yethikrishna R',
    tagline: 'Connecting artists, fostering creativity, building the future of artistic collaboration',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    features: {
      creativeCircles: true,
      terminalInterface: true,
      portfolioHosting: true,
      realTimeCollaboration: true,
      newsletter: true,
      challenges: true
    },
    circles: [
      { level: 1, name: 'Beginner', color: '#90EE90' },
      { level: 2, name: 'Apprentice', color: '#87CEEB' },
      { level: 3, name: 'Artist', color: '#FF7F7F' },
      { level: 4, name: 'Master', color: '#FFD700' },
      { level: 5, name: 'Virtuoso', color: '#40E0D0' },
      { level: 6, name: 'Creator', color: '#C0C0C0' }
    ],
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/collaborations', collaborationRoutes);
app.use('/api/terminal', terminalRoutes);
app.use('/api/circles', circleRoutes);
app.use('/api/tools', toolsRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/gamification', gamificationRoutes);

// =============================================================================
// TERMINAL INTERFACE WEBSOCKET SETUP
// =============================================================================

// Setup Socket.IO for real-time features
setupSocketHandlers(io);

// Terminal session management
io.on('connection', (socket) => {
  console.log(`Terminal connection established: ${socket.id}`);
  
  // Join user to their personal room for targeted updates
  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined personal room`);
  });

  // Terminal command execution
  socket.on('terminal_command', async (data) => {
    try {
      const { command, sessionId, userId } = data;
      
      // Log command for analytics and security
      console.log(`Terminal command from user ${userId}: ${command}`);
      
      // Process command through terminal service
      // This will be implemented in the terminal service
      socket.emit('terminal_response', {
        command,
        output: `Command received: ${command}`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      socket.emit('terminal_error', {
        error: 'Command execution failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Creative Circles updates
  socket.on('subscribe_circle_updates', (userId) => {
    socket.join(`circle_updates_${userId}`);
  });

  // Collaboration room management
  socket.on('join_collaboration', (collaborationId, userId) => {
    socket.join(`collaboration_${collaborationId}`);
    socket.to(`collaboration_${collaborationId}`).emit('user_joined', { userId });
  });

  socket.on('leave_collaboration', (collaborationId, userId) => {
    socket.leave(`collaboration_${collaborationId}`);
    socket.to(`collaboration_${collaborationId}`).emit('user_left', { userId });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Terminal connection closed: ${socket.id}`);
  });
});

// =============================================================================
// ERROR HANDLING
// =============================================================================

// 404 handler for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested endpoint ${req.originalUrl} does not exist`,
    availableEndpoints: {
      auth: '/api/auth/*',
      users: '/api/users/*',
      portfolio: '/api/portfolio/*',
      challenges: '/api/challenges/*',
      newsletter: '/api/newsletter/*',
      collaborations: '/api/collaborations/*',
      terminal: '/api/terminal/*',
      circles: '/api/circles/*'
    }
  });
});

// Global error handler
app.use(errorHandler);

// =============================================================================
// SERVER STARTUP
// =============================================================================

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Initialize database connection
    console.log('🗄️  Connecting to database...');
    await connectDatabase();
    console.log('✅ Database connected successfully');

    // Initialize Redis connection
    console.log('🔴 Connecting to Redis...');
    await setupRedis();
    console.log('✅ Redis connected successfully');

    // Setup authentication
    console.log('🔐 Setting up authentication...');
    await setupAuthentication(app);
    console.log('✅ Authentication configured');

    // Start the server
    server.listen(PORT, () => {
      console.log(`
🎨 ======================================================
   YEET BY YETHIKRISHNA R - ARTISTIC COMMUNITY PLATFORM
   ======================================================
   
   🌟 Platform: Artistic Community with Terminal Aesthetic
   🎵 Creator: Yethikrishna R (Carnatic Vocalist, Author, Shooter)
   🔗 Server: http://localhost:${PORT}
   🌍 Environment: ${process.env.NODE_ENV || 'development'}
   
   ✨ Features Available:
   • Creative Circles (6-tier progression system)
   • Terminal Interface with artistic commands
   • Portfolio hosting and showcase
   • Real-time collaboration tools
   • Newsletter and community features
   • Challenge system for artistic growth
   
   🎯 Ready for creative collaboration!
   ======================================================
      `);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed successfully');
    process.exit(0);
  });
});

// Start the server
startServer();

export { app, server, io };
