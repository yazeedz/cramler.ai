import { useEffect, useRef, useState, useCallback } from 'react';

type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

type PromptGenerationUpdate = {
  type: 'PROMPT_GENERATION_STARTED' | 'PROMPT_GENERATION_COMPLETE' | 'PROMPT_GENERATION_ERROR';
  requestId: string;
  brandId?: string;
  status?: string;
  totalTopics?: number;
  totalPrompts?: number;
  error?: string;
};

type UsePromptGenerationOptions = {
  userId: string | null;
  onUpdate?: (update: PromptGenerationUpdate) => void;
};

type GeneratePromptsParams = {
  requestId: string;
  brandId: string;
  brandName: string;
  brandDescription: string;
  topics?: string[];
  competitors?: string[];
  organizationId: string;
  numTopics?: number;
  promptsPerTopic?: number;
  useFastMode?: boolean;
};

export function usePromptGeneration({ userId, onUpdate }: UsePromptGenerationOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onUpdateRef = useRef(onUpdate);
  const [status, setStatus] = useState<WebSocketStatus>('disconnected');
  const [lastUpdate, setLastUpdate] = useState<PromptGenerationUpdate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const WS_URL = process.env.NEXT_PUBLIC_WS_SERVER_URL || 'ws://localhost:3001';

  // Keep the onUpdate ref current without triggering reconnects
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  const connect = useCallback(() => {
    console.log('[WS] connect() called, userId:', userId, 'WS_URL:', WS_URL);
    if (!userId) {
      console.log('[WS] No userId, skipping connection');
      return;
    }
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('[WS] Already connected');
      return;
    }
    if (wsRef.current?.readyState === WebSocket.CONNECTING) {
      console.log('[WS] Already connecting');
      return;
    }

    console.log('[WS] Creating new WebSocket connection...');
    setStatus('connecting');

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Prompt Generation WebSocket connected');
        ws.send(JSON.stringify({
          type: 'AUTH',
          userId
        }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('Prompt Generation WebSocket message:', message);

          switch (message.type) {
            case 'AUTH_SUCCESS':
              setStatus('connected');
              break;

            case 'PROMPT_GENERATION_STARTED':
              setIsGenerating(true);
              setLastUpdate(message);
              onUpdateRef.current?.(message);
              break;

            case 'PROMPT_GENERATION_COMPLETE':
              setIsGenerating(false);
              setLastUpdate(message);
              onUpdateRef.current?.(message);
              break;

            case 'PROMPT_GENERATION_ERROR':
              setIsGenerating(false);
              setLastUpdate(message);
              onUpdateRef.current?.(message);
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
        console.log('Prompt Generation WebSocket disconnected');
        setStatus('disconnected');
        wsRef.current = null;

        if (userId) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            connect();
          }, 3000);
        }
      };

      ws.onerror = (event) => {
        console.error('[WS] WebSocket error event:', event);
        if (wsRef.current?.readyState !== WebSocket.OPEN) {
          setStatus('error');
        }
      };

    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setStatus('error');
    }
  }, [userId, WS_URL]);

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

  const generatePrompts = useCallback((params: GeneratePromptsParams) => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      return false;
    }

    wsRef.current.send(JSON.stringify({
      type: 'GENERATE_PROMPTS',
      ...params
    }));

    setIsGenerating(true);
    return true;
  }, []);

  useEffect(() => {
    if (userId) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return {
    status,
    lastUpdate,
    isGenerating,
    generatePrompts,
    connect,
    disconnect,
    isConnected: status === 'connected'
  };
}
