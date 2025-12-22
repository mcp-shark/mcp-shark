import { createConnection } from 'node:net';
import { Defaults } from '#core/constants/Defaults';

export function checkPortReady(port, host = 'localhost', timeout = Defaults.PORT_CHECK_TIMEOUT) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const tryConnect = () => {
      const socket = createConnection(port, host);

      socket.on('connect', () => {
        socket.destroy();
        resolve(true);
      });

      socket.on('error', (_err) => {
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
