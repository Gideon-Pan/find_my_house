const db = require('../model/db/mysql/mysql')
const { makeIdToPtx } = require('./make_graph')

async function getTime() {
  const edges = []
  const busIdMap = await makeBusIdMap()
  const q = `SELECT from_stop_id, to_stop_id, time_period_hour, time_period_minute, period, time, distance FROM time_between_stop
    JOIN time_period
      ON time_between_stop.time_period_id = time_period.id
    JOIN stop
      ON stop.id = to_stop_id
    JOIN station
      ON station.id = stop.station_id
      WHERE from_stop_id IS NOT NULL
      AND to_stop_id IS NOT NULL
      AND time IS NOT NULL
      AND version = ${version}
      AND type = 'metro'
    `
  const [data] = await db.query(q)
  data.forEach(
    ({
      from_stop_id,
      to_stop_id,
      // time_period_hour,
      // time_period_minute,
      period,
      time,
      distance
    }) => {
      if (!busIdMap[from_stop_id]) {
        console.log(from_stop_id)
        return
      }
      distance = distance ? distance : 0
      // console.log(distance)
      // console.log(busIdMap[from_stop_id])
      const edge = new Edge(
        busIdMap[from_stop_id],
        busIdMap[to_stop_id],
        // `${time_period_hour}-${time_period_minute}`,
        period,
        time,
        distance
      )
      // g.addEdge(edge)
      edges.push(edge)
    }
  )
  console.log('finish fetching data')
  return edges
}


async function main () {
  const q = `SELECT to_stop_id, time, period, version FROM time_between_stop
  JOIN time_period
    ON time_between_stop.time_period_id = time_period.id
  JOIN stop
    ON stop.id = time_between_stop.from_stop_id
  JOIN station
    ON station.id = stop.station_id
WHERE version = 2 AND ptx_stop_id = -1
`

  const [data] = await db.query(q)
  console.log('finish fetching')
  // console.log(data)
  const map = await makeIdToPtx()
  console.log('22')
  data.forEach(({to_stop_id, time}) => {
    // console.log(123)
    
    if (!Number(map[to_stop_id])) {
      console.log('map[to_stop_id]: ', map[to_stop_id]);
      console.log('time: ', time);
      // console.log()
    } else {
      // console.log('3q')
    }
  })
}
main()