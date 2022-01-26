import { Server, WebSocket } from "ws"
import { EventEmitter } from 'events'
import config from './config'
import sendDanmake from "./sendDanmaku"
import { startPlugins } from "./startPlugins";

interface Message {
  cmd: string
  data: any
}

const AuthedScoketSet = new Set<WebSocket>();
const APIMsgHandler = new EventEmitter();

APIMsgHandler.on('AUTH', (socket: WebSocket, data: string) => {
  if(data === config.api.token && !AuthedScoketSet.has(socket)) {
    AuthedScoketSet.add(socket)
    socket.send(JSON.stringify({cmd: 'AUTH', data: 'AUTHED'}));
  }else{
    socket.send(JSON.stringify({cmd: 'AUTH', data: 'FAILED'}));
  }
})

APIMsgHandler.on('SEND', (socket, data: string) => {
  if(AuthedScoketSet.has(socket)) {
    sendDanmake({
      msg: data
    });
  }
});

APIMsgHandler.on('ROOMID', (socket: WebSocket) => {
  if(AuthedScoketSet.has(socket)) {
    socket.send(JSON.stringify({
      msg: 'ROOMID',
      data: config.room_id
    }));
  }
});

const wsServer = new Server({
  port: config.api.port
});

wsServer.on('connection', (socket: WebSocket) => {
  socket.on('message', (rawData: string) => {
    try{
      const msg: Message = JSON.parse(rawData);
      APIMsgHandler.emit(msg.cmd, socket, msg.data);
    } catch(e) {
      console.log(e);
    }
  });

  socket.on('close', () => {
    AuthedScoketSet.delete(socket);
  });
});

startPlugins();

export default AuthedScoketSet
export { AuthedScoketSet, APIMsgHandler, wsServer }