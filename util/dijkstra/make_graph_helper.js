const db = require('../../server/models/db/mysql')

async function makeBusIdMap() {
  const map = {}
  const q = `SELECT id, ptx_stop_id FROM stop`
  const [stops] = await db.query(q)
  stops.forEach(({ id, ptx_stop_id }) => {
    map[id] = ptx_stop_id
  })
  return map
}

async function makeIdToPtx() {
  const map ={}
  const q = `SELECT id, ptx_stop_id from stop`
  const [data] = await db.query(q)
  data.forEach(({id, ptx_stop_id}) => {
    map[id] = ptx_stop_id
  })
  return map
}

function getType(fromId, toId) {
  if (parseInt(fromId) === -1) {
    return 'start'
  }
  let type 
  if (parseInt(fromId) && parseInt(toId)) {
    type = 'bus'
  } else if (!parseInt(fromId) && !parseInt(toId)) {
    type = 'metro'
  } else {
    type = 'mix'
  }
  return type
}``

module.exports = {
  makeBusIdMap,
  makeIdToPtx,
  getType
}