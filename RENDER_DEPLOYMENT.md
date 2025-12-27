# Render Deployment Configuration

## Build Command
```
npm run render-build
```

## Start Command
```
npm start
```

## Environment Variables (Set in Render Dashboard)

```
PORT=5500
PREFIX=/api/v1
DATABASE_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d
CORS_ORIGIN=*
NODE_ENV=production
```

## Important Notes

1. **Build Command**: Use `npm run render-build` instead of just `npm run build`
   - This ensures dependencies are installed before building

2. **Start Command**: Use `npm start`
   - This runs `node dist/server.js`

3. **Root Directory**: Should be set to the project root (where package.json is)

4. **Node Version**: Render uses Node 14+ by default. To specify:
   - Add to package.json:
   ```json
   "engines": {
     "node": ">=18.0.0"
   }
   ```

## Troubleshooting

### Error: Cannot find module '/opt/render/project/src/dist/server.js'

**Cause**: Render is looking in the wrong path

**Solution**:
1. Ensure `outDir` in tsconfig.json is set to `"dist"` (not `"src/dist"`)
2. Ensure `rootDir` in tsconfig.json is set to `"src"`
3. Use the correct start command: `npm start` (which runs `node dist/server.js`)

### Build Fails

**Check**:
1. All dependencies are in `dependencies` (not just `devDependencies`)
2. TypeScript is in `devDependencies`
3. Build command is `npm run render-build`

### Server Crashes on Start

**Check**:
1. All environment variables are set in Render dashboard
2. DATABASE_URL is correct
3. Port is set correctly (Render provides PORT automatically)
