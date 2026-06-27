// ============= Socket.IO Signaling Server =============
// Simple Node.js WebRTC signaling server using Socket.IO
// Install: npm install express socket.io cors
// Run: node socketio-server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

// Track rooms and peers
const rooms = {};

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // User joins a room
    socket.on('join-room', (data) => {
        const { roomName, userId } = data;
        socket.join(roomName);
        console.log(`${socket.id} joined room: ${roomName}`);

        if (!rooms[roomName]) {
            rooms[roomName] = [];
        }
        rooms[roomName].push({
            socketId: socket.id,
            userId: userId
        });

        // Notify other peers in the room
        const peers = rooms[roomName].filter(p => p.socketId !== socket.id);
        if (peers.length > 0) {
            io.to(roomName).emit('peer-joined', {
                peerId: socket.id,
                userId: userId,
                peerCount: rooms[roomName].length
            });
        }
    });

    // Forward signaling messages (SDP and ICE candidates)
    socket.on('signal', (data) => {
        const { to, sdp, candidate } = data;
        if (to) {
            io.to(to).emit('signal', {
                from: socket.id,
                sdp: sdp,
                candidate: candidate
            });
            console.log(`Signal from ${socket.id} to ${to}`);
        }
    });

    // User leaves a room
    socket.on('leave-room', (data) => {
        const { roomName } = data;
        socket.leave(roomName);
        
        if (rooms[roomName]) {
            rooms[roomName] = rooms[roomName].filter(p => p.socketId !== socket.id);
            if (rooms[roomName].length === 0) {
                delete rooms[roomName];
            }
        }
        
        // Notify other peers
        io.to(roomName).emit('peer-left', { peerId: socket.id });
        console.log(`${socket.id} left room: ${roomName}`);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        
        // Clean up rooms
        Object.keys(rooms).forEach(roomName => {
            rooms[roomName] = rooms[roomName].filter(p => p.socketId !== socket.id);
            if (rooms[roomName].length === 0) {
                delete rooms[roomName];
            }
        });
    });
});

server.listen(PORT, () => {
    console.log(`Socket.IO signaling server running on http://localhost:${PORT}`);
    console.log(`\nUsage:`);
    console.log(`1. Update SIGNALING_SERVER in client HTML to "http://localhost:${PORT}"`);
    console.log(`2. Open the client in two browsers on the same room`);
    console.log(`3. Voice connection should establish automatically`);
});