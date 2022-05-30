import { assert } from '@blackglory/prelude'
import { WebSocketError } from './websocket-error'

export enum BinaryType {
  Blob
, ArrayBuffer
}

export enum State {
  Closed
, Connecting
, Connected
, Closing
}

export class ExtraNativeWebSocket {
  private instance?: WebSocket
  private eventListeners: Map<string, Set<Function>> = new Map()
  private binaryType: BinaryType =
    BinaryType.Blob

  constructor(private createWebSocket: () => WebSocket) {}

  getState(): State {
    if (this.instance) {
      switch (this.instance.readyState) {
        case 0: return State.Connecting
        case 1: return State.Connected
        case 2: return State.Closing
        case 3: return State.Closed
        default: throw new Error('Unknown state')
      }
    } else {
      return State.Closed
    }
  }

  getBinaryType(): BinaryType {
    return this.binaryType
  }

  setBinaryType(val: BinaryType): void {
    this.binaryType = val

    if (this.instance) {
      switch (val) {
        case BinaryType.Blob:
          this.instance.binaryType = 'blob'
          break
        case BinaryType.ArrayBuffer:
          this.instance.binaryType = 'arraybuffer'
          break
        default: throw new Error('Unknown binary type')
      }
    }
  }

  addEventListener(event: 'message', listener: (event: MessageEvent) => void): void
  addEventListener(event: 'close', listener: (event: CloseEvent) => void): void
  addEventListener(event: 'error', listener: (event: Event) => void): void
  addEventListener(event: 'open', listener: (event: Event) => void): void
  addEventListener(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }

    const listeners = this.eventListeners.get(event)!
    listeners.add(listener)

    this.instance?.addEventListener(event as any, listener as any)
  }

  removeEventListener(event: 'message', listener: (event: MessageEvent) => void): void
  removeEventListener(event: 'close', listener: (event: CloseEvent) => void): void
  removeEventListener(event: 'error', listener: (event: Event) => void): void
  removeEventListener(event: 'open', listener: (event: Event) => void): void
  removeEventListener(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }

    const listeners = this.eventListeners.get(event)!
    listeners.delete(listener)
    if (listeners.size === 0) {
      this.eventListeners.delete(event)
    }

    this.instance?.removeEventListener(event as any, listener as any)
  }

  /**
   * @throws {WebSocketError}
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      assert(
        this.getState() === State.Closing ||
        this.getState() === State.Closed
      , 'WebSocket is not closed'
      )

      const ws = this.createWebSocket()
      ws.addEventListener('error', errorListener)
      ws.addEventListener('open', () => {
        ws.removeEventListener('close', closeListener)
        ws.removeEventListener('error', errorListener)
        resolve()
      })

      for (const [event, listeners] of this.eventListeners) {
        for (const listener of listeners) {
          ws.addEventListener(event as any, listener as any)
        }
      }

      this.instance = ws
      this.setBinaryType(this.binaryType)

      function errorListener(event: Event): void {
        ws.addEventListener('close', closeListener, { once: true })
      }

      function closeListener(event: CloseEvent): void {
        reject(new WebSocketError(event.code, event.reason))
      }
    })
  }

  close(code?: number, reason?: string): Promise<void> {
    return new Promise<void>(resolve => {
      assert(this.instance, 'WebSocket is not created')

      switch (this.getState()) {
        case State.Closed: return resolve()
        case State.Closing:
          this.instance.addEventListener('close', () => resolve(), { once: true })
          break
        default:
          this.instance.addEventListener('close', () => resolve(), { once: true })
          this.instance.close(code, reason)
      }
    })
  }

  send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
    assert(this.instance, 'WebSocket is not created')

    this.instance.send(data)
  }
}
