# Complete Testing Guide

## Prerequisites

- Node.js 16+ installed
- Two browsers or browser tabs
- HTTPS enabled (for microphone access)
- Docker installed (for advanced testing)

## Quick Test Setup

### 1. Test Socket.IO Implementation (Recommended First)

#### Step 1: Start the Server

```bash
cd alternatives
npm install express socket.io cors
node 03-socketio-server.js
```

You should see:
```
Socket.IO signaling server running on http://localhost:3000
```

#### Step 2: Update Client

Edit `01-socketio-implementation.html` line 23:
```javascript
const SIGNALING_SERVER = "http://localhost:3000";  // Change from "https://your-socketio-server.com"
```

#### Step 3: Test Connection

1. Open `01-socketio-implementation.html` in **Browser Tab 1**
2. Open `01-socketio-implementation.html` in **Browser Tab 2** (or different browser)
3. Enter same room name in both: `testroom`
4. Click "📞 Connect Call" in both tabs
5. Wait for connection (should say "Connected! Two-way audio active.")
6. Speak in one tab - should hear audio in the other tab

**Expected Results:**
- ✅ Status changes to "Connected! Two-way audio active."
- ✅ Audio flows bidirectionally
- ✅ Clicking "🛑 End Call" disconnects both
- ✅ Server logs show connections and rooms

**If something fails:**
- Check browser console (F12) for errors
- Verify microphone permissions granted
- Ensure both tabs are in the same room name
- Check server is running on port 3000

---

### 2. Test PeerJS Implementation

#### Step 1: Open in Two Tabs

1. Open `02-peerjs-implementation.html` in **Browser Tab 1**
2. Open `02-peerjs-implementation.html` in **Browser Tab 2**

#### Step 2: Connect

1. Enter room name `testroom` in both
2. Click "📞 Connect Call" in both tabs
3. Wait for peer discovery (uses free PeerJS cloud)

**Expected Results:**
- ✅ Both show peer IDs
- ✅ Audio connects automatically
- ✅ Connection status updates to "Connected! Two-way audio active."

**Note:** PeerJS cloud is simpler but works best for point-to-point calls.

---

### 3. Test Original Piesocket (Baseline Comparison)

1. Open `../index.html` (original implementation)
2. Enter room: `testroom`
3. Open in second tab
4. Enter same room
5. Verify connection works

**Compare with Socket.IO/PeerJS:**
- Connection speed
- Reliability
- UI responsiveness
- Audio quality

---

## Advanced Testing with Docker

### Test All Three Solutions Simultaneously

Create `docker-compose-test.yml`:

```yaml
version: '3.8'

services:
  socketio-server:
    image: node:16-alpine
    working_dir: /app
    volumes:
      - ./:/app
    command: sh -c "npm install && node alternatives/03-socketio-server.js"
    ports:
      - "3000:3000"
    networks:
      - webrtc-test

  # Simple HTTP server to serve HTML files
  web-server:
    image: node:16-alpine
    working_dir: /app
    volumes:
      - ./:/app
    command: sh -c "npm install -g http-server && http-server . -p 8080 -c-1"
    ports:
      - "8080:8080"
    networks:
      - webrtc-test
    depends_on:
      - socketio-server

networks:
  webrtc-test:
    driver: bridge
```

**Run:**
```bash
docker-compose -f docker-compose-test.yml up
```

Then access:
- Socket.IO: `http://localhost:8080/alternatives/01-socketio-implementation.html`
- PeerJS: `http://localhost:8080/alternatives/02-peerjs-implementation.html`
- Piesocket: `http://localhost:8080/index.html`

---

## Test Checklist

### Socket.IO Tests

- [ ] Server starts without errors
- [ ] Client connects to server
- [ ] Two clients can join same room
- [ ] Audio flows between clients
- [ ] Disconnecting one client notifies the other
- [ ] Reconnection works after network hiccup
- [ ] Multiple rooms work independently
- [ ] Server logs show connection events

### PeerJS Tests

- [ ] Client gets peer ID
- [ ] Two clients can discover each other
- [ ] Audio flows between clients
- [ ] Disconnecting one client notifies the other
- [ ] Works with free PeerJS cloud
- [ ] Works with self-hosted server (if deployed)

### Piesocket Tests (Original Baseline)

- [ ] Connection established
- [ ] Audio flows
- [ ] Disconnection handled
- [ ] API key not exposed in console logs

### Cross-Implementation Tests

- [ ] Socket.IO faster than Piesocket? Y/N
- [ ] PeerJS simpler to deploy? Y/N
- [ ] Audio quality similar across all three? Y/N
- [ ] Reconnection reliability similar? Y/N

---

## Performance Comparison

### Metrics to Monitor

1. **Connection Time** (how long until "Connected!")
   - Piesocket: ~2-5 seconds
   - Socket.IO: ~1-3 seconds (local)
   - PeerJS: ~3-7 seconds (cloud)

2. **Audio Latency** (delay between speaking and hearing)
   - All should be <500ms

3. **CPU Usage**
   - Monitor in Task Manager/Activity Monitor

4. **Memory Usage**
   - Initial: Should be <50MB per client

### Test Script

```javascript
// Paste in browser console to measure connection time
let startTime = Date.now();
let originalUpdateStatus = updateStatus;
updateStatus = function(msg, type) {
  if (msg.includes("Connected")) {
    let elapsed = Date.now() - startTime;
    console.log(`⏱️ Connection took ${elapsed}ms`);
  }
  originalUpdateStatus(msg, type);
};
```

---

## Troubleshooting

### "Microphone Access Denied"
- **Cause:** Browser permission not granted
- **Fix:** Click browser address bar → Permissions → Allow Microphone

### "Connection Timeout"
- **Cause:** Peer not found in room
- **Fix:** 
  - Verify both clients in same room name
  - Check server is running (for Socket.IO)
  - Check network connectivity

### "No Audio Received"
- **Cause:** STUN/TURN issue or firewall
- **Fix:**
  - Test with headphones (not speakers to avoid echo)
  - Check firewall allows UDP/TCP
  - Add TURN servers if behind corporate firewall

### "WebSocket Connection Failed"
- **Cause:** Server not running or wrong URL
- **Fix:**
  - Verify server running: `curl http://localhost:3000`
  - Check SIGNALING_SERVER URL in HTML
  - Try `localhost` instead of `127.0.0.1`

### "Browser Console Shows Errors"
- **Action:** Right-click → Inspect → Console tab
- **Copy:** Full error message
- **Check:** Line number and file name

---

## Network Testing (Advanced)

### Simulate Poor Network Conditions

Use Chrome DevTools:
1. F12 → Network tab
2. Click throttle dropdown (top-left)
3. Select "Slow 3G" or "Offline"
4. Test how each implementation handles:
   - High latency
   - Low bandwidth
   - Packet loss

**Expected behavior:**
- Connection should timeout gracefully
- Reconnection should attempt automatically
- UI should show error status

---

## Report Template

When testing, document results:

```
## Test Date: [DATE]
## Implementation: [Socket.IO / PeerJS / Piesocket]

### Connection Test
- Time to connect: _____ ms
- Server logs received: YES / NO
- Status message correct: YES / NO

### Audio Test
- Audio received: YES / NO
- Audio quality: [Excellent / Good / Fair / Poor]
- Latency perceived: _____ ms (approx)

### Disconnection Test
- Disconnection detected: YES / NO
- Reconnection automatic: YES / NO
- Error message clear: YES / NO

### Issues Found
1. [Issue 1]
2. [Issue 2]

### Overall Rating
[⭐⭐⭐⭐⭐] / 5
```

---

## Next Steps After Testing

✅ If all tests pass:
- Commit to `alternatives/signaling-servers` branch
- Create pull request comparing results
- Add performance benchmarks to README

❌ If tests fail:
- Check troubleshooting guide above
- Review server logs
- Check browser console
- Document issue in GitHub issue