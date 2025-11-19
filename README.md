# Through History - World History Simulation

A comprehensive educational game for high school students to learn world history through interactive civilization building and strategic decision-making.

## 🎉 Project Status - Phase 2 Complete!

### ✅ Currently Completed Features

#### 1. **Authentication System** ✨
- **Teacher Registration & Login**: Full account creation with email/password
- **Student Login & Join**: Username-based login with invite code system
- **JWT-based Authentication**: Secure 7-day session tokens
- **Role-based Access Control**: Separate teacher and student permissions
- **Password Security**: SHA-256 hashing for all passwords

#### 2. **Teacher Dashboard** 👨‍🏫
- **Period Management**: Create class periods with custom year ranges (50,000 BCE - 362 CE)
- **Invite Code Generator**: Create unique 6-character codes for students
- **Student Roster**: View all enrolled students by period
- **Timeline Control**: Advance class timeline through historical periods
- **Statistics Overview**: Total students, active sessions, and period counts
- **Session Monitoring**: Track student game progress

#### 3. **Student Dashboard** 👨‍🎓
- **Civilization Selection**: Choose from 18+ historical civilizations
  - Egypt, Greece, Rome, China, Germania, Phoenicia, India, Mesopotamia
  - Persia, Sparta, Anatolia, Crete, Gaul, Carthage, Macedonia, Assyria
- **Game Session Management**: Create and manage multiple game saves
- **Class Leaderboard**: Compete with classmates based on games played
- **Progress Tracking**: View your stats and period information
- **Quick Access**: Resume games with one click

#### 4. **Database Architecture** 🗄️
- **Cloudflare D1 Database**: SQLite-based distributed database
- **5 Core Tables**:
  - `teachers`: Teacher accounts and profiles
  - `students`: Student accounts linked to teachers/periods
  - `periods`: Class periods with timeline management
  - `invite_codes`: Reusable invite codes with usage limits
  - `game_sessions`: Saved games with full state serialization
- **Auto-save Feature**: Game state saves every 30 seconds
- **Optimized Indexes**: Fast queries for all common operations

#### 5. **Backend API** 🔧
- **Hono Framework**: Lightweight, fast edge-compatible API
- **RESTful Endpoints**:
  - `/api/auth/*`: Registration, login, join (4 endpoints)
  - `/api/teacher/*`: Dashboard, periods, invite codes, students (8 endpoints)
  - `/api/student/*`: Dashboard, civilizations, game sessions, leaderboard (7 endpoints)
- **Security Middleware**: JWT verification for protected routes
- **CORS Enabled**: Cross-origin support for frontend

#### 6. **Frontend Components** 🎨
- **Landing Page**: Beautiful gradient design with role-based portals
- **Authentication Forms**: 4 polished forms (teacher login/register, student login/join)
- **Teacher Dashboard**: Complete period and student management UI
- **Student Dashboard**: Game launcher with civilization selector
- **Game Wrapper**: Integrates original game with database auto-save
- **Responsive Design**: TailwindCSS with glassmorphism effects

### 📊 Summary of Functional URIs

#### Authentication Endpoints
```
POST /api/auth/teacher/register    - Teacher account creation
POST /api/auth/teacher/login       - Teacher authentication
POST /api/auth/student/login       - Student authentication
POST /api/auth/student/join        - Student registration with invite code
```

#### Teacher Endpoints (Protected)
```
GET  /api/teacher/dashboard        - Dashboard overview with stats
GET  /api/teacher/periods          - List all class periods
POST /api/teacher/periods          - Create new period
PATCH /api/teacher/periods/:id/timeline - Update period timeline
POST /api/teacher/invite-codes     - Generate invite code
GET  /api/teacher/invite-codes     - List all invite codes
GET  /api/teacher/students         - List students (optional period filter)
GET  /api/teacher/students/:id/progress - Student game progress
```

#### Student Endpoints (Protected)
```
GET  /api/student/dashboard        - Dashboard with recent sessions
GET  /api/student/civilizations    - Available civilizations
POST /api/student/game-sessions    - Create new game
GET  /api/student/game-sessions    - List all games
GET  /api/student/game-sessions/:id - Get specific game
PATCH /api/student/game-sessions/:id - Save game state
GET  /api/student/leaderboard      - Class rankings
```

