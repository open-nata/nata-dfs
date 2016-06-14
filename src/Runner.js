import path from 'path'
import Device from 'nata-device'
import _ from 'lodash'
import DFSMonkey from './DFSMonkey.js'
import apkparser from 'apkparser'

//const appPath = path.join(__dirname, '../experiments/subjects/aarddict.android_13_src')
const apkPath = path.join(__dirname, '../assets/alogcat.apk')
apkparser.parse(apkPath).then((manifest) => {
  const pkg = manifest.packageName
  const act = manifest.entry
  Device.getOnlineDeviceIds() // get online devices
  .then(devices=> {
    _.forEach(devices, device => {
      const id = device.id
      console.time(`monkey-${id}`)
      const monkey = new DFSMonkey(id, null, pkg, act)
      const result = monkey.result
      result.on('summary', (summary) => {
        console.log(summary)
      })

      monkey.play().then(() => {
        console.log('done')
        console.timeEnd(`monkey-${id}`)
      })
      .catch((err) => console.log(err))
    })
  })
  .catch((err) => console.log(err))
})