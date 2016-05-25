import Monkey from './Monkey'
import * as utils from './utils/index.js'
import _ from 'lodash'
import TapAction from './actions/TapAction.js'
import Edge from './Edge.js'
import State from './State.js'


class DFSMonkey extends Monkey {
  constructor(pkg, act, deviceId) {
    super(pkg, act, deviceId)
    this.currentActions = []
    this.nodes = []

    this.rootState = null
    this.curState = null

    this.nodeCount = 0
    this.flag = true
  }

  play() {
    // start app
    this.startApp()
    // record current state
    this.rootState = this.getCurrentState()
    this.curState = this.rootState
    this.addNode(this.rootState)
    // start loop
    while (this.flag && !(this.curState.fromEdge == null && !this.curState.isNotOver())) {
      const action = this.curState.getAction()

      if (action === null) {
        this.flag = this.goBack()
        continue
      }

      this.action.fire()

      const tempNode = this.getCurrentState()

      const kind = this.classifyNode(tempNode)

      switch (kind) {
        case State.Types.OLD:
        case State.Types.OUT:
          this.currentActions.add(action)
          this.addNode(tempNode)
          this.curState = tempNode
          this.flag = this.goBack()
          break
        case State.Types.SAME:
          console.debug('same state')
          break
        default:
          this.currentActions.add(action)
          this.addNode(tempNode)
          this.curState = tempNode
          console.debug('new state')
          break
      }
    }
  }

  startApp() {
    this.restartAction.fire()
  }

  restartApp() {
    this.restartAction.fire()
    const rootPa = this.rootState.getAppPackage()
    const rootAct = this.rootState.getActivity()
    let count = 0
    const RESTART_TIME_LIMIT = 10
    while (count <= RESTART_TIME_LIMIT) {
      this.wait(1000)
      if (rootPa === this.device.getCurrentPackageName()
        && rootAct === this.device.getCurrentActivity()) {
        break
      }

      count++
    }
  }

  wait(ms) {
    this.device.sleep(ms)
  }

  // TODO
  goBack() {

  }

  classifyNode(state) {
    let k = State.Types.NORMAL
    // out of this App
    if (state.pkg !== this.pkg) {
      state.setKind(State.Types.OUT)
      k = State.Types.OUT
    } else {
        // nothing change
      if (this.curState != null && this.curState.equals(state)) {
        return State.Types.SAME
      }
      // find if old state
      let index = -1
      for (let j = 0, len = this.nodes.length; j < len; j++) {
        if (this.nodes[j].equals(state)) {
          index = j
          break
        }
      }
      // if it is
      if (index !== -1) {
        state.setKind(State.Types.OLD)
        k = State.Types.OLD
      }
    }
    return k
  }

  addNode(toState) {
    if (this.nodeCount !== 0) {
      const edge = new Edge(this.curState, toState, this.currentActions)
      this.curState.addToEdge(edge)
      toState.setFromEdge(edge)
      this.currentActions.clear()
    }
    this.nodeCount++
    this.nodes.add(toState)
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

const pkg = 'com.cvicse.zhnt'
const deviceId = 'DU2SSE1478031311'
const act = '.LoadingActivity'

const monkey = new DFSMonkey(pkg, act, deviceId)
monkey.play()

