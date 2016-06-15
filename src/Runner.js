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
  Device.getOnlineDevices() // get online devices
  .then((devices) => {
    _.forEach(devices, device => {
      const id = device.id
      console.time(`monkey-${id}`)
      const monkey = new DFSMonkey(id, pkg, act, {
        //apkPath,
        setup: ['CleanData com.cvicse.zhnt',
          'StartApp com.cvicse.zhnt/.LoadingActivity',
          'Click @0,75x1080,1776',
          'Swipe @0,75x1080,1776 LEFT',
          'Swipe @0,75x1080,1776 LEFT',
          'Swipe @0,75x1080,1776 LEFT',
          'Swipe @0,75x1080,1776 LEFT'],
        action_count: 10,
      })
      const result = monkey.result
      result.on('summary', (summary) => {
        console.log(summary)
      })

      result.on('activity', (activity) => {
        console.log(activity)
      })

      result.on('action', (action) => {
        console.log(action)
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