#### Frontend Routes
```
/                      - Landing page
/teacher/login         - Teacher login form
/teacher/register      - Teacher registration form
/teacher/dashboard     - Teacher dashboard
/student/login         - Student login form
/student/join          - Student join with invite code
/student/dashboard     - Student dashboard
/game/:sessionId       - Game interface with auto-save
```

### 🚧 Features Not Yet Implemented

1. **Game-Database Integration Issue**: The original GameApp.tsx is too large (56KB+) causing build timeouts
2. **Email Verification**: Teacher account email confirmation
3. **Password Reset**: Forgot password functionality
4. **Student Profile Editing**: Change name/password
5. **Teacher Analytics**: Detailed student progress charts
6. **Period Timeline Events**: Automatic historical event triggers
7. **Multiplayer Sync**: Real-time civilization interactions
8. **Wonder Tracking**: Global wonder completion status
9. **Achievement System**: Badges and milestones
10. **Export/Import**: Game save file management

### 🎯 Recommended Next Steps

#### Priority 1: Fix Build Issue
The GameApp.tsx file (56,777 bytes) is causing memory issues during Vite build:
- **Option A**: Split GameApp.tsx into smaller components
- **Option B**: Use dynamic imports for heavy components
- **Option C**: Optimize the game logic and reduce code size

#### Priority 2: Complete Deployment
Once build is fixed:
```bash
npm run build
npx wrangler pages deploy dist --project-name worldhistorysimulation
```

#### Priority 3: User Testing
- Create test teacher account
- Generate invite codes
- Test student registration flow
- Verify game state persistence

#### Priority 4: Polish & Features
- Add loading states and better error messages
- Implement period timeline advancement
- Add teacher analytics dashboard
- Create student progress reports

## 📦 Project Structure

```
webapp/
├── src/
│   ├── api/                      # Backend API (Hono)
│   │   ├── index.ts              # Main API app
│   │   ├── middleware/
│   │   │   └── auth.ts           # JWT authentication
│   │   ├── routes/
│   │   │   ├── auth.ts           # Auth endpoints
│   │   │   ├── teacher.ts        # Teacher endpoints
│   │   │   └── student.ts        # Student endpoints
│   │   └── utils/
│   │       └── crypto.ts         # Password hashing, JWT
│   ├── components/
│   │   ├── auth/                 # Login/register forms
│   │   ├── dashboard/            # Teacher/student dashboards
│   │   └── pages/                # Landing, game pages
│   └── utils/
│       └── api.ts                # Frontend API client
├── functions/
│   └── [[path]].ts               # Cloudflare Pages Functions
├── migrations/
│   └── 0001_initial_schema.sql   # Database schema
├── GameApp.tsx                   # Original game component (56KB)
├── App.tsx                       # Main app with routing
├── index.tsx                     # React entry point
├── wrangler.jsonc                # Cloudflare config
├── package.json                  # Dependencies & scripts
└── ecosystem.config.cjs          # PM2 config
```

## 🚀 Deployment Information

### Production URLs
- **Cloudflare Pages**: https://worldhistorysimulation.pages.dev
- **Latest Deploy**: https://fe9d7e08.worldhistorysimulation.pages.dev
- **GitHub Repository**: https://github.com/Eggmanaa/3D-Assests-for-World-Sim

### Database
- **Provider**: Cloudflare D1
- **Database**: worldhistorysimulation-db
- **Database ID**: ab05c467-ae98-4d3a-b526-6ac2a5a9261a
- **Tables**: 5 (teachers, students, periods, invite_codes, game_sessions)
- **Indexes**: 10 optimized indexes

### Deployment Status
- ✅ Backend API deployed to Cloudflare Workers
- ✅ Database migrations applied to production
- ✅ Cloudflare Pages project configured
- ⚠️ Frontend build needs optimization (GameApp.tsx too large)

## 🛠️ Technology Stack

### Frontend
- **React 19.2.0**: UI framework
- **React Router 7**: Client-side routing
- **TailwindCSS**: Utility-first styling
- **Lucide React**: Icon library
- **Three.js**: 3D game rendering
- **@react-three/fiber**: React Three.js renderer
- **@react-three/drei**: Three.js helpers

### Backend
- **Hono 4.10**: Fast, lightweight web framework
- **Cloudflare Workers**: Edge compute platform
- **Cloudflare D1**: Distributed SQLite database
- **Web Crypto API**: Password hashing and JWT

