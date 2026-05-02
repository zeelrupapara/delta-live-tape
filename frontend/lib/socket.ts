import { io, Socket } from "socket.io-client";

const URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

let _socket: Socket | null = null;

export function getSocket(): Socket {
  if (_socket) return _socket;
  _socket = io(URL, {
    transports: ["websocket"],
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 500,
    reconnectionDelayMax: 5_000,
  });
  return _socket;
}

export const BACKEND_URL = URL;
