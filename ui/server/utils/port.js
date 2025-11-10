import { createConnection } from 'net';

export function checkPortReady(port, host = 'localhost', timeout = 10000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const tryConnect = () => {
      const socket = createConnection(port, host);

      socket.on('connect', () => {
        socket.destroy();
        resolve(true);
      });

      socket.on('error', (err) => {
        socket.destroy();
        const elapsed = Date.now() - startTime;
        if (elapsed >= timeout) {
          reject(new Error(`Port ${port} not ready after ${timeout}ms`));
        } else {
          setTimeout(tryConnect, 200);
        }
      });
    };

    tryConnect();
  });
}
