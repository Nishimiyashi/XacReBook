import type { Server, Socket } from 'socket.io';

export function registerSockets(io: Server) {
  io.on('connection', (socket: Socket) => {
    socket.join('library');

    socket.on('book:join', (bookId: string) => {
      if (typeof bookId === 'string') socket.join(`book:${bookId}`);
    });

    socket.on('book:leave', (bookId: string) => {
      if (typeof bookId === 'string') socket.leave(`book:${bookId}`);
    });
  });
}
