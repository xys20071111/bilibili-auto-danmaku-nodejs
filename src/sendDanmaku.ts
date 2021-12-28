import config from './config'
import { request } from 'https'
import * as form from 'form-data'

const cookie = `buvid3=${config.verify.buvid3}; SESSDATA=${config.verify.sessdata}; bili_jct=${config.verify.csrf};`


export interface DanmakuStruct {
  color?: number
  bubble?: number
  msg: string
  mode?: number
  fontsize?: number
  rnd?: number
  roomid?: number
  csrf?: string
  csrf_token?: string
}

export default function sendDanmake(danmaku: DanmakuStruct) {
  if (danmaku.msg.length > 19) {
    sendDanmake({
      msg: danmaku.msg.slice(0, 15)
    })
    setTimeout(() => {
      sendDanmake({
        msg: danmaku.msg.slice(15, danmaku.msg.length)
      })
    }, 2000)
    return
  }
  danmaku.rnd = new Date().getTime()
  danmaku.color = 5816798
  danmaku.bubble = 0
  danmaku.mode = 1
  danmaku.roomid = config.room_id as number
  danmaku.csrf = danmaku.csrf_token = config.verify.csrf
  danmaku.fontsize = 24
  const data = new form.default()
  for (let k in danmaku) {
    data.append(k, danmaku[k as keyof DanmakuStruct])
  }
  const req = request({
    host: 'api.live.bilibili.com',
    path: '/msg/send',
    headers: {
      cookie: cookie,
      'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36',
      host: 'api.live.bilibili.com',
      'content-type': `multipart/form-data; boundary=${data.getBoundary()}`,
      "Referer": "https://live.bilibili.com",
    },
    method: 'POST'
  })
  req.on('response', (response) => {
    response.setEncoding('utf8')
    let raw = ''
    response.on('data', (data) => { raw += data })
  })
  data.pipe(req)
  req.end()

}
