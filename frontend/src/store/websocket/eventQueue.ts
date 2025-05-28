import { PlayerEvent } from "./types";

export interface QueuedEvent {
  event: PlayerEvent;
  timestamp: number;
}

export class EventQueue {
  private queue: QueuedEvent[] = [];
  private readonly maxQueueSize: number;

  constructor(maxQueueSize: number = 100) {
    this.maxQueueSize = maxQueueSize;
  }

  enqueue(event: PlayerEvent): void {
    if (this.queue.length >= this.maxQueueSize) {
      this.queue.shift(); // Remove oldest event if queue is full
    }
    this.queue.push({
      event,
      timestamp: Date.now(),
    });
  }

  dequeue(): QueuedEvent | undefined {
    return this.queue.shift();
  }

  peek(): QueuedEvent | undefined {
    return this.queue[0];
  }

  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  clear(): void {
    this.queue = [];
  }

  get length(): number {
    return this.queue.length;
  }
}
