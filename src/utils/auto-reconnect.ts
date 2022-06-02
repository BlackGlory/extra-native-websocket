import { ExtraNativeWebSocket } from '@src/extra-native-websocket'
import { delay } from 'extra-promise'
import { AbortController } from 'extra-abort'
import { pass } from '@blackglory/prelude'

export function autoReconnect(ws: ExtraNativeWebSocket, timeout: number = 0): () => void {
  const controller = new AbortController()

  ws.addEventListener('close', listener)
  return () => {
    controller.abort()
    ws.removeEventListener('close', listener)
  }

  async function listener(): Promise<void> {
    ws.removeEventListener('close', listener)

    while (true) {
      if (controller.signal.aborted) return

      await delay(timeout)
      if (controller.signal.aborted) return

      try {
        await ws.connect()
        if (controller.signal.aborted) return

        ws.addEventListener('close', listener)
        break
      } catch {
        pass()
      }
    }
  }
}
