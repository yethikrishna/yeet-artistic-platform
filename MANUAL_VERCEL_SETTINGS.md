# Manual Vercel Settings

If vercel.json continues to cause issues, use these manual settings in Vercel UI:

## Framework Detection
- Framework Preset: Vite

## Build Settings  
- Build Command: npm run build
- Output Directory: dist
- Install Command: npm install
- Development Command: npm run dev

## Root Directory
- Leave empty (repository root)

## Environment Variables
- NODE_ENV: production
