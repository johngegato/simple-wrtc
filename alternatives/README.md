# WebRTC Signaling Server Alternatives

This directory contains implementations and guides for using different signaling servers instead of Piesocket.

## Quick Comparison

| Solution | Complexity | Setup Time | Self-Host | Best For | License |
|----------|-----------|-----------|-----------|----------|---------|
| **Socket.IO** | Medium | 30 min | ✅ | Production voice/video | MIT |
| **PeerJS** | Low | 10 min | ✅ | Simple P2P calls | MIT |
| **OpenVidu** | High | 1-2 hours | ✅ | Enterprise conferencing | Apache 2.0 |
| **Jitsi** | High | 1-2 hours | ✅ | Full-featured conferences | Apache 2.0 |

## Files in This Directory

### Client Implementations
- **`01-socketio-implementation.html`** - Voice call using Socket.IO
- **`02-peerjs-implementation.html`** - Voice call using PeerJS

### Server Implementations
- **`03-socketio-server.js`** - Simple Node.js Socket.IO signaling server

### Setup Guides
- **`04-peerjs-server-setup.md`** - How to deploy PeerJS server
- **`05-socketio-server-setup.md`** - How to deploy Socket.IO server
- **`06-openvidu-setup.md`** - How to deploy OpenVidu
- **`07-jitsi-setup.md`** - How to deploy Jitsi Meet

### Testing & Documentation
- **`08-TESTING-GUIDE.md`** - Complete testing guide for all implementations
- **`README.md`** - This file

## Quick Start

### Option 1: Socket.IO (Recommended for Production)

**Best for:** Production deployments, scalable applications

```bash
# Install dependencies
npm install express socket.io cors

# Start server
node alternatives/03-socketio-server.js

# Update SIGNALING_SERVER in 01-socketio-implementation.html
# to "http://localhost:3000"
```

**Pros:**
- Battle-tested, mature library
- Excellent documentation
- Great for scaling
- Built-in reconnection logic

**Cons:**
- Requires server infrastructure
- More setup than peer-to-peer

---

### Option 2: PeerJS (Simplest)

**Best for:** Quick prototypes, simple P2P connections

```bash
# Just open the HTML file
# No server needed (uses free PeerJS cloud)
open alternatives/02-peerjs-implementation.html
```

**Pros:**
- Zero configuration (cloud version)
- Simple API
- Works out of the box

**Cons:**
- Cloud service limitations
- Less control over infrastructure

---

### Option 3: OpenVidu (Enterprise)

**Best for:** Enterprise applications, recording, complex features

```bash
# Run with Docker
docker run -d -p 4443:4443 -e OPENVIDU_SECRET=my-secret openvidu/openvidu:latest

# Access: https://localhost:4443
```

**Pros:**
- Production-grade
- Built-in recording
- Media server capabilities
- Scalable

**Cons:**
- Higher resource usage
- Steeper learning curve
- Overkill for simple use cases

---

### Option 4: Jitsi (Full-Featured)

**Best for:** Full conferencing, battle-tested solutions

```bash
git clone https://github.com/jitsi/docker-jitsi-meet
cd docker-jitsi-meet
cp env.example .env
./gen-passwords.sh
docker-compose up -d
```

**Pros:**
- Full-featured conferencing
- Production-proven
- Large community
- Easy Docker deployment

**Cons:**
- High resource usage
- Complex architecture
- Overkill for simple voice calls

---

## Detailed Comparison

### Architecture

| Aspect | Piesocket | Socket.IO | PeerJS | OpenVidu | Jitsi |
|--------|-----------|-----------|--------|----------|-------|
| **Architecture** | SaaS | Self-hosted | P2P or Hosted | Self-hosted | Self-hosted |
| **Signaling** | WebSocket | WebSocket | P2P via Peer Server | WebSocket | XMPP |
| **Media Handling** | Client P2P | Client P2P | Client P2P | Media Server | Media Server |
| **Scalability** | Limited (SaaS) | High | Medium | High | High |
| **Cost** | Per-connection charges | Infrastructure only | Free (cloud) or self-hosted | Apache 2.0 (free) | Apache 2.0 (free) |
| **Learning Curve** | Low | Medium | Low | High | High |

### Features

| Feature | Socket.IO | PeerJS | OpenVidu | Jitsi |
|---------|-----------|--------|----------|-------|
| Audio Only | ✅ | ✅ | ✅ | ✅ |
| Audio + Video | ✅ | ✅ | ✅ | ✅ |
| Group Calls | ✅ | ✅ (with server) | ✅ | ✅ |
| Recording | ❌ | ❌ | ✅ | ✅ (Jibri) |
| Screen Sharing | ❌ | ❌ | ✅ | ✅ |
| Chat | ❌ | ❌ | ❌ | ✅ |
| Streaming | ❌ | ❌ | ✅ | ✅ |
| Mobile Support | ✅ | ✅ | ✅ | ✅ |

### Performance Metrics

**Connection Speed (ms):**
- PeerJS (cloud): 3000-5000ms
- Socket.IO (local): 1000-2000ms
- Socket.IO (cloud): 2000-4000ms
- OpenVidu: 2000-5000ms
- Jitsi: 3000-8000ms

