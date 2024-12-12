import {WebSocketServer,WebSocket} from "ws";

const PORT = 8080;
const wss = new WebSocketServer({port: PORT});

console.log("WS Server started on port 8080");

interface Message {
    x: number;
    y: number;
    color: string;
    brushSize: number
}

wss.on('connection', (ws: WebSocket)=>{
    console.log('New client connected');

    //Broadcasting incoming messages to all connected clients

    ws.on('message', (data: Buffer) => {
        const stringData = data.toString();
        console.log('Received:', stringData);

        try {
            // Parse the received message as JSON
            const message: Message = JSON.parse(stringData);

            // Broadcast the message to all connected clients
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN && client !== ws) {
                    client.send(JSON.stringify(message));
                }
            });
        } catch (error) {
            console.error('Failed to parse message:', error);
        }
    });

    // Handle client disconnections
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

console.log(`WebSocket server is running on ws://localhost:${PORT}`);