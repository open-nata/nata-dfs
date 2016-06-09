import Action from './Action.js'

class TapAction extends Action {
  constructor(device, widget) {
    super('tap')
    this._device = device
    this._widget = widget

    this._centerX = widget.centerX
    this._centerY = widget.centerY
  }

  async fire() {
    await this._device.click(this._centerX, this._centerY)
  }
}


export default TapAction