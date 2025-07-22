# Entrepeques Production Deployment Guide

## Overview
This guide covers the deployment process for all Entrepeques applications:
- **Backend API + PostgreSQL**: Heroku
- **Frontend Apps**: Vercel (Valuador, Admin, Tienda, POS)

## Prerequisites

### Required Accounts
- [ ] Heroku account with verified payment method
- [ ] Vercel account (free tier works)
- [ ] AWS account for S3 image storage

### Required CLI Tools
```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Install Vercel CLI
npm install -g vercel

# Verify installations
heroku --version
vercel --version
```

## Backend Deployment (Heroku)

### 1. Initial Heroku Setup

```bash
# Navigate to API directory
cd packages/api

# Login to Heroku
heroku login

# Create new Heroku app
heroku create entrepeques-api

# Add PostgreSQL addon (Hobby Dev free tier)
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secure-jwt-secret-here
heroku config:set CORS_ORIGIN=https://valuador.entrepeques.com,https://admin.entrepeques.com,https://tienda.entrepeques.com,https://pos.entrepeques.com
heroku config:set AWS_ACCESS_KEY_ID=your-aws-access-key
heroku config:set AWS_SECRET_ACCESS_KEY=your-aws-secret-key
heroku config:set AWS_REGION=us-east-2
heroku config:set S3_BUCKET_NAME=pequetienda
```

### 2. Database Migration Setup

```bash
# Get database URL
heroku config:get DATABASE_URL

# Create migration script in package.json
# Add to scripts section:
"migrate:prod": "DATABASE_URL=$(heroku config:get DATABASE_URL) npm run migrate"
```

### 3. Deploy API to Heroku

```bash
# Ensure you're in the packages/api directory
cd packages/api

# Initialize git if not already done
git init
git add .
git commit -m "Initial API commit"

# Add Heroku remote
heroku git:remote -a entrepeques-api

# Deploy to Heroku
git push heroku main

# Run migrations on production
heroku run npm run migrate

# Check logs
heroku logs --tail
```

### 4. Verify API Deployment

```bash
# Test API health endpoint
curl https://entrepeques-api.herokuapp.com/api/health

# Open app in browser
heroku open
```

## Frontend Deployments (Vercel)

### General Vercel Setup

```bash
# Login to Vercel
vercel login

```

### Deploy Valuador App

```bash
# Navigate to valuador app
cd apps/valuador

# Deploy to Vercel
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name? entrepeques-valuador
# - Directory? ./
# - Override settings? N

# Set environment variables
vercel env add PUBLIC_API_URL
# Enter: https://entrepeques-api.herokuapp.com

# Deploy to production
vercel --prod

# Set custom domain (in Vercel dashboard)
# valuador.entrepeques.com → entrepeques-valuador.vercel.app
```

### Deploy Admin App

```bash
# Navigate to admin app
cd apps/admin

# Deploy to Vercel
vercel

# Follow prompts:
# - Project name? entrepeques-admin
# - Rest: same as valuador

# Set environment variables
vercel env add PUBLIC_API_URL
# Enter: https://entrepeques-api.herokuapp.com

# Deploy to production
vercel --prod

# Set custom domain
# admin.entrepeques.com → entrepeques-admin.vercel.app
```

### Deploy Tienda App

```bash
# Navigate to tienda app
cd apps/tienda

# Deploy to Vercel
vercel

# Follow prompts:
# - Project name? entrepeques-tienda
# - Rest: same as valuador

# Set environment variables
vercel env add PUBLIC_API_URL
# Enter: https://entrepeques-api.herokuapp.com

# Deploy to production
vercel --prod

# Set custom domain
# tienda.entrepeques.com → entrepeques-tienda.vercel.app
```

### Deploy POS App

```bash
# Navigate to pos app
cd apps/pos

# Deploy to Vercel
vercel

# Follow prompts:
# - Project name? entrepeques-pos
# - Rest: same as valuador

# Set environment variables
vercel env add PUBLIC_API_URL
# Enter: https://entrepeques-api.herokuapp.com

# Deploy to production
vercel --prod

# Set custom domain
# pos.entrepeques.com → entrepeques-pos.vercel.app
```

## Post-Deployment Configuration

### 1. Update CORS in Heroku

Once you have all Vercel URLs:

```bash
heroku config:set CORS_ORIGIN=https://entrepeques-valuador.vercel.app,https://entrepeques-admin.vercel.app,https://entrepeques-tienda.vercel.app,https://entrepeques-pos.vercel.app
```

### 2. Create Production Users

