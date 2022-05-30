import { ExtraNativeWebSocket } from '@src/extra-native-websocket'
import { delay } from 'extra-promise'
import { isntUndefined } from '@blackglory/prelude'
import { AbortController } from 'extra-abort'

export function autoReconnect(ws: ExtraNativeWebSocket, timeout?: number): () => void {
  const controller = new AbortController()

  ws.addEventListener('close', listener)
  return () => {
    controller.abort()
    ws.removeEventListener('close', listener)
  }

  async function listener(): Promise<void> {
    if (controller.signal.aborted) return

    if (isntUndefined(timeout)) {
      await delay(timeout)
      if (controller.signal.aborted) return
    }

    await ws.connect()
  }
}
