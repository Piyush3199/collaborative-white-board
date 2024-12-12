"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ws_1 = require("ws");
var PORT = 8080;
var wss = new ws_1.WebSocketServer({ port: PORT });
console.log("WS Server started on port 8080");
var history = [];
wss.on('connection', function (ws) {
    console.log('New client connected');
    //Broadcasting incoming messages to all connected clients
    if (history.length > 0) {
        ws.send(JSON.stringify({
            type: 'history',
            data: history
        }));
    }
    ws.on('message', function (data) {
        var stringData = data.toString();
        console.log('Received:', stringData);
        try {
            // Parse the received message as JSON
            var message_1 = JSON.parse(stringData);
            //Adding to history the action performed
            if (message_1.type === 'clear') {
                history = [message_1];
            }
            else if (message_1.type === 'draw') {
                history.push(message_1);
            }
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
