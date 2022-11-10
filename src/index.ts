import DanmakuReceiver from './danmakuReceiver'
import config from './config'
import { onGraud, onLiveEnd, onLiveStart, onSuperChat, onTotalGift, receiveDanmaku, receiveGift } from './danmakuEventsCallback'
import { printLog } from './utils'

const receiver = new DanmakuReceiver(config.room_id)
receiver.connect()

receiver.on('connected', () => {
	printLog('已连接到弹幕服务器')
})

receiver.on('close', () => {
	receiver.connect()
})

if (!config.disable_gift_action) {
	receiver.on('SEND_GIFT', receiveGift)
	receiver.on('COMBO_SEND', onTotalGift)
}
if (!config.disable_super_chat_action) {
	receiver.on('GUARD_BUY', onGraud)
}
if (!config.disable_super_chat_action) {
	receiver.on('SUPER_CHAT_MESSAGE', onSuperChat)
}

receiver.on('LIVE', onLiveStart)
receiver.on('PREPARING', onLiveEnd)
receiver.on('DANMU_MSG', receiveDanmaku)
