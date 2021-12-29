/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-case-declarations */
/* eslint-disable no-shadow */
/* eslint-disable class-methods-use-this */
import { WebSocket } from 'ws';
import * as https from 'https';
import { EventEmitter } from 'events';
import * as zlib from 'zlib';
import { config } from './config';
import { AuthedScoketSet } from './APIServer'

enum DANMAKU_PROTOCOL {
  JSON = 0,
  HEARTBEAT,
  ZIP,
  BROTLI
}

enum DANMAKU_TYPE {
  HEARTBEAT = 2,
  HEARTBEAT_REPLY = 3,
  DATA = 5,
  AUTH = 7,
  AUTH_REPLY = 8
}

const cookie = `buvid3=${config.verify.buvid3}; SESSDATA=${config.verify.sessdata}; bili_jct=${config.verify.csrf};`

class DanmakuReceiver extends EventEmitter {
  private socket: WebSocket | null = null;

  constructor(roomId: number | string) {
    super();
    this.run(roomId);
  }

  private async run(roomId: number | string) {
    const request = https.request(`https://api.live.bilibili.com/room/v1/Danmu/getConf?room_id=${roomId}&platform=pc&player=web`, {
      method: 'GET',
      headers: {
        cookie: cookie, 
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36',
        host: 'api.live.bilibili.com',
      },
    });
    request.on('response', (response) => {
      if (response.statusCode !== 200) {
        response.resume();
        throw new Error(`Error, code:${response.statusCode}`);
      }
      response.setEncoding('utf8');
      let rawData = '';
      response.on('data', (chunk) => { rawData += chunk; });
      response.on('end', () => {
        const parsedData = JSON.parse(rawData);
        this.socket = new WebSocket(`wss://${parsedData.data.host_server_list[0].host}:${parsedData.data.host_server_list[0].wss_port}/sub`);
        this.socket.on('message', this.danmakeProcesser.bind(this));
        this.socket.on('close', () => { console.log('closed'); });
        this.socket.on('open', async () => {
          const data = JSON.stringify({
            roomid: parseInt(roomId.toString(), 10), protover: 3, platform: 'web', uid: config.verify.uid, key: parsedData.data.token,
          });
          const authPacket = this.generatePacket(1, 7, data);
          if (this.socket) {
            this.socket.send(authPacket);
            console.log('auth');
          }
        });
      });
    });
    request.end();
  }

  private generatePacket(protocol: number, type: number, payload: string | Buffer): Buffer {
    let packet = Buffer.alloc(16 + Buffer.byteLength(payload));
    packet.writeInt32BE(16 + Buffer.byteLength(payload), 0); // 总长度
    packet.writeInt16BE(16, 4); // 头长度
    packet.writeUInt16BE(protocol, 6); // 协议类型
    packet.writeUInt32BE(type, 8); // 包类型
    packet.writeUInt32BE(1, 12); // 一个常数
    if (typeof payload === 'string') {
      packet.write(payload, 16); // 数据体
    } else {
      packet = Buffer.concat([packet, payload]);
    }
    return packet;
  }

  private danmakeProcesser(msg: Buffer) {
    // TODO: 弹幕事件处理
    const packetProtocol = msg.readInt16BE(6);
    const packetType = msg.readInt32BE(8);
    const packetPayload: Buffer = msg.slice(16);
    let jsonData: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    switch (packetType) {
      case DANMAKU_TYPE.HEARTBEAT_REPLY:
        console.log('收到心跳包回应');
        break;
      case DANMAKU_TYPE.AUTH_REPLY:
        console.log('通过认证');
        setInterval(() => {
          const heartbeatPayload = '陈睿你妈死了';
          if (this.socket) {
            this.socket.send(this.generatePacket(1, 2, heartbeatPayload));
          }
        }, 30000);
        this.emit('connected')
        break;
      case DANMAKU_TYPE.DATA:
        switch (packetProtocol) {
          case DANMAKU_PROTOCOL.JSON:
            jsonData = JSON.parse(packetPayload.toString('utf-8'));
            this.emit(jsonData.cmd, jsonData.data);
            AuthedScoketSet.forEach((socket: WebSocket) => {
              socket.send(JSON.stringify({cmd: jsonData.cmd, data: jsonData.data}))
            })
            break;
          case DANMAKU_PROTOCOL.BROTLI:
            zlib.brotliDecompress(packetPayload, (err, result) => {
              if (err) {
                throw err;
              }
              let offset = 0;
              while (offset < result.length) {
                const length = result.readUInt32BE(offset);
                const packetData = result.slice(offset + 16, offset + length);
                const jsonString = packetData.toString('utf8');
                const data = JSON.parse(jsonString);
                this.emit(data.cmd, (data.info || data.data));
                AuthedScoketSet.forEach((socket: WebSocket) => {
                  socket.send(JSON.stringify({cmd: data.cmd, data: data.info || data.data}))
                })
                offset += length;
              }
            });
            break;
          default:
            break;
        }
        break;
      default:
        console.log('什么鬼，没见过这种包');
    }
  }

  public close(): void {
    if (this.socket) {
      this.socket.close();
    }
  }
}

export default DanmakuReceiver;
