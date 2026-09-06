import { io } from "socket.io-client";

let socket = null;
export function getSocket() {
  if (!socket) {
    const host = window.location.hostname || "localhost";
    socket = io(`${window.location.protocol}//${host}:5000`, {
      auth: { token: localStorage.getItem("token") },
      autoConnect: true,
    });
  }
  return socket;
}
export function disconnectSocket() { socket?.disconnect(); socket = null; }
