# Vercel Deployment Guide

This guide will help you deploy your Next.js frontend to Vercel using the Vercel CLI.

## Prerequisites

1. **Install Vercel CLI globally:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

## Environment Variables Setup

1. **Copy the environment template:**
   ```bash
   cp env.template .env.local
   ```

2. **Fill in your environment variables in `.env.local`**

3. **For production deployment, set environment variables in Vercel dashboard:**
   - Go to your project in Vercel dashboard
   - Navigate to Settings > Environment Variables
   - Add all required environment variables

## Deployment Commands

### Deploy to Preview (Development)
```bash
npm run deploy-preview
# or
vercel
```

### Deploy to Production
```bash
npm run deploy
# or
vercel --prod
```

### Build Locally (Test)
```bash
npm run build
npm start
```

## Project Structure

The following files have been configured for Vercel deployment:

- `vercel.json` - Vercel deployment configuration
- `next.config.mjs` - Next.js configuration with production optimizations
- `.vercelignore` - Files to exclude from deployment
- `package.json` - Updated with deployment scripts
- `env.template` - Environment variables template

## Configuration Details

### Vercel Configuration (`vercel.json`)
- Uses Node.js 18.x runtime
- Configured for Next.js framework
- Includes security headers
- Optimized for production

### Next.js Configuration (`next.config.mjs`)
- Standalone output for better performance
- Image optimization enabled
- CSS optimization enabled
- Security headers configured
- Compression enabled

## Troubleshooting

### Common Issues

1. **Build Failures:**
   - Check that all dependencies are in `package.json`
   - Ensure TypeScript compilation passes
   - Verify environment variables are set

2. **Environment Variables:**
   - Make sure all required env vars are set in Vercel dashboard
   - Check that variable names match exactly

3. **Image Optimization:**
   - If using external images, add domains to `next.config.mjs`
   - Ensure images are properly formatted

### Useful Commands

```bash
# Check Vercel CLI version
vercel --version

# View deployment logs
vercel logs

# Remove deployment
vercel remove

# Link to existing project
vercel link
```

## Next Steps

1. Set up your environment variables
2. Test the build locally: `npm run build`
3. Deploy to preview: `npm run deploy-preview`
4. Deploy to production: `npm run deploy`

## Support

For more information, visit:
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
