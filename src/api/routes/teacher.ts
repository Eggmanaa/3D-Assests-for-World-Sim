import { Hono } from 'hono';
import { teacherAuthMiddleware } from '../middleware/auth';
import { generateInviteCode } from '../utils/crypto';
import { Bindings } from '../index';

type Variables = {
  userId: number;
  role: string;
};

export const teacherRoutes = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Apply auth middleware to all teacher routes
teacherRoutes.use('/*', teacherAuthMiddleware);

// Get teacher dashboard data
teacherRoutes.get('/dashboard', async (c) => {
  try {
    const teacherId = c.get('userId');

    // Get periods
    const periods = await c.env.DB.prepare(
      'SELECT * FROM periods WHERE teacher_id = ? ORDER BY created_at DESC'
    ).bind(teacherId).all();

    // Get total students
    const studentCount = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM students WHERE teacher_id = ?'
    ).bind(teacherId).first();

    // Get active game sessions
    const activeSessions = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM game_sessions WHERE teacher_id = ? AND status = ?'
    ).bind(teacherId, 'active').first();

    return c.json({
      periods: periods.results,
      stats: {
        totalStudents: studentCount?.count || 0,
        activeSessions: activeSessions?.count || 0,
        totalPeriods: periods.results.length
      }
    });
  } catch (error: any) {
    console.error('Dashboard error:', error);
    return c.json({ error: 'Failed to load dashboard' }, 500);
  }
});

// Create new period
// Create new period
teacherRoutes.post('/periods', async (c) => {
  try {
    const teacherId = c.get('userId');
    const { name, startYear, endYear } = await c.req.json();

    console.log('Creating period:', { teacherId, name, startYear, endYear });

    if (!teacherId) {
      return c.json({ error: 'Unauthorized: Missing teacher ID' }, 401);
    }

    if (!name || !startYear || !endYear) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Create the period
    let periodId;
    try {
      const result = await c.env.DB.prepare(
        'INSERT INTO periods (teacher_id, name, start_year, end_year, current_year) VALUES (?, ?, ?, ?, ?)'
      ).bind(teacherId, name, startYear, endYear, startYear).run();

      periodId = result.meta.last_row_id;
      console.log('Period created with ID:', periodId);
    } catch (dbError: any) {
      console.error('Database error creating period:', dbError);
      return c.json({ error: `Database error: ${dbError.message}` }, 500);
    }

    if (!periodId) {
      return c.json({ error: 'Failed to retrieve new period ID' }, 500);
    }

    // Automatically generate an invite code for the new period
    let generatedCode = null;
    try {
      let code = generateInviteCode();
      let attempts = 0;

      // Ensure the code is unique
      while (attempts < 10) {
        const existing = await c.env.DB.prepare(
          'SELECT id FROM invite_codes WHERE code = ?'
        ).bind(code).first();

        if (!existing) break;

        code = generateInviteCode();
        attempts++;
      }

      if (attempts >= 10) {
        console.error('Failed to generate unique invite code for period:', periodId);
        // We don't fail the request here, just log it. The user can generate one manually later.
      } else {
        // Insert the invite code (unlimited uses, no expiration by default)
        await c.env.DB.prepare(
          'INSERT INTO invite_codes (code, teacher_id, period_id, max_uses, expires_at) VALUES (?, ?, ?, ?, ?)'
        ).bind(code, teacherId, periodId, null, null).run();
        generatedCode = code;
        console.log('Auto-generated invite code:', code);
      }
    } catch (inviteError: any) {
      console.error('Error auto-generating invite code:', inviteError);
      // Don't fail the request if invite code generation fails, but log it clearly
    }

    const period = await c.env.DB.prepare(
      'SELECT * FROM periods WHERE id = ?'
    ).bind(periodId).first();

    return c.json({ period, inviteCode: generatedCode });
  } catch (error: any) {
    console.error('Create period error:', error);
    return c.json({ error: `Failed to create period: ${error.message}` }, 500);
  }
});

// Get periods
teacherRoutes.get('/periods', async (c) => {
  try {
    const teacherId = c.get('userId');

    const periods = await c.env.DB.prepare(
      'SELECT * FROM periods WHERE teacher_id = ? ORDER BY created_at DESC'
    ).bind(teacherId).all();

    return c.json({ periods: periods.results });
  } catch (error: any) {
    console.error('Get periods error:', error);
    return c.json({ error: `Failed to load periods: ${error.message}` }, 500);
  }
});

// Update period timeline
teacherRoutes.patch('/periods/:id/timeline', async (c) => {
  try {
    const teacherId = c.get('userId');
    const periodId = c.req.param('id');
    const { currentYear } = await c.req.json();

    if (!currentYear) {
      return c.json({ error: 'Missing current year' }, 400);
    }

    // Verify period belongs to teacher
    const period = await c.env.DB.prepare(
      'SELECT * FROM periods WHERE id = ? AND teacher_id = ?'
    ).bind(periodId, teacherId).first();

    if (!period) {
      return c.json({ error: 'Period not found' }, 404);
    }

    // Update current year
    await c.env.DB.prepare(
      'UPDATE periods SET current_year = ? WHERE id = ?'
    ).bind(currentYear, periodId).run();

    return c.json({ success: true, currentYear });
  } catch (error: any) {
    console.error('Update timeline error:', error);
    return c.json({ error: `Failed to update timeline: ${error.message}` }, 500);
  }
});

