import { Console } from 'console'
import * as fs from 'fs'
import config from './config';
import sendDanmake from './sendDanmaku';
import { getTimeString } from './utils/time';

let logFile = fs.createWriteStream(`${getTimeString()}-${config.room_id}.log`)

let logger = new Console({
  stdout: logFile
});

const coldDown = config.cold_down_time
let lastColdDonw = 0

export function receiveGift(data: any) {
  logger.log(`${getTimeString()} ${data.uname} 投喂了${data.super_gift_num}个 ${data.giftName} 价值${data.price / 1000 * data.super_gift_num}元`)
  if (lastColdDonw === 0 || Date.now() / 1000 - lastColdDonw > coldDown) {
    sendDanmake({
      msg: config.danmakus.gift.replace('{name}', data.uname).replace('{gift}', data.giftName)
    })
  }
}

export function onTotalGift(data: any) {
  logger.log(`${getTimeString()} ${data.uname}投喂了${data.total_num}个${data.gift_name}`)
  sendDanmake({
    msg: config.danmakus.gift_total.replace('{name}', data.uname).replace('{gift}', data.gift_name).replace('{count}', data.total_num)
  })
}

export function receiveDanmaku(data: any) {
  logger.log(`${getTimeString()} ${data[2][1]}:${data[2][0]}  ${data[1]}`)
}

export function onLiveStart() {
  logFile.close()
  sendDanmake({ msg: config.danmakus.live_start })
  logFile = fs.createWriteStream(`${getTimeString()}-${config.room_id}.log`)
  logger = new Console({
    stdout: logFile
  });
  logger.log(`${getTimeString} 直播开始`)
}

export function onLiveEnd() {
  logger.log(`${getTimeString} 直播结束`)
  sendDanmake({ msg: config.danmakus.live_end })
}

export function onGraud(data: any) {
  logger.log(`${getTimeString()} ${data.username}:${data.uid} 购买了 ${data.gift_name}`)
  sendDanmake({
    msg: config.danmakus.guard
              .replace('{name}', data.username)
              .replace('{type}', data.gift_name) //`感谢 ${data.username} 开通了 ${data.gift_name}`
  })
}

export function onSuperChat(data: any) {
  logger.log(`${getTimeString()} ${data.user_info.uname}发送了SC 价格${data.price}`)
  sendDanmake({
    msg: config.danmakus.sc.replace('{name}', data.user_info.uname)
  })
}
