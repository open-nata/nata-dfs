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
  .then(ids => {
    _.forEach(ids, id => {
      console.time(`monkey-${id}`)
      new DFSMonkey(id, apkPath, pkg, act).play().then(() => {
        console.log('done')
        console.timeEnd(`monkey-${id}`)
      })
      .catch((err) => console.log(err))
    })
  })
  .catch((err) => console.log(err))
})