// Generate invite code
teacherRoutes.post('/invite-codes', async (c) => {
  try {
    const teacherId = c.get('userId');
    const { periodId, maxUses, expiresAt } = await c.req.json();

    if (!periodId) {
      return c.json({ error: 'Missing period ID' }, 400);
    }

    // Verify period belongs to teacher
    const period = await c.env.DB.prepare(
      'SELECT * FROM periods WHERE id = ? AND teacher_id = ?'
    ).bind(periodId, teacherId).first();

    if (!period) {
      return c.json({ error: 'Period not found' }, 404);
    }

    // Generate unique code
    let code = generateInviteCode();
    let attempts = 0;

    while (attempts < 10) {
      const existing = await c.env.DB.prepare(
        'SELECT id FROM invite_codes WHERE code = ?'
      ).bind(code).first();

      if (!existing) break;

      code = generateInviteCode();
      attempts++;
    }

    if (attempts >= 10) {
      return c.json({ error: 'Failed to generate unique code after 10 attempts' }, 500);
    }

    // Insert invite code
    const result = await c.env.DB.prepare(
      'INSERT INTO invite_codes (code, teacher_id, period_id, max_uses, expires_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(code, teacherId, periodId, maxUses || null, expiresAt || null).run();

    const inviteCode = await c.env.DB.prepare(
      'SELECT * FROM invite_codes WHERE id = ?'
    ).bind(result.meta.last_row_id).first();

    return c.json({ inviteCode });
  } catch (error: any) {
    console.error('Generate invite code error:', error);
    return c.json({ error: `Failed to generate invite code: ${error.message}` }, 500);
  }
});

// Get invite codes
teacherRoutes.get('/invite-codes', async (c) => {
  try {
    const teacherId = c.get('userId');

    const codes = await c.env.DB.prepare(
      'SELECT ic.*, p.name as period_name FROM invite_codes ic LEFT JOIN periods p ON ic.period_id = p.id WHERE ic.teacher_id = ? ORDER BY ic.created_at DESC'
    ).bind(teacherId).all();

    return c.json({ inviteCodes: codes.results });
  } catch (error: any) {
    console.error('Get invite codes error:', error);
    return c.json({ error: 'Failed to load invite codes' }, 500);
  }
});

// Get students with their latest game state
teacherRoutes.get('/students', async (c) => {
  try {
    const teacherId = c.get('userId');
    const periodId = c.req.query('periodId');

    let query = `
      SELECT 
        s.*, 
        p.name as period_name,
        gs.game_state,
        gs.civilization_id,
        gs.updated_at as last_played
      FROM students s 
      LEFT JOIN periods p ON s.period_id = p.id 
      LEFT JOIN game_sessions gs ON s.id = gs.student_id
      WHERE s.teacher_id = ?
    `;

    const params: any[] = [teacherId];

    if (periodId) {
      query += ' AND s.period_id = ?';
      params.push(periodId);
    }

    // We only want the latest game session for each student if they have multiple
    // For simplicity in this query, we'll just grab the one with the max updated_at per student
    // But since we're selecting * from students, we might get duplicates if we don't group or filter.
    // A better approach for SQLite:

    query = `
      SELECT 
        s.*, 
        p.name as period_name,
        gs.game_state,
        gs.civilization_id,
        gs.updated_at as last_played
      FROM students s 
      LEFT JOIN periods p ON s.period_id = p.id 
      LEFT JOIN (
        SELECT student_id, game_state, civilization_id, updated_at
        FROM game_sessions
        WHERE (student_id, updated_at) IN (
          SELECT student_id, MAX(updated_at)
          FROM game_sessions
          GROUP BY student_id
        )
      ) gs ON s.id = gs.student_id
      WHERE s.teacher_id = ?
    `;

    if (periodId) {
      query += ' AND s.period_id = ?';
      // params is already [teacherId]
      params.push(periodId);
    }

    query += ' ORDER BY s.name';

    const students = await c.env.DB.prepare(query).bind(...params).all();

    return c.json({ students: students.results });
  } catch (error: any) {
    console.error('Get students error:', error);
    return c.json({ error: 'Failed to load students' }, 500);
  }
});

// Get student progress
teacherRoutes.get('/students/:id/progress', async (c) => {
  try {
    const teacherId = c.get('userId');
    const studentId = c.req.param('id');

    // Verify student belongs to teacher
    const student = await c.env.DB.prepare(
      'SELECT * FROM students WHERE id = ? AND teacher_id = ?'
    ).bind(studentId, teacherId).first();

    if (!student) {
      return c.json({ error: 'Student not found' }, 404);
    }

    // Get game sessions
    const sessions = await c.env.DB.prepare(
      'SELECT * FROM game_sessions WHERE student_id = ? ORDER BY updated_at DESC'
    ).bind(studentId).all();

    return c.json({ sessions: sessions.results });
  } catch (error: any) {
    console.error('Get student progress error:', error);
    return c.json({ error: 'Failed to load student progress' }, 500);
  }
});

// Delete period
teacherRoutes.delete('/periods/:id', async (c) => {
  try {
    const teacherId = c.get('userId');
    const periodId = c.req.param('id');

    // Verify period belongs to teacher
    const period = await c.env.DB.prepare(
      'SELECT * FROM periods WHERE id = ? AND teacher_id = ?'
    ).bind(periodId, teacherId).first();

    if (!period) {
      return c.json({ error: 'Period not found' }, 404);
    }

    // Check if there are students in this period
    const studentCount = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM students WHERE period_id = ?'
    ).bind(periodId).first();

    if (studentCount && (studentCount as any).count > 0) {
      return c.json({
        error: 'Cannot delete period with active students. Please remove all students first.'
      }, 400);
    }

    // Delete associated invite codes first
    await c.env.DB.prepare(
      'DELETE FROM invite_codes WHERE period_id = ?'
    ).bind(periodId).run();

    // Delete the period
    await c.env.DB.prepare(
      'DELETE FROM periods WHERE id = ?'
    ).bind(periodId).run();

    return c.json({ success: true, message: 'Period deleted successfully' });
  } catch (error: any) {
    console.error('Delete period error:', error);
    return c.json({ error: 'Failed to delete period' }, 500);
  }
});
