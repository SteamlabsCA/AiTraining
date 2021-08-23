import { io } from 'socket.io-client';
import socketClient from 'socket.io-client';

// const socket = socketClient();
const socket = socketClient('http://127.0.0.1:8080');
socket.on('connect', () => {
	console.log('hello');
});
