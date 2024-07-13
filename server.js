const express = require('express');
const WebSocket = require('ws');
const dgram = require('dgram');

// Initialize Express server
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('WebSocket server is running');
});

// Start the Express server
const server = app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});

// Create WebSocket server and bind to the same server
const wss = new WebSocket.Server({ server });
const udpSocket = dgram.createSocket('udp4');

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');

  ws.on('message', (message) => {
    console.log('Received message from WebSocket client:', message);

    // Send UDP discovery message
    udpSocket.send(message, 0, message.length, 1982, '239.255.255.250', (err) => {
      if (err) {
        console.error('UDP message send error:', err);
      } else {
        console.log('UDP message sent');
      }
    });
  });

  udpSocket.on('message', (msg, rinfo) => {
    console.log(`UDP message received from ${rinfo.address}:${rinfo.port}`, msg.toString());
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg.toString());
      }
    });
  });
});

wss.on('error', (error) => {
  console.error('WebSocket error:', error);
});

udpSocket.on('error', (err) => {
  console.error('UDP socket error:', err);
  udpSocket.close();
});

udpSocket.bind(1982, () => {
  console.log('UDP socket listening on port 1982');
});

console.log('Starting WebSocket server on port', port);
