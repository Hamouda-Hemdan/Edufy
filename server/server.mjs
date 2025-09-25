import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js";

const app = express();
const server = http.createServer(app);

app.use(cors());

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Store the current whiteboard state
let whiteboardPaths = [];
// Store user cursors
let userCursors = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Send the current whiteboard state to the new client
  socket.emit("init", whiteboardPaths);

  socket.on("draw", (path) => {
    // Add the new path to the whiteboard state
    whiteboardPaths.push(path);
    // Broadcast to all other clients
    socket.broadcast.emit("draw", path);
  });

  socket.on("clear", () => {
    // Clear the whiteboard state
    whiteboardPaths = [];
    // Broadcast to all other clients
    io.emit("clear");
  });

  // Listen for cursor position updates
  socket.on("cursor", (cursorData) => {
    userCursors[socket.id] = cursorData;
    // Broadcast to all other clients (except sender)
    socket.broadcast.emit("cursors", { id: socket.id, cursor: cursorData });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    // Remove cursor data
    delete userCursors[socket.id];
    // Notify others to remove this cursor
    socket.broadcast.emit("cursor_disconnect", socket.id);
  });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

server.listen(3001, () => {
  console.log("Socket.IO server running at http://localhost:3001");
});
