import fs from 'fs'
import xmldom from 'xmldom'
import Widget from '../Widget.js'

const parser = new xmldom.DOMParser()

function parseFile(target) {
  return new Promise((resolve, reject) => {
    fs.readFile(target, (err, data) => {
      if (err) reject(err)
      const doc = parser.parseFromString(data.toString(), 'application/xml')
      resolve(doc)
    })
  })
}

async function getWidgets(target) {
  const doc = await parseFile(target)
  // console.log(doc)
  const widgets = []
  const nodes = doc.getElementsByTagName('node')
  let widget

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    widget = new Widget()
    widget.text = node.getAttribute('text')
    widget.resourceId = node.getAttribute('resource-id')
    widget.className = node.getAttribute('class')
    widget.packageName = node.getAttribute('package')
    widget.contentDesc = node.getAttribute('content-desc')
    widget.checkable = node.getAttribute('checkable')
    widget.checked = node.getAttribute('checked')
    widget.clickable = node.getAttribute('clickable')
    widget.enabled = node.getAttribute('enabled')
    widget.focusable = node.getAttribute('focusable')
    widget.focused = node.getAttribute('focused')
    widget.scrollable = node.getAttribute('scrollable')
    widget.longClickable = node.getAttribute('long-clickable')
    widget.password = node.getAttribute('password')
    widget.selected = node.getAttribute('selected')
    widget.bounds = node.getAttribute('bounds')
    widgets.push(widget)
  }
  return widgets
  // console.log(widgets)
}

export default getWidgets