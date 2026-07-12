import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../config/env';
import { tokenStorage } from './storage';

let socket: Socket | null = null;

export async function connectSocket(): Promise<Socket> {
  if (socket?.connected) return socket;
  const token = await tokenStorage.getAccess();
  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    auth: { token },
    forceNew: true,
  });
  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
