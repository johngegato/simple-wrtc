# Vercel + External Server Deployment Guide

## Architecture Overview

```
┌──────────────────────┐
│   Your Custom Domain │
│   (yourdomain.com)   │
└──────────┬───────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
[Vercel]      [Railway/Render/Fly]
Frontend      Backend Signaling
(Static       (Socket.IO WebSocket)
HTML/JS)      
```

## Option 1: Railway.app (Recommended - Easiest)

Railway is the simplest option with automatic deployments from GitHub.

### Step 1: Prepare Your Repository

1. Ensure `package.json` exists in root (already added)
2. Ensure `03-socketio-server.js` is in `alternatives/` folder
3. Push to GitHub:

```bash
git add package.json .env.example
git commit -m "Add deployment configuration"
git push origin main
```

### Step 2: Create Railway Account

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project"

### Step 3: Connect GitHub Repository

1. Click "Deploy from GitHub repo"
2. Select your `simple-wrtc` repository
3. Railway auto-detects Node.js
4. Click "Deploy"

### Step 4: Configure Environment Variables

In Railway dashboard:

1. Go to **Variables** tab
2. Add:
   ```
   NODE_ENV=production
   PORT=3000
   ```
3. Click "Deploy"

### Step 5: Get Your Server URL

1. Go to **Settings** tab
2. Find "Public Networking"
3. Copy the public URL (e.g., `https://simple-wrtc-prod.up.railway.app`)

### Step 6: Update Your Frontend

Edit `01-socketio-implementation.html` line 23:

```javascript
const SIGNALING_SERVER = "https://simple-wrtc-prod.up.railway.app";
```

### Step 7: Deploy Frontend to Vercel

```bash
# Push frontend changes to main branch
git add alternatives/01-socketio-implementation.html
git commit -m "Update Socket.IO server URL for production"
git push origin main

# Vercel auto-deploys
```

### Cost Breakdown

- **Vercel:** Free (static frontend)
- **Railway:** Free tier with $5/month credits (includes WebSocket support)
- **Total:** Free

---

## Option 2: Render.com (Alternative)

Similar to Railway but slightly different interface.

### Step 1: Create Render Account

1. Go to https://render.com
2. Sign up with GitHub

### Step 2: Create New Web Service

1. Click "New +"
2. Select "Web Service"
3. Connect your GitHub repo

### Step 3: Configure Service

```
Name: webrtc-signaling
Environment: Node
Build Command: npm install
Start Command: npm start
Region: Use nearest to your users
```

### Step 4: Set Environment Variables

1. Click "Environment"
2. Add:
   ```
   NODE_ENV=production
   ```

### Step 5: Get Server URL

After deployment completes, Render provides a public URL.

### Cost Breakdown

- **Vercel:** Free
- **Render:** Free tier (~0.5 CPU, 512MB RAM, auto-sleeps after 15 min inactivity)
  - Upgrade to ~$7/month for always-on
- **Total:** Free (with limitations) or ~$7/month

---

## Option 3: Fly.io (Most Powerful)

Fly.io is better for performance-critical applications.

### Step 1: Install Fly CLI

```bash
curl -L https://fly.io/install.sh | sh
```

### Step 2: Create Fly Account

```bash
fly auth signup
```

### Step 3: Initialize Fly App

In your repo directory:

```bash
fly launch --no-deploy
```

This creates `fly.toml` configuration.

### Step 4: Configure fly.toml

Update the file:

```toml
app = "webrtc-signaling"
primary_region = "sfo"  # or your nearest region

[build]
  image = "node:18"

[env]
  NODE_ENV = "production"

[[services]]
  internal_port = 3000
  protocol = "tcp"
  [services.ports]
    ports = [80, 443]
```

### Step 5: Deploy

```bash
fly deploy
```

### Step 6: Get Server URL

```bash
fly status

# Output: https://webrtc-signaling.fly.dev
```

### Cost Breakdown

- **Vercel:** Free
- **Fly.io:** Free tier (3 shared-cpu-1x 256MB VMs)
  - Or $0.0000231/second for dedicated resources (~$2/month minimum)
- **Total:** Free

---

## Step-by-Step: Complete Deployment Workflow

### For Railway (Recommended)

```bash
# 1. Make sure everything is committed
git status

# 2. If needed, add missing files
git add package.json .env.example
git commit -m "Add deployment config"

# 3. Push to GitHub
git push origin main

# 4. Go to Railway.app → New Project → Select Repo
# 5. Railway auto-deploys (2-3 minutes)

# 6. Copy Railway URL from dashboard

# 7. Update HTML client
# Edit: alternatives/01-socketio-implementation.html
# Line 23: const SIGNALING_SERVER = "https://your-railway-url";

# 8. Push frontend update
git add alternatives/01-socketio-implementation.html
git commit -m "Update production server URL"
git push origin main

# 9. Vercel auto-deploys your frontend

# 10. Test
# Open your Vercel URL in two tabs
# Connect and test audio
```

### For Render

