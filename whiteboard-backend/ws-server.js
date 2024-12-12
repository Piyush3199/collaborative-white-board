"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ws_1 = require("ws");
var PORT = 8080;
var wss = new ws_1.WebSocketServer({ port: PORT });
console.log("WS Server started on port 8080");
wss.on('connection', function (ws) {
    console.log('New client connected');
    //Broadcasting incoming messages to all connected clients
    ws.on('message', function (data) {
        var stringData = data.toString();
        console.log('Received:', stringData);
        try {
            // Parse the received message as JSON
            var message_1 = JSON.parse(stringData);
            // Broadcast the message to all connected clients
            wss.clients.forEach(function (client) {
                if (client.readyState === ws_1.WebSocket.OPEN && client !== ws) {
                    client.send(JSON.stringify(message_1));
                }
            });
        }
        catch (error) {
            console.error('Failed to parse message:', error);
        }
    });
    // Handle client disconnections
    ws.on('close', function () {
        console.log('Client disconnected');
    });
});
console.log("WebSocket server is running on ws://localhost:".concat(PORT));