**Resource Usage:**
- Socket.IO: ~50MB memory per connection
- PeerJS: ~40MB memory per connection
- OpenVidu: ~150MB base + ~100MB per connection
- Jitsi: ~500MB base + ~200MB per connection

---

## Migration Guide

### From Piesocket to Socket.IO

**Estimated time: 2-4 hours**

1. Replace WebSocket with Socket.IO client
2. Change signaling message format
3. Update server URL
4. Deploy Node.js server

**Key differences:**
```javascript
// Piesocket
const ws = new WebSocket('wss://...');
ws.send(JSON.stringify(data));

// Socket.IO
const socket = io('https://...');
socket.emit('event-name', data);
```

**Benefits:**
- Automatic reconnection
- Built-in room support
- Better error handling

---

### From Piesocket to PeerJS

**Estimated time: 1-2 hours**

1. Replace WebSocket with PeerJS library
2. Use Peer IDs instead of rooms
3. Simplify connection logic
4. (Optional) Deploy PeerJS server

**Key differences:**
```javascript
// Piesocket
const ws = new WebSocket('wss://...');

// PeerJS
const peer = new Peer();
const call = peer.call(remotePeerId, localStream);
```

**Benefits:**
- Simpler API
- Less server infrastructure
- Works immediately with free cloud

---

### From Piesocket to OpenVidu/Jitsi

**Estimated time: 2-3 days**

1. Adopt new client library
2. Modify backend token generation
3. Deploy full stack (complex)
4. Integrate new features

**When to use:**
- Need recording capabilities
- Need group conferencing
- Need enterprise features

---

## Testing

See **`08-TESTING-GUIDE.md`** for complete testing procedures including:

- Local testing setup
- Performance benchmarking
- Network condition simulation
- Troubleshooting guide
- Test report template

**Quick test:**
```bash
# Start Socket.IO server
node 03-socketio-server.js

# Open in two browser tabs
open 01-socketio-implementation.html

# Enter same room name in both tabs
# Click "Connect Call"
# Speak in one tab - should hear in the other
```

---

## Troubleshooting

### "Connection refused" error
- **Cause:** Server not running on correct port
- **Fix:** Check `SIGNALING_SERVER` URL in HTML matches server

### "No audio received"
- **Cause:** Microphone permissions not granted
- **Fix:** Allow microphone access in browser settings

### "Signaling messages not reaching peer"
- **Cause:** Peer not in same room/session
- **Fix:** Verify both clients joined same room name

### "WebSocket connection failed"
- **Cause:** Server down or wrong URL
- **Fix:** 
  - Verify server running: `curl http://localhost:3000`
  - Check SIGNALING_SERVER URL
  - Try `localhost` instead of `127.0.0.1`

For more troubleshooting, see **`08-TESTING-GUIDE.md`**

---

## Decision Tree

```
Do you need...?

Recording capabilities?
├─ YES → Use OpenVidu or Jitsi
└─ NO → Continue...

Group conferencing (3+ people)?
├─ YES → Use Socket.IO + custom logic, OpenVidu, or Jitsi
└─ NO → Continue...

Enterprise features (streaming, advanced controls)?
├─ YES → Use OpenVidu
└─ NO → Continue...

Simple point-to-point voice?
├─ YES → Use PeerJS (quick) or Socket.IO (scalable)
└─ Continue...

Want to minimize infrastructure?
├─ YES → Use PeerJS cloud
└─ NO → Use Socket.IO or OpenVidu
```

---

## Production Checklist

### Socket.IO
- [ ] Enable HTTPS with valid certificate
- [ ] Add authentication/authorization
- [ ] Implement rate limiting
- [ ] Set up monitoring (CPU, memory, connections)
- [ ] Configure reverse proxy (Nginx/HAProxy)
- [ ] Add logging and error tracking
- [ ] Deploy on reliable hosting (AWS, Azure, GCP)
- [ ] Use Redis adapter for multi-server scaling

### PeerJS (Self-Hosted)
- [ ] Enable HTTPS with valid certificate
- [ ] Configure TURN servers for NAT traversal
- [ ] Set up monitoring
- [ ] Add firewall rules
- [ ] Configure for high availability

### OpenVidu
- [ ] SSL certificates configured
- [ ] Secure OPENVIDU_SECRET set
- [ ] Recording storage configured
- [ ] TURN servers configured
- [ ] Monitoring and alerting setup
- [ ] Authentication enabled

### Jitsi
- [ ] SSL certificates configured
- [ ] Firewall rules set (UDP 10000, TCP 4443)
- [ ] TURN servers configured
- [ ] Authentication enabled
- [ ] Resource monitoring setup
- [ ] Automatic restart policies

---

## Support & Resources

- **Socket.IO:** https://socket.io/docs/
- **PeerJS:** https://peerjs.com/docs/
- **OpenVidu:** https://openvidu.io/docs/
- **Jitsi:** https://jitsi.org/user-documentation/

---

## Contributing

Found a bug or want to add another implementation? Create an issue or pull request!

---

## License

Examples provided under MIT license for reference purposes.

---

## Next Steps

1. **Choose your solution** using the decision tree above
2. **Read the setup guide** for your chosen solution
3. **Follow the testing guide** in `08-TESTING-GUIDE.md`
4. **Deploy to production** using the production checklist
5. **Monitor and optimize** based on performance metrics

Happy WebRTC building! 🚀
