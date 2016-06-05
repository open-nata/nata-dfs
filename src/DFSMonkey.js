import Monkey from './Monkey'
import * as utils from './utils/index.js'
import _ from 'lodash'
import TapAction from './actions/TapAction.js'
import Edge from './Edge.js'
import State from './State.js'


class DFSMonkey extends Monkey {
  constructor(deviceId, apkpath) {
    super(deviceId, apkpath)
    this.currentActions = []
    this.nodes = []

    this.rootState = null
    this.curState = null

    this.nodeCount = 0
    this.flag = true
  }


  collectCoverage() {
    let cnt = 0
    return setInterval(() => {
      this.device.collectCoverage(`${this._coveragePath}/${cnt++}.ec`)
    }, 10000)
  }

  async play() {
    console.log(`Monkey on ${this._deviceId} start playing...`)
    // analyse the apk to run
    console.log('analysing apk...')
    await this.analyseApk()
    // install apk in the device
    console.log('installing apk...')
    await this.installApk()

    const ccInterval = this.collectCoverage()

    console.log(this.pkgAct)
    // start app
    await this.startApp()
    // record current state
    this.rootState = await this.getCurrentState()
    this.curState = this.rootState
    this.addNode(this.rootState)

    // start loop
    while (this.flag && !(this.curState.fromEdge == null && !this.curState.isNotOver())) {
      const action = this.curState.getNextAction()

      if (action === null) {
        this.flag = await this.goBack()
        continue
      }

      await action.fire()

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
          console.log('same state')
          break
        default:
          this.currentActions.push(action)
          this.addNode(tempNode)
          this.curState = tempNode
          console.log('new state')
          break
      }
    }

    clearInterval(ccInterval)
  }

  async startApp() {
    await this.restartAction.fire()
  }

  async restartApp() {
    await this.restartAction.fire()
    const rootPa = this.rootState.pkg
    const rootAct = this.rootState.act
    let count = 0
    const RESTART_TIME_LIMIT = 10
    while (count <= RESTART_TIME_LIMIT) {
      await this.wait(1000)
      if (rootPa === await this.device.getCurrentPackageName()
        && rootAct === await this.device.getCurrentActivity()) {
        break
      }

      count++
    }
  }

  async wait(ms) {
    await this.device.sleep(ms)
  }

  async goBack() {
    const ee = this.curState.fromEdge
    if (ee !== null) {
      this.curState = ee.fromState

      while (!this.curState.isNotOver()
              && this.curState.fromEdge !== null) {
        this.curState = this.curState.fromEdge.fromState
      }

      const nodesStack = []
      const edgesStack = []

      let tempState = this.curState
      while (tempState.fromEdge != null) {
        edgesStack.push(tempState.fromEdge)
        tempState = tempState.fromEdge.fromState
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

      let index = -1
      const len = nodesStack.length
      for (let j = 0; j < len; j++) {
        if (nodesStack[j].equals(tempState)) {
          index = j
          break
        }
      }

      if (tempState != null && index !== -1) {
        while (nodesStack.length !== 0
          && !_.last(nodesStack).equals(tempState)) {
          nodesStack.pop()
          edgesStack.pop()
        }
      } else {
        await this.restartApp()
      }
      while (edgesStack.length !== 0) {
        const pe = edgesStack.pop()
        await this.executeActions(pe.fireActions)
      }

      tempState = await this.getCurrentState()
      if (this.curState.equals(tempState)) {
        return true
      }
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
      const len = this.nodes.length
      for (let j = 0; j < len; j++) {
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
      this.currentActions = []
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
    const target = `${this.resultDir}/dumpfile.xml`
    const dumpfile = await this.device.dumpUI(target)
    const widgets = await utils.getWidgetsFromXml(dumpfile)
    const actions = this.getActions(widgets)
    return new State(currentPackage, currentActivity, widgets, actions)
  }
}

export default DFSMonkey



