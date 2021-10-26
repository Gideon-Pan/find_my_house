const getPtxData = require('../metro-ptx')
const { getMongoData, insertMany } = require('../model/mongo/mongo-helper')

async function insertMetroStation() {
  const data = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Rail/Metro/StationOfLine/TRTC?$top=1000&$format=JSON'
  )
  // console.log(data.length)
  await insertMany('metroStations', data)
}

async function insertMetroIntervalTime() {
  const data = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Rail/Metro/S2STravelTime/TRTC?$top=1000&$format=JSON'
  )
  // console.log(data.length)
  await insertMany('metroIntervalTime', data)
}

async function insertMetroTransferTime() {
  const data = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Rail/Metro/LineTransfer/TRTC?$top=1000&$format=JSON'
  )
  // console.log(data.length)
  await insertMany('metroTransferTime', data)
}

async function insertMetroStationPosition() {
  const data = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Rail/Metro/Station/TRTC?$top=3000&$format=JSON'
  )
  // console.log(data.length)
  await insertMany('metroStationsPosition', data)
}

async function insertMetroFrequency() {
  const data = await getPtxData(
    'https://ptx.transportdata.tw/MOTC/v2/Rail/Metro/Frequency/TRTC?$top=1000&$format=JSON'
  )
  // console.log(data.length)
  await insertMany('metroFrenquency', data)
}

// insertMetroTransferTime()
// insertMetroStationPosition()
// insertMetroFrequency()
