# HTTPS Setup Guide

## Option 1: Self-Signed Certificate (Development)

```bash
# Generate certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Run server
SSL_KEY=key.pem SSL_CERT=cert.pem npm start
```

## Option 2: Let's Encrypt (Production)

```bash
# Install certbot
sudo apt-get install certbot

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com

# Run server
SSL_KEY=/etc/letsencrypt/live/yourdomain.com/privkey.pem SSL_CERT=/etc/letsencrypt/live/yourdomain.com/fullchain.pem npm start
```

## Option 3: Use .env File

Create `.env`:
```
PORT=3000
SSL_KEY=./key.pem
SSL_CERT=./cert.pem
```

Install dotenv:
```bash
npm install dotenv
```

Add to server.js top:
```javascript
require('dotenv').config();
```

## Without HTTPS (Development Only)

Just run:
```bash
npm start
```

Server auto-detects and uses HTTP if no SSL certificates provided.
