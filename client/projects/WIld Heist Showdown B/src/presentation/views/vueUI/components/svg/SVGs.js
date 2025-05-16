import xml from './SVGs.xml?raw'

const sprites = {}
xml.split('<symbol').forEach(text => {
  const finalText = '' + text.replace('</svg>', '').replace('</symbol>', '')
  const id = finalText.match(/id="(.*?)"/g)?.[0].split('"')[1]
  sprites[id] = finalText
})

export default sprites