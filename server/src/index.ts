import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.WS_SERVER_PORT || 3001;
const N8N_WEBHOOK_URL = process.env.N8N_PRODUCT_WEBHOOK_URL || 'http://localhost:5678/webhook/product-lookup';

// Middleware
app.use(cors());
app.use(express.json());

// Create HTTP server
const server = createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Store active connections mapped by user ID
const userConnections = new Map<string, Set<WebSocket>>();

// Store pending product requests mapped by product ID
const pendingRequests = new Map<string, {
  userId: string;
  productName: string;
  timestamp: number;
}>();

// WebSocket connection handler
wss.on('connection', (ws: WebSocket) => {
  let userId: string | null = null;

  console.log('New WebSocket connection established');

  ws.on('message', async (data: Buffer) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('Received message:', message.type);

      switch (message.type) {
        case 'AUTH':
          // Authenticate and store the connection
          userId = message.userId;
          if (userId) {
            if (!userConnections.has(userId)) {
              userConnections.set(userId, new Set());
            }
            userConnections.get(userId)!.add(ws);

            ws.send(JSON.stringify({
              type: 'AUTH_SUCCESS',
              message: 'Connected successfully'
            }));
            console.log(`User ${userId} authenticated`);
          }
          break;

        case 'SUBMIT_PRODUCT':
          // Handle product submission
          if (!userId) {
            ws.send(JSON.stringify({
              type: 'ERROR',
              message: 'Not authenticated'
            }));
            return;
          }

          const { productId, productName } = message;

          // Store the pending request
          pendingRequests.set(productId, {
            userId,
            productName,
            timestamp: Date.now()
          });

          // Acknowledge receipt
          ws.send(JSON.stringify({
            type: 'PRODUCT_RECEIVED',
            productId,
            status: 'processing'
          }));

          // Trigger n8n workflow
          try {
            const response = await fetch(N8N_WEBHOOK_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                product_id: productId,
                user_id: userId,
                product_name: productName,
                callback_url: `http://localhost:${PORT}/api/n8n-callback`
              })
            });

            if (!response.ok) {
              throw new Error(`n8n webhook failed: ${response.status}`);
            }

            console.log(`Triggered n8n workflow for product ${productId}`);
          } catch (error) {
            console.error('Failed to trigger n8n workflow:', error);
            ws.send(JSON.stringify({
              type: 'PRODUCT_ERROR',
              productId,
              error: 'Failed to start product identification'
            }));
          }
          break;

        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'ERROR',
        message: 'Invalid message format'
      }));
    }
  });

  ws.on('close', () => {
    // Remove connection from user's set
    if (userId && userConnections.has(userId)) {
      userConnections.get(userId)!.delete(ws);
      if (userConnections.get(userId)!.size === 0) {
        userConnections.delete(userId);
      }
      console.log(`User ${userId} disconnected`);
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// API endpoint for n8n callback
app.post('/api/n8n-callback', (req, res) => {
  const { product_id, user_id, status, data, error } = req.body;

  console.log(`Received n8n callback for product ${product_id}`);

  // Find the user's connections and send the update
  const connections = userConnections.get(user_id);

  if (connections && connections.size > 0) {
    const message = JSON.stringify({
      type: status === 'error' ? 'PRODUCT_ERROR' : 'PRODUCT_READY',
      productId: product_id,
      status,
      data,
      error
    });

    connections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });

    console.log(`Sent update to ${connections.size} connection(s) for user ${user_id}`);
  } else {
    console.log(`No active connections for user ${user_id}`);
  }

  // Clean up pending request
  pendingRequests.delete(product_id);

  res.json({ success: true });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    connections: userConnections.size,
    pendingRequests: pendingRequests.size
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
  console.log(`n8n webhook URL: ${N8N_WEBHOOK_URL}`);
});

// Cleanup stale pending requests every 5 minutes
setInterval(() => {
  const now = Date.now();
  const timeout = 10 * 60 * 1000; // 10 minutes

  pendingRequests.forEach((request, productId) => {
    if (now - request.timestamp > timeout) {
      console.log(`Cleaning up stale request for product ${productId}`);
      pendingRequests.delete(productId);
    }
  });
}, 5 * 60 * 1000);
