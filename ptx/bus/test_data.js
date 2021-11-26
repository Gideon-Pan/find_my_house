const { getPtxData } = require("../ptx_helper")

async function makeStations() {
  const map = {}
  const stations = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Bus/Station/City/Taipei?$top=10000&$format=JSON'
  )
  for (let i = 0; i < stations.length; i++) {
    const station = stations[i]
    if (!map[station.StationID]) {
      map[station.StationID] = station
      continue
    }
    break
  }
  const stationss = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Bus/Station/City/NewTaipei?$top=10000&$format=JSON'
  )
  for (let i = 0; i < stationss.length; i++) {
    const station = stationss[i]
    if (!map[station.StationID]) {
      map[station.StationID] = station
      continue
    }
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
      break
    }

    map[station.StopID] = station
  }

  const stationss = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Bus/Stop/City/NewTaipei?$top=100000&$format=JSON'
  )
  for (let i = 0; i < stationss.length; i++) {
    const station = stationss[i]
    if (map[station.StopID]) {
      break
    }
    map[station.StopID] = station
  }
}

makeStations()