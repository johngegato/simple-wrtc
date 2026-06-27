# OpenVidu Setup Guide

## What is OpenVidu?

OpenVidu is a production-ready, open-source platform for video/audio conferencing. It provides WebRTC infrastructure with signaling, recording, and media server capabilities.

**Pros:**
- Production-grade with built-in features
- Supports recording and streaming
- Scalable architecture
- Great for enterprise use cases
- Apache 2.0 licensed

**Cons:**
- Overkill for simple signaling
- Higher resource usage
- More complex architecture

## Quick Start with Docker

### 1. Pull and Run OpenVidu

```bash
# Run OpenVidu server (on port 4443)
docker run -d \
  -p 4443:4443 \
  --name openvidu \
  -e OPENVIDU_SECRET=YOUR_SECRET \
  openvidu/openvidu:latest
```

### 2. Access Dashboard

```
https://localhost:4443
Password: YOUR_SECRET
```

## Client Implementation

### Install OpenVidu Client

```bash
npm install openvidu-browser
```

### Basic Usage

```javascript
import { OpenVidu } from 'openvidu-browser';

const OV = new OpenVidu();

// Get a token from your backend
const token = await getToken(sessionName);

// Connect to the session
const session = OV.initSession();
await session.connect(token, { clientData: userId });

// Publish your stream
const publisher = OV.initPublisher(undefined, {
    audioSource: true,
    videoSource: false  // Audio only
});

await session.publish(publisher);

// Listen for other participants
session.on('streamCreated', event => {
    session.subscribe(event.stream, 'subscriber-div');
});
```

## Backend Setup (Node.js)

```javascript
const express = require('express');
const { OpenVidu } = require('openvidu-node-client');

const app = express();
const OV = new OpenVidu(process.env.OPENVIDU_URL || 'https://localhost:4443',
                        process.env.OPENVIDU_SECRET || 'YOUR_SECRET');

// Generate a token for clients
app.post('/sessions/:sessionName/connections', async (req, res) => {
    try {
        const sessionName = req.params.sessionName;
        let sessionId;

        // Try to get existing session
        try {
            const session = await OV.fetch();
            sessionId = session.sessionId;
        } catch (e) {
            // Create new session if doesn't exist
            const session = await OV.createSession({ customSessionId: sessionName });
            sessionId = session.sessionId;
        }

        // Create connection token
        const connection = await OV.createConnection(sessionId);
        res.json({ token: connection.token });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

app.listen(3000);
```

## Docker Compose (Production Setup)

```yaml
version: '3.8'

services:
  openvidu:
    image: openvidu/openvidu:latest
    restart: always
    ports:
      - "4443:4443"
    environment:
      - OPENVIDU_SECRET=your-secret-key
      - OPENVIDU_RECORDING=true
      - OPENVIDU_RECORDING_PATH=/recordings
    volumes:
      - ./recordings:/recordings
      - ./certs:/opt/openvidu/certs
    networks:
      - webrtc

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - OPENVIDU_URL=https://openvidu:4443
      - OPENVIDU_SECRET=your-secret-key
    depends_on:
      - openvidu
    networks:
      - webrtc

networks:
  webrtc:
    driver: bridge
```

## Advanced Configuration

### Enable Recording

```javascript
const session = OV.createSession({
    customSessionId: 'my-session',
    mediaMode: 'ROUTED',  // Media server processes streams
    recordingMode: 'ALWAYS',  // Always record
    defaultRecordingProperties: {
        outputMode: 'COMPOSED',  // Single video file
        recordingLayout: 'BEST_FIT'
    }
});
```

### Multiple Regions (Scalability)

```bash
# Deploy multiple OpenVidu instances behind load balancer
# Nginx example:
upstream openvidu_backend {
    server openvidu1:4443;
    server openvidu2:4443;
    server openvidu3:4443;
}

server {
    listen 443 ssl;
    location / {
        proxy_pass https://openvidu_backend;
    }
}
```

## Production Checklist

- [ ] Configure SSL certificates
- [ ] Set secure OPENVIDU_SECRET
- [ ] Enable recording if needed
- [ ] Configure TURN servers
- [ ] Set up monitoring and logging
- [ ] Enable authentication
- [ ] Configure session limits
- [ ] Set up backup/redundancy
