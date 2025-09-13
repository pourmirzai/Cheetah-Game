# Deployment Plan for Save Cheetah Project

## Current Project Structure
- **Frontend**: React + Vite application located in `client/` directory
- **Backend**: TypeScript server in `server/` directory with routes and database logic
- **API Routes**: Currently in `api/` directory at root level (e.g., `api/ping.ts`, `api/game/start.ts`)
- **Shared**: Common schemas and types in `shared/` directory
- **Assets**: Static assets in `public/` directory

## Deployment Strategy: Full Separation (Recommended)
Since Vercel works best with static sites + serverless functions, but our backend requires full Node.js capabilities, we'll deploy frontend and backend separately.

### Frontend Deployment (Vercel - Static)
- **Location**: `client/` directory
- **Build Process**: Use Vite to build static files to `dist/` or `client/dist/`
- **Deployment**: Deploy static build to Vercel
- **Configuration**: Update `vite.config.ts` for production build settings

### Backend Deployment (Render/Railway - Full Node.js)
- **Location**: `server/` directory (contains `index.ts`, `routes.ts`, `storage.ts`, `db.ts`)
- **Deployment Platform**: Render or Railway (recommended for full Node.js support)
- **API Routes**: Move current `api/` routes to backend or restructure as needed
- **Database**: Ensure database connection works in deployed environment

### Key Changes Required

#### 1. Frontend Changes
- Update all API fetch calls from relative paths (e.g., `/api/game/start`) to absolute URLs pointing to deployed backend
- Add environment variable for backend URL (e.g., `VITE_BACKEND_URL`)
- Ensure build process outputs to correct directory for Vercel static deployment

#### 2. Backend Changes
- Move API route logic from `api/` directory into `server/routes.ts` or create proper Express routes
- Update CORS settings to allow requests from deployed frontend domain
- Ensure all dependencies are properly configured for deployment
- Add health check endpoint if needed

#### 3. Configuration Files
- Update `vercel.json` for frontend-only deployment
- Create deployment configuration for chosen backend platform (Render/Railway)
- Update `package.json` scripts for separate build processes

#### 4. Environment Variables
- Set up environment variables for:
  - Database connection strings
  - Backend URL for frontend
  - Any API keys or secrets

## Implementation Steps

### Phase 1: Prepare Frontend for Deployment
1. Update `vite.config.ts` for production build
2. Add environment variable support for backend URL
3. Update all fetch calls in components to use environment variable
4. Test build process locally

### Phase 2: Prepare Backend for Deployment
1. Restructure API routes if needed (move from `api/` to `server/`)
2. Update CORS configuration
3. Add deployment-specific configuration
4. Test backend locally with updated structure

### Phase 3: Deployment
1. Deploy frontend to Vercel
2. Deploy backend to Render/Railway
3. Update frontend environment variables with backend URL
4. Test end-to-end functionality

### Phase 4: Post-Deployment
1. Monitor performance and errors
2. Update documentation
3. Set up CI/CD if needed

## Alternative Approach (Not Recommended)
If we want to keep everything on Vercel, we would need to:
- Move all backend logic into `/api/` directory as serverless functions
- Restructure the entire backend to work within Vercel's serverless limitations
- This would require significant refactoring and may not be suitable for complex backend operations

## Risks and Considerations
- Ensure database connectivity works in deployed backend environment
- Handle CORS properly between frontend and backend domains
- Monitor cold start times for backend if using serverless
- Plan for scaling requirements

## Current Status ✅
- ✅ Frontend prepared for Vercel deployment
- ✅ Backend prepared for Render/Railway deployment
- ✅ CORS configuration added
- ✅ Environment variable support implemented
- ✅ API routes restructured
- ✅ Deployment configuration files created

## Next Steps
1. **Choose Backend Platform**: Decide between Render or Railway for backend deployment
2. **Set up Database**: Configure database connection (PostgreSQL recommended)
3. **Deploy Frontend to Vercel**:
   - Connect your GitHub repository to Vercel
   - Set build settings: `cd client && npm run build`
   - Set output directory: `dist`
4. **Deploy Backend**:
   - For Render: Use `render.yaml` configuration
   - For Railway: Use `railway.json` configuration
   - Set environment variables from `.env.example`
5. **Update Frontend Environment**:
   - In Vercel dashboard, add `VITE_API_BASE_URL` environment variable
   - Set it to your deployed backend URL
6. **Test End-to-End**: Verify frontend can communicate with backend
7. **Update DNS**: Point your domain to Vercel if needed

## Deployment Commands
```bash
# Frontend deployment (Vercel will handle this automatically)
cd client && npm run build

# Backend deployment (manual or via platform)
npm start
```

## Environment Variables Required
See `.env.example` for all required environment variables.

## Important Notes
- The `api/` folder contains Vercel serverless functions that are now redundant
- All API logic has been moved to `server/routes.ts`
- CORS is configured to allow requests from Vercel deployments
- Health check endpoint available at `/health`