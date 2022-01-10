import { Server, WebSocket } from "ws"
import { EventEmitter } from 'events'
import config from './config'
import sendDanmake from "./sendDanmaku"

interface Message {
  cmd: string
  data: any
}

const AuthedScoketSet = new Set<WebSocket>()
const APIMsgHandler = new EventEmitter()

APIMsgHandler.on('AUTH', (socket: WebSocket, data: string) => {
  if(data === config.api.token && !AuthedScoketSet.has(socket)) {
    AuthedScoketSet.add(socket)
  }
})

APIMsgHandler.on('SEND', (socket, data: string) => {
  if(AuthedScoketSet.has(socket)) {
    sendDanmake({
      msg: data
    })
  }
})

const wsServer = new Server({
  port: config.api.port
});

wsServer.on('connection', (socket: WebSocket) => {
  socket.on('message', (rawData: string) => {
    try{
      const msg: Message = JSON.parse(rawData)
      APIMsgHandler.emit(msg.cmd, socket, msg.data)
    } catch(e) {
      console.log(e)
    }
  })

  socket.on('close', () => {
    AuthedScoketSet.delete(socket)
  })
})


export default AuthedScoketSet
export {AuthedScoketSet, APIMsgHandler, wsServer }