```bash
# Connect to production database
heroku pg:psql

# Create admin user (run this SQL)
INSERT INTO users (username, email, password_hash, first_name, last_name, role_id, is_active)
VALUES (
  'admin',
  'admin@entrepeques.com',
  '$2b$10$YourHashedPasswordHere', -- Generate with bcrypt
  'Admin',
  'Entrepeques',
  (SELECT id FROM roles WHERE name = 'admin'),
  true
);
```

### 3. Load Initial Data

```bash
# Run seed data migrations if needed
heroku run npm run migrate

# Or manually load critical data
heroku pg:psql < data/sql_inserts/insert_brands.sql
heroku pg:psql < data/sql_inserts/insert_all_feature_definitions.sql
```

## Domain Configuration

### 1. DNS Setup (in your domain provider)

Add CNAME records:
```
valuador.entrepeques.com → cname.vercel-dns.com
admin.entrepeques.com → cname.vercel-dns.com
tienda.entrepeques.com → cname.vercel-dns.com
pos.entrepeques.com → cname.vercel-dns.com
api.entrepeques.com → entrepeques-api.herokuapp.com
```

### 2. Configure Domains in Vercel

For each app in Vercel dashboard:
1. Go to Settings → Domains
2. Add custom domain
3. Follow verification steps

### 3. Update Environment Variables

After domains are configured, update all apps:

```bash
# For each Vercel app
vercel env add PUBLIC_API_URL
# Enter: https://api.entrepeques.com

# Update Heroku CORS
heroku config:set CORS_ORIGIN=https://valuador.entrepeques.com,https://admin.entrepeques.com,https://tienda.entrepeques.com,https://pos.entrepeques.com
```

## Monitoring & Maintenance

### Heroku Monitoring

```bash
# View logs
heroku logs --tail

# Check app metrics
heroku ps

# Database info
heroku pg:info

# Run console
heroku run node
```

### Vercel Monitoring

```bash
# View deployment logs
vercel logs entrepeques-valuador

# List all deployments
vercel list

# Rollback if needed
vercel rollback [deployment-url]
```

## Backup Strategy

### Database Backups

```bash
# Manual backup
heroku pg:backups:capture

# Schedule daily backups
heroku pg:backups:schedule DATABASE_URL --at '02:00 America/Mexico_City'

# Download backup
heroku pg:backups:download
```

### Code Backups

Ensure all code is committed to Git:
```bash
# In root directory
git add .
git commit -m "Production deployment"
git push origin main
```

## Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Check CORS settings
   - Verify PUBLIC_API_URL in frontend apps
   - Check Heroku logs: `heroku logs --tail`

2. **Database Connection Issues**
   - Verify DATABASE_URL is set correctly
   - Check connection pool settings
   - Review pg:diagnose: `heroku pg:diagnose`

3. **Build Failures**
   - Check Node.js version compatibility
   - Ensure all dependencies are in package.json
   - Review build logs in Vercel/Heroku

4. **Authentication Issues**
   - Verify JWT_SECRET matches across deployments
   - Check token expiration settings
   - Ensure CORS includes all frontend domains

## Deployment Checklist

### Pre-Deployment
- [ ] All code committed to Git
- [ ] Environment variables documented
- [ ] Database migrations tested locally
- [ ] API endpoints tested
- [ ] Frontend builds successfully

### Deployment
- [ ] Deploy API to Heroku
- [ ] Run database migrations
- [ ] Deploy all frontend apps to Vercel
- [ ] Configure environment variables
- [ ] Set up custom domains

### Post-Deployment
- [ ] Test all authentication flows
- [ ] Verify CORS settings
- [ ] Create production users
- [ ] Set up monitoring
- [ ] Configure backups
- [ ] Test critical user flows

## Emergency Rollback

### Heroku Rollback
```bash
# List releases
heroku releases

# Rollback to previous release
heroku rollback v10
```

### Vercel Rollback
```bash
# List deployments
vercel list

# Promote previous deployment
vercel alias [deployment-url] [your-domain]
```

## Cost Considerations

### Heroku
- Hobby Dyno: $7/month
- Hobby Postgres: Free (10K rows)
- Upgrade to Standard when needed

### Vercel
- Free tier: Usually sufficient
- Pro: $20/month per member if needed

### AWS S3
- Pay per usage
- ~$0.023 per GB stored
- ~$0.09 per GB transferred

## Security Best Practices

1. **Environment Variables**
   - Never commit secrets to Git
   - Use strong JWT secrets
   - Rotate credentials regularly

2. **Database Security**
   - Use connection pooling
   - Enable SSL connections
   - Regular backups

3. **API Security**
   - Rate limiting (implement if needed)
   - HTTPS only
   - Proper CORS configuration

4. **Monitoring**
   - Set up alerts for errors
   - Monitor response times
   - Track resource usage