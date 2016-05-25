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

  async play() {
    // start app
    console.log('start palying...')
    await this.startApp()
    // record current state
    this.rootState = await this.getCurrentState()
    // console.log(this.rootState)
    this.curState = this.rootState
    this.addNode(this.rootState)
    // start loop
    while (this.flag && !(this.curState.fromEdge == null && !this.curState.isNotOver())) {
      const action = this.curState.getAction()

      if (action === null) {
        this.flag = await this.goBack()
        continue
      }

      this.action.fire()

      const tempNode = await this.getCurrentState()

      const kind = this.classifyNode(tempNode)

      switch (kind) {
        case State.Types.OLD:
        case State.Types.OUT:
          this.currentActions.push(action)
          this.addNode(tempNode)
          this.curState = tempNode
          this.flag = await this.goBack()
          break
        case State.Types.SAME:
          console.debug('same state')
          break
        default:
          this.currentActions.push(action)
          this.addNode(tempNode)
          this.curState = tempNode
          console.debug('new state')
          break
      }
    }
  }

  async startApp() {
    await this.restartAction.fire()
  }

  async restartApp() {
    await this.restartAction.fire()
    const rootPa = this.rootState.getAppPackage()
    const rootAct = this.rootState.getActivity()
    let count = 0
    const RESTART_TIME_LIMIT = 10
    while (count <= RESTART_TIME_LIMIT) {
      await this.wait(1000)
      if (rootPa === this.device.getCurrentPackageName()
        && rootAct === this.device.getCurrentActivity()) {
        break
      }

      count++
    }
  }

  async wait(ms) {
    await this.device.sleep(ms)
  }

  // TODO
  async goBack() {
    const ee = this.curState.getFromEdge()
    if (ee != null) {
      this.curState = ee.getFromState()

      while (!this.curState.isNotOver()
              && this.curState.getFromEdge() !== null) {
        this.curState = this.curState.getFromEdge().getFromState()
      }

      const nodesStack = []
      const edgesStack = []

      let tempState = this.curState
      while (tempState.getFromEdge() != null) {
        edgesStack.push(tempState.getFromEdge())
        tempState = tempState.getFromEdge().getFromState()
        nodesStack.push(tempState)
      }

      // attempt to one step back
      if (edgesStack.length > 2) {
        await this.backAction.fire()
      }

      tempState = await this.getCurrentState()

      if (this.curState.equals(tempState)) {
        return true
      }

      if (tempState != null && nodesStack.contains(tempState)) {
        // this node is ancestor of current node
        while (nodesStack.length !== 0
          && !nodesStack.peekBack().equals(tempState)) {
          nodesStack.pop()
          edgesStack.pop()
        }
      } else {
        await this.restartApp()
      }

      while (!edgesStack.isEmpty()) {
        const pe = edgesStack.pop()
        this.executeActions(pe.getFireActions())
      }

      tempState = await this.getCurrentState()
      if (this.curState.equals(tempState)) {
        return true
      }
      console.log('go to a wrong state!')
      return await this.goBack()
    }
    return true
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
    this.nodes.push(toState)
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
    const state = new State(currentPackage, currentActivity, widgets, actions)
    // console.log(state)
    return state
  }
}

export default DFSMonkey

const pkg = 'com.cvicse.zhnt'
const deviceId = 'DU2SSE1478031311'
const act = '.LoadingActivity'

const monkey = new DFSMonkey(pkg, act, deviceId)
monkey.play().then(() => {
  console.log('done')
})

