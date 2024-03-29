import { readFileSync } from 'fs'

interface DanmakuTemplate {
  live_start: string
  live_end: string
  gift: string
  gift_total: string
  guard: string
  sc: string
  advertisement: string
}

interface Credential {
  sessdata: string
  csrf: string
  buvid3: string
  uid: number
}

interface api_config {
  token: string
  port: number
}

interface ConfigStruct {
  room_id: number | string
  verify: Credential
  danmakus: DanmakuTemplate
  cold_down_time: number
  advertiseing_cold_down: number
  api: api_config
  free_gift_action: boolean,
  disable_gift_action: boolean
  disable_super_chat_action: boolean
  disable_graud_action: boolean
}

const config: ConfigStruct = JSON.parse(readFileSync(process.argv[2]).toString('utf8'))

export default config
