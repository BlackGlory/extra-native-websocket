import { WebSocket as NodeWebSocket } from 'ws'

// 这是jest-environment-jsdom无法使用情况下的临时解决方案.
// 尽管jsdom的底层也使用ws模块, 但jsdom有对其进行重新封装, 这使得其更符合浏览器规范.
// 直接使用ws模块的情况下, 偏离浏览器规范的程度会更大.
globalThis.WebSocket = NodeWebSocket as unknown as typeof globalThis.WebSocket
