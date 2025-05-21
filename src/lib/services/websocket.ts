/**
 * WebSocket service for handling real-time connections with automatic reconnection
 */

type WebSocketCallback = (data: any) => void;

export class WebSocketService {
  private socket: WebSocket | null = null;
  private url: string;
  private reconnectInterval: number;
  private maxReconnectAttempts: number;
  private reconnectAttempts: number = 0;
  private callbacks: Map<string, WebSocketCallback[]> = new Map();
  private isConnecting: boolean = false;
  private reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(url: string, reconnectInterval = 5000, maxReconnectAttempts = 10) {
    this.url = url;
    this.reconnectInterval = reconnectInterval;
    this.maxReconnectAttempts = maxReconnectAttempts;
  }

  /**
   * Connect to the WebSocket server
   */
  public connect(): Promise<void> {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    if (this.isConnecting) {
      return Promise.resolve();
    }

    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      try {
        // Only create WebSocket in browser environment
        if (typeof window !== 'undefined') {
          this.socket = new WebSocket(this.url);

          this.socket.onopen = () => {
            console.log('WebSocket connected');
            this.reconnectAttempts = 0;
            this.isConnecting = false;
            resolve();
          };

          this.socket.onclose = (event) => {
            console.log(`WebSocket disconnected: ${event.code} ${event.reason}`);
            this.socket = null;
            this.isConnecting = false;

            if (this.reconnectAttempts < this.maxReconnectAttempts) {
              this.scheduleReconnect();
            } else {
              console.error('Max reconnect attempts reached');
            }
          };

          this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.isConnecting = false;
            reject(error);
          };

          this.socket.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              const eventType = data.type || 'message';
              
              // Call all registered callbacks for this event type
              const eventCallbacks = this.callbacks.get(eventType) || [];
              eventCallbacks.forEach(callback => {
                try {
                  callback(data);
                } catch (err) {
                  console.error(`Error in WebSocket callback for ${eventType}:`, err);
                }
              });
            } catch (err) {
              console.error('Error parsing WebSocket message:', err);
            }
          };
        } else {
          // Resolve immediately in non-browser environment
          this.isConnecting = false;
          resolve();
        }
      } catch (error) {
        this.isConnecting = false;
        console.error('Error connecting to WebSocket:', error);
        reject(error);
      }
    });
  }

  /**
   * Schedule a reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
    }

    this.reconnectTimeoutId = setTimeout(() => {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connect().catch(() => {
        // If reconnection fails, it will trigger onclose which will schedule another reconnect
      });
    }, this.reconnectInterval);
  }

  /**
   * Disconnect from the WebSocket server
   */
  public disconnect(): void {
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  /**
   * Send data to the WebSocket server
   */
  public send(data: any): boolean {
    if (this.socket?.readyState === WebSocket.OPEN) {
      try {
        const message = typeof data === 'string' ? data : JSON.stringify(data);
        this.socket.send(message);
        return true;
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        return false;
      }
    } else {
      console.warn('Cannot send message, WebSocket is not connected');
      return false;
    }
  }

  /**
   * Register a callback for a specific event type
   */
  public on(eventType: string, callback: WebSocketCallback): void {
    const callbacks = this.callbacks.get(eventType) || [];
    callbacks.push(callback);
    this.callbacks.set(eventType, callbacks);
  }

  /**
   * Remove a callback for a specific event type
   */
  public off(eventType: string, callback: WebSocketCallback): void {
    const callbacks = this.callbacks.get(eventType) || [];
    const index = callbacks.indexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
      this.callbacks.set(eventType, callbacks);
    }
  }

  /**
   * Get the current connection state
   */
  public getState(): string {
    if (!this.socket) {
      return 'CLOSED';
    }

    switch (this.socket.readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING';
      case WebSocket.OPEN:
        return 'OPEN';
      case WebSocket.CLOSING:
        return 'CLOSING';
      case WebSocket.CLOSED:
        return 'CLOSED';
      default:
        return 'UNKNOWN';
    }
  }

  /**
   * Check if the WebSocket is connected
   */
  public isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

// Create a singleton instance for the stock WebSocket
let stockWebSocketInstance: WebSocketService | null = null;

export function getStockWebSocket(): WebSocketService {
  if (!stockWebSocketInstance && typeof window !== 'undefined') {
    // Use secure WebSocket if the page is served over HTTPS
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const url = `${protocol}//${host}/api/stock/ws`;
    
    stockWebSocketInstance = new WebSocketService(url);
    // Connect immediately
    stockWebSocketInstance.connect().catch(err => {
      console.error('Failed to connect to stock WebSocket:', err);
    });
  }
  
  return stockWebSocketInstance as WebSocketService;
}
