const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
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
        clients.delete(clientId);
        
        // Clean up rooms
        for (const [roomId, room] of rooms.entries()) {
            if (room.initiator === clientId || room.peer === clientId) {
                const otherClient = room.initiator === clientId ? room.peer : room.initiator;
                if (otherClient && clients.has(otherClient)) {
                    clients.get(otherClient).send(JSON.stringify({ type: 'call-ended' }));
                }
                rooms.delete(roomId);
            }
        }
    });
});

function handleMessage(ws, clientId, data) {
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
                ws.send(JSON.stringify({ type: 'peer-joined' }));
                
                const initiatorWs = clients.get(room.initiator);
                if (initiatorWs) {
                    initiatorWs.send(JSON.stringify({ type: 'peer-joined' }));
                }
                console.log(`Peer joined room: ${data.roomId}`);
            }
            break;
            
        case 'call-request':
            const callRoom = rooms.get(data.roomId);
            if (callRoom && callRoom.initiator) {
                const targetWs = clients.get(callRoom.initiator);
                if (targetWs) {
                    targetWs.send(JSON.stringify({ type: 'call-request' }));
                }
            }
            break;
            
        case 'call-response':
            const responseRoom = rooms.get(data.roomId);
            if (responseRoom && responseRoom.peer) {
                const peerWs = clients.get(responseRoom.peer);
                if (peerWs) {
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
                if (targetWs) {
                    targetWs.send(JSON.stringify(data));
                }
            }
            break;
            
        case 'end-call':
            const endRoom = rooms.get(data.roomId);
            if (endRoom) {
                const otherId = endRoom.initiator === clientId ? endRoom.peer : endRoom.initiator;
                const otherWs = clients.get(otherId);
                if (otherWs) {
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
