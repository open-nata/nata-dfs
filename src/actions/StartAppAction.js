import Action from './Action.js'

class StartAppAction extends Action {
  constructor(device, pkgAct) {
    super('startapp')
    this.device = device
    this.pkgAct = pkgAct
  }

  fire() {
    this.device.startActivity(this.pkgAct)
    this.device.sleep(2000)
  }
}


export default StartAppAction