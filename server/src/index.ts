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
const N8N_BRAND_WEBHOOK_URL = process.env.N8N_BRAND_WEBHOOK_URL || 'http://localhost:5678/webhook/brand-research';
const N8N_COMPETITOR_WEBHOOK_URL = process.env.N8N_COMPETITOR_WEBHOOK_URL || 'http://localhost:5678/webhook/competitor-research';
const N8N_PROMPT_GENERATION_WEBHOOK_URL = process.env.N8N_PROMPT_GENERATION_WEBHOOK_URL || 'http://localhost:5678/webhook/generate-prompts';

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

// Store pending brand research requests
const pendingBrandRequests = new Map<string, {
  userId: string;
  websiteUrl: string;
  brandName?: string;
  timestamp: number;
}>();

// Store pending competitor research requests
const pendingCompetitorRequests = new Map<string, {
  userId: string;
  brandName: string;
  timestamp: number;
}>();

// Store pending prompt generation requests
const pendingPromptGenerationRequests = new Map<string, {
  userId: string;
  brandId: string;
  brandName: string;
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

        case 'RESEARCH_BRAND':
          // Handle brand research request
          if (!userId) {
            ws.send(JSON.stringify({
              type: 'ERROR',
              message: 'Not authenticated'
            }));
            return;
          }

          const { requestId, websiteUrl, brandName } = message;

          // Store the pending request
          pendingBrandRequests.set(requestId, {
            userId,
            websiteUrl,
            brandName,
            timestamp: Date.now()
          });

          // Acknowledge receipt
          ws.send(JSON.stringify({
            type: 'BRAND_RESEARCH_STARTED',
            requestId,
            status: 'researching'
          }));

          // Trigger n8n brand research workflow
          try {
            const response = await fetch(N8N_BRAND_WEBHOOK_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                website_url: websiteUrl,
                brand_name: brandName,
                user_id: userId,
                request_id: requestId
              })
            });

            if (!response.ok) {
              throw new Error(`n8n brand research webhook failed: ${response.status}`);
            }

            console.log(`Triggered n8n brand research workflow for ${websiteUrl}`);
          } catch (error) {
            console.error('Failed to trigger brand research:', error);
            ws.send(JSON.stringify({
              type: 'BRAND_RESEARCH_ERROR',
              requestId,
              error: 'Failed to start brand research'
            }));
            pendingBrandRequests.delete(requestId);
          }
          break;

        case 'RESEARCH_COMPETITORS':
          // Handle competitor research request
          if (!userId) {
            ws.send(JSON.stringify({
              type: 'ERROR',
              message: 'Not authenticated'
            }));
            return;
          }

          const {
            requestId: competitorRequestId,
            brandName: competitorBrandName,
            brandDescription,
            industry,
            topics
          } = message;

          // Store the pending request
          pendingCompetitorRequests.set(competitorRequestId, {
            userId,
            brandName: competitorBrandName,
            timestamp: Date.now()
          });

          // Acknowledge receipt
          ws.send(JSON.stringify({
            type: 'COMPETITOR_RESEARCH_STARTED',
            requestId: competitorRequestId,
            status: 'researching'
          }));

          // Trigger n8n competitor research workflow
          try {
            const response = await fetch(N8N_COMPETITOR_WEBHOOK_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                brand_name: competitorBrandName,
                brand_description: brandDescription,
                industry: industry,
                topics: topics,
                user_id: userId,
                request_id: competitorRequestId
              })
            });

            if (!response.ok) {
              throw new Error(`n8n competitor research webhook failed: ${response.status}`);
            }

            console.log(`Triggered n8n competitor research workflow for ${competitorBrandName}`);
          } catch (error) {
            console.error('Failed to trigger competitor research:', error);
            ws.send(JSON.stringify({
              type: 'COMPETITOR_RESEARCH_ERROR',
              requestId: competitorRequestId,
              error: 'Failed to start competitor research'
            }));
            pendingCompetitorRequests.delete(competitorRequestId);
          }
          break;

        case 'GENERATE_PROMPTS':
          // Handle prompt generation request
          if (!userId) {
            ws.send(JSON.stringify({
              type: 'ERROR',
              message: 'Not authenticated'
            }));
            return;
          }

          const {
            requestId: promptRequestId,
            brandId,
            brandName: promptBrandName,
            brandDescription: promptBrandDescription,
            topics: brandTopics,
            competitors: brandCompetitors,
            organizationId,
            numTopics,
            promptsPerTopic,
            useFastMode
          } = message;

          // Store the pending request
          pendingPromptGenerationRequests.set(promptRequestId, {
            userId,
            brandId,
            brandName: promptBrandName,
            timestamp: Date.now()
          });

          // Acknowledge receipt
          ws.send(JSON.stringify({
            type: 'PROMPT_GENERATION_STARTED',
            requestId: promptRequestId,
            status: 'generating'
          }));

          // Trigger n8n prompt generation workflow
          try {
            const response = await fetch(N8N_PROMPT_GENERATION_WEBHOOK_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                brand_id: brandId,
                brand_name: promptBrandName,
                brand_description: promptBrandDescription,
                topics: brandTopics || [],
                competitors: brandCompetitors || [],
                user_id: userId,
                organization_id: organizationId,
                num_topics: numTopics || 5,
                prompts_per_topic: promptsPerTopic || 5,
                use_fast_mode: useFastMode !== false,
                request_id: promptRequestId
              })
            });

            if (!response.ok) {
              throw new Error(`n8n prompt generation webhook failed: ${response.status}`);
            }

            console.log(`Triggered n8n prompt generation workflow for brand ${promptBrandName}`);
          } catch (error) {
            console.error('Failed to trigger prompt generation:', error);
            ws.send(JSON.stringify({
              type: 'PROMPT_GENERATION_ERROR',
              requestId: promptRequestId,
              error: 'Failed to start prompt generation'
            }));
            pendingPromptGenerationRequests.delete(promptRequestId);
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

// API endpoint for n8n brand research callback
app.post('/api/brand-research-callback', (req, res) => {
  const { request_id, user_id, status, brandData, error } = req.body;

  console.log(`Received brand research callback for request ${request_id}`);

  // Find the user's connections and send the update
  const connections = userConnections.get(user_id);

  if (connections && connections.size > 0) {
    const message = JSON.stringify({
      type: status === 'error' ? 'BRAND_RESEARCH_ERROR' : 'BRAND_RESEARCH_COMPLETE',
      requestId: request_id,
      status,
      data: brandData,
      error
    });

    connections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });

    console.log(`Sent brand research update to ${connections.size} connection(s) for user ${user_id}`);
  } else {
    console.log(`No active connections for user ${user_id}`);
  }

  // Clean up pending request
  pendingBrandRequests.delete(request_id);

  res.json({ success: true });
});

