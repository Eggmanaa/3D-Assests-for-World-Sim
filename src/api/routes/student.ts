import { Hono } from 'hono';
import { studentAuthMiddleware } from '../middleware/auth';
import { Bindings } from '../index';

export const studentRoutes = new Hono<{ Bindings: Bindings }>();

// Apply auth middleware to all student routes
studentRoutes.use('/*', studentAuthMiddleware);

// Get student dashboard data
studentRoutes.get('/dashboard', async (c) => {
  try {
    const studentId = c.get('userId');
    
    // Get student info
    const student = await c.env.DB.prepare(
      'SELECT s.*, p.name as period_name, p.current_year FROM students s LEFT JOIN periods p ON s.period_id = p.id WHERE s.id = ?'
    ).bind(studentId).first();
    
    if (!student) {
      return c.json({ error: 'Student not found' }, 404);
    }
    
    // Get active game sessions
    const sessions = await c.env.DB.prepare(
      'SELECT * FROM game_sessions WHERE student_id = ? ORDER BY updated_at DESC LIMIT 5'
    ).bind(studentId).all();
    
    return c.json({
      student,
      sessions: sessions.results
    });
  } catch (error: any) {
    console.error('Dashboard error:', error);
    return c.json({ error: 'Failed to load dashboard' }, 500);
  }
});

// Get available civilizations
studentRoutes.get('/civilizations', async (c) => {
  try {
    // Return hardcoded civilizations list
    const civilizations = [
      { id: 'egypt', name: 'Egypt', description: 'Masters of the Nile', color: '#FFD700' },
      { id: 'greece', name: 'Greece', description: 'Birthplace of Democracy', color: '#4169E1' },
      { id: 'rome', name: 'Rome', description: 'The Eternal City', color: '#DC143C' },
      { id: 'china', name: 'China', description: 'Middle Kingdom', color: '#FF4500' },
      { id: 'germania', name: 'Germania', description: 'Fierce Warriors', color: '#696969' },
      { id: 'phoenicia', name: 'Phoenicia', description: 'Master Traders', color: '#8B008B' },
      { id: 'india', name: 'India', description: 'Land of Wisdom', color: '#FF8C00' },
      { id: 'mesopotamia', name: 'Mesopotamia', description: 'Cradle of Civilization', color: '#CD853F' },
      { id: 'persia', name: 'Persia', description: 'Empire of Empires', color: '#4B0082' },
      { id: 'sparta', name: 'Sparta', description: 'Military Excellence', color: '#8B0000' },
      { id: 'anatolia', name: 'Anatolia', description: 'Crossroads of Civilizations', color: '#CD5C5C' },
      { id: 'crete', name: 'Crete', description: 'Minoan Legacy', color: '#00CED1' },
      { id: 'gaul', name: 'Gaul', description: 'Celtic Warriors', color: '#228B22' },
      { id: 'carthage', name: 'Carthage', description: 'Phoenician Power', color: '#9370DB' },
      { id: 'macedonia', name: 'Macedonia', description: 'Conquerors', color: '#FFD700' },
      { id: 'assyria', name: 'Assyria', description: 'Military Might', color: '#8B4513' }
    ];
    
    return c.json({ civilizations });
  } catch (error: any) {
    console.error('Get civilizations error:', error);
    return c.json({ error: 'Failed to load civilizations' }, 500);
  }
});

