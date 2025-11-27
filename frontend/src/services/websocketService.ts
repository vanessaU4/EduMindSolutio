import { ChatMessage } from './communityService';

export interface WebSocketMessage {
  type: 'message' | 'user_joined' | 'user_left' | 'typing' | 'stop_typing' | 'call_started' | 'call_ended';
  data?: any;
  room_id?: number;
  user_id?: number;
  timestamp?: string;
}

export interface WebSocketCallbacks {
  onMessage?: (message: ChatMessage) => void;
  onUserJoined?: (user: any) => void;
  onUserLeft?: (user: any) => void;
  onTyping?: (user: any) => void;
  onStopTyping?: (user: any) => void;
  onCallStarted?: (callData: any) => void;
  onCallEnded?: (callData: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private roomId: number | null = null;
  private callbacks: WebSocketCallbacks = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3; // Reduced from 5
  private reconnectInterval = 2000; // Increased from 1000ms
  private isConnecting = false;

  connect(roomId: number, callbacks: WebSocketCallbacks) {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.roomId = roomId;
    this.callbacks = callbacks;
    this.isConnecting = true;

    try {
      // Get the WebSocket URL from environment or use default
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = import.meta.env?.VITE_WS_HOST || window.location.host.replace(':3000', ':8000');
      const wsUrl = `${wsProtocol}//${wsHost}/ws/chat/${roomId}/`;

      console.log('🔌 Connecting to WebSocket:', wsUrl);
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected to room:', roomId);
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.callbacks.onConnect?.();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('❌ Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        this.isConnecting = false;
        this.callbacks.onDisconnect?.();
        
        // Attempt to reconnect if not a clean close
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.isConnecting = false;
        
        // Don't show error toast for connection failures during development
        if (window.location.hostname === 'localhost') {
          console.warn('⚠️ WebSocket connection failed - this is expected if backend WebSocket server is not running');
        } else {
          this.callbacks.onError?.(error);
        }
      };

    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
      this.isConnecting = false;
      this.callbacks.onError?.(error);
    }
  }

  private handleMessage(message: WebSocketMessage) {
    console.log('📨 Received WebSocket message:', message);

    switch (message.type) {
      case 'message':
        this.callbacks.onMessage?.(message.data);
        break;
      case 'user_joined':
        this.callbacks.onUserJoined?.(message.data);
        break;
      case 'user_left':
        this.callbacks.onUserLeft?.(message.data);
        break;
      case 'typing':
        this.callbacks.onTyping?.(message.data);
        break;
      case 'stop_typing':
        this.callbacks.onStopTyping?.(message.data);
        break;
      case 'call_started':
        this.callbacks.onCallStarted?.(message.data);
        break;
      case 'call_ended':
        this.callbacks.onCallEnded?.(message.data);
        break;
      default:
        console.log('🤷 Unknown message type:', message.type);
    }
  }

  private scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`🔄 Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      if (this.roomId && this.reconnectAttempts <= this.maxReconnectAttempts) {
        this.connect(this.roomId, this.callbacks);
      } else if (this.reconnectAttempts > this.maxReconnectAttempts) {
        console.log('❌ Max reconnection attempts reached. Giving up WebSocket connection.');
        this.callbacks.onDisconnect?.();
      }
    }, delay);
  }

  sendMessage(message: Partial<WebSocketMessage>) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const fullMessage: WebSocketMessage = {
        type: 'message',
        room_id: this.roomId || undefined,
        timestamp: new Date().toISOString(),
        ...message
      };
      
      console.log('📤 Sending WebSocket message:', fullMessage);
      this.ws.send(JSON.stringify(fullMessage));
    } else {
      console.warn('⚠️ WebSocket not connected, cannot send message');
    }
  }

  sendTyping() {
    this.sendMessage({ type: 'typing' });
  }

  sendStopTyping() {
    this.sendMessage({ type: 'stop_typing' });
  }

  sendCallStart(callData: any) {
    this.sendMessage({ type: 'call_started', data: callData });
  }

  sendCallEnd() {
    this.sendMessage({ type: 'call_ended' });
  }

  disconnect() {
    if (this.ws) {
      console.log('🔌 Manually disconnecting WebSocket');
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
    this.roomId = null;
    this.callbacks = {};
    this.reconnectAttempts = 0;
    this.isConnecting = false;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getConnectionState(): string {
    if (!this.ws) return 'DISCONNECTED';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'CONNECTING';
      case WebSocket.OPEN: return 'CONNECTED';
      case WebSocket.CLOSING: return 'CLOSING';
      case WebSocket.CLOSED: return 'DISCONNECTED';
      default: return 'UNKNOWN';
    }
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
export default websocketService;
