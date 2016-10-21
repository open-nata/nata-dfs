import DFSMonkey from '../lib/DFSMonkey.js'
import assert from 'assert'

describe('testing dfs monkey', () => {
  const pkg = 'com.cvicse.zhnt'
  const deviceId = '080539a400e358f3'
  const act = '.LoadingActivity'
  let monkey

  before(() => {
    monkey = new DFSMonkey(deviceId, pkg, act)
  })

  it('should get current state', async done => {
    const state = await monkey.getCurrentState()
    assert.equal(state.pkg, pkg)
    done()
  })
})
