"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var ws_1 = require("ws");
var express = require('express');
var http_1 = require("http");
var cors = require('cors');
var app = express();
var axios_1 = require("axios");
require('dotenv').config();
var clientID = process.env.CLIENT_ID;
var clientSecret = process.env.CLIENT_SECRET;
app.use(express.json());
app.use(cors());
var PORT = 8080;
// Create HTTP server from Express app
var server = (0, http_1.createServer)(app);
// Attach WebSocket server to the HTTP server
var wss = new ws_1.WebSocketServer({ server: server });
console.log("WS Server started on port 8080");
var history = [];
wss.on('connection', function (ws) {
    console.log('New client connected');
    if (history.length > 0) {
        ws.send(JSON.stringify({
            type: 'history',
            data: history
        }));
    }
    ws.on('message', function (data) { return __awaiter(void 0, void 0, void 0, function () {
        var stringData, message_1, output, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    stringData = data.toString();
                    console.log('Received:', stringData);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    message_1 = JSON.parse(stringData);
                    if (!(message_1.type === 'clear')) return [3 /*break*/, 2];
                    history = [message_1];
                    return [3 /*break*/, 5];
                case 2:
                    if (!(message_1.type === 'draw')) return [3 /*break*/, 3];
                    history.push(message_1);
                    return [3 /*break*/, 5];
                case 3:
                    if (!(message_1.type === 'code')) return [3 /*break*/, 5];
                    return [4 /*yield*/, codeCompiler(message_1.code)];
                case 4:
                    output = _a.sent();
                    ws.send(JSON.stringify({ type: 'codeOutput', output: output }));
                    return [2 /*return*/];
                case 5:
                    wss.clients.forEach(function (client) {
                        if (client.readyState === ws_1.WebSocket.OPEN && client !== ws) {
                            client.send(JSON.stringify(message_1));
                        }
                    });
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _a.sent();
                    console.error('Failed to parse message:', error_1);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); });
    ws.on('close', function () {
        console.log('Client disconnected');
    });
});
function codeCompiler(code) {
    return __awaiter(this, void 0, void 0, function () {
        var API, codePayload, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    API = "https://api.jdoodle.com/v1/execute";
                    codePayload = {
                        clientId: clientID,
                        clientSecret: clientSecret,
                        "script": code,
                        "stdin": "",
                        "language": "java",
                        "versionIndex": "3",
                        "compileOnly": false
                    };
                    return [4 /*yield*/, axios_1.default.post(API, codePayload, {
                            headers: {
                                "Content-Type": "application/json"
                            },
                        })];
                case 1:
                    response = _a.sent();
                    console.log(response.data);
                    return [2 /*return*/, response.data.output];
            }
        });
    });
}
// app.post("/run", async (req: Request, res: Response):Promise<any> => {
//      const { code } = req.body;
//      console.log(code);
//      const output = await codeCompiler(code);
//      return res.json({ output: output })
// });
// Start the server
server.listen(PORT, function () {
    console.log("HTTP server running on http://localhost:".concat(PORT));
    console.log("WebSocket server running on ws://localhost:".concat(PORT));
});
exports.default = server;
