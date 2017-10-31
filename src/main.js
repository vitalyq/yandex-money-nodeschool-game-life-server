'use strict';

//
// YOUR CODE GOES HERE...
//
// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
// ░░░░░░░░░░▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄░░░░░░░░░░░
// ░░░░░░░░▄▀░░░░░░░░░░░░▄░░░░░░░▀▄░░░░░░░░
// ░░░░░░░░█░░▄░░░░▄░░░░░░░░░░░░░░█░░░░░░░░
// ░░░░░░░░█░░░░░░░░░░░░▄█▄▄░░▄░░░█░▄▄▄░░░░
// ░▄▄▄▄▄░░█░░░░░░▀░░░░▀█░░▀▄░░░░░█▀▀░██░░░
// ░██▄▀██▄█░░░▄░░░░░░░██░░░░▀▀▀▀▀░░░░██░░░
// ░░▀██▄▀██░░░░░░░░▀░██▀░░░░░░░░░░░░░▀██░░
// ░░░░▀████░▀░░░░▄░░░██░░░▄█░░░░▄░▄█░░██░░
// ░░░░░░░▀█░░░░▄░░░░░██░░░░▄░░░▄░░▄░░░██░░
// ░░░░░░░▄█▄░░░░░░░░░░░▀▄░░▀▀▀▀▀▀▀▀░░▄▀░░░
// ░░░░░░█▀▀█████████▀▀▀▀████████████▀░░░░░░
// ░░░░░░████▀░░███▀░░░░░░▀███░░▀██▀░░░░░░░
// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
//
// Nyan cat lies here...
//
const url = require('url');
const WebSocket = require('ws');
const LifeGameVirtualDom = require('../lib/LifeGameVirtualDom');

// Generate color string between #000 and #fff
const getRandomColor = () => {
  const colorNum = Math.floor(Math.random() * 4096);
  const colorHex = colorNum.toString(16).padStart(3, '0');
  return `#${colorHex}`;
};

// Broadcast helper
const broadcast = (server, data) => {
  server.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

// Extract token from query string
const getTokenFromUrl = reqUrl => (
  url.parse(reqUrl, true).query.token
);

// Authorize a client by token
const verifyClient = ({ req }) => (
  Boolean(getTokenFromUrl(req.url))
);

// Initialize
const wss = new WebSocket.Server({ port: 3000, verifyClient });
const lifeGame = new LifeGameVirtualDom();

lifeGame.sendUpdates = (data) => {
  broadcast(wss, JSON.stringify({
    type: 'UPDATE_STATE',
    data,
  }));
};

wss.on('connection', (ws, req) => {
  // Send initialization data
  ws.send(JSON.stringify({
    type: 'INITIALIZE',
    data: {
      state: lifeGame.state,
      settings: lifeGame.settings,
      user: {
        token: getTokenFromUrl(req.url),
        color: getRandomColor(),
      },
    },
  }));

  ws.on('message', (message) => {
    const { type, data } = JSON.parse(message);
    if (type === 'ADD_POINT') {
      lifeGame.applyUpdates(data);
    }
  });
});
