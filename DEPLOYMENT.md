# 🚀 Deployment Guide for NexCall

## Quick Deployment Options
### 1. Heroku (Easiest)
```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create new app
heroku create your-app-name

# Add MongoDB Atlas addon
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set JWT_SECRET=your_secure_jwt_secret_here
heroku config:set CLIENT_URL=https://your-app-name.herokuapp.com

# Deploy
git add .
git commit -m "Ready for deployment"
git push heroku main
```

### 2. Vercel (Recommended for Frontend + Serverless)
```bash
# Install Vercel CLI
npm i -g vercel

# Build and deploy
cd client
npm run build
cd ..
vercel --prod
```

### 3. DigitalOcean App Platform
1. Push code to GitHub
2. Create DigitalOcean account
3. Connect GitHub repository
4. Set environment variables in dashboard
5. Deploy

## 📋 Pre-Deployment Checklist

### ✅ Required Setup
- [ ] MongoDB Atlas database created
- [ ] Environment variables configured
- [ ] Production build created (`npm run build`)
- [ ] HTTPS domain (required for WebRTC)
- [ ] TURN server (for users behind NAT)

### 🔧 Environment Variables
```bash
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/videochat
JWT_SECRET=your_32_character_minimum_secure_string
CLIENT_URL=https://your-domain.com
```

### 🌐 TURN Server Setup (Optional but Recommended)
WebRTC requires STUN/TURN servers for reliable connections:

**Free Options:**
- Google STUN: `stun:stun.l.google.com:19302`
- Twilio Free TURN (limited)

**Paid Options:**
- Xirsys (starting at $9/month)
- Twilio (pay-as-you-go)
- coturn (self-hosted)

## 🛠️ Platform-Specific Instructions

### Heroku Deployment
1. **Create app:**
   ```bash
   heroku create nexcall-app
   ```

2. **Add MongoDB:**
   ```bash
   heroku addons:create mongolab:sandbox
   ```

3. **Configure environment:**
   ```bash
   heroku config:set JWT_SECRET=$(openssl rand -base64 32)
   heroku config:set CLIENT_URL=https://nexcall-app.herokuapp.com
   ```

4. **Deploy:**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

### Vercel Deployment
1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Configure vercel.json:**
   ```json
   {
     "version": 2,
     "builds": [
       { "src": "server/index.js", "use": "@vercel/node" },
       { "src": "client/package.json", "use": "@vercel/static-build" }
     ],
     "routes": [
       { "src": "/api/(.*)", "dest": "/server/index.js" },
       { "src": "/(.*)", "dest": "/client/build/$1" }
     ]
   }
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

### Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN cd client && npm run build

EXPOSE 5000
CMD ["npm", "run", "prod"]
```

## 🔒 Security Considerations

1. **HTTPS Required:** WebRTC only works on secure contexts
2. **Strong JWT Secret:** Use at least 32 characters
3. **Environment Variables:** Never commit secrets to git
4. **CORS Configuration:** Only allow your domain
5. **Rate Limiting:** Implement for production

## 📱 Testing After Deployment

1. **Health Check:** Visit `https://your-domain.com/api/health`
2. **User Registration:** Test account creation
3. **Video Calling:** Test with two different browsers
4. **Mobile Testing:** Test on mobile devices

## 🚨 Common Issues

### "User is not online" error
- Ensure both users have valid JWT tokens
- Check Socket.IO connection in browser console

### Black video screen
- Verify HTTPS is enabled
- Check browser camera permissions
- Ensure TURN server is accessible

### Call doesn't connect
- Add TURN server for NAT traversal
- Check firewall settings
- Verify STUN servers are reachable

## 📞 Support

For deployment issues:
1. Check platform-specific documentation
2. Review browser console for errors
3. Verify all environment variables are set
4. Test with different network configurations
