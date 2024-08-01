import { assert } from '@blackglory/prelude'
import { WebSocketError } from './websocket-error.js'
import { Queue, Emitter } from '@blackglory/structures'
import { SyncDestructor } from 'extra-defer'

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

type Data = string | ArrayBufferLike | Blob | ArrayBufferView

export class ExtraNativeWebSocket extends Emitter<{
  open: [event: Event]
  message: [event: MessageEvent]
  error: [event: Event]
  close: [event: CloseEvent]
}> {
  private instance?: WebSocket
  private binaryType: BinaryType = BinaryType.Blob
  protected unsentMessages = new Queue<Data>()

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
  connect(signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      signal?.throwIfAborted()
      assert(this.getState() === State.Closed, 'WebSocket is not closed')

      const self = this
      const ws = this.createWebSocket()
      this.instance = ws

      signal?.addEventListener('abort', abortListener, { once: true })

      const destructor = new SyncDestructor()
      ws.addEventListener('error', errorListener, { once: true })
      destructor.defer(() => ws.removeEventListener('error', errorListener))

      {
        const listener = (event: Event) => this.emit('open', event)
        ws.addEventListener('open', listener)
        destructor.defer(() => ws.removeEventListener('open', listener))
      }
      {
        const listener = (event: MessageEvent) => this.emit('message', event)
        ws.addEventListener('message', listener)
        destructor.defer(() => ws.removeEventListener('message', listener))
      }
      {
        const listener = (event: Event) => this.emit('error', event)
        ws.addEventListener('error', listener)
        destructor.defer(() => ws.removeEventListener('error', listener))
      }
      {
        const listener = (event: CloseEvent) => this.emit('close', event)
        ws.addEventListener('close', listener)
        destructor.defer(() => ws.removeEventListener('close', listener))
      }

      this.setBinaryType(this.binaryType)

      ws.addEventListener('open', openListener, { once: true })

      function abortListener(): void {
        assert(signal)

        destructor.execute()
        ws.close()

        reject(signal.reason)
      }

      function errorListener(event: Event): void {
        ws.addEventListener('close', closeListener, { once: true })

        function closeListener(event: CloseEvent): void {
          destructor.execute()

          reject(new WebSocketError(event.code, event.reason))
        }
      }

      function openListener(event: Event): void {
        ws.removeEventListener('error', errorListener)

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

  send(data: Data): void {
    if (this.getState() === State.Connected) {
      this.instance!.send(data)
    } else {
      this.unsentMessages.enqueue(data)
    }
  }
}
