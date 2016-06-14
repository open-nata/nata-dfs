import Device from 'nata-device'
import apkparser from 'apkparser'
import path from 'path'
import fs from 'fs'
import rimraf from 'rimraf'
import Result from './Result.js'
import _ from 'lodash'
import State from './State.js'


class Monkey {
  constructor(deviceId, pkg, act, options) {
    this._deviceId = deviceId
    this._device = new Device(deviceId)

    this._pkg = pkg
    this._act = act
    this.options = options || {}
    this._apkPath = options.apkPath || ''
    this._setup = options.setup || []
    this._apk = undefined
    this._restartAction = undefined

    this._backAction = this._device.getBackAction(this._device)

    // create results dir
    this._resultDir = path.join(__dirname, `../results`)
    if (!fs.existsSync(this._resultDir)) {
      fs.mkdirSync(this._resultDir)
    }
    this._resultDir = path.join(__dirname, `../results/${this._deviceId}`)

    if (!fs.existsSync(this._resultDir)) {
      fs.mkdirSync(this._resultDir)
    }
    // create apktool dir
    this._apkToolPath = `${this._resultDir}/apktool`

    this._result = new Result()
  }


  get result() {
    return this._result
  }


  async analyseApk() {
    //this._apk = await apkparser.parse(this._apkPath, this._apkToolPath)
    //this._pkg = this._apk.packageName
    //this._act = this._apk.entry
    this._restartAction = this._device.getStartAppAction(this.pkgAct)

    this._resultDir = path.join(this._resultDir, `/${this._pkg}`)

    if (fs.existsSync(this._resultDir)) {
      rimraf.sync(this._resultDir)
    }

    fs.mkdirSync(this._resultDir)
    // create coverage dir
    this._coveragePath = `${this._resultDir}/coverage`
    fs.mkdirSync(this._coveragePath)
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

  async installApk() {
    if (this._apkPath) {
      await this._device.install(this._apkPath)
    }
  }

  get apkPath() {
    return this._apkPath
  }

  get resultDir() {
    return this._resultDir
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

  async executeAction(action) {
    this._result.addAction(action)
    await action.fire()
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
