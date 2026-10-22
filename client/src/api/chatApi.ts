import { io, type Socket } from 'socket.io-client';
import { getToken } from '@/utils/token';
import type { SendMessagePayload, SendMessageAck, Message } from '@/types';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export function connectSocket(): Socket | null {
  const token = getToken();
  if (!token) return null;

  if (socket?.connected) return socket;

  socket = io(baseURL, {
    auth: { token },
    transports: ['websocket'],
    autoConnect: true,
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

export function getSocket(): Socket | null {
  return socket;
}

export function sendMessage(
  payload: SendMessagePayload,
  ack: (response: SendMessageAck) => void,
): void {
  if (!socket?.connected) {
    ack({ success: false, error: 'Socket not connected' });
    return;
  }
  socket.emit('send-message', payload, ack);
}

export function onNewMessage(callback: (message: Message) => void): () => void {
  if (!socket) return () => {};
  socket.on('new-message', callback);
  return () => {
    socket?.off('new-message', callback);
  };
}
