const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const ACTIONS = require('./src/Actions');
const path = require('path');

const app = express();

const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'build')));

app.use((req, res, next) => {
	res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const userSocketMap = {};

const getAllConnectedClients = (roomId) => {
	return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
		return {
			socketId,
			username: userSocketMap[socketId],
		};
	});
};

io.on('connection', (socket) => {
	console.log('Socket Connected', socket.id);

	// Join Event Scoket

	socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
		socket.join(roomId);
		userSocketMap[socket.id] = username;
		const clients = getAllConnectedClients(roomId);
		// console.log(clients);
		clients.forEach(({ socketId }) => {
			io.to(socketId).emit(ACTIONS.JOINED, {
				clients,
				username,
				socketId: socket.id,
			});
		});
	});

	// Code Change Event

	socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
		socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
	});

	// Code Sync Event

	socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
		io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
	});

	socket.on('disconnecting', () => {
		const rooms = [...socket.rooms];
		rooms.forEach((roomId) => {
			socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
				socketId: socket.id,
				username: userSocketMap[socket.id],
			});
		});

		delete userSocketMap[socket.id];
		socket.leave();
	});
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
	console.log(`Listening on Port ${PORT}`);
});
