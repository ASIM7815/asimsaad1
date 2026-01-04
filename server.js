const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');
const path = require('path');
const crypto = require('crypto');

const app = express();

let server;
if (process.env.SSL_KEY && process.env.SSL_CERT) {
    server = https.createServer({
        key: fs.readFileSync(process.env.SSL_KEY),
        cert: fs.readFileSync(process.env.SSL_CERT)
    }, app);
} else {
    server = http.createServer(app);
}

const wss = new WebSocket.Server({ server });

const rooms = new Map();
const clients = new Map();

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

wss.on('connection', (ws) => {
    const clientId = crypto.randomUUID();
    clients.set(clientId, ws);
    
    console.log(`Client connected: ${clientId}`);
    
    // Send ping every 30 seconds to keep connection alive
    const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.ping();
        }
    }, 30000);
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handleMessage(ws, clientId, data);
        } catch (error) {
            console.error('Message error:', error);
        }
    });
    
    ws.on('close', () => {
        console.log(`Client disconnected: ${clientId}`);
        clearInterval(pingInterval);
        clients.delete(clientId);
        
        // Clean up rooms
        for (const [roomId, room] of rooms.entries()) {
            if (room.initiator === clientId || room.peer === clientId) {
                const otherClient = room.initiator === clientId ? room.peer : room.initiator;
                if (otherClient && clients.has(otherClient)) {
                    const otherWs = clients.get(otherClient);
                    if (otherWs.readyState === WebSocket.OPEN) {
                        otherWs.send(JSON.stringify({ type: 'call-ended' }));
                    }
                }
                rooms.delete(roomId);
            }
        }
    });
    
    ws.on('error', (error) => {
        console.error(`WebSocket error for ${clientId}:`, error);
    });
});

function handleMessage(ws, clientId, data) {
    // Validate WebSocket is still open before processing
    if (ws.readyState !== WebSocket.OPEN) {
        console.log(`WebSocket not open for client ${clientId}`);
        return;
    }
    
    switch (data.type) {
        case 'create-room':
            const roomId = crypto.randomBytes(8).toString('hex');
            rooms.set(roomId, { initiator: clientId, peer: null });
            ws.send(JSON.stringify({
                type: 'room-created',
                roomId,
                peerId: clientId
            }));
            console.log(`Room created: ${roomId}`);
            break;
            
        case 'join-room':
            const room = rooms.get(data.roomId);
            if (room) {
                room.peer = clientId;
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: 'peer-joined' }));
                }
                
                const initiatorWs = clients.get(room.initiator);
                if (initiatorWs && initiatorWs.readyState === WebSocket.OPEN) {
                    initiatorWs.send(JSON.stringify({ type: 'peer-joined' }));
                }
                console.log(`Peer joined room: ${data.roomId}`);
            }
            break;
            
        case 'call-request':
            const callRoom = rooms.get(data.roomId);
            if (callRoom && callRoom.initiator) {
                const targetWs = clients.get(callRoom.initiator);
                if (targetWs && targetWs.readyState === WebSocket.OPEN) {
                    targetWs.send(JSON.stringify({ type: 'call-request' }));
                }
            }
            break;
            
        case 'call-response':
            const responseRoom = rooms.get(data.roomId);
            if (responseRoom && responseRoom.peer) {
                const peerWs = clients.get(responseRoom.peer);
                if (peerWs && peerWs.readyState === WebSocket.OPEN) {
                    peerWs.send(JSON.stringify({
                        type: data.accepted ? 'call-accepted' : 'call-rejected'
                    }));
                }
            }
            break;
            
        case 'offer':
        case 'answer':
        case 'ice-candidate':
            const signalingRoom = rooms.get(data.roomId);
            if (signalingRoom) {
                const targetId = signalingRoom.initiator === clientId ? signalingRoom.peer : signalingRoom.initiator;
                const targetWs = clients.get(targetId);
                if (targetWs && targetWs.readyState === WebSocket.OPEN) {
                    targetWs.send(JSON.stringify(data));
                }
            }
            break;
            
        case 'end-call':
            const endRoom = rooms.get(data.roomId);
            if (endRoom) {
                const otherId = endRoom.initiator === clientId ? endRoom.peer : endRoom.initiator;
                const otherWs = clients.get(otherId);
                if (otherWs && otherWs.readyState === WebSocket.OPEN) {
                    otherWs.send(JSON.stringify({ type: 'call-ended' }));
                }
            }
            break;
    }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Ready to handle video calls');
});
