import Device from 'nata-device'
import StartAppAction from './actions/StartAppAction.js'
import BackAction from './actions/BackAction.js'
import apkparser from 'apkparser'
import path from 'path'
import fs from 'fs'
import rimraf from 'rimraf'
import Result from './Result.js'
import _ from 'lodash'
import TapAction from './actions/TapAction.js'
import * as utils from './utils/index.js'
import State from './State.js'


class Monkey {
  constructor(deviceId, appPath, pkg, act) {
    // this._apkPath = path.join(appPath, '/bin/
    this._apkPath = appPath
    this._pkg = pkg
    this._act = act
    this._apk = undefined
    this._restartAction = undefined
    this._deviceId = deviceId
    this._device = new Device(deviceId)
    this._backAction = new BackAction(this._device)

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
    // this._apk = await apkparser.parse(this._apkPath, this._apkToolPath)
    // this._pkg = this._apk.packageName
    // this._act = this._apk.entry
    this._restartAction = new StartAppAction(this._device, this.pkgAct)

    this._resultDir = path.join(this._resultDir, `/${this._pkg}`)

    if (fs.existsSync(this._resultDir)) {
      rimraf.sync(this._resultDir)
    }

    fs.mkdirSync(this._resultDir)
    // create coverage dir
    this._coveragePath = `${this._resultDir}/coverage`
    fs.mkdirSync(this._coveragePath)
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
    const state = new State(currentPackage, currentActivity, widgets, actions)

    // add state
    this._result.addState(state)
    // add activity
    if (currentPackage === this._pkg) {
      this._result.addActivity(currentActivity)
    }
    // add widget
    _.forEach(widgets, (widget) => {
      if (widget.packageName === this._pkg) {
        this._result.addWidget(widget)
      }
    })

    return state
  }


}

export default Monkey
