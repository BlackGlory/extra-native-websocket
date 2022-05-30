import { ExtraNativeWebSocket, State } from '@src/extra-native-websocket'
import { WebSocketError } from '@src/websocket-error'
import { Server, Data } from 'ws'
import { delay } from 'extra-promise'
import { getErrorPromise } from 'return-style'

describe('ExtraNativeWebsocket', () => {
  test('initial state is CLOSED', () => {
    const ws = new ExtraNativeWebSocket(() => new WebSocket('ws://localhost:8080'))

    const result = ws.getState()

    expect(result).toBe(State.Closed)
  })

  test('connect', async () => {
    const server = new Server({ port: 8080 })

    const ws = new ExtraNativeWebSocket(() => new WebSocket('ws://localhost:8080'))
    try {
      const promise = ws.connect()
      const state1 = ws.getState()
      await promise
      const state2 = ws.getState()

      expect(state1).toBe(State.Connecting)
      expect(state2).toBe(State.Connected)
    } finally {
      await ws.close()
      server.close()
    }
  })

  test('send', async () => {
    const server = new Server({ port: 8080 })
    const messageListener = jest.fn()
    server.on('connection', socket => {
      socket.addEventListener('message', event => messageListener(event.data))
    })

    const ws = new ExtraNativeWebSocket(() => new WebSocket('ws://localhost:8080'))
    try {
      await ws.connect()

      ws.send('foo')
      await delay(1000)

      expect(messageListener).toBeCalledTimes(1)
      expect(messageListener).toBeCalledWith('foo')
    } finally {
      await ws.close()
      server.close()
    }
  })

  test('listen', async () => {
    const server = new Server({ port: 8080 })
    server.on('connection', socket => {
      socket.send('foo')
    })

    const ws = new ExtraNativeWebSocket(() => new WebSocket('ws://localhost:8080'))
    try {
      const promise = waitForMessage(ws)
      await ws.connect()
      const message = await promise

      expect(message).toBe('foo')
    } finally {
      await ws.close()
      server.close()
    }
  })

  test('reconnect', async () => {
    const server = new Server({ port: 8080 })
    server.on('connection', socket => {
      socket.send('hello')
    })

    const ws = new ExtraNativeWebSocket(() => new WebSocket('ws://localhost:8080'))
    try {
      const messageListener = jest.fn()
      ws.addEventListener('message', messageListener)
      await ws.connect()

      await ws.close()
      await ws.connect()
      await delay(1000)

      expect(messageListener).toBeCalledTimes(2)
    } finally {
      await ws.close()
      server.close()
    }
  })

  test('bad connection', async () => {
    const ws = new ExtraNativeWebSocket(() => new WebSocket('ws://localhost:8080'))

    const err = await getErrorPromise(ws.connect())

    expect(err).toBeInstanceOf(WebSocketError)
    expect((err as WebSocketError).code).toBe(1006)
  })
})

function waitForMessage(ws: ExtraNativeWebSocket): Promise<Data> {
  return new Promise(resolve => {
    ws.addEventListener('message', function listener(event) {
      resolve(event.data)
      ws.removeEventListener('message', listener)
    })
  })
} 
