# Pension Tracker

A web application for tracking pension contributions and stock holdings built with React, TypeScript, Express, and SQLite.

## Features

- Track multiple pension accounts (SIPP and managed types)
- Monitor contributions and current values
- Track stock holdings with real-time prices from AlphaVantage
- Auto-calculate expected contributions for regular fixed pensions
- Secure authentication with session-based login
- Manage contributions and holdings through an intuitive interface

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- AlphaVantage API key (get one free at https://www.alphavantage.co/support/#api-key)

### Installation

1. Install backend dependencies:
```bash
cd backend
npm install
```

2. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### Configuration

1. Create a `.env` file in the backend directory based on `.env.example`:
```bash
cd backend
cp .env.example .env
```

2. Edit the `.env` file and add your configuration:
```env
NODE_ENV=development
PORT=3000
SESSION_SECRET=your-random-secret-key-here
ALPHAVANTAGE_API_KEY=N1PYJXQSD4NV27OW
DATABASE_PATH=./pension_tracker.db
INITIAL_USERNAME=admin
INITIAL_PASSWORD=changeme
```

1. Create a `.env` file in the frontend directory based on `.env.example`:

```bash
cd frontend
cp .env.example .env
```

You shouldn't need to change it for local development.

### Database Setup

Initialize the database and create the initial user:
```bash
cd backend
npm run seed
```

This will create the database tables and an initial user with the credentials from your `.env` file.

### Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

The backend will run on http://localhost:3000

2. In a new terminal, start the frontend development server:
```bash
cd frontend
npm run dev
```

The frontend will run on http://localhost:5173

3. Open your browser and navigate to http://localhost:5173

4. Login with the credentials you set in your `.env` file (default: admin/changeme)

### Building for Production

1. Build the backend:
```bash
cd backend
npm run build
npm start
```

2. Build the frontend:
```bash
cd frontend
npm run build
```

The production build will be in the `dist` directory.

## Usage

### Adding a Pension

1. Click "Add Pension" in the navigation
2. Fill in the pension details:
   - Name
   - Type (SIPP or Managed)
   - Contribution type (Manual or Regular Fixed)
   - For regular fixed: monthly amount and day of month

### Managing Pensions

1. Click "Manage Pension" on any pension card
2. Add/edit/delete contributions
3. For SIPP pensions: add/edit/delete stock holdings
4. Delete the pension if needed

### Viewing Your Dashboard

The main dashboard shows:
- All your pensions
- Total contributions for each
- Current value (for SIPP: sum of stock holdings at current prices)
- Stock holdings with real-time prices

Stock prices update automatically every 30 seconds while viewing the dashboard.

## Technology Stack

### Backend
- Express.js with TypeScript
- SQLite database
- bcrypt for password hashing
- express-session for authentication
- AlphaVantage API for stock prices

### Frontend
- React with TypeScript
- Vite for build tooling
- React Router for navigation
- Axios for API calls
- Context API for state management

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/session` - Check session

### Pensions
- `GET /api/pensions` - List all pensions
- `POST /api/pensions` - Create pension
- `GET /api/pensions/:id` - Get single pension
- `PUT /api/pensions/:id` - Update pension
- `DELETE /api/pensions/:id` - Delete pension

### Contributions
- `GET /api/pensions/:pensionId/contributions` - List contributions
- `POST /api/pensions/:pensionId/contributions` - Add contribution
- `PUT /api/contributions/:id` - Update contribution
- `DELETE /api/contributions/:id` - Delete contribution

### Holdings
- `GET /api/pensions/:pensionId/holdings` - List holdings
- `POST /api/pensions/:pensionId/holdings` - Add holding
- `PUT /api/holdings/:id` - Update holding
- `DELETE /api/holdings/:id` - Delete holding

### Stock Prices
- `GET /api/stocks/prices?tickers=AAPL,GOOGL` - Get multiple stock prices
- `GET /api/stocks/quote/:ticker` - Get single stock quote

## License

ISC

# Claude Code

I generated this using Claude Code.

Here is the initial prompt:

```
Build a React typescript web app for tracking my pension contributions and stock holdings. Use a SQLite database.

Main page:
For each pension account, total amount of contributions and the current value of the pension.
If the pension is a SIPP, show a list of holdings and their current value. Use the alphavantage API to
get stock prices. The API key should be stored in a .env file which is gitignored. Use dotenv.

Add pension page:
A form allowing input of pension name, a dropdown to select the contribution type (regular fixed or
manual) and a dropdown to select the type (SIPP or managed).
If regular fixed contributions were selected, show fields for inputting the monthly amount and day of the
month the contributions are expected.

Manage pension page:
Ability to delete the pension.
Ability to add a contribution if the pension's contribution type is manual (amount and date).
Ability to edit and delete contributions.
Ability to add, edit and delete stock holdings if the pension type is SIPP (ticker symbol and number of
shares).

Login page:
Username and password.
```

Claude went into plan mode and asked a few questions.

```
⏺ Good! This is a fresh project. Before I create a detailed implementation plan, I have some architectural questions:

⏺ User answered Claude's questions:
  ⎿  · What application architecture would you prefer for this pension tracker? → Vite React + Express
     backend (Recommended)
     · How should user authentication work? → Single local user (Recommended)
     · For regular fixed contributions, should the app automatically calculate expected contributions? →
     Auto-calculate expected contributions
```

After deliberation, this was Claude's plan:

```
⏺ Perfect! I've created a comprehensive implementation plan for your pension tracker application. The plan includes:

  - Architecture: Vite React frontend + Express backend with SQLite
  - Complete database schema with 4 tables (users, pensions, contributions, holdings)
  - 40+ implementation steps organized into 6 phases
  - All API endpoints needed for the application
  - Technical considerations for AlphaVantage API integration, contribution calculations, and security
  - File structure for both frontend and backend

  The plan addresses all your requirements:
  - Main page showing pension totals and SIPP holdings with live stock prices
  - Add pension page with conditional fields
  - Manage pension page for contributions and holdings
  - Login page with single-user authentication
  - Auto-calculation of expected contributions with missing payment detection

─────────────────────────────────────────────────────────────────────────────────────────────────────────────
 Ready to code?

 Here is Claude's plan:
╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
 Pension Tracker Implementation Plan

 Overview

 Building a Vite React + TypeScript frontend with Express + TypeScript backend and SQLite database for
 tracking pension contributions and stock holdings.

 Architecture Decisions

 - Frontend: Vite + React + TypeScript
 - Backend: Express + TypeScript with SQLite
 - Auth: Single local user with session-based authentication
 - State Management: React Context + custom hooks
 - Stock Prices: AlphaVantage API with caching (15-min TTL)
 - Auto-calculation: Expected contributions based on schedule

 Database Schema

 Tables

 1. users: id, username, password_hash, created_at
 2. pensions: id, user_id, name, type (SIPP/managed), contribution_type (regular_fixed/manual),
 monthly_amount, day_of_month, created_at
 3. contributions: id, pension_id, amount, contribution_date, created_at
 4. holdings: id, pension_id, ticker, shares, created_at, updated_at

 Key Relationships

 - All foreign keys cascade on delete
 - Unique constraint on (pension_id, ticker) for holdings
 - Indexes on pension_id and contribution_date for performance

 Project Structure

 pension-tracker/
 ├── frontend/                 # Vite React app
 │   ├── src/
 │   │   ├── api/              # Axios client, API functions
 │   │   ├── components/       # React components
 │   │   ├── context/          # AuthContext, PensionContext
 │   │   ├── hooks/            # useAuth, usePensions, useStockPrices
 │   │   ├── pages/            # Login, Dashboard, AddPension, ManagePension
 │   │   ├── types/            # TypeScript definitions
 │   │   └── utils/            # Date helpers, contribution calculator
 │   ├── .env.example
 │   └── package.json
 └── backend/                  # Express API
     ├── src/
     │   ├── config/           # Database connection, env validation
     │   ├── middleware/       # Auth, error handling, validation
     │   ├── models/           # User, Pension, Contribution, Holding
     │   ├── routes/           # API endpoints
     │   ├── services/         # Business logic, AlphaVantage integration
     │   └── db/               # schema.sql, migrations
     ├── .env.example
     └── package.json

 API Endpoints

 Authentication

 - POST /api/auth/login - Login with username/password
 - POST /api/auth/logout - Logout
 - GET /api/auth/session - Check session status

 Pensions

 - GET /api/pensions - List all with totals
 - GET /api/pensions/:id - Get single pension
 - POST /api/pensions - Create pension
 - PUT /api/pensions/:id - Update pension
 - DELETE /api/pensions/:id - Delete pension

 Contributions

 - GET /api/pensions/:pensionId/contributions - List contributions
 - POST /api/pensions/:pensionId/contributions - Add contribution
 - PUT /api/contributions/:id - Update contribution
 - DELETE /api/contributions/:id - Delete contribution

 Holdings

 - GET /api/pensions/:pensionId/holdings - List holdings
 - POST /api/pensions/:pensionId/holdings - Add holding
 - PUT /api/holdings/:id - Update holding
 - DELETE /api/holdings/:id - Delete holding

 Stock Prices

 - GET /api/stocks/prices?tickers=AAPL,GOOGL - Batch price lookup
 - GET /api/stocks/quote/:ticker - Single quote

 Implementation Steps

 Phase 1: Backend Foundation

 1. Initialize backend project with TypeScript
 2. Setup Express with CORS, sessions, JSON middleware
 3. Create SQLite database configuration
 4. Implement database schema and migrations
 5. Build User model with bcrypt password hashing
 6. Create auth service and routes (login/logout/session)
 7. Implement auth middleware for protected routes

 Phase 2: Core Backend Features

 8. Create Pension model with CRUD operations
 9. Build pension routes with validation
 10. Create Contribution model and routes
 11. Implement contribution aggregation logic
 12. Create Holdings model and routes
 13. Build AlphaVantage service with caching and rate limiting
 14. Implement stock price endpoints
 15. Add expected contribution calculation service

 Phase 3: Frontend Foundation

 16. Initialize Vite + React + TypeScript project
 17. Configure Vite proxy to backend
 18. Create TypeScript type definitions
 19. Setup Axios client with credentials
 20. Build AuthContext and useAuth hook
 21. Create LoginPage with form
 22. Implement protected route wrapper

 Phase 4: Core Frontend Features

 23. Build DashboardPage (main page)
 24. Create PensionList and PensionCard components
 25. Implement StockHoldings component with real-time prices
 26. Add useStockPrices hook with polling
 27. Build AddPensionPage with conditional fields
 28. Create ManagePensionPage with tabs
 29. Implement ContributionsList with edit/delete
 30. Build ManageHoldingsForm for SIPP pensions

 Phase 5: Advanced Features

 31. Implement contribution calculation logic
 32. Add missing/late contribution detection
 33. Create visual indicators for contribution status
 34. Add loading states and error handling
 35. Implement confirmation dialogs
 36. Add responsive layouts

 Phase 6: Polish & Setup

 37. Create .gitignore for node_modules, .env, database
 38. Add .env.example files with documentation
 39. Create initial user seed script
 40. Update README with setup instructions
 41. Test all features end-to-end

 Key Dependencies

 Backend

 - express, express-session, connect-sqlite3
 - sqlite3, bcrypt
 - cors, dotenv, axios
 - TypeScript tooling

 Frontend

 - react, react-dom, react-router-dom
 - axios, react-hook-form
 - TypeScript, Vite

 Technical Considerations

 AlphaVantage Integration

 - Free tier: 5 API calls/minute, 500/day
 - Cache prices for 15 minutes in-memory
 - Queue requests with 12-second delay
 - Graceful error handling with stale price indicators

 Contribution Calculation

 - For regular_fixed pensions: calculate expected contributions
 - Check for missing payments within grace period (3 days)
 - Status: received, pending, missing, late
 - Display warnings for missing contributions

 Security

 - bcrypt password hashing (10 rounds)
 - Session-based auth with httpOnly cookies
 - CSRF protection via same-origin policy
 - Environment variable validation on startup

 Performance

 - Database indexes on foreign keys
 - Frontend: React.memo for expensive components
 - Stock price polling only when dashboard visible
 - Optimistic UI updates for better UX

 Critical Files to Create First

 1. backend/src/config/database.ts - Database setup
 2. backend/src/db/schema.sql - Complete schema
 3. backend/src/services/alphaVantageService.ts - Stock API integration
 4. backend/src/services/contributionService.ts - Business logic
 5. frontend/src/types/pension.ts - Type definitions

 Environment Variables

 Backend (.env)

 NODE_ENV=development
 PORT=3000
 SESSION_SECRET=generate-random-secret
 ALPHAVANTAGE_API_KEY=your-api-key
 DATABASE_PATH=./pension_tracker.db
 INITIAL_USERNAME=admin
 INITIAL_PASSWORD=changeme

 Frontend (.env)

 VITE_API_URL=http://localhost:3000/api

 Data Flow Examples

 Main Page (Dashboard)

 1. Frontend fetches all pensions from GET /api/pensions
 2. Backend joins contributions to calculate totals
 3. For SIPP pensions, fetch holdings
 4. Frontend calls GET /api/stocks/prices with all tickers
 5. Backend returns cached prices or fetches from AlphaVantage
 6. Calculate current value: sum(shares × price) per holding
 7. Display pension cards with totals and holdings

 Expected Contributions

 1. Frontend requests pension data
 2. Backend calculates expected contributions based on monthly_amount and day_of_month
 3. Compare with actual contributions in database
 4. Return status for each expected contribution
 5. Frontend highlights missing/late payments

 Adding Stock Holding

 1. User enters ticker + shares on ManagePension page
 2. POST /api/pensions/:id/holdings
 3. Backend validates and inserts into holdings table
 4. Return updated holding
 5. Frontend fetches current price and updates display

 Success Criteria

 - Plan completed
 - User can login with credentials
 - User can add/edit/delete pensions
 - User can add/edit/delete contributions
 - User can add/edit/delete stock holdings (SIPP only)
 - Dashboard shows total contributions and current values
 - Stock prices update from AlphaVantage API
 - Expected contributions calculated and missing payments detected
 - All data persisted in SQLite database
 - Environment variables properly configured
 ```

Here was the final output from Claude:

```
 Summary

  I've successfully built a complete Pension Tracker web application with the following features:

  Backend (Express + TypeScript + SQLite)

  - Authentication system with session-based login
  - User management with password hashing using bcrypt
  - Pension CRUD operations supporting SIPP and managed pension types
  - Contribution tracking with manual and regular fixed contribution types
  - Stock holdings management for SIPP pensions
  - AlphaVantage API integration with intelligent caching (15-min TTL) and rate limiting
  - Contribution calculation service for auto-calculating expected contributions

  Frontend (React + TypeScript + Vite)

  - Login page with authentication
  - Dashboard displaying all pensions with:
    - Total contributions
    - Current values (calculated from stock holdings for SIPPs)
    - Stock holdings with real-time prices
    - Auto-refresh every 30 seconds
  - Add Pension page with conditional form fields
  - Manage Pension page for:
    - Adding/editing/deleting contributions
    - Managing stock holdings (SIPP only)
    - Deleting pensions
  - Protected routes ensuring authentication
  - Responsive UI with clean styling

  Database Schema

  - Users table
  - Pensions table (with type and contribution_type)
  - Contributions table
  - Holdings table (with unique constraint per pension/ticker)
  - Proper foreign key relationships with cascade deletes

  Key Features Implemented

  - Session-based authentication with httpOnly cookies
  - Real-time stock price fetching with caching and rate limiting
  - Automatic contribution calculation for regular fixed pensions
  - Full CRUD operations for all entities
  - Type-safe TypeScript throughout
  - Proper error handling and validation

  To Run the Application:

  1. Backend (already configured):
  cd backend
  npm run dev
  Server runs on http://localhost:3001

  2. Frontend:
  cd frontend
  npm run dev
  Frontend runs on http://localhost:5173

  3. Login credentials:
  - Username: admin
  - Password: admin123

  The application is fully functional and ready to track your pension contributions and stock holdings with real-time price updates from AlphaVantage!
  ```
  