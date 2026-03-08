const http = require('http');
const app = require('./src/app');
const config = require('./src/config/env');
const { initSocket } = require('./src/socket/socket.server');

const port = config.port || 4000;

const server = http.createServer(app);

// Initialize Socket.io for realtime group chat
initSocket(server);

server.listen(port, () => {
  console.log(`Safe Sphere backend listening on http://localhost:${port}`);
});

