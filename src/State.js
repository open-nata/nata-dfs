
class State {
  constructor(pkg, act, actions) {
    this._pkg = pkg
    this._act = act
    this._actions = actions

    this._kind = State.Types.NORMAL
    this._fromEdge = null
    this._toEdge = []

    this.actionIndex = 0
  }

  static get Types() {
    return {
      NORMAL: 1,
      OLD: 2,
      OUT: 3,
      SAME: 4,
    }
  }

  get fromEdge() {
    return this._fromEdge || null
  }

  setFromEdge(edge) {
    this._fromEdge = edge
  }

  get toEdge() {
    return this._toEdge
  }

  addToEdge(toEdge) {
    this._toEdge.push(toEdge)
  }

  get kind() {
    return this._kind
  }

  setKind(kind) {
    this._kind = kind
  }

  getNextAction() {
    if (this.actionIndex < this.actions.length) {
      return this._actions[this.actionIndex++]
    }
    return null
  }

  isNotOver() {
    return (this.actionIndex < this.actions.length)
  }

  get pkg() {
    return this._pkg
  }

  get act() {
    return this._act
  }

  get actions() {
    return this._actions
  }

  equals(oState) {
    if (oState === null) {
      return false
    }
    if (this === oState) {
      return true
    }
    if (!(oState instanceof State)) {
      return false
    }
    if (this.pkg === oState.pkg
      && this.act === oState.act
      && this.actions.length === oState.actions.length) {
      let count = 0
      // search for equal ones
      for (let i = 0; i < this.actions.length; i++) {
        const searchTerm = this.actions[i]
        let index = -1
        for (let j = 0, len = oState.actions.length; j < len; j++) {
          if (oState.actions[j].equals(searchTerm)) {
            index = j
            break
          }
        }
        if (index === -1) {
          count++
        }
      }

      const rate = (count / this.actions.length)
      if (rate < 0.5) {
        return true
      }
    }

    return false
  }

}

export default State