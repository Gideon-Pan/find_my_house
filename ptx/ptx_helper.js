const axios = require('axios')
const jsSHA = require('jssha')
require('dotenv').config()

// const AppID = "a6be0b43fa40447d8fb3f73e8e0d0cfe";
// const AppKey = "76gQ9w82jGN2_Z4dJEQU9uTy3nY";
const AppID = process.env.PTX_ID
const AppKey = process.env.PTX_KEY

// console.log('process.env.AppID: ', AppID);
// console.log('process.env.AppID: ', AppKey);

function GetAuthorizationHeader() {
  // var AppID = process.env.AppID;

  // var AppKey = process.env.AppKey;

  var GMTString = new Date().toGMTString()
  var ShaObj = new jsSHA('SHA-1', 'TEXT')
  ShaObj.setHMACKey(AppKey, 'TEXT')
  ShaObj.update('x-date: ' + GMTString)
  var HMAC = ShaObj.getHMAC('B64')
  var Authorization =
    'hmac username="' +
    AppID +
    '", algorithm="hmac-sha1", headers="x-date", signature="' +
    HMAC +
    '"'

  return {
    Authorization: Authorization,
    'X-Date': GMTString /*,'Accept-Encoding': 'gzip'*/
  } //如果要將js運行在伺服器，可額外加入 'Accept-Encoding': 'gzip'，要求壓縮以減少網路傳輸資料量
}

async function getPtxData(url) {
  const { data } = await axios.get(url, {
    headers: GetAuthorizationHeader()
  })
  // console.log(data[0].Stations);
  return data
}

// getStationOfLine("https://ptx.transportdata.tw/MOTC/v2/Rail/Metro/StationOfLine/TRTC?$top=1&$format=JSON")

module.exports = getPtxData
