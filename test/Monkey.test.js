import Monkey from '../lib/Monkey.js'
import assert from 'assert'

describe('testing monkey', () => {
  const pkg = 'com.cvicse.zhnt'
  const deviceId = 'DU2SSE1478031311'
  const act = '.LoadingActivity'
  let monkey

  before(() => {
    monkey = new Monkey(pkg, act, deviceId)
  })


  it('should get pkg_act', done => {
    assert.equal(monkey.pkgAct, `${pkg}/${act}`)
    done()
  })
})