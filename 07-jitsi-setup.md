# Jitsi Meet Setup Guide

## What is Jitsi?

Jitsi Meet is a fully featured, open-source video conferencing solution. While more than just a signaling server, it's production-proven and can be used for voice-only scenarios.

**Pros:**
- Production-ready
- Easy deployment (Docker)
- No account required
- Full-featured (chat, screen share, etc.)
- Large, active community
- Apache 2.0 licensed

**Cons:**
- Overkill for simple signaling
- Higher resource usage
- More complex architecture

## Quick Start with Docker

### 1. Clone and Deploy

```bash
git clone https://github.com/jitsi/docker-jitsi-meet
cd docker-jitsi-meet

# Generate configs
cp env.example .env
./gen-passwords.sh

# Start services
docker-compose up -d
```

### 2. Access Jitsi

```
https://localhost
```

## Minimal Voice-Only Implementation

### Using Jitsi iFrame API

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://your-jitsi-domain/external_api.js"></script>
</head>
<body>
    <div id="jitsi-container"></div>
    
    <script>
        const options = {
            roomName: 'voice-room-123',
            width: 700,
            height: 700,
            parentNode: document.querySelector('#jitsi-container'),
            userInfo: {
                displayName: 'Anonymous User'
            },
            configOverwrite: {
                startAudioOnly: true,
                disableSimulcast: false,
                startWithAudioMuted: false,
                startWithVideoMuted: true,
                enableLobbyMode: false
            },
            interfaceConfigOverwrite: {
                DISABLE_VIDEO: true,
                DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
                SHOW_CHROME_EXTENSION_BANNER: false,
                TOOLBAR_BUTTONS: [
                    'microphone', 'hangup', 'settings'
                ]
            }
        };

        const api = new JitsiMeetExternalAPI("your-jitsi-domain", options);
    </script>
</body>
</html>
```

## Self-Hosted Setup

### Prerequisites

- Ubuntu 18.04 or later
- Docker and Docker Compose
- Domain name with SSL certificate

### Installation

```bash
# Clone repository
git clone https://github.com/jitsi/docker-jitsi-meet
cd docker-jitsi-meet

# Generate configuration
cp env.example .env

# Edit .env
echo "JITSI_INTERFACE_CONFIG_OVERRIDES=startAudioOnly:true" >> .env
echo "PUBLIC_URL=https://your-domain.com" >> .env

# Generate passwords
./gen-passwords.sh

# Start
docker-compose up -d
```

### Access Control (Optional)

Add authentication to `.env`:

```bash
ENABLE_AUTH=1
ENABLE_GUESTS=0
AUTH_TYPE=internal
JICOFO_BREWERY_MUC=jibribrewery
```

## Docker Compose Configuration

```yaml
version: '3.8'

services:
  # Web UI
  web:
    image: jitsi/web:latest
    restart: always
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ${CONFIG}/web:/config:Z
      - ${CONFIG}/transcripts:/usr/share/jitsi-meet/transcripts:Z
    environment:
      - ENABLE_AUTH
      - AUTH_TYPE
      - VIRTUAL_HOST
      - TZ
    networks:
      - meet.jitsi
    depends_on:
      - prosody

  # XMPP Server
  prosody:
    image: jitsi/prosody:latest
    restart: always
    volumes:
      - ${CONFIG}/prosody/config:/config:Z
      - ${CONFIG}/prosody/prosody-plugins-custom:/prosody-plugins-custom:Z
    environment:
      - ENABLE_AUTH
      - XMPP_DOMAIN
      - XMPP_AUTH_DOMAIN
      - XMPP_GUEST_DOMAIN
      - XMPP_MUC_DOMAIN
      - XMPP_INTERNAL_MUC_DOMAIN
      - JICOFO_COMPONENT_SECRET
      - JVB_AUTH_USER
      - JVB_AUTH_PASSWORD
      - JWT_ASAP_KEYMOD
      - JWT_ALLOWED_AUDIENCE
      - JWT_AUDIENCE
      - JWT_ISS
      - JWT_TOKEN_AUTH_MODULE
      - LOG_LEVEL
      - TZ
    networks:
      - meet.jitsi

  # Media Server
  jvb:
    image: jitsi/jvb:latest
    restart: always
    ports:
      - '${JVB_PORT}:${JVB_PORT}/udp'
      - '4443:4443/tcp'
    volumes:
      - ${CONFIG}/jvb:/config:Z
    environment:
      - ENABLE_COLIBRI_WEBSOCKET
      - JVB_AUTH_USER
      - JVB_AUTH_PASSWORD
      - JVB_BREWERY_MUC
      - JVB_PORT
      - JVB_TCP_HARVESTER_DISABLED
      - JVB_TCP_PORT
      - JVB_STUN_SERVERS
      - JICOFO_AUTH_USER
      - TZ
    networks:
      - meet.jitsi
    depends_on:
      - prosody

  # Conference Focus
  jicofo:
    image: jitsi/jicofo:latest
    restart: always
    volumes:
      - ${CONFIG}/jicofo:/config:Z
    environment:
      - ENABLE_AUTH
      - XMPP_DOMAIN
      - XMPP_AUTH_DOMAIN
      - XMPP_INTERNAL_MUC_DOMAIN
      - JICOFO_AUTH_USER
      - JICOFO_AUTH_PASSWORD
      - JICOFO_COMPONENT_SECRET
      - TZ
    networks:
      - meet.jitsi
    depends_on:
      - prosody

networks:
  meet.jitsi:

volumes:
  jitsi_config:
```

## Production Deployment

### SSL/TLS with Let's Encrypt

```bash
# Add to .env
echo "ENABLE_LETSENCRYPT=1" >> .env
echo "LETSENCRYPT_DOMAIN=your-domain.com" >> .env
echo "LETSENCRYPT_EMAIL=admin@your-domain.com" >> .env
```

### Scaling (Multiple Jitsi Instances)

Use a reverse proxy (Nginx) with load balancing:

```nginx
upstream jitsi_backend {
    server jitsi-1:443;
    server jitsi-2:443;
    server jitsi-3:443;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    location / {
        proxy_pass https://jitsi_backend;
    }
}
```

## Comparison: When to Use Jitsi

| Scenario | Recommendation |
|----------|-----------------|
| Simple point-to-point voice | Use **Socket.IO** or **PeerJS** |
| Room-based conferencing | Use **Jitsi** or **OpenVidu** |
| Complex signaling needs | Use **OpenVidu** |
| Minimal setup & self-hosted | Use **Jitsi** |
| Enterprise/scalable | Use **OpenVidu** |

## Production Checklist

- [ ] SSL certificates configured
- [ ] Firewall rules set (UDP 10000, TCP 4443)
- [ ] TURN servers configured
- [ ] Authentication enabled
- [ ] Logging and monitoring setup
- [ ] Backup strategy in place
- [ ] Resource monitoring (CPU, memory)
- [ ] Automatic restart policies
