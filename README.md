# Video Call QR Connect

WebRTC-based video calling website where users connect by scanning QR codes.

## Features
- QR code generation for connection
- QR code scanning (mobile camera)
- WebRTC peer-to-peer video calling
- Call/Accept/Reject functionality
- No messaging or extra features

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Server
```bash
npm start
```

### 3. Access Application
Open browser: `http://localhost:3000`

## How to Use

### User 1 (Initiator):
1. Click "Generate My QR Code"
2. Wait for QR code to appear
3. Wait for User 2 to scan and connect
4. Click "Start Video Call" when peer joins
5. Video call begins

### User 2 (Joiner):
1. Click "Start QR Scanner"
2. Scan User 1's QR code with mobile camera
3. Automatically redirects to call page
4. Accept or Reject incoming call
5. Video call begins if accepted

## Scaling to Millions of Users

### Current Setup (Development)
- Direct peer-to-peer WebRTC
- Single Node.js signaling server
- Good for: Testing, small deployments

### Production Scaling Requirements

#### 1. Signaling Server Scaling
```bash
# Use PM2 for clustering
npm install -g pm2
pm2 start server.js -i max
```

#### 2. Add Redis for Multi-Server State
```javascript
// Install: npm install redis ioredis
// Share room state across multiple server instances
```

#### 3. Deploy SFU Media Server (For Group Calls)
- **Mediasoup** (Node.js): https://mediasoup.org/
- **Janus Gateway** (C): https://janus.conf.meetecho.com/
- **Jitsi Videobridge**: https://jitsi.org/

#### 4. TURN Server Setup (For NAT Traversal)
```bash
# Install Coturn
sudo apt-get install coturn

# Configure in index.html:
iceServers: [
  { urls: 'stun:stun.l.google.com:19302' },
  { 
    urls: 'turn:your-turn-server.com:3478',
    username: 'user',
    credential: 'pass'
  }
]
```

#### 5. Cloud Deployment Options

**AWS:**
- EC2 Auto Scaling Groups for signaling servers
- Application Load Balancer
- ElastiCache Redis for state
- CloudFront CDN for static files
- Route53 for DNS

**Google Cloud:**
- GKE (Kubernetes) for container orchestration
- Cloud Load Balancing
- Memorystore for Redis
- Cloud CDN

**Azure:**
- Azure Kubernetes Service (AKS)
- Azure Load Balancer
- Azure Cache for Redis

#### 6. Architecture for Millions

```
Users → CDN (Static Files)
     → Load Balancer
        → Signaling Servers (Multiple instances)
           → Redis (Shared state)
        → SFU Media Servers (Regional)
        → TURN Servers (Global)
```

#### 7. Monitoring & Optimization
- Use Prometheus + Grafana for metrics
- Monitor WebSocket connections
- Track media quality (packet loss, latency)
- Auto-scale based on connection count

## Environment Variables

Create `.env` file:
```
PORT=3000
REDIS_URL=redis://localhost:6379
TURN_SERVER=turn:your-server.com:3478
TURN_USERNAME=username
TURN_PASSWORD=password
```

## Browser Requirements
- Chrome/Edge (recommended)
- Firefox
- Safari (iOS 11+)
- Requires HTTPS in production (except localhost)

## Security Notes
- Use HTTPS in production (required for getUserMedia)
- Implement authentication for production
- Rate limit WebSocket connections
- Validate all client messages

## Performance Tips
- Use H.264 video codec for better compression
- Limit video resolution (720p max for mobile)
- Enable simulcast for better quality adaptation
- Use TURN only when STUN fails

## Troubleshooting

**Camera not working:**
- Check browser permissions
- Must use HTTPS (or localhost)

**Connection fails:**
- Check firewall settings
- Verify STUN/TURN servers are accessible
- Check NAT type

**High latency:**
- Deploy TURN servers closer to users
- Use regional SFU servers
- Optimize network routing

## License
MIT
