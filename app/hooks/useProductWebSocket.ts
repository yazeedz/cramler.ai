import { useEffect, useRef, useState, useCallback } from 'react';

type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

type ProductUpdate = {
  type: 'PRODUCT_RECEIVED' | 'PRODUCT_READY' | 'PRODUCT_ERROR';
  productId: string;
  status?: string;
  data?: any;
  error?: string;
};

type UseProductWebSocketOptions = {
  userId: string | null;
  onProductUpdate?: (update: ProductUpdate) => void;
};

export function useProductWebSocket({ userId, onProductUpdate }: UseProductWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const [lastUpdate, setLastUpdate] = useState<ProductUpdate | null>(null);

  const WS_URL = process.env.NEXT_PUBLIC_WS_SERVER_URL || 'ws://localhost:3001';

  const connect = useCallback(() => {
    if (!userId) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setStatus('connecting');

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        // Authenticate with user ID
        ws.send(JSON.stringify({
          type: 'AUTH',
          userId
        }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('WebSocket message:', message);

          switch (message.type) {
            case 'AUTH_SUCCESS':
              setStatus('connected');
              break;

            case 'PRODUCT_RECEIVED':
            case 'PRODUCT_READY':
            case 'PRODUCT_ERROR':
              setLastUpdate(message);
              onProductUpdate?.(message);
              break;

            case 'ERROR':
              console.error('WebSocket error:', message.message);
              break;
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setStatus('disconnected');
        wsRef.current = null;

        // Attempt to reconnect after 3 seconds
        if (userId) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            connect();
          }, 3000);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setStatus('error');
      };

    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setStatus('error');
    }
  }, [userId, WS_URL, onProductUpdate]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setStatus('disconnected');
  }, []);

  const submitProduct = useCallback((productId: string, productName: string) => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      return false;
    }

    wsRef.current.send(JSON.stringify({
      type: 'SUBMIT_PRODUCT',
      productId,
      productName
    }));

    return true;
  }, []);

  // Connect when userId changes
  useEffect(() => {
    if (userId) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [userId, connect, disconnect]);

  return {
    status,
    lastUpdate,
    submitProduct,
    connect,
    disconnect,
    isConnected: status === 'connected'
  };
}
