/* ============================================
   BRUTSTeamPad — Yjs WebSocket Server
   Standalone WebSocket server for CRDT sync
   
   Usage: node src/server/websocket.mjs
   ============================================ */

import { WebSocketServer } from 'ws';
import http from 'http';
import * as Y from 'yjs';
import { setupWSConnection, docs } from 'y-websocket/bin/utils';

const HOST = process.env.WS_HOST || '0.0.0.0';
const PORT = parseInt(process.env.WS_PORT || '1234', 10);

// Create HTTP server
const server = http.createServer((req, res) => {
    // Health check endpoint
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
            JSON.stringify({
                status: 'ok',
                rooms: docs.size,
                uptime: process.uptime(),
                timestamp: new Date().toISOString(),
            })
        );
        return;
    }

    // Room stats endpoint
    if (req.url === '/stats') {
        const roomStats = [];
        docs.forEach((doc, name) => {
            roomStats.push({
                room: name,
                connections: doc.conns ? doc.conns.size : 0,
            });
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ rooms: roomStats }));
        return;
    }

    res.writeHead(404);
    res.end('Not found');
});

// Create WebSocket server
const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
    const docName = req.url?.slice(1).split('?')[0] || 'default';

    console.log(
        `[BRUTSTeamPad WS] New connection to room: ${docName} | ` +
        `Total connections: ${wss.clients.size}`
    );

    // Set up Yjs WebSocket connection (handles CRDT sync automatically)
    setupWSConnection(ws, req, {
        docName,
        gc: true, // Enable garbage collection
    });

    ws.on('close', () => {
        console.log(
            `[BRUTSTeamPad WS] Connection closed for room: ${docName} | ` +
            `Remaining: ${wss.clients.size}`
        );
    });

    ws.on('error', (error) => {
        console.error(`[BRUTSTeamPad WS] Error in room ${docName}:`, error.message);
    });
});

// Periodic cleanup of inactive rooms
setInterval(() => {
    const now = Date.now();
    docs.forEach((doc, name) => {
        if (doc.conns && doc.conns.size === 0) {
            // Keep empty rooms for 5 minutes before cleanup
            if (!doc._lastActive) {
                doc._lastActive = now;
            } else if (now - doc._lastActive > 5 * 60 * 1000) {
                docs.delete(name);
                console.log(`[BRUTSTeamPad WS] Cleaned up inactive room: ${name}`);
            }
        } else {
            doc._lastActive = now;
        }
    });
}, 60 * 1000); // Run every minute

// Start server
server.listen(PORT, HOST, () => {
    console.log(`
  ╔══════════════════════════════════════════════╗
  ║                                              ║
  ║   🚀 BRUTSTeamPad WebSocket Server          ║
  ║                                              ║
  ║   Listening on: ws://${HOST}:${PORT}          ║
  ║   Health:       http://${HOST}:${PORT}/health ║
  ║   Stats:        http://${HOST}:${PORT}/stats  ║
  ║                                              ║
  ╚══════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n[BRUTSTeamPad WS] Shutting down gracefully...');
    wss.clients.forEach((client) => {
        client.close(1001, 'Server shutting down');
    });
    server.close(() => {
        console.log('[BRUTSTeamPad WS] Server closed.');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    process.emit('SIGINT');
});
