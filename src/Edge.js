import _ from 'lodash'

class Edge {

  constructor(fromState, toState, actions) {
    this._fromState = fromState
    this._toState = toState
    this._actions = _.clone(actions)
  }

  get fromState() {
    return this._fromState
  }

  get toState() {
    return this._toState
  }

  get fireActions() {
    return this._actions
  }

  fire() {
    _.forEach(this._actions, (action) => {
      action.fire()
    })
  }

}

export default Edge