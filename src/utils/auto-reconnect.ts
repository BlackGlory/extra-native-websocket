import { ExtraNativeWebSocket, State } from '@src/extra-native-websocket.js'
import { delay } from 'extra-promise'
import { AbortController, timeoutSignal } from 'extra-abort'
import { pass } from '@blackglory/prelude'
import { waitForFunction } from '@blackglory/wait-for'

export function autoReconnect(
  ws: ExtraNativeWebSocket
, reconnectInterval: number = 0
, connectTimeout?: number
): () => void {
  const controller = new AbortController()

  // Make sure the error listener is added, prevent crashes due to uncaught errors.
  const removeErrorListener = ws.on('error', pass)
  let removeCloseListener = ws.once('close', closeListener)

  return () => {
    controller.abort()
    removeCloseListener()
    removeErrorListener()
  }

  async function closeListener(): Promise<void> {
    while (true) {
      if (controller.signal.aborted) return

      await delay(reconnectInterval)
      if (controller.signal.aborted) return

      try {
        await waitForFunction(() => ws.getState() === State.Closed)
        await ws.connect(
          connectTimeout
        ? timeoutSignal(connectTimeout)
        : undefined
        )
        if (controller.signal.aborted) return

        removeCloseListener = ws.once('close', closeListener)
        break
      } catch {
        pass()
      }
    }
  }
}
