const { Node, Edge, Graph } = require('../graph')
const getPtxData = require('../metro-ptx')

async function makeStations(g) {
  const stationsTPE = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Bus/Station/City/Taipei?$top=10000&$format=JSON'
  )
  for (let i = 0; i < stationsTPE.length; i++) {
    const station = stationsTPE[i]
    const node = new Node(station.StationID, station.StationName.Zh_tw)
    g.addNode(node)
  }

  const stationsNTP = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Bus/Station/City/NewTaipei?$top=10000&$format=JSON'
  )
  for (let i = 0; i < stationsNTP.length; i++) {
    const station = stationsNTP[i]
    const node = new Node(station.StationID, station.StationName.Zh_tw)
    g.addNode(node)
  }
}

async function makeStops() {
  const map = {}
  const stations = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Bus/Stop/City/Taipei?$top=100000&$format=JSON'
  )
  for (let i = 0; i < stations.length; i++) {
    const station = stations[i]
    if (map[station.StopID]) {
      console.log('QQ')
      console.log(map[station.StopID])
      console.log(station)
      break
    }

    map[station.StopID] = station
  }
  console.log(Object.keys(map).length)
  const stationss = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Bus/Stop/City/NewTaipei?$top=100000&$format=JSON'
  )
  console.log(stationss.length)
  for (let i = 0; i < stationss.length; i++) {
    const station = stationss[i]
    if (map[station.StopID]) {
      console.log('QQ')
      console.log(map[station.StopID])
      console.log(station)
      break
    }

    map[station.StopID] = station
  }
  console.log(Object.keys(map).length)
  console.log(Object.keys(map)[0])
  console.log(Object.keys(map)[59439])
}

async function makeBusGraph() {
  const g = new Graph()
  await makeStations(g)
  console.log(g._nameMap)
}
