import { Server, WebSocket } from 'ws'
import { EventEmitter } from 'events'
import config from './config'
import sendDanmake from './sendDanmaku'
import { startPlugins } from './startPlugins'

interface Message {
  cmd: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

const authedScoketSet = new Set<WebSocket>()

class APIMsgHandler extends EventEmitter {
	emit(eventName: string | symbol,socket: WebSocket,...args: unknown[]): boolean {
		if (eventName === 'AUTH') {
			if (args[0] === config.api.token) {
				authedScoketSet.add(socket)
				socket.send(JSON.stringify({ cmd: 'AUTH', data: 'AUTHED' }))
				return true
			} else {
				socket.send(JSON.stringify({ cmd: 'AUTH', data: 'FAILED' }))
				return true
			}
		}
		if (authedScoketSet.has(socket)) {
			super.emit.apply(this, [eventName, socket, args])
			return true
		}
		return false
	}
}
const apiMsgHandler = new APIMsgHandler()

apiMsgHandler.on('SEND', (socket, data: string) => {
	sendDanmake({
		msg: data,
	})
})

apiMsgHandler.on('ROOMID', (socket: WebSocket) => {
	socket.send(JSON.stringify({
		cmd: 'ROOMID',
		data: config.room_id,
	}))
})

const wsServer = new Server({
	port: config.api.port,
})

wsServer.on('connection', (socket: WebSocket) => {
	socket.on('message', (rawData: string) => {
		try {
			const msg: Message = JSON.parse(rawData)
			if (!authedScoketSet.has(socket) && msg.cmd !== 'AUTH') {
				return
			}
			apiMsgHandler.emit(msg.cmd, socket, msg.data)
		} catch (e) {
			console.log(e)
		}
	})

	socket.on('close', () => {
		authedScoketSet.delete(socket)
	})
})

startPlugins()

export default authedScoketSet
export { APIMsgHandler, authedScoketSet, wsServer }
