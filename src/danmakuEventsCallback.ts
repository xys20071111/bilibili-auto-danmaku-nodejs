/* eslint-disable @typescript-eslint/no-explicit-any */
import { Console } from 'console';
import * as fs from 'fs';
import config from './config';
import sendDanmake from './sendDanmaku';
import { getTimeString, FormatString } from './utils/';

let skipCount = 0;
let logFile = fs.createWriteStream(`${getTimeString()}-${config.room_id}.log`);
const thanksColdDownSet = new Set<string>();

let logger = new Console({
  stdout: logFile
});

export function receiveGift(data: any) {
  if(thanksColdDownSet.has(data.uname)){
    return;
  }
  logger.log(`${getTimeString()} ${data.uname} 投喂了${data.super_gift_num}个 ${data.giftName} 价值${data.price / 1000 * data.super_gift_num}元`);
  sendDanmake({
    msg: FormatString(config.danmakus.gift, { name: data.uname, gift: data.giftName }) 
  })
  thanksColdDownSet.add(data.uname);
  setTimeout(() => {thanksColdDownSet.delete(data.uname)}, config.cold_down_time);
}

export function onTotalGift(data: any) {
  logger.log(`${getTimeString()} ${data.uname}投喂了${data.total_num}个${data.gift_name}`);
  sendDanmake({
    msg: FormatString(config.danmakus.gift_total, { name: data.uname, gift: data.gift_name, count: data.total_num })
  })
}

export function receiveDanmaku(data: any) {
  logger.log(`${getTimeString()} ${data[2][1]}:${data[2][0]}  ${data[1]}`);
}

export function onLiveStart() {
  if(skipCount != 1){
    skipCount ++;
    return;
  }
  skipCount = 0;
  logFile.close();
  sendDanmake({ msg: config.danmakus.live_start });
  logFile = fs.createWriteStream(`${getTimeString()}-${config.room_id}.log`);
  logger = new Console({
    stdout: logFile
  });
  logger.log(`${getTimeString} 直播开始`);
}

export function onLiveEnd() {
  logger.log(`${getTimeString} 直播结束`);
  sendDanmake({ msg: config.danmakus.live_end });
}

export function onGraud(data: any) {
  logger.log(`${getTimeString()} ${data.username}:${data.uid} 购买了 ${data.gift_name}`);
  sendDanmake({
    msg: FormatString(config.danmakus.guard, { type: data.gift_name, name: data.username })
  })
}

export function onSuperChat(data: any) {
  logger.log(`${getTimeString()} ${data.user_info.uname}发送了SC 价格${data.price}`);
  sendDanmake({
    msg: FormatString(config.danmakus.sc, { name: data.user_info.uname })
  });
}
