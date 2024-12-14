import { json } from "react-router-dom";
import { WebSocketServer, WebSocket } from "ws";
//import  express  from "express";
const express = require('express');
import { Request, Response } from "express";
const { NodeVM } = require("vm2");
import { createServer } from "http";
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());

const PORT = 8080;

// Create HTTP server from Express app
const server = createServer(app);

// Attach WebSocket server to the HTTP server
const wss = new WebSocketServer({ server });

console.log("WS Server started on port 8080");

interface Message {
    type: 'draw' | 'clear',
    x: number;
    y: number;
    color: string;
    brushSize: number,
    isStarting: boolean
}

let history: Message[] = [];

wss.on('connection', (ws: WebSocket) => {
    console.log('New client connected');

    if (history.length > 0) {
        ws.send(JSON.stringify({
            type: 'history',
            data: history
        }));
    }

    ws.on('message', (data: Buffer) => {
        const stringData = data.toString();
        console.log('Received:', stringData);

        try {
            const message: Message = JSON.parse(stringData);

            if (message.type === 'clear') {
                history = [message];
            } else if (message.type === 'draw') {
                history.push(message);
            }

            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN && client !== ws) {
                    client.send(JSON.stringify(message));
                }
            });
        } catch (error) {
            console.error('Failed to parse message:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

app.post("/run", async (req: Request, res: Response):Promise<any> => {
    const { code } = req.body;
    console.log(code);
    if (!code) {
        return res.status(400).json({ error: 'No code provided' });
    }

    try {
        const vm = new NodeVM({
            console: "inherit",
            sandbox: {},
            timeout: 1000,
            wrapper: 'commonjs' 
        });

        try {
            const result = vm.run(code);
            console.log("Raw result : ",result);

            const output = typeof result === 'function' ? result() : result;
            console.log("Processed result:", output);
            return res.json({ output: output });
        } catch (vmerror) {
            return res.status(400).json({ output: `Error: ${vmerror.message}` });
        }
      //  console.log(res.json({output: result}));
        
       // res.send({output: result});
    } catch (error) {
        console.error(`Error: ${error}`);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Start the server
server.listen(PORT, () => {
    console.log(`HTTP server running on http://localhost:${PORT}`);
    console.log(`WebSocket server running on ws://localhost:${PORT}`);
});
export default server;