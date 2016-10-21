import fs from 'fs'
import Result from './Result.js'
import State from './State.js'

class Monkey {
  constructor(device, pkg, act, setup, limit, resultDir) {
    this._device = device
    this._pkg = pkg
    this._act = act
    this._setup = setup || []
    this._actionCount = limit || 1000
    this._resultDir = resultDir
    this._restartAction = this._device.getStartAppAction(`${this._pkg}/${this._act}`)
    this._stopFlag = false
    this._backAction = this._device.getBackAction(this._device)
    this._result = new Result()
    this.createCoverage()
  }

  get result() {
    return this._result
  }

  createCoverage() {
    this._coveragePath = `${this._resultDir}/coverage`
    if (!fs.existsSync(this._coveragePath)) {
      fs.mkdirSync(this._coveragePath)
    }
  }

  async setUp() {
    if (this._setup && this._setup.length > 0) {
      await this.device.executeActions(this._setup)
    }
  }

  collectCoverage() {
    let cnt = 0
    return setInterval(() => {
      this._device.collectCoverage(`${this._coveragePath}/${cnt++}.ec`)
    }, 10000)
  }

  get apkPath() {
    return this._apkPath
  }

  get resultDir() {
    return this._resultDir
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

  stop() {
    this._stopFlag = true
  }

  async executeAction(action) {
    this._result.addAction(action)
    await action.fire()

    if (this._result.actionList.length > this._actionCount) {
      this.stop()
    }
  }

  async executeActions(actions) {
    for (let i = 0; i < actions.length; i++) {
      await this.executeAction(actions[i])
    }
  }

  async getCurrentState() {
    const currentActivity = await this.device.getCurrentActivity()
    const currentPackage = await this.device.getCurrentPackageName()
    const actions = await this.device.getAvaliableActions()

    const state = new State(currentPackage, currentActivity, actions)

    // add state
    this._result.addState(state)
    // add activity
    if (currentPackage === this._pkg) {
      this._result.addActivity(currentActivity)
    }

    return state
  }
}

export default Monkey
