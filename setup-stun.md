# Setup Your Own STUN Server

## Install Coturn

### Ubuntu/Debian:
```bash
sudo apt-get update
sudo apt-get install coturn
```

### Windows:
Download from: https://github.com/coturn/coturn/releases

### Docker (Easiest):
```bash
docker run -d -p 3478:3478 -p 3478:3478/udp coturn/coturn
```

## Configure Coturn

Edit `/etc/turnserver.conf`:

```conf
listening-port=3478
external-ip=YOUR_SERVER_IP
realm=yourdomain.com
server-name=yourdomain.com
fingerprint
lt-cred-mech
user=username:password
```

## Start Server

```bash
sudo systemctl start coturn
sudo systemctl enable coturn
```

## Test Your STUN Server

```bash
# Test from command line
stunclient YOUR_SERVER_IP 3478
```

## Update Your Application

Replace the config in index.html with:

```javascript
const config = {
    iceServers: [
        { urls: 'stun:YOUR_SERVER_IP:3478' }
    ],
    iceCandidatePoolSize: 10
};
```

## Free Public STUN Servers (Alternative)

If you don't want to host your own:
- stun:stun.relay.metered.ca:80
- stun:openrelay.metered.ca:80
