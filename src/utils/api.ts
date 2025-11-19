const API_BASE_URL = '/api';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const token = localStorage.getItem('token');
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return { error: data.error || 'An error occurred' };
    }
    
    return { data };
  } catch (error) {
    console.error('API Error:', error);
    return { error: 'Network error' };
  }
}

// Auth API
export const authAPI = {
  teacherRegister: (name: string, email: string, password: string) =>
    fetchAPI('/auth/teacher/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),
  
  teacherLogin: (email: string, password: string) =>
    fetchAPI('/auth/teacher/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  
  studentLogin: (username: string, password: string) =>
    fetchAPI('/auth/student/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  
  studentJoin: (inviteCode: string, username: string, name: string, password: string) =>
    fetchAPI('/auth/student/join', {
      method: 'POST',
      body: JSON.stringify({ inviteCode, username, name, password }),
    }),
};

// Teacher API
export const teacherAPI = {
  getDashboard: () => fetchAPI('/teacher/dashboard'),
  
  createPeriod: (name: string, startYear: number, endYear: number) =>
    fetchAPI('/teacher/periods', {
      method: 'POST',
      body: JSON.stringify({ name, startYear, endYear }),
    }),
  
  getPeriods: () => fetchAPI('/teacher/periods'),
  
  updateTimeline: (periodId: string, currentYear: number) =>
    fetchAPI(`/teacher/periods/${periodId}/timeline`, {
      method: 'PATCH',
      body: JSON.stringify({ currentYear }),
    }),
  
  generateInviteCode: (periodId: string, maxUses?: number, expiresAt?: string) =>
    fetchAPI('/teacher/invite-codes', {
      method: 'POST',
      body: JSON.stringify({ periodId, maxUses, expiresAt }),
    }),
  
  getInviteCodes: () => fetchAPI('/teacher/invite-codes'),
  
  getStudents: (periodId?: string) =>
    fetchAPI(`/teacher/students${periodId ? `?periodId=${periodId}` : ''}`),
  
  getStudentProgress: (studentId: string) =>
    fetchAPI(`/teacher/students/${studentId}/progress`),
};

// Student API
export const studentAPI = {
  getDashboard: () => fetchAPI('/student/dashboard'),
  
  getCivilizations: () => fetchAPI('/student/civilizations'),
  
  createGameSession: (civilizationId: string, periodId: string) =>
    fetchAPI('/student/game-sessions', {
      method: 'POST',
      body: JSON.stringify({ civilizationId, periodId }),
    }),
  
  getGameSessions: () => fetchAPI('/student/game-sessions'),
  
  getGameSession: (sessionId: string) =>
    fetchAPI(`/student/game-sessions/${sessionId}`),
  
  saveGameState: (sessionId: string, gameState: any) =>
    fetchAPI(`/student/game-sessions/${sessionId}`, {
      method: 'PATCH',
      body: JSON.stringify({ gameState }),
    }),
  
  getLeaderboard: () => fetchAPI('/student/leaderboard'),
};

// Auth helpers
export const auth = {
  setToken: (token: string) => localStorage.setItem('token', token),
  getToken: () => localStorage.getItem('token'),
  removeToken: () => localStorage.removeItem('token'),
  
  setUser: (user: any) => localStorage.setItem('user', JSON.stringify(user)),
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  removeUser: () => localStorage.removeItem('user'),
  
  logout: () => {
    auth.removeToken();
    auth.removeUser();
  },
};
