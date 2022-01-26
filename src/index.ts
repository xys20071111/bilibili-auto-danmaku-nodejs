import DanmakuReceiver from "./danmakuWs"
import config from "./config";
import { onGraud, onLiveStart, onSuperChat, onTotalGift, receiveDanmaku, receiveGift } from "./danmakuEventsCallback";


const receiver = new DanmakuReceiver(config.room_id);
receiver.connect();

receiver.on('connected', () => {
  console.log("已连接到弹幕服务器")
})

receiver.on('close', () => {
  receiver.connect()
})

receiver.on('SEND_GIFT', receiveGift)
receiver.on('LIVE', onLiveStart)
receiver.on('DANMU_MSG', receiveDanmaku)
receiver.on('COMBO_SEND', onTotalGift)
receiver.on('GUARD_BUY', onGraud)
receiver.on('SUPER_CHAT_MESSAGE', onSuperChat)
