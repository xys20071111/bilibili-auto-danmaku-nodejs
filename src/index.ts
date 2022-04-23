import DanmakuReceiver from "./danmakuReceiver"
import config from "./config";
import { onGraud, onLiveStart, onSuperChat, onTotalGift, receiveDanmaku, receiveGift } from "./danmakuEventsCallback";
import { printLog } from "./utils";

const receiver = new DanmakuReceiver(config.room_id);
receiver.connect();

receiver.on('connected', () => {
  printLog("已连接到弹幕服务器");
})

receiver.on('close', () => {
  receiver.connect();
})

receiver.on('SEND_GIFT', receiveGift);
receiver.on('LIVE', onLiveStart);
receiver.on('DANMU_MSG', receiveDanmaku);
receiver.on('COMBO_SEND', onTotalGift);
receiver.on('GUARD_BUY', onGraud);
receiver.on('SUPER_CHAT_MESSAGE', onSuperChat);