// Create new game session
studentRoutes.post('/game-sessions', async (c) => {
  try {
    const studentId = c.get('userId');
    const { civilizationId, periodId } = await c.req.json();
    
    if (!civilizationId || !periodId) {
      return c.json({ error: 'Missing required fields' }, 400);
    }
    
    // Get student info
    const student = await c.env.DB.prepare(
      'SELECT teacher_id FROM students WHERE id = ?'
    ).bind(studentId).first();
    
    if (!student) {
      return c.json({ error: 'Student not found' }, 404);
    }
    
    // Create game session with initial empty game state
    const initialGameState = JSON.stringify({
      civilization: { name: civilizationId },
      tiles: [],
      year: -50000,
      resources: { food: 50, production: 50, population: 100, water: 100 }
    });
    
    const result = await c.env.DB.prepare(
      'INSERT INTO game_sessions (student_id, teacher_id, period_id, civilization_id, game_state, status) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(studentId, student.teacher_id, periodId, civilizationId, initialGameState, 'active').run();
    
    const session = await c.env.DB.prepare(
      'SELECT * FROM game_sessions WHERE id = ?'
    ).bind(result.meta.last_row_id).first();
    
    return c.json({ session });
  } catch (error: any) {
    console.error('Create game session error:', error);
    return c.json({ error: 'Failed to create game session' }, 500);
  }
});

// Get game sessions
studentRoutes.get('/game-sessions', async (c) => {
  try {
    const studentId = c.get('userId');
    
    const sessions = await c.env.DB.prepare(
      'SELECT * FROM game_sessions WHERE student_id = ? ORDER BY updated_at DESC'
    ).bind(studentId).all();
    
    return c.json({ sessions: sessions.results });
  } catch (error: any) {
    console.error('Get game sessions error:', error);
    return c.json({ error: 'Failed to load game sessions' }, 500);
  }
});

// Get specific game session
studentRoutes.get('/game-sessions/:id', async (c) => {
  try {
    const studentId = c.get('userId');
    const sessionId = c.req.param('id');
    
    const session = await c.env.DB.prepare(
      'SELECT * FROM game_sessions WHERE id = ? AND student_id = ?'
    ).bind(sessionId, studentId).first();
    
    if (!session) {
      return c.json({ error: 'Game session not found' }, 404);
    }
    
    return c.json({ session });
  } catch (error: any) {
    console.error('Get game session error:', error);
    return c.json({ error: 'Failed to load game session' }, 500);
  }
});

// Save game state
studentRoutes.patch('/game-sessions/:id', async (c) => {
  try {
    const studentId = c.get('userId');
    const sessionId = c.req.param('id');
    const { gameState } = await c.req.json();
    
    if (!gameState) {
      return c.json({ error: 'Missing game state' }, 400);
    }
    
    // Verify session belongs to student
    const session = await c.env.DB.prepare(
      'SELECT * FROM game_sessions WHERE id = ? AND student_id = ?'
    ).bind(sessionId, studentId).first();
    
    if (!session) {
      return c.json({ error: 'Game session not found' }, 404);
    }
    
    // Update game state
    await c.env.DB.prepare(
      'UPDATE game_sessions SET game_state = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(JSON.stringify(gameState), sessionId).run();
    
    return c.json({ success: true });
  } catch (error: any) {
    console.error('Save game state error:', error);
    return c.json({ error: 'Failed to save game state' }, 500);
  }
});

// Get leaderboard for period
studentRoutes.get('/leaderboard', async (c) => {
  try {
    const studentId = c.get('userId');
    
    // Get student's period
    const student = await c.env.DB.prepare(
      'SELECT period_id FROM students WHERE id = ?'
    ).bind(studentId).first();
    
    if (!student || !student.period_id) {
      return c.json({ leaderboard: [] });
    }
    
    // Get all students in the same period with their game sessions
    const leaderboard = await c.env.DB.prepare(`
      SELECT 
        s.id,
        s.name,
        s.username,
        COUNT(gs.id) as games_played,
        MAX(gs.updated_at) as last_played
      FROM students s
      LEFT JOIN game_sessions gs ON s.id = gs.student_id
      WHERE s.period_id = ?
      GROUP BY s.id, s.name, s.username
      ORDER BY games_played DESC, last_played DESC
      LIMIT 20
    `).bind(student.period_id).all();
    
    return c.json({ leaderboard: leaderboard.results });
  } catch (error: any) {
    console.error('Get leaderboard error:', error);
    return c.json({ error: 'Failed to load leaderboard' }, 500);
  }
});
