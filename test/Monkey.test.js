import Monkey from '../lib/Monkey'
import assert from 'assert'

describe('testing monkey', () => {
  const pkg = 'com.cvicse.zhnt'
  const deviceId = 'DU2SSE1478031311'
  const act = '.LoadingActivity'
  let monkey

  before(() => {
    monkey = new Monkey(pkg, act, deviceId)
  })


  it('should get current state', async done => {
    await monkey.getCurrentState()
    done()
  })
})