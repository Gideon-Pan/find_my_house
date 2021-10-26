const { Node, Edge, Graph } = require('../graph')
const getPtxData = require('../metro-ptx')

async function makeStations() {
  const map = {}
  const stations = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Bus/Station/City/Taipei?$top=10000&$format=JSON'
  )
  // console.log(stations)
  for (let i = 0; i < stations.length; i++) {
    const station = stations[i]
    // stationss.forEach(station => {
    // if (station.StationName.Zh_tw === '大眾廟') {
    //   console.log(station)
    // }
    if (station.StationName.Zh_tw === '楓林') {
      console.log(station)
    }
    if (!map[station.StationID]) {
      map[station.StationID] = station
      continue
    }
    console.log('QQ')
    console.log(map[station.StationID])
    console.log(station)
    break
  }
  console.log(Object.keys(map).length)

  const stationss = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Bus/Station/City/NewTaipei?$top=10000&$format=JSON'
  )
  // console.log(stations)
  for (let i = 0; i < stationss.length; i++) {
    const station = stationss[i]
    // stationss.forEach(station => {
    // if (station.StationName.Zh_tw === '大眾廟') {
    //   console.log(station)
    // }
    // if (station.StationName === ) {
    //   console.log(station)
    // }
    if (station.StationName.Zh_tw === '衛生所') {
      console.log(station)
    }
    if (!map[station.StationID]) {
      map[station.StationID] = station
      continue
    }
    // console.log('QQ')
    // console.log(map[station.StationID])
    // console.log(station)
    // break
  }
  console.log(Object.keys(map).length)

  // console.log(stations.length)
}

async function makeStops() {
  const map = {}
  const stations = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Bus/Stop/City/Taipei?$top=100000&$format=JSON'
  )
  // console.log(stations)
  for (let i = 0; i < stations.length; i++) {
    const station = stations[i]
    // stationss.forEach(station => {
    // if (station.StationName.Zh_tw === '大眾廟') {
    //   console.log(station)
    // }
    if (map[station.StopID]) {
      console.log('QQ')
      console.log(map[station.StopID])
      console.log(station)
      break
    }

    map[station.StopID] = station
  }
  console.log(Object.keys(map).length)
  // console.log('a')

  const stationss = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Bus/Stop/City/NewTaipei?$top=100000&$format=JSON'
  )
  // console.log(stations)
  // console.log('c')
  console.log(stationss.length)
  for (let i = 0; i < stationss.length; i++) {
    const station = stationss[i]
    // stationss.forEach(station => {
    // if (station.StationName.Zh_tw === '大眾廟') {
    //   console.log(station)
    // }
    if (map[station.StopID]) {
      console.log('QQ')
      console.log(map[station.StopID])
      console.log(station)
      break
    }

    map[station.StopID] = station
  }
  // console.log('b')
  console.log(Object.keys(map).length)
  console.log(Object.keys(map)[0])
  console.log(Object.keys(map)[59439])
}

makeStations()

// makeStops()
