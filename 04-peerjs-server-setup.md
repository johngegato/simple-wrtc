# PeerJS Server Setup Guide

## What is PeerJS?

PeerJS simplifies WebRTC peer-to-peer data, video, and audio calls. It provides both a client library and a signaling server.

**Pros:**
- Simple API
- Built-in signaling server
- Handles NAT traversal automatically
- Good for small to medium deployments

**Cons:**
- Cloud service has usage limits
- Self-hosted requires Node.js infrastructure

## Quick Start with PeerJS Cloud (Free)

```html
<!-- Use default PeerJS server (no config needed) -->
<script src="https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js"></script>

<script>
  const peer = new Peer(); // Uses PeerJS cloud by default
  peer.on('open', (id) => {
    console.log('My peer ID is:', id);
  });
</script>
```

## Self-Hosting PeerJS Server

### Installation

```bash
npm install peer
```

### Basic Server (server.js)

```javascript
const PeerServer = require('peer').PeerServer;

const server = PeerServer({
    port: 9000,
    path: '/peerjs'
});

console.log('PeerJS server running on port 9000');
```

### Run the Server

```bash
node server.js
```

### Connect Client to Self-Hosted Server

```javascript
const peer = new Peer('peer-id', {
    host: 'localhost',
    port: 9000,
    path: '/peerjs',
    secure: false // Set to true if using HTTPS
});
```

## Production Deployment

### Using Express + PeerJS

```javascript
const express = require('express');
const { PeerServer } = require('peer');

const app = express();
const server = require('http').createServer(app);
const peerServer = PeerServer({ port: 9000, path: '/peerjs' });

app.use(express.static('public'));
app.get('/', (req, res) => res.send('PeerJS server running'));

server.listen(3000);
peerServer.listen(9000);
```

### Docker Deployment

```dockerfile
FROM node:16
WORKDIR /app
RUN npm install peer
COPY server.js .
EXPOSE 9000
CMD ["node", "server.js"]
```

```bash
docker build -t peerjs-server .
docker run -p 9000:9000 peerjs-server
```

## Considerations

- **Firewall/NAT:** PeerJS uses STUN/TURN for NAT traversal. Add TURN servers for better reliability.
- **Scalability:** For many connections, consider clustering or load balancing.
- **Bandwidth:** Peer-to-peer means low server bandwidth usage.
- **Cost:** Self-hosted server costs scale with infrastructure, not connections.