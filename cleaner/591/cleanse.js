const { getMongo, getMongoOne, insertMongo } = require('../../server/models/db/mongo')

async function cleanseData(rawDataCollection, today) {
  console.log('database name: 591_raw')
  console.log('collection to be cleansed:', rawDataCollection)
  let houses = await getMongo('591_raw', rawDataCollection)
  console.log('finish fetching data')
  const housesData = []
  const map = {}
  houses.forEach((house) => {
    if (!house.data || !house.data.shareInfo) {
      return
    }
    map[house.id] = house
  })
  for (let [key, house] of Object.entries(map)) {
    let { breadcrumb, title, shareInfo, tags, price, info, positionRound, service, favData } = house.data
    const tagsData = tags.map(({ value }) => {
      return value
    })
    const infoMap = {}
    info.forEach(({ value, key }) => {
      infoMap[key] = value
    })
    const facilities = []
    service.facility.forEach(({ key, name, active }) => {
      if (active) {
        facilities.push(name)
      }
    })

    const breadcrumbMap = {}
    breadcrumb.forEach(({ name, query }) => {
      breadcrumbMap[query] = name
    })

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
      facilities,
      tags: tagsData,
      region: breadcrumbMap.region,
      section: breadcrumbMap.section
    }
    housesData.push(houseData)
  }
  console.log('start inserting')
  await insertMongo('591_cleansed', `${today}houseDatacleansed`, housesData)
}

module.exports = {
  cleanseData
}