```bash
# Same as Railway, but in Render dashboard:
# Services → New → Web Service
# Connect GitHub repo
# Select branch: main
# Railway handles the rest
```

### For Fly.io

```bash
# 1. Install CLI (one time)
curl -L https://fly.io/install.sh | sh

# 2. In repo directory
fly launch --no-deploy

# 3. Update fly.toml (see above)

# 4. Deploy
fly deploy

# 5. Get URL
fly status

# 6. Update HTML and push to Vercel (same as above)
```

---

## Testing Production Deployment

### 1. Test Socket.IO Server

```bash
# Get your server URL from Railway/Render/Fly dashboard
SIGNALING_SERVER="https://your-server-url"

# Test connectivity
curl -I "$SIGNALING_SERVER"

# Should return 200 OK
```

### 2. Test WebSocket Connection

Open browser console and run:

```javascript
const socket = io('https://your-server-url');
socket.on('connect', () => {
  console.log('✅ Connected to signaling server');
});
socket.on('error', (error) => {
  console.log('❌ Connection error:', error);
});
```

### 3. Full End-to-End Test

1. Deploy frontend to Vercel
2. Update HTML with production server URL
3. Open Vercel URL in two browser tabs
4. Enter same room name in both
5. Click "Connect Call"
6. Verify audio flows both ways

---

## Production Checklist

### Before Going Live

- [ ] `package.json` committed to repo
- [ ] `.env.example` has all required variables
- [ ] Server deployed to Railway/Render/Fly
- [ ] Server URL working (tested with curl)
- [ ] Frontend updated with production URL
- [ ] Frontend deployed to Vercel
- [ ] CORS configured in `03-socketio-server.js`
- [ ] Two-way audio tested
- [ ] Mobile browser tested
- [ ] Different network tested (WiFi + cellular)

### Ongoing Monitoring

- [ ] Monitor server logs (Railway/Render dashboard)
- [ ] Monitor Vercel logs for frontend errors
- [ ] Monitor active connections
- [ ] Set up alerts for downtime
- [ ] Review WebSocket usage monthly

---

## Troubleshooting Deployment

### "Connection refused" error

**Cause:** Server URL wrong or server not running

**Fix:**
```bash
# 1. Check server is deployed
# Go to Railway/Render/Fly dashboard
# Should show "Running" status

# 2. Check URL is correct
# Copy from dashboard, not your domain

# 3. Verify CORS in server code
# Should have: cors: { origin: "*" }
```

### "WebSocket connection failed"

**Cause:** Server not responding to WebSocket

**Fix:**
```bash
# Check server logs in dashboard
# Should see "User connected" messages

# Verify Socket.IO library loaded
# F12 → Network tab → check socket.io.js loads
```

### "Audio not flowing after connection"

**Cause:** Microphone permissions or peer connection issue

**Fix:**
- Allow microphone access (browser prompt)
- Check browser console for errors
- Test with headphones (not speakers)
- Verify both tabs in same room name

### "Server keeps crashing"

**Cause:** Memory issue or code error

**Fix:**
```bash
# Check dashboard logs for errors
# Upgrade server tier (Railway: add credits)
# Check for memory leaks in code
```

---

## Scaling for Multiple Connections

If you get many concurrent users:

### Option 1: Upgrade Server Tier

```bash
# Railway: Add more credits
# Render: Upgrade to paid plan
# Fly.io: Increase resources in fly.toml
```

### Option 2: Add Redis for Multi-Server

Update `03-socketio-server.js`:

```javascript
const { createAdapter } = require('@socket.io/redis-adapter');
const redis = require('redis');

const pubClient = redis.createClient();
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
```

Then deploy multiple server instances behind a load balancer.

---

## Cost Comparison

| Service | Free Tier | Paid Minimum | Recommended |
|---------|-----------|--------------|-------------|
| **Vercel** | Frontend hosting | $20/mo | Free tier (for MVP) |
| **Railway** | $5/mo credits | Pay per use | $10-20/mo |
| **Render** | Sleep after 15min | $7/mo (always-on) | $7/mo |
| **Fly.io** | 3 shared VMs | $2/mo (pay per second) | $2-5/mo |
| **Total (Free)** | - | - | **Free** |
| **Total (Recommended)** | - | - | **$10-20/mo** |

---

## Next Steps

1. ✅ Choose hosting (Railway recommended)
2. ✅ Deploy server
3. ✅ Update frontend URL
4. ✅ Deploy frontend to Vercel
5. ✅ Test end-to-end
6. ✅ Monitor in production

---

## Additional Resources

- **Railway Docs:** https://docs.railway.app
- **Render Docs:** https://render.com/docs
- **Fly.io Docs:** https://fly.io/docs
- **Vercel Docs:** https://vercel.com/docs
- **Socket.IO Deployment:** https://socket.io/docs/v4/deployment-guide/

---

## Questions?

If you run into issues:

1. Check dashboard logs (Railway/Render/Fly)
2. Check browser console (F12)
3. Verify environment variables set
4. Verify GitHub repo has latest code
5. Try redeploying
