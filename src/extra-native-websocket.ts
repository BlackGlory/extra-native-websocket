import { assert } from '@blackglory/prelude'
import { WebSocketError } from './websocket-error'
import { Queue, Emitter } from '@blackglory/structures'

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

enum ReadyState {
  CONNECTING = 0
, OPEN = 1
, CLOSING = 2
, CLOSED = 3
}

export class ExtraNativeWebSocket extends Emitter<{
  message: [event: MessageEvent]
  close: [event: CloseEvent]
  error: [event: Event]
  open: [event: Event]
}> {
  private instance?: WebSocket
  private binaryType: BinaryType = BinaryType.Blob
  protected unsentMessages = new Queue<string | ArrayBufferLike | Blob | ArrayBufferView>()

  constructor(private createWebSocket: () => WebSocket) {
    super()
  }

  getState(): State {
    if (this.instance) {
      switch (this.instance.readyState) {
        case ReadyState.CONNECTING: return State.Connecting
        case ReadyState.OPEN: return State.Connected
        case ReadyState.CLOSING: return State.Closing
        case ReadyState.CLOSED: return State.Closed
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

  /**
   * @throws {WebSocketError}
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      assert(this.getState() === State.Closed, 'WebSocket is not closed')

      const self = this
      const ws = this.instance = this.createWebSocket()

      ws.addEventListener('error', errorListener, { once: true })

      ws.addEventListener('open', event => this.emit('open', event))
      ws.addEventListener('close', event => this.emit('close', event))
      ws.addEventListener('message', event => this.emit('message', event))
      ws.addEventListener('error', event => this.emit('error', event))

      this.setBinaryType(this.binaryType)

      ws.addEventListener('open', openListener, { once: true })

      function errorListener(event: Event): void {
        ws.addEventListener('close', closeListener, { once: true })
      }

      function closeListener(event: CloseEvent): void {
        reject(new WebSocketError(event.code, event.reason))
      }

      function openListener(event: Event): void {
        ws.removeEventListener('error', errorListener)
        ws.removeEventListener('close', closeListener)
        for (let size = self.unsentMessages.size; size--;) {
          self.send(self.unsentMessages.dequeue()!)
        }
        resolve()
      }
    })
  }

  close(code?: number, reason?: string): Promise<void> {
    return new Promise<void>(resolve => {
      assert(this.instance, 'WebSocket is not created')

      switch (this.getState()) {
        case State.Closed:
          resolve()
          break
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
    if (this.getState() === State.Connected) {
      this.instance!.send(data)
    } else {
      this.unsentMessages.enqueue(data)
    }
  }
}
