import * as fs from 'fs';
import * as cp from 'child_process'

export function startPlugins() {
  const pluginList = fs.readdirSync('./plugins');
  pluginList.forEach((val: string) => {
    if(fs.statSync(`./plugins/${val}`).isDirectory()) {
      const jsonStr = fs.readFileSync(`./plugins/${val}/package.json`, {encoding: 'utf8'})
      const packageJson = JSON.parse(jsonStr)
      cp.fork(`./plugins/${val}/${packageJson.main}`)
    }
  });
}