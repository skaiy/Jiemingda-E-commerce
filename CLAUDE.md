# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a CloudBase-powered mobile product catalog application for Jiemingda bakery products. The project consists of a responsive web application with database management tools, deployed on Tencent Cloud CloudBase.

## Key Development Commands

### Database Management
```bash
# Initialize database locally (generates scripts)
node init-db-local.js

# Deploy cloud function for database initialization
tcb functions deploy initDatabase

# Invoke cloud function to populate database
tcb functions invoke initDatabase
```

### Deployment Commands
```bash
# Login to CloudBase
tcb login

# Deploy entire application
tcb hosting deploy

# Deploy specific files
tcb hosting deploy index.html
tcb hosting deploy init-database.html

# Deploy with framework
cloudbase framework deploy
```

### Local Development
```bash
# Install dependencies
npm install

# Start local server (for testing)
python -m http.server 8000
# Access: http://localhost:8000
```

## Project Architecture

### Core Application Structure
- **Frontend**: Single-page application using vanilla HTML/CSS/JavaScript
- **Backend**: CloudBase (Tencent Cloud) with document database and cloud functions
- **Database**: Two main collections - `products` and `config`
- **Static Hosting**: CloudBase static website hosting with CDN

### Data Flow Architecture
1. **Data Priority**: CloudBase models → CloudBase collections → Local JSON fallback
2. **Database Collections**:
   - `products` collection: Document ID `catalog-data` contains all product data
   - `config` collection: Document ID `category-config` contains category configurations
3. **Authentication**: Anonymous authentication for read-only database access

### Key Configuration Files
- `cloudbaserc.json`: CloudBase deployment configuration
- `cloudbase.config.js`: Frontend CloudBase SDK configuration
- `package.json`: Node.js dependencies and scripts

### Data Management System
- **Local Data Sources**: `data/products.json` and `data/category_config.json`
- **Database Initialization**: Multiple tools available:
  - `init-db-local.js`: Local script for generating database scripts
  - `functions/initDatabase/`: Cloud function for database initialization
  - `init-database.html`: Web-based database initialization interface
  - `migrate-data.html`: Data migration utility

### CloudBase Environment
- **Environment ID**: `cloud1-0gc8cbzg3efd6a99`
- **Region**: `ap-shanghai`
- **Runtime**: Node.js 12.16 for cloud functions
- **Production URL**: `https://cloud1-0gc8cbzg3efd6a99-1251221636.tcloudbaseapp.com`

## Important Implementation Notes

### SDK Version Requirements
- Use CloudBase Web SDK v2.17.3 (loaded from CDN)
- The project has been upgraded from tcb.js v1.x to avoid compatibility issues
- All HTML files should use `cloudbase.full.js` for consistency

### Database Operations
- Production database is configured with read-only permissions
- Data updates must be performed through cloud functions or admin privileges
- Anonymous authentication is enabled for public read access

### Data Structure
- Product data contains 387 products across 22 categories
- Category configuration uses `categories` array structure (not legacy `banner_slugs`)
- Images are stored in `data/photos/` with consistent naming convention

### Mobile-First Design
- Responsive layout with sidebar navigation
- Grid-based product display with lazy loading
- Touch-optimized interactions for mobile devices

## Development Workflow

1. **Making Data Changes**:
   - Edit `data/products.json` or `data/category_config.json`
   - Run `node init-db-local.js` to generate scripts
   - Use online initialization page or cloud function to update database

2. **Code Changes**:
   - Modify application files
   - Test locally with HTTP server
   - Deploy using `tcb hosting deploy`

3. **Cloud Function Updates**:
   - Modify function code in `functions/initDatabase/`
   - Deploy with `tcb functions deploy initDatabase`
   - Test with `tcb functions invoke initDatabase`

## File Structure Context

- `prd-cat/`: Main application directory
- `index.html`: Primary application entry point
- `init-database.html`: Web-based database management
- `functions/initDatabase/`: Cloud function for database operations
- `data/`: Local data sources and product images
- `deploy/`: Deployment configuration backups

## Common Troubleshooting

### Database Connection Issues
- Verify CloudBase environment status in console
- Check authentication configuration in `cloudbase.config.js`
- Review cloud function execution logs

### Deployment Failures
- Confirm CloudBase CLI login status with `tcb login`
- Check network connectivity and permissions
- Review deployment logs for specific errors

### Data Inconsistencies
- Use online initialization page to reset database
- Compare local JSON files with cloud database content
- Verify image file naming matches database records