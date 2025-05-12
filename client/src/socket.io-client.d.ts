declare module 'socket.io-client' {
  import { ManagerOptions, Socket, SocketOptions } from 'socket.io-client/build/esm';

  export { Socket };

  export function io(url: string, opts?: Partial<ManagerOptions & SocketOptions>): Socket;
  export function io(opts?: Partial<ManagerOptions & SocketOptions>): Socket;

  export default io;
} 