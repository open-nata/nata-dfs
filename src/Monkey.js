import Device from 'nata-device'

class Monkey {
  constructor(pkg, act, deviceId) {
    this._pkg = pkg
    this._act = act
    this._deviceId = deviceId
    this._device = new Device(deviceId)
  }

  get pkgAct() {
    return `${this._pkg}/${this._act}`
  }

  get device() {
    return this._device
  }
}

export default Monkey
