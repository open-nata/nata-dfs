import Device from 'nata-device'
import StartAppAction from './actions/StartAppAction.js'
import BackAction from './actions/BackAction.js'
import _ from 'lodash'

class Monkey {
  constructor(pkg, act, deviceId) {
    this._pkg = pkg
    this._act = act
    this._deviceId = deviceId
    this._device = new Device(deviceId)
    this._restartAction = new StartAppAction(this._device, this.pkgAct)
    this._backAction = new BackAction(this._device)
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

  get backAction() {
    return this._backAction
  }

  async executeActions(actions) {
    for (let i = 0; i < actions.length; i++) {
      await actions[i].fire()
    }
  }
}

export default Monkey
