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

let players = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('joinGame', (playerName) => {
        players[socket.id] = playerName;
        io.emit('playerList', players); // Broadcast updated player list
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('playerList', players); // Broadcast updated player list
        console.log('User disconnected:', socket.id);
    });

    // Handle game actions here (e.g., card dealt, actions taken)
    socket.on('action', (action) => {
        io.emit('gameAction', action); // Broadcast the action to all players
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
