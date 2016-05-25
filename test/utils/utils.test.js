import * as utils from '../../lib/utils/index.js'
import assert from 'assert'
import path from 'path'

describe('testing utils ', () => {
  const dumpfile = path.join(__dirname, '../../assets/dumpfile.xml')

  it('should get parse the xml file ', async done => {
    await utils.parseFile(dumpfile)
    done()
  })

  it('should generate widgets from dumpfile.xml', async done => {
    const widgets = await utils.getWidgetsFromXml(dumpfile)
    assert.notEqual(widgets.length, 0)
    done()
  })
})