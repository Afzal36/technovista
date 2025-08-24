// socket.js - Make sure your client socket is configured properly
import { io } from "socket.io-client";

const socket = io("https://technovista-nine.vercel.app", {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH"]
  },
  autoConnect: true, // Ensure auto connection
  reconnection: true, // Enable reconnection
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Add connection event listeners for debugging
socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("❌ Socket disconnected:", reason);
});

socket.on("connect_error", (error) => {
  console.error("❌ Socket connection error:", error);
});

export default socket;