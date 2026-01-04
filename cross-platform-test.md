# Computer ↔ Android Connection Test

## YES! It Works Between Computer and Android

Your WebRTC app is **platform-independent**. Any device with a browser can connect.

## Test Scenarios

### ✅ Computer to Android
1. **Computer**: Generate QR code
2. **Android**: Scan QR with phone camera
3. **Result**: Video call connects

### ✅ Android to Computer  
1. **Android**: Generate QR code
2. **Computer**: Scan QR (use another phone or webcam app)
3. **Result**: Video call connects

### ✅ Android to Android
1. **Phone 1**: Generate QR code
2. **Phone 2**: Scan QR code
3. **Result**: Video call connects

### ✅ Computer to Computer
1. **PC 1**: Generate QR code
2. **PC 2**: Scan QR (use phone or screenshot + QR reader)
3. **Result**: Video call connects

## How to Test Locally

### Option 1: Same WiFi Network
```bash
# On computer, find your IP
ipconfig  # Windows
ifconfig  # Mac/Linux

# Example: 192.168.1.100

# Start server
npm start

# Access from both devices:
# Computer: http://192.168.1.100:3000
# Android: http://192.168.1.100:3000
```

### Option 2: Use Ngrok (Internet Access)
```bash
# Install ngrok
npm install -g ngrok

# Start your server
npm start

# In another terminal
ngrok http 3000

# You'll get: https://abc123.ngrok.io
# Open this URL on BOTH computer and Android
```

## Requirements for Cross-Platform

✅ Both devices on same network OR use ngrok
✅ HTTPS (required for camera/mic on Android)
✅ Allow camera/microphone permissions
✅ Modern browser (Chrome recommended)

## Connection Flow

```
Computer (Chrome)  ←→  Your Server  ←→  Android (Chrome)
     ↓                                        ↓
  WebRTC Signaling                    WebRTC Signaling
     ↓                                        ↓
     └────────── Direct P2P Video ──────────┘
```

## Troubleshooting

**Can't connect?**
- Check both devices are on same network
- Verify HTTPS is enabled (use ngrok for testing)
- Check firewall isn't blocking ports
- Ensure camera/mic permissions granted

**Video not showing?**
- Check STUN server is accessible
- Try using Google STUN temporarily:
  `{ urls: 'stun:stun.l.google.com:19302' }`

## Production Deployment

For public access (computer + Android anywhere):
1. Deploy to cloud (AWS, Heroku, DigitalOcean)
2. Get SSL certificate (Let's Encrypt)
3. Use domain name
4. Both devices access via: `https://yourdomain.com`

**It just works!** WebRTC handles all the complexity.
