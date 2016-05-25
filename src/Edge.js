import _ from 'lodash'

class Edge {

  constructor(fromState, toState, actions) {
    this._fromState = fromState
    this._toState = toState
    this._actions = _.clone(actions)

    fromState.addToEdge(this)
    toState.setFromEdge(this)
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

  // public String toString() {
  //     return "ActionEdge{" +
  //             "fromState=" + fromState +
  //             ", toState=" + toState +
  //             ", actions=" + actions +
  //             '}';
  // }

  // public String toCommand(){
  //     String s="";
  //     for(Action a:actions){
  //         s+=a.toCommand()+"\n";
  //     }
  //     return s;
  // }
}

export default Edge