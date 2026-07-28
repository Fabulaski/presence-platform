import { EventEmitter2 } from 'eventemitter2';
import { BaseDomainEvent, DomainEventPayloadMap, DomainEventType } from './domain-events.js';

export class PresenceEventBus {
  private static instance: PresenceEventBus;
  private emitter: EventEmitter2;

  private constructor() {
    this.emitter = new EventEmitter2({
      wildcard: true,
      delimiter: '.',
      maxListeners: 50
    });
  }

  public static getInstance(): PresenceEventBus {
    if (!PresenceEventBus.instance) {
      PresenceEventBus.instance = new PresenceEventBus();
    }
    return PresenceEventBus.instance;
  }

  public publish<T extends DomainEventType>(type: T, payload: DomainEventPayloadMap[T]): BaseDomainEvent<T> {
    const event: BaseDomainEvent<T> = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type,
      payload,
      timestamp: new Date().toISOString()
    };

    this.emitter.emit(type, event);
    return event;
  }

  public subscribe<T extends DomainEventType>(
    type: T,
    handler: (event: BaseDomainEvent<T>) => void | Promise<void>
  ): () => void {
    const listener = (event: BaseDomainEvent<T>) => {
      Promise.resolve(handler(event)).catch((err) => {
        console.error(`[PresenceEventBus] Error handling event ${type}:`, err);
      });
    };

    this.emitter.on(type, listener);
    return () => this.emitter.off(type, listener);
  }
}
