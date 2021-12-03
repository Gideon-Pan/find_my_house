const axios = require('axios')
const jsSHA = require('jssha')
require('dotenv').config()

const AppID = process.env.PTX_ID
const AppKey = process.env.PTX_KEY

function GetAuthorizationHeader() {
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
    'X-Date': GMTString 
  } 
}

async function getPtxData(url) {
  const { data } = await axios.get(url, {
    headers: GetAuthorizationHeader()
  })
  return data
}

module.exports = {getPtxData}