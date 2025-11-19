import { Context, Next } from 'hono';
import { verifyToken } from '../utils/crypto';

export async function teacherAuthMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: Missing or invalid token' }, 401);
  }
  
  const token = authHeader.substring(7);
  
  try {
    const payload = await verifyToken(token);
    
    if (payload.role !== 'teacher') {
      return c.json({ error: 'Unauthorized: Teacher access required' }, 403);
    }
    
    // Attach user info to context
    c.set('userId', payload.userId);
    c.set('role', payload.role);
    
    await next();
  } catch (error) {
    return c.json({ error: 'Unauthorized: Invalid token' }, 401);
  }
}

export async function studentAuthMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: Missing or invalid token' }, 401);
  }
  
  const token = authHeader.substring(7);
  
  try {
    const payload = await verifyToken(token);
    
    if (payload.role !== 'student') {
      return c.json({ error: 'Unauthorized: Student access required' }, 403);
    }
    
    // Attach user info to context
    c.set('userId', payload.userId);
    c.set('role', payload.role);
    
    await next();
  } catch (error) {
    return c.json({ error: 'Unauthorized: Invalid token' }, 401);
  }
}
