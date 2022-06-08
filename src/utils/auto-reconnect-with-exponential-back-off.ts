import { ExtraNativeWebSocket, State } from '@src/extra-native-websocket'
import { calculateExponentialBackoffTimeout } from 'extra-timers'
import { pass } from '@blackglory/prelude'
import { delay } from 'extra-promise'
import { waitForFunction } from '@blackglory/wait-for'

export function autoReconnectWithExponentialBackOff(
  ws: ExtraNativeWebSocket
, {
    baseTimeout
  , maxTimeout = Infinity
  , factor = 2
  , jitter = true
  }: {
    baseTimeout: number
    maxTimeout?: number
    factor?: number
    jitter?: boolean
  }
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
    let retries = 0
    while (true) {
      if (controller.signal.aborted) return

      await delay(calculateExponentialBackoffTimeout({
        retries
      , baseTimeout
      , maxTimeout
      , factor
      , jitter
      }))
      if (controller.signal.aborted) return

      try {
        await waitForFunction(() => ws.getState() === State.Closed)
        await ws.connect()
        if (controller.signal.aborted) return

        removeCloseListener = ws.once('close', closeListener)
        break
      } catch {
        retries++
        pass()
      }
    }
  }
}
