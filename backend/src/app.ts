import express from 'express';
import session from 'express-session';
import cors from 'cors';
import SQLiteStore from 'connect-sqlite3';
import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/auth';
import pensionRoutes from './routes/pensions';
import contributionRoutes from './routes/contributions';
import holdingRoutes from './routes/holdings';
import stockRoutes from './routes/stocks';

const app = express();

// Setup SQLite session store
const SQLiteSessionStore = SQLiteStore(session);

// Middleware
app.use(cors({
  origin: config.nodeEnv === 'development' ? 'http://localhost:5173' : false,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  store: new SQLiteSessionStore({
    db: 'sessions.db',
    dir: '.',
  }),
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.nodeEnv === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: config.nodeEnv === 'production' ? 'strict' : 'lax',
  },
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pensions', pensionRoutes);
app.use('/api', contributionRoutes);
app.use('/api', holdingRoutes);
app.use('/api/stocks', stockRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
