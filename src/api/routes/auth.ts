import { Hono } from 'hono';
import { hashPassword, verifyPassword, generateToken, generateInviteCode } from '../utils/crypto';
import { Bindings } from '../index';

export const authRoutes = new Hono<{ Bindings: Bindings }>();

// Teacher Registration
authRoutes.post('/teacher/register', async (c) => {
  try {
    const { name, email, password } = await c.req.json();

    // Validation
    if (!name || !email || !password) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    if (password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400);
    }

    // Check if email already exists
    const existing = await c.env.DB.prepare(
      'SELECT id FROM teachers WHERE email = ?'
    ).bind(email).first();

    if (existing) {
      return c.json({ error: 'Email already registered' }, 400);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Insert teacher
    const result = await c.env.DB.prepare(
      'INSERT INTO teachers (name, email, password_hash) VALUES (?, ?, ?)'
    ).bind(name, email, passwordHash).run();

    const teacherId = result.meta.last_row_id;

    // Generate token
    const token = await generateToken({ userId: teacherId, role: 'teacher' });

    return c.json({
      token,
      user: { id: teacherId, name, email, role: 'teacher' }
    });
  } catch (error: any) {
    console.error('Teacher registration error:', error);
    return c.json({ error: 'Registration failed' }, 500);
  }
});

// Teacher Login
authRoutes.post('/teacher/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Missing email or password' }, 400);
    }

    // Find teacher
    const teacher = await c.env.DB.prepare(
      'SELECT id, name, email, password_hash FROM teachers WHERE email = ?'
    ).bind(email).first();

    if (!teacher) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Verify password
    const isValid = await verifyPassword(password, teacher.password_hash as string);

    if (!isValid) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Generate token
    const token = await generateToken({ userId: teacher.id, role: 'teacher' });

    return c.json({
      token,
      user: { id: teacher.id, name: teacher.name, email: teacher.email, role: 'teacher' }
    });
  } catch (error: any) {
    console.error('Teacher login error:', error);
    return c.json({ error: 'Login failed' }, 500);
  }
});

// Student Login
authRoutes.post('/student/login', async (c) => {
  try {
    const { username, password } = await c.req.json();

    if (!username || !password) {
      return c.json({ error: 'Missing username or password' }, 400);
    }

    // Find student
    const student = await c.env.DB.prepare(
      'SELECT id, username, name, password_hash, teacher_id, period_id FROM students WHERE username = ?'
    ).bind(username).first();

    if (!student) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Verify password
    const isValid = await verifyPassword(password, student.password_hash as string);

    if (!isValid) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Generate token
    const token = await generateToken({ userId: student.id, role: 'student' });

    return c.json({
      token,
      user: {
        id: student.id,
        username: student.username,
        name: student.name,
        role: 'student',
        teacherId: student.teacher_id,
        periodId: student.period_id
      }
    });
  } catch (error: any) {
    console.error('Student login error:', error);
    return c.json({ error: 'Login failed' }, 500);
  }
});

// Student Join with Invite Code
authRoutes.post('/student/join', async (c) => {
  try {
    const { inviteCode, username, name, password } = await c.req.json();

    console.log('Student join attempt:', { inviteCode, username, name });

    // Validation
    if (!inviteCode || !username || !name || !password) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    if (password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400);
    }

    // Find invite code
    const invite = await c.env.DB.prepare(
      'SELECT id, teacher_id, period_id, max_uses, current_uses, expires_at FROM invite_codes WHERE code = ?'
    ).bind(inviteCode).first();

    console.log('Invite code lookup:', invite ? 'Found' : 'Not found');

    if (!invite) {
      return c.json({ error: 'Invalid invite code' }, 400);
    }

    // Check if invite is still valid
    if (invite.expires_at && new Date(invite.expires_at as string) < new Date()) {
      return c.json({ error: 'Invite code expired' }, 400);
    }

    if (invite.max_uses && (invite.current_uses as number) >= (invite.max_uses as number)) {
      return c.json({ error: 'Invite code has reached maximum uses' }, 400);
    }

    // Check if username already exists
    const existing = await c.env.DB.prepare(
      'SELECT id FROM students WHERE username = ?'
    ).bind(username).first();

    if (existing) {
      return c.json({ error: 'Username already taken' }, 400);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    console.log('Creating student with teacher_id:', invite.teacher_id, 'period_id:', invite.period_id);

    // Insert student
    const result = await c.env.DB.prepare(
      'INSERT INTO students (username, name, password_hash, teacher_id, period_id) VALUES (?, ?, ?, ?, ?)'
    ).bind(username, name, passwordHash, invite.teacher_id, invite.period_id).run();

    const studentId = result.meta.last_row_id;

    // Update invite code usage
    await c.env.DB.prepare(
      'UPDATE invite_codes SET current_uses = current_uses + 1 WHERE id = ?'
    ).bind(invite.id).run();

    // Generate token
    const token = await generateToken({ userId: studentId, role: 'student' });

    console.log('Student created successfully:', studentId);

    return c.json({
      token,
      user: {
        id: studentId,
        username,
        name,
        role: 'student',
        teacherId: invite.teacher_id,
        periodId: invite.period_id
      }
    });
  } catch (error: any) {
    console.error('Student join error:', error);
    console.error('Error stack:', error.stack);
    return c.json({ error: `Join failed: ${error.message}` }, 500);
  }
});
