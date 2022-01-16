#!/usr/bin/env node

import createDebug from 'debug';
import http from 'http';

import './datadog.js';
import app, { disposeApp } from './app.js';
import { toNumber } from './common/util.js';

const port = toNumber(
  process.argv[2],
  () => new Error('The server port must be provided as the first argument.'),
);
console.log(`server port '${port}'`);

const server = http.createServer(app);
app.set('port', port);
server.listen(port);

server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;

    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;

    default:
      throw error;
  }
});

const debug = createDebug('express:server');

server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? `pipe ${address}` : `port ${address.port}`;
  debug(`Listening on ${bind}`);
});

let shuttingDown = false;
const shutdown = async () => {
  if (!shuttingDown) {
    shuttingDown = true;
    console.log('Shutting down...');
    server.close(async () => {
      await disposeApp();
      console.log('Server down.');
      process.exit(0);
    });
  }
};

['exit', 'SIGHUP', 'SIGINT', 'SIGTERM'].forEach((event) => {
  process.on(event, shutdown);
});
