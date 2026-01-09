# Environment-Based Database Configuration

This project uses environment-specific database URLs to support different environments (development, testing, and production).

## How It Works

The server automatically selects the correct database URL based on the `NODE_ENV` environment variable:

- **`NODE_ENV=development`** → Uses `DB_DEV_URL`
- **`NODE_ENV=production`** → Uses `DB_PROD_URL`
- **`NODE_ENV=test`** → Uses `DB_TEST_URL`

If an environment-specific URL is not found, the system falls back to `DATABASE_URL`.

## Setup Instructions

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Configure your database URLs in `.env`:**
   ```env
   NODE_ENV=development
   
   DB_DEV_URL=postgresql://user:password@localhost:5432/dev_db
   DB_PROD_URL=postgresql://user:password@prod-host:5432/prod_db
   DB_TEST_URL=postgresql://user:password@localhost:5432/test_db
   ```

3. **Run Prisma migrations:**
   ```bash
   # For development
   NODE_ENV=development npx prisma migrate dev
   
   # For production
   NODE_ENV=production npx prisma migrate deploy
   ```

4. **Start the server:**
   ```bash
   # Development
   npm run dev
   
   # Production
   NODE_ENV=production npm start
   ```

## Environment Variables

### Required
- `NODE_ENV` - Environment mode (development, production, test)
- `DB_DEV_URL` - Development database URL
- `DB_PROD_URL` - Production database URL (for production deployments)
- `DB_TEST_URL` - Test database URL (for running tests)
- `JWT_SECRET` - Secret key for JWT token generation
- `PORT` - Server port (default: 3333)
- `PREFIX` - API prefix (default: /api/v1)

### Optional
- `DATABASE_URL` - Fallback database URL if environment-specific URL is not set
- `CORS_ORIGIN` - Allowed CORS origins
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` - Email configuration

## Safety Features

The configuration includes a safety guard to prevent accidentally using production/development databases in test mode. This is implemented in `src/config/app.config.ts`.

## Files Involved

- **`src/config/app.config.ts`** - Main configuration with environment-based database URL selection
- **`src/utils/prisma.ts`** - Prisma client configured to use the selected database URL
- **`.env`** - Your local environment variables (not committed to git)
- **`.env.example`** - Template for environment variables