// API endpoint for n8n competitor research callback
app.post('/api/competitor-research-callback', (req, res) => {
  const { request_id, user_id, status, competitorData, error } = req.body;

  console.log(`Received competitor research callback for request ${request_id}`);

  // Find the user's connections and send the update
  const connections = userConnections.get(user_id);

  if (connections && connections.size > 0) {
    const message = JSON.stringify({
      type: status === 'error' ? 'COMPETITOR_RESEARCH_ERROR' : 'COMPETITOR_RESEARCH_COMPLETE',
      requestId: request_id,
      status,
      data: competitorData,
      error
    });

    connections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });

    console.log(`Sent competitor research update to ${connections.size} connection(s) for user ${user_id}`);
  } else {
    console.log(`No active connections for user ${user_id}`);
  }

  // Clean up pending request
  pendingCompetitorRequests.delete(request_id);

  res.json({ success: true });
});

// API endpoint for n8n prompt generation callback
app.post('/api/prompt-generation-callback', (req, res) => {
  const { request_id, user_id, brand_id, status, total_topics, total_prompts, error } = req.body;

  console.log(`Received prompt generation callback for request ${request_id}`);

  // Find the user's connections and send the update
  const connections = userConnections.get(user_id);

  if (connections && connections.size > 0) {
    const message = JSON.stringify({
      type: status === 'error' ? 'PROMPT_GENERATION_ERROR' : 'PROMPT_GENERATION_COMPLETE',
      requestId: request_id,
      brandId: brand_id,
      status,
      totalTopics: total_topics,
      totalPrompts: total_prompts,
      error
    });

    connections.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });

    console.log(`Sent prompt generation update to ${connections.size} connection(s) for user ${user_id}`);
  } else {
    console.log(`No active connections for user ${user_id}`);
  }

  // Clean up pending request
  pendingPromptGenerationRequests.delete(request_id);

  res.json({ success: true });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    connections: userConnections.size,
    pendingProductRequests: pendingRequests.size,
    pendingBrandRequests: pendingBrandRequests.size,
    pendingCompetitorRequests: pendingCompetitorRequests.size,
    pendingPromptGenerationRequests: pendingPromptGenerationRequests.size
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
