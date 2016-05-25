import Device from 'nata-device'
import dump from './utils/dump'

class Monkey {
  constructor(pkg, act, deviceId) {
    this.pkg = pkg
    this.act = act
    this.deviceId = deviceId
    this.device = new Device(deviceId)
  }

  getPkgAct() {
    return `$(this.pkg)/$(this.act)`
  }

  async getCurrentState() {
    const currentActivity = this.device.getCurrentActivity()
    const currentPackage = this.device.getCurrentPackageName()
    const target = await this.device.dumpUI()
    console.log(target)
    await dump(target)
  }
}

export default Monkey
