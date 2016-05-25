import Device from 'nata-device'
import StartAppAction from './actions/StartAppAction'

class Monkey {
  constructor(pkg, act, deviceId) {
    this._pkg = pkg
    this._act = act
    this._deviceId = deviceId
    this._device = new Device(deviceId)
    this._restartAction = new StartAppAction(this._device, this.pkgAct)
  }

  get pkgAct() {
    return `${this._pkg}/${this._act}`
  }

  get pkg() {
    return this._pkg
  }

  get device() {
    return this._device
  }

  get restartAction() {
    return this._restartAction
  }
}

export default Monkey
