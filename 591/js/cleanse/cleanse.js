// const { getMongoData } = require("../../server/models/db/mongo")

const {
  getMongo,
  getMongoOne,
  insertMongo
} = require('../../../server/models/db/mongo')

async function cleanseData(rawDataCollection) {
  let houses = await getMongo('591_raw', rawDataCollection)
  // console.log(houses.length)
  // return console.log(houses)
  // houses = [houses]
  console.log('finish fetching data')
  const housesData = []
  const map = {}
  houses.forEach((house) => {
    if (!house.data.shareInfo) {
      // return console.log(house)
      return
    }
    // map[house.data.shareInfo.url] = house
    map[house.id] = house
  })
  // console.log(Object.keys(map).length)
  for (let [key, house] of Object.entries(map)) {
    // console.log('he')
    // console.log(house)
    let {
      breadcrumb,
      title,
      shareInfo,
      tags,
      price,
      info,
      positionRound,
      service,
      favData
    } = house.data
    // console.log(breadcrumb)
    // price =
    // const link
    // const category
    // const size
    // const image
    // const address
    // const latitude
    // const longitude
    const tagsData = tags.map(({ value }) => {
      return value
    })
    const infoMap = {}
    info.forEach(({ value, key }) => {
      infoMap[key] = value
    })
    // const facilitymap = {}
    const facilities = []
    service.facility.forEach(({ key, name, active }) => {
      // facilitymap[key] = {
      //   name,
      //   active
      // }
      if (active) {
        // console.log(active)
        facilities.push(name)
      }
    })

    const breadcrumbMap = {}
    breadcrumb.forEach(({ name, query }) => {
      breadcrumbMap[query] = name
    })

    // const neighborhoodMap = {}
    // positionRound.mapData.forEach(({key, children}) => {
    //   // neighborhoodMap[key] = children
    //   // children.forEach()
    // })

    const houseData = {
      id: house.id,
      timestamp: house.timestamp,
      title,
      category: favData.kindTxt,
      area: infoMap.area,
      price: favData.price,
      layout: infoMap.layout,
      floor: infoMap.floor,
      shape: infoMap.shape,
      link: shareInfo.url,
      image: favData.thumb,
      address: positionRound.address,
      latitude: positionRound.lat,
      longitude: positionRound.lng,
      lifeFunction: positionRound.mapData,
      // breadcrumb,
      facilities,
      tags: tagsData,
      region: breadcrumbMap.region,
      section: breadcrumbMap.section
    }
    // console.log(houseData)
    housesData.push(houseData)
    // console.log(houseData)
    // return
  }
  console.log('start inserting')

  const date = new Date()
  // console.log(data.getDay())
  const day = date.getDate()
  // console.log('day: ', day);
  const month = date.getMonth()
  // console.log('month: ', month);
  const year = date.getFullYear()
  // console.log('year: ', year);
  const finalDate = `${year}-${month + 1}-${day}`
  await insertMongo('591_cleansed', `${finalDate}houseDatacleansed`, housesData)
}

// cleanseData("houseDataRawAutomated")

module.exports = {
  cleanseData
}