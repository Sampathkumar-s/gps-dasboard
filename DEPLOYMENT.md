# Deployment Guide - Fleet GPS Tracking System

This guide covers deployment strategies for the Fleet GPS Dashboard in various environments.

## 📋 Pre-Deployment Checklist

- [ ] All tests passing
- [ ] ESLint validation complete
- [ ] Environment variables configured
- [ ] API endpoints verified
- [ ] SSL/TLS certificates ready
- [ ] Database connections tested
- [ ] Logging configured
- [ ] Error tracking setup (Sentry, etc.)
- [ ] Performance monitoring configured
- [ ] Backup strategy defined

## 🚀 Deployment Options

### Option 1: Vercel (Recommended for Beginners)

**Advantages:**
- Zero-configuration deployment
- Automatic HTTPS
- Global CDN
- Free tier available
- Environment variables support

**Steps:**
1. Push code to GitHub/GitLab
2. Connect repository to Vercel
3. Set environment variables
4. Deploy automatically on push

```bash
# Deploy via CLI
npm i -g vercel
vercel
```

### Option 2: AWS Amplify

**Advantages:**
- Integrated with AWS ecosystem
- Built-in CI/CD
- Custom domain support
- Environment variables
- Monitoring and analytics

**Steps:**
1. Create AWS Amplify app
2. Connect Git repository
3. Configure build settings
4. Deploy

### Option 3: Docker Containerization

**Dockerfile:**
```dockerfile
FROM node:19-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "preview"]
```

**Build and Run:**
```bash
docker build -t gps-dashboard .
docker run -p 3000:3000 gps-dashboard
```

### Option 4: Traditional VPS (DigitalOcean, Linode)

**Requirements:**
- Ubuntu 20.04+ or CentOS 8+
- Node.js 18+
- Nginx or Apache
- PM2 for process management

**Setup Steps:**

```bash
# SSH into server
ssh root@your_server_ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone your_repo_url
cd gps-dashboard

# Install dependencies
npm ci

# Build production
npm run build

# Install PM2
npm install -g pm2

# Start application
pm2 start "npm run preview" --name "gps-dashboard"
pm2 startup
pm2 save
```

**Nginx Configuration:**
```nginx
server {
  listen 80;
  server_name your_domain.com;

  location / {
    proxy_pass http://localhost:4173;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

### Option 5: Heroku (Deprecated - Use Alternative)

**Note:** Heroku free tier is no longer available. Use Render or Fly.io instead.

## 🔐 Security Configuration

### Environment Variables

Create `.env.production`:
```
VITE_API_URL=https://api.example.com
VITE_GPS_UPDATE_INTERVAL=5000
VITE_ONLINE_THRESHOLD=10000
VITE_ENABLE_ANALYTICS=true
```

### CORS Configuration

Backend should allow only trusted origins:
```javascript
const allowedOrigins = [
  'https://yourdomain.com',
  'https://www.yourdomain.com'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
```

### HTTPS/SSL

**Let's Encrypt (Free):**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d yourdomain.com
```

### API Authentication

Implement JWT or OAuth:
```javascript
// Backend: Generate JWT
const token = jwt.sign(
  { userId: user.id },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

// Frontend: Send with requests
fetch('/api/vehicles', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## 📊 Monitoring & Analytics

### Error Tracking (Sentry)

```bash
npm install @sentry/react @sentry/tracing
```

```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
  tracesSampleRate: 1.0,
});
```

### Performance Monitoring

- Core Web Vitals
- Page Load Time
- API Response Time
- Error Rate

### Logging

Use structured logging:
```javascript
const logger = require('winston');

logger.info('Vehicle updated', {
  vehicleId: 'TRUCK-001',
  timestamp: new Date(),
  location: { lat, lng }
});
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      
      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## 📈 Performance Optimization

### Build Optimization

```bash
# Analyze bundle size
npm install -g vite-plugin-visualizer

# Minify and compress
npm run build  # Vite does this automatically
```

### CDN Configuration

```javascript
// Vite config
export default {
  build: {
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          'react': ['react', 'react-dom'],
        }
      }
    }
  }
}
```

### Caching Strategy

```nginx
# Cache static assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}

# Don't cache HTML
location ~ \.html?$ {
  expires -1;
  add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

## 🔍 Database Setup

### PostgreSQL Example

```bash
# Create database
createdb gps_tracking

# Run migrations
psql gps_tracking < schema.sql
```

### Connection String

```
postgresql://user:password@host:5432/gps_tracking
```

## 📱 Mobile Deployment

### Progressive Web App (PWA)

Add `public/manifest.json`:
```json
{
  "name": "Fleet GPS Tracking",
  "short_name": "Fleet GPS",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ],
  "start_url": "/",
  "display": "standalone"
}
```

## 🧪 Testing Before Deployment

```bash
# Run tests
npm test

# Check production build
npm run build
npm run preview

# Performance audit
lighthouse https://yoursite.com
```

## 🚨 Rollback Procedure

### Vercel/Amplify
- Automatic rollback available in dashboard
- Select previous deployment

### VPS with Git
```bash
git log --oneline  # Find previous commit
git reset --hard <commit-hash>
pm2 restart gps-dashboard
```

## 📞 Support & Troubleshooting

### Common Issues

**1. Build Fails**
```bash
# Clear cache
rm -rf node_modules dist
npm install
npm run build
```

**2. Port Already in Use**
```bash
# Find and kill process
lsof -i :3000
kill -9 <PID>
```

**3. Out of Memory**
```bash
# Increase Node memory
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

## 📚 Resources

- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [React Production Optimization](https://react.dev/learn/scaling-up-with-reducer-and-context)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

**Version:** 1.0.0  
**Last Updated:** February 2, 2026
