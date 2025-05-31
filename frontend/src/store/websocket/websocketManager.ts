import {
  WebSocketState,
  PlayerEvent,
  SessionState,
  EventQueue,
} from "@/types/domain";
import { SessionManager } from "@/store/websocket/sessionManager";

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private socketState: WebSocketState;
  private eventQueue: EventQueue;
  private sessionManager: SessionManager;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private readonly inactivityTimeout: number = 30000; // 30 seconds
  private readonly wsUrl: string;
  private messageHandler: ((event: MessageEvent) => void) | null = null;
  private queueProcessingInterval: NodeJS.Timeout | null = null;
  private readonly queueProcessingDelay: number = 100; // 100ms between queue processing attempts
  private readonly maxRetries: number = 3;
  private processingQueue: boolean = false;

  constructor(wsUrl: string) {
    this.wsUrl = wsUrl;
    this.socketState = {
      isConnected: false,
      isConnecting: false,
      lastActivity: Date.now(),
    };
    this.eventQueue = new EventQueue();
    this.sessionManager = new SessionManager();
  }

  setUsername(username: string): void {
    this.sessionManager.setUsername(username);
  }

  getSocketState(): WebSocketState {
    return { ...this.socketState };
  }

  getSessionState(): SessionState {
    return { ...this.sessionManager.getState() };
  }

  setMessageHandler(handler: (event: MessageEvent) => void): void {
    this.messageHandler = handler;
    if (this.ws) {
      this.ws.onmessage = handler;
    }
  }

  private updateState(newState: Partial<WebSocketState>): void {
    this.socketState = { ...this.socketState, ...newState };
  }

  private async connect(): Promise<void> {
    if (this.socketState.isConnected || this.socketState.isConnecting) return;

    this.updateState({ isConnecting: true });

    try {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        this.updateState({ isConnected: true, isConnecting: false });
        this.startQueueProcessing();
        this.processEventQueue();
      };

      this.ws.onclose = () => {
        this.updateState({ isConnected: false, isConnecting: false });
        this.stopQueueProcessing();
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.ws?.close();
      };

      if (this.messageHandler) {
        this.ws.onmessage = this.messageHandler;
      }
    } catch (error) {
      console.error("Failed to connect:", error);
      this.updateState({ isConnected: false, isConnecting: false });
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    this.reconnectTimeout = setTimeout(() => this.connect(), 5000);
  }

  private inactivityExceeded(): boolean {
    const now = Date.now();
    return now - this.socketState.lastActivity > this.inactivityTimeout;
  }

  private updateActivity(): void {
    this.socketState.lastActivity = Date.now();
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.stopQueueProcessing();
    this.updateState({ isConnected: false, isConnecting: false });
  }

  private async processEventQueue(): Promise<void> {
    if (this.processingQueue) return;
    this.processingQueue = true;

    try {
      if (this.eventQueue.isEmpty()) {
        if (this.inactivityExceeded() && this.socketState.isConnected) {
          this.disconnect();
        }
        return;
      }

      if (!this.socketState.isConnected) {
        this.connect();
        return;
      }

      const e = this.eventQueue.dequeue();
      if (!e) return;

      this.updateActivity();

      const messages = this.sessionManager.handleEvent(e.event);
      if (messages) {
        let retries = 0;
        for (const message of messages) {
          while (retries < this.maxRetries) {
            try {
              this.ws?.send(JSON.stringify(message));

              // if event type is close, empty the queue and do not process queue any further
              if (e.event.type === "close") {
                this.eventQueue.clear();
                this.stopQueueProcessing();
                return;
              }

              //delay between messages to avoid throttling
              await new Promise((resolve) => setTimeout(resolve, 50));
              break;
            } catch (error) {
              retries++;
              console.error(
                `Failed to send event (attempt ${retries}/${this.maxRetries}):`,
                error
              );
              if (retries === this.maxRetries) {
                this.eventQueue.enqueue(e.event);
              } else {
                await new Promise((resolve) =>
                  setTimeout(resolve, 1000 * retries)
                ); // Exponential backoff
              }
            }
          }
        }
      }
    } finally {
      this.processingQueue = false;
    }
  }

  private startQueueProcessing(): void {
    if (this.queueProcessingInterval) {
      clearInterval(this.queueProcessingInterval);
    }
    this.queueProcessingInterval = setInterval(() => {
      this.processEventQueue();
    }, this.queueProcessingDelay);
  }

  private stopQueueProcessing(): void {
    if (this.queueProcessingInterval) {
      clearInterval(this.queueProcessingInterval);
      this.queueProcessingInterval = null;
    }
  }

  async sendEvent(event: PlayerEvent): Promise<void> {
    this.eventQueue.enqueue(event);
    if (!this.queueProcessingInterval) {
      this.startQueueProcessing();
    }
    await this.processEventQueue();
  }

  async sendChatMessage(message: string): Promise<void> {
    if (
      !this.socketState.isConnected ||
      !this.sessionManager.getState().musicId
    ) {
      throw new Error("WebSocket is not connected or no active session");
    }

    const event = {
      t: "chat_message",
      p: {
        m: message,
      },
    };

    try {
      this.ws?.send(JSON.stringify(event));
      this.updateActivity();
    } catch (error) {
      console.error("Failed to send chat message:", error);
      throw new Error("Failed to send chat message");
    }
  }
}
