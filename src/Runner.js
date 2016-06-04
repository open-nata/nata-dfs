import path from 'path'
import Device from 'nata-device'
import _ from 'lodash'
import DFSMonkey from './DFSMonkey.js'

const apkPath = path.join(__dirname, '../assets/alogcat.apk')

Device.getOnlineDeviceIds() // get online devices
  .then(ids => {
    _.forEach(ids, id => {
      new DFSMonkey(id, apkPath).play().then(() => {
        console.log('done')
      })
      .catch((err) => console.log(err))
    })
  })