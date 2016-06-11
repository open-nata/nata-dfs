import EventEmitter from 'events'

class Result extends EventEmitter {
  constructor() {
    super()
    this.widgetSet = new Set()
    this.activitySet = new Set()
    this.stateSet = new Set()
    this.actionList = []
    this.summaryList = []
  }

  addWidget(widget) {
    let isNew = true
    this.widgetSet.forEach((instance) => {
      if (widget.equals(instance)) {
        isNew = false
      }
    })
    if (isNew) this.widgetSet.add(widget)
  }

  addActivity(activity) {
    let isNew = true
    this.activitySet.forEach((instance) => {
      if (activity === instance) {
        isNew = false
      }
    })
    if (isNew) this.activitySet.add(activity)
  }

  addState(state) {
    let isNew = true
    this.stateSet.forEach((instance) => {
      if (state.equals(instance)) {
        isNew = false
      }
    })
    if (isNew) this.stateSet.add(state)
  }

  addAction(action) {
    this.actionList.push(action)
    if (this.actionList.length % 3 === 0) {
      this.emit('summary', this.summary())
    }
  }

  summary() {
    return {
      action: this.actionList.length,
      activity: this.activitySet.size,
      widget: this.widgetSet.size,
      state: this.stateSet.size,
    }
  }
}

export default Result