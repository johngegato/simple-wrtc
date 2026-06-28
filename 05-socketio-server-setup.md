# Socket.IO Signaling Server Setup Guide

## What is Socket.IO?

Socket.IO is a library that enables real-time, bidirectional communication between web clients and servers. It's widely used for WebRTC signaling.

**Pros:**
- Battle-tested and mature
- Built-in fallbacks (polling, etc.)
- Great for complex signaling logic
- Large community and ecosystem
- Good documentation

**Cons:**
- Requires more infrastructure than peer-to-peer solutions
- Server overhead increases with connection count

## Installation

```bash
npm init
npm install express socket.io cors
```

## Basic Server

```javascript
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "*" }
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', (roomName) => {
        socket.join(roomName);
        console.log(`${socket.id} joined ${roomName}`);
    });

    socket.on('signal', (data) => {
        io.to(data.to).emit('signal', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});
```

## Client Usage

```html
<script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
<script>
  const socket = io('http://localhost:3000');
  socket.emit('join-room', 'my-room');
  socket.on('signal', (data) => {
    console.log('Received signal:', data);
  });
</script>
```

## Deployment Options

### Heroku

1. Create `Procfile`:
```
web: node server.js
```

2. Deploy:
```bash
heroku create my-rtc-signaling
git push heroku main
```

### AWS EC2

```bash
# SSH into instance
ssh -i key.pem ubuntu@your-instance-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and run
git clone your-repo
cd your-repo
npm install
node server.js
```

### Docker

```dockerfile
FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
docker build -t socketio-server .
docker run -p 3000:3000 socketio-server
```

### Docker Compose (with Redis for scaling)

```yaml
version: '3'
services:
  signaling:
    build: .
    ports:
      - "3000:3000"
    environment:
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

## Production Checklist

- [ ] Enable HTTPS (get SSL certificate)
- [ ] Add authentication/authorization
- [ ] Implement rate limiting
- [ ] Monitor server metrics (CPU, memory, connections)
- [ ] Use reverse proxy (Nginx) for load balancing
- [ ] Add logging and error tracking
- [ ] Set up auto-scaling if on cloud
- [ ] Use Redis adapter for multi-server deployment

## Scaling with Redis Adapter

For multiple server instances:

```javascript
const socketIo = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const redis = require('redis');

const pubClient = redis.createClient();
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));
```
