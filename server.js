const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
	},
});

app.use('/static', express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname, 'public/pages/index.html'));
});

io.on('connection', (socket) => {
	console.log(socket.id);
});

server.listen(process.env.PORT || 8080, () => console.log('Server started'));
