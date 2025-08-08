let ioInstance = null;
const userSocketMap = new Map();

function initIO(io) {
  ioInstance = io;
  io.userSocketMap = userSocketMap; // Attach the map
}

function getIO() {
  if (!ioInstance) {
    throw new Error("Socket.IO not initialized");
  }
  return ioInstance;
}

module.exports = { initIO, getIO };
