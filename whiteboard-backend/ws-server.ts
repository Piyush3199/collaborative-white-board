import { json } from "react-router-dom";
import { WebSocketServer, WebSocket } from "ws";
const express = require('express');
import { Request, Response } from "express";
import { createServer } from "http";
const cors = require('cors');
const app = express();
import axios from "axios";
require('dotenv').config(); 

const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET

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
    isStarting: boolean,
    code: string
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

    ws.on('message',  async (data: Buffer) => {
        const stringData = data.toString();
        console.log('Received:', stringData);

        try {
            const message: Message = JSON.parse(stringData);

            if (message.type === 'clear') {
                history = [message];
            } else if (message.type === 'draw') {
                history.push(message);
            }else if(message.type === 'code'){
                const output = await codeCompiler(message.code);
                ws.send(JSON.stringify({ type: 'codeOutput', output }));
                return;
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

async function codeCompiler(code : string):Promise<string | null>{
   const API = `https://api.jdoodle.com/v1/execute`;
   const codePayload = {
        clientId: clientID,
        clientSecret: clientSecret,
        "script": code,
        "stdin": "",
        "language": "java",
        "versionIndex": "3",
        "compileOnly": false
   }

    const response = await axios.post(API, codePayload,{
        headers:{
            "Content-Type": "application/json"
        },
   });
   console.log(response.data);
   return response.data.output;
   

}
// app.post("/run", async (req: Request, res: Response):Promise<any> => {
//      const { code } = req.body;
//      console.log(code);
//      const output = await codeCompiler(code);
//      return res.json({ output: output })

// });

// Start the server
server.listen(PORT, () => {
    console.log(`HTTP server running on http://localhost:${PORT}`);
    console.log(`WebSocket server running on ws://localhost:${PORT}`);
});
export default server;