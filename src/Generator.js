import DFSMonkey from './DFSMonkey.js'
import Device from 'nata-device'
import path from 'path'
import fs from 'fs'
import mkdir from 'mkdirp'

const join = path.join

class Generator {
  /**
   * var options = {
      apkPath,
      pkg,
      act,
      number: 10000,
      devices,
      verbose,
      dir
    }
   * @param options
   */
  constructor(options) {
    this.options = options || {}
    this.apkPath(this.options.apkPath || '')
    this.devices(this.options.devices || [])
    this.pkg(this.options.pkg || '')
    this.entry(this.options.entry || '')
    this.limit(this.options.limit || 1000)
    this.verbose(this.options.verbose || false)
    this.setup(this.options.setup || [])
    this.resultDir(this.options.resultDir || join(__dirname, `../results`))
  }

  apkPath(apkPath) {
    this.options.apkPath = apkPath
    return this
  }

  setup(actions) {
    this.options.setup = actions
    return this
  }

  pkg(pkg) {
    this.options.pkg = pkg
    return this
  }

  entry(activity) {
    this.options.entry = activity
    return this
  }

  devices(devices) {
    this.options.devices = devices
    return this
  }

  limit(limit) {
    this.options.limit = limit
    return this
  }

  verbose(verbose) {
    this.options.verbose = verbose
    return this
  }

  resultDir(resultDir) {
    this.options.resultDir = resultDir
    if (!fs.existsSync(resultDir)) {
      mkdir.sync(resultDir)
    }
    return this
  }


  async run() {
    for (let i = 0; i < this.options.devices.length; i++) {
      const deviceId = this.options.devices[i]
      const device = new Device(deviceId)
      // always install apk
      if (this.options.apkPath) {
        await device.install(this.options.apkPath)
      }
      const resultDir = path.join(this.options.resultDir, `/${deviceId}/${this.options.pkg}`)
      if (!fs.existsSync(resultDir)) {
        mkdir.sync(resultDir)
      }
      console.log(resultDir)

      const monkey = new DFSMonkey(
        device,
        this.options.pkg,
        this.options.entry,
        this.options.setup,
        this.options.limit,
        resultDir
      )

      if (this.options.verbose) {
        const result = monkey.result
        result.on('summary', (summary) => {
          console.log(summary)
        })

        result.on('activity', (activity) => {
          console.log(activity)
        })

        result.on('action', (action) => {
          console.log(action)
        })
      }
      await monkey.play()
    }
  }
}

export default Generator

// apkparser.parse(apkPath).then((manifest) => {
//   const pkg = manifest.packageName
//   const act = manifest.entry
//   Device.getOnlineDevices() // get online devices
//   .then((devices) => {
//     _.forEach(devices, device => {
//       const id = device.id
//       console.time(`monkey-${id}`)
//       const monkey = new DFSMonkey(id, pkg, act, {
//         apkPath,
//         // setup: ['CleanData com.cvicse.zhnt',
//         //   'StartApp com.cvicse.zhnt/.LoadingActivity',
//         //   'Click @0,75x1080,1776',
//         //   'Swipe @0,75x1080,1776 LEFT',
//         //   'Swipe @0,75x1080,1776 LEFT',
//         //   'Swipe @0,75x1080,1776 LEFT',
//         //   'Swipe @0,75x1080,1776 LEFT'],
//         // action_count: 10,
//       })
//       monkey.installApk();
//       const result = monkey.result
//       result.on('summary', (summary) => {
//         console.log(summary)
//       })
//
//       result.on('activity', (activity) => {
//         console.log(activity)
//       })
//
//       result.on('action', (action) => {
//         console.log(action)
//       })
//
//       monkey.play().then(() => {
//         console.log('done')
//         console.timeEnd(`monkey-${id}`)
//       })
//       .catch((err) => console.log(err))
//     })
//   })
//   .catch((err) => console.log(err))
// })
