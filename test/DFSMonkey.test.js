import DFSMonkey from '../lib/DFSMonkey.js'
import assert from 'assert'

describe('testing dfs monkey', () => {
  const pkg = 'com.cvicse.zhnt'
  const deviceId = 'DU2SSE1478031311'
  const act = '.LoadingActivity'
  let monkey

  before(() => {
    monkey = new DFSMonkey(pkg, act, deviceId)
  })

  it('should get current state', async done => {
    const state = await monkey.getCurrentState()
    assert.equal(state.pkg, pkg)
    done()
  })
})