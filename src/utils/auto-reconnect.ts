import { ExtraNativeWebSocket, State } from '@src/extra-native-websocket'
import { delay } from 'extra-promise'
import { AbortController } from 'extra-abort'
import { pass } from '@blackglory/prelude'
import { waitForFunction } from '@blackglory/wait-for'

export function autoReconnect(ws: ExtraNativeWebSocket, timeout: number = 0): () => void {
  const controller = new AbortController()

  let removeCloseListener = ws.on('close', closeListener)

  return () => {
    controller.abort()
    removeCloseListener()
  }

  async function closeListener(): Promise<void> {
    removeCloseListener()

    while (true) {
      if (controller.signal.aborted) return

      await delay(timeout)
      if (controller.signal.aborted) return

      try {
        await waitForFunction(() => ws.getState() === State.Closed)
        await ws.connect()
        if (controller.signal.aborted) return

        removeCloseListener = ws.on('close', closeListener)
        break
      } catch {
        pass()
      }
    }
  }
}
