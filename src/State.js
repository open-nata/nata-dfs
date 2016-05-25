
class State {
  constructor(pkg, act, widgets, actions) {
    this._pkg = pkg
    this._act = act
    this._widgets = widgets
    this._actions = actions
    console.log(`${this._pkg} ${this._act} `)

    this._it = actions[Symbol.iterator]()
  }

  get nextAction() {
    return this._it.next()
  }

  get pkg() {
    return this._pkg
  }

  get act() {
    return this._act
  }

  get widgets() {
    return this._widgets
  }

  get actions() {
    return this._actions
  }


}

export default State