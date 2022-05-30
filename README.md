# extra-native-websocket
## Install
```sh
npm install --save extra-native-websocket
# or
yarn add extra-native-websocket
```

## API
### WebSocketError
```ts
class WebSocketError extends CustomError {
  readonly code: number
  readonly reason: string
}
```

### ExtraNativeWebSocket
```ts
enum BinaryType {
  Blob
, ArrayBuffer
}

enum State {
  Closed
, Connecting
, Connected
, Closing
}

class ExtraNativeWebSocket {
  constructor(createWebSocket: () => WebSocket)

  getState(): State
  getBinaryType(): BinaryType
  setBinaryType(val: BinaryType): void

  /**
   * @throws {WebSocketError}
   */
  connect(): Promise<void>
  close(code?: number, reason?: string): Promise<void>
  send(data: unknown): void

  addEventListener(event: 'message', listener: (event: MessageEvent) => void): void
  addEventListener(event: 'close', listener: (event: CloseEvent) => void): void
  addEventListener(event: 'error', listener: (event: Event) => void): void
  addEventListener(event: 'open', listener: (event: Event) => void): void

  removeEventListener(event: 'message', listener: (event: MessageEvent) => void): void
  removeEventListener(event: 'close', listener: (event: CloseEvent) => void): void
  removeEventListener(event: 'error', listener: (event: Event) => void): void
  removeEventListener(event: 'open', listener: (event: Event) => void): void
}
```

### autoReconnect
```ts
function autoReconnect(ws: ExtraNativeWebSocket, timeout?: number): () => void
```
