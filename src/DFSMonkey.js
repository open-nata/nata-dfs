import Monkey from './Monkey'
import * as utils from './utils/index.js'
import _ from 'lodash'
import TapAction from './actions/TapAction.js'
import State from './State.js'


class DFSMonkey extends Monkey {

  // constructor(pkg, act, deviceId) {
  //   super(pkg, act, deviceId)
  // }

  play() {

  }


  getActions(widgets) {
    const actions = []
    _.forEach(widgets, (widget) => {
      if (widget.enabled === 'false') return

      if (widget.clickable === 'true') {
        actions.push(new TapAction(this._device, widget))
      }
    })
    return actions
  }

  async getCurrentState() {
    const currentActivity = await this.device.getCurrentActivity()
    const currentPackage = await this.device.getCurrentPackageName()
    const dumpfile = await this.device.dumpUI()
    const widgets = await utils.getWidgetsFromXml(dumpfile)
    const actions = this.getActions(widgets)
    return new State(currentPackage, currentActivity, widgets, actions)
  }


}

export default DFSMonkey

// const pkg = 'com.cvicse.zhnt'
// const deviceId = 'DU2SSE1478031311'
// const act = '.LoadingActivity'
// const monkey = new DFSMonkey(pkg, act, deviceId)
// monkey.getCurrentState().then((state) => {
//   console.log(state.nextAction)
// })
