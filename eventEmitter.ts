type Listener = (...args: any[]) => void;

class EventEmitter {
  private listeners: Record<string, Listener[]> = {};

  on(event: string, handler: Listener): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }

    this.listeners[event].push(handler);
  }

  off(event: string, handler: Listener): void {
    if (!this.listeners[event]) return;

    this.listeners[event] = this.listeners[event].filter(h => h !== handler);
  }

  emit(event: string, ...args: any[]): void {
    if (!this.listeners[event]) return;

    this.listeners[event].forEach(handler => handler(...args));
  }

  removeAllListeners(event?: string): void {
    if (event) {
      delete this.listeners[event];
    } else {
      this.listeners = {};
    }
  }

  // todo
  // once()
}

export default EventEmitter;