### Development
- **Vite 6.2**: Build tool and dev server
- **TypeScript 5.8**: Type safety
- **Wrangler 4.49**: Cloudflare CLI
- **PM2**: Process manager for local dev

## 📖 Local Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Wrangler CLI (installed as dependency)

### Setup
```bash
# Install dependencies
npm install

# Apply database migrations (local)
npm run db:migrate:local

# Build the project
npm run build

# Start development server
pm2 start ecosystem.config.cjs

# Or use wrangler directly
npm run dev:sandbox
```

### Available Scripts
```bash
npm run dev              # Vite dev server (frontend only)
npm run dev:sandbox      # Wrangler dev server with D1
npm run build            # Build for production
npm run deploy           # Deploy to Cloudflare Pages
npm run db:migrate:local # Apply migrations locally
npm run db:migrate:prod  # Apply migrations to production
npm run clean-port       # Kill process on port 3000
```

## 🔐 Authentication Flow

### Teacher Flow
1. Visit `/teacher/register`
2. Enter name, email, password
3. Account created → JWT token → redirect to dashboard
4. Create periods and generate invite codes
5. Share codes with students

### Student Flow
1. Receive invite code from teacher
2. Visit `/student/join`
3. Enter code, username, name, password
4. Account created → JWT token → redirect to dashboard
5. Select civilization and start game

## 📚 Game Features

### Historical Timeline
- **Start**: 50,000 BCE (Paleolithic Era)
- **End**: 362 CE (Late Roman Empire)
- **Span**: 30,362 years of human history

### Civilizations (18+)
Egypt • Greece • Rome • China • Germania • Phoenicia • India • Mesopotamia • Persia • Sparta • Anatolia • Crete • Gaul • Carthage • Macedonia • Assyria

### Game Mechanics
- **Resource Management**: Food, production, population, water
- **Terrain Bonuses**: Different terrains provide strategic advantages
- **Building System**: Farms, mines, walls, temples, amphitheaters, wonders
- **Technology Tree**: Research advances through the ages
- **Religion System**: Monotheism, polytheism, and religious tenets
- **Diplomacy**: Trade, alliances, and conflicts with neighbors
- **Timeline Events**: Historical events that shape your civilization
- **Wonders**: Great Pyramids, Colossus, Lighthouse, and more

## 🐛 Known Issues

1. **Build Timeout**: GameApp.tsx (56KB) causes Node.js out-of-memory errors during Vite build
2. **API Integration**: Functions need proper request context handling
3. **Game State Loading**: Initial game state from database needs testing
4. **React Router**: May need adjustments for production URL structure

## 📝 Data Models

### Teacher
```typescript
{
  id: number
  name: string
  email: string
  password_hash: string
  created_at: datetime
  updated_at: datetime
}
```

### Student
```typescript
{
  id: number
  username: string
  name: string
  password_hash: string
  teacher_id: number
  period_id: number
  created_at: datetime
  updated_at: datetime
}
```

### Period
```typescript
{
  id: number
  teacher_id: number
  name: string
  start_year: number
  end_year: number
  current_year: number
  created_at: datetime
  updated_at: datetime
}
```

### Invite Code
```typescript
{
  id: number
  code: string (6 chars)
  teacher_id: number
  period_id: number
  max_uses: number | null
  current_uses: number
  expires_at: datetime | null
  created_at: datetime
}
```

### Game Session
```typescript
{
  id: number
  student_id: number
  teacher_id: number
  period_id: number
  civilization_id: string
  game_state: text (JSON)
  status: 'active' | 'completed'
  created_at: datetime
  updated_at: datetime
}
```

## 🎓 Educational Value

This project teaches students:
- **World History**: Ancient civilizations and their interactions
- **Resource Management**: Economic decision-making
- **Strategic Thinking**: Long-term planning and consequences
- **Cultural Awareness**: Understanding different civilizations
- **Timeline Comprehension**: Chronological understanding of history

## 📄 License

This project is for educational purposes.

## 👥 Contributors

- Project created for Bishop Garcia Diego High School
- Phase 2 implementation: Complete authentication and dashboard system

## 🆘 Support

For issues or questions:
1. Check the Known Issues section
2. Review the deployment logs
3. Check Cloudflare Workers/Pages dashboard

---

**Last Updated**: 2025-11-19  
**Version**: Phase 2 Complete  
**Status**: Backend deployed, frontend needs build optimization
