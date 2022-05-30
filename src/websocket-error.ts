import { CustomError } from '@blackglory/errors'

export class WebSocketError extends CustomError {
  readonly code: number
  readonly reason: string

  constructor(code: number, reason: string) {
    if (reason) {
      super(`${code}: ${reason}`)
    } else {
      super(`${code}`)
    }

    this.code = code
    this.reason = reason
  }
}
