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
import { Emitter } from '@blackglory/structures'

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

class ExtraNativeWebSocket extends Emitter<{
  open: [event: Event]
  message: [event: MessageEvent]
  error: [event: Event]
  close: [event: CloseEvent]
}> {
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
}
```

### autoReconnect
```ts
function autoReconnect(ws: ExtraNativeWebSocket, timeout?: number): () => void
```

### autoReconnectWithExponentialBackOff
```ts
function autoReonnectWithExponentialBackOff(
  ws: ExtraWebSocket
, options: {
    baseTimeout: number
    maxTimeout?: number
    factor?: number = 2
    jitter?: boolean = true
  }
): () => void
```
