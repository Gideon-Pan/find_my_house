const { getMongo, getMongoOne } = require("../../../server/models/db/mongo")
const pool = require('../../../server/models/db/mysql')
const { makeCategoryToIdMap, makeTagMap, makeLifeFunctionMap, makeSubypeToIdMap } = require("./map")
const {today, yesterday} = require('../time')

async function insertHouseFirstTime() {
  const houseMap = {}
  const map = {}
  const categoryMap = await makeCategoryToIdMap()
  const houses = await getMongo('591_data', 'cleansedHouseDataNew')
  console.log(houses.length)
  houses.forEach(house => {
    const {title, latitude, longitude, id} = house

      houseMap[id] = house
      // map[id] = house
    // })
  })
  // console.log(houseMap)
  const houseData = Object.values(houseMap).map(({id, title, area, category, price, layout, floor, shape, link, image, address, latitude, longitude, region, section}) => {
    area = area.replace('坪', '')
    return [id, title, categoryMap[category], area, price, layout, floor, shape, link, image, address, latitude, longitude, region, section]
  })

  const q = 'INSERT INTO house (id, title, category_id, area, price, layout, floor, shape, link, image, address, latitude, longitude, region, section) VALUES ?'
  // const values = Object.values(houseMap).map(house => [house])
  // console.log(values)
  let values = []
  const bulkNum = 1000
  const insertTimes = Math.floor(houseData.length / bulkNum) + 1
  for (let i = 0; i < insertTimes; i++) {
    if (i === insertTimes - 1) {
      await pool.query(q, [houseData.slice(i * bulkNum, houseData.length - 1)])
      console.log(`finish inserting house ${i * bulkNum} to ${houseData.length - 1}`)
      break
    }
    await pool.query(q, [houseData.slice(i * bulkNum, (i + 1) * bulkNum)])
    console.log(`finish inserting house ${i * bulkNum} to ${(i + 1) * bulkNum}`)
  }
  
  console.log('finish inserting all houses')
}

async function insertHouseTag() {
  const houseMap = {}
  const map = {}
  const tagMap = await makeTagMap()
  // const categoryMap = await makeCategoryToIdMap()
  const houses = await getMongo('591_data', 'cleansedHouseDataNew')
  // console.log(houses.length)
  houses.forEach(house => {
    const {title, latitude, longitude, id} = house
      houseMap[`${title}-${latitude}-${longitude}`] = house
      // map[id] = house
    // })
  })
  // console.log(houseMap)
  const houseData = []
  Object.values(houseMap).forEach(({id, tags}) => {
    tags.forEach(tag => {
      // console.log(tag)
      houseData.push([id, tagMap[tag]])
    })
    // return [id, title, categoryMap[category], area, price, layout, floor, shape, link, image, address, latitude, longitude, region, section]
  })
  console.log(houseData.length)

  const q = 'INSERT INTO house_tag (house_id, tag_id) VALUES ?'
  // const values = Object.values(houseMap).map(house => [house])
  // console.log(values)
  let values = []
  const bulkNum = 1000
  const insertTimes = Math.floor(houseData.length / bulkNum) + 1
  for (let i = 0; i < insertTimes; i++) {
    if (i === insertTimes - 1) {
      console.log(insertTimes)
      console.log(houseData.slice(i * bulkNum, houseData.length - 1))
      await pool.query(q, [houseData.slice(i * bulkNum, houseData.length - 1)])
      console.log(`finish inserting house ${i * bulkNum} to ${houseData.length - 1}`)
      break
    }
    try {
      await pool.query(q, [houseData.slice(i * bulkNum, (i + 1) * bulkNum)])
    console.log(`finish inserting house ${i * bulkNum} to ${(i + 1) * bulkNum}`)
    } catch(e) {
      console.log(`finish inserting house ${i * bulkNum} to ${(i + 1) * bulkNum} fail~~~~~~~`)
    }
  }
  console.log('finish inserting all houses tags')
}

async function insertHouse(houses) {
  
  const houseMap = {}
  const map = {}
  const categoryMap = await makeCategoryToIdMap()
  // const houses = await getMongo('591_data', 'cleansedHouseDataNew')
  console.log(houses.length)
  houses.forEach(house => {
    const {title, latitude, longitude, id} = house
  
      houseMap[id] = house
      // map[id] = house
    // })
  })
  // console.log(houseMap)
  const houseData = Object.values(houseMap).map(({id, title, area, category, price, layout, floor, shape, link, image, address, latitude, longitude, region, section}) => {
    area = area.replace('坪', '')
    return [id, title, categoryMap[category], area, price, layout, floor, shape, link, image, address, latitude, longitude, region, section]
  })

  const q = 'INSERT INTO house (id, title, category_id, area, price, layout, floor, shape, link, image, address, latitude, longitude, region, section) VALUES ?'
  // const values = Object.values(houseMap).map(house => [house])
  // console.log(values)
  let values = []
  const bulkNum = 1000
  const insertTimes = Math.floor(houseData.length / bulkNum) + 1
  for (let i = 0; i < insertTimes; i++) {
    if (i === insertTimes - 1) {
      await pool.query(q, [houseData.slice(i * bulkNum, houseData.length - 1)])
      console.log(`finish inserting house ${i * bulkNum} to ${houseData.length - 1}`)
      break
    }
    await pool.query(q, [houseData.slice(i * bulkNum, (i + 1) * bulkNum)])
    console.log(`finish inserting house ${i * bulkNum} to ${(i + 1) * bulkNum}`)
  }
  
  console.log('finish inserting all houses')
}

// async function

async function getHousesToInsert(cleansedDataOld, cleansedDataNew) {
  const q = 'SELECT id FROM house'
  // const [oldHouses] = await pool.query(q)
  const oldHouses = await getMongo("591_cleansed", cleansedDataOld)
  console.log('finish fetch old data')
  // console.log(cleansedData)
  const newHouses = await getMongo("591_cleansed", cleansedDataNew)
  console.log('finish fetch new data')

  const oldHouseIdMap = {}
  const newHouseIdMap = {}
  const houseMap = {}
  const houseIdsToDelete = []
  const houseIdsToInsert = []

  oldHouses.forEach(({id}) => {
    oldHouseIdMap[id] = true
  })
  newHouses.forEach((house) => {
    newHouseIdMap[house.id] = true
    houseMap[house.id] = house
  })
  // console.log(oldHouseIdMap)
  // console.log(newHouseIdMap)
  oldHouses.forEach(({id}) => {
    if (!newHouseIdMap[id]) {
      houseIdsToDelete.push(id)
    }
  })
  newHouses.forEach(({id}) => {
    if (!oldHouseIdMap[id]) {
      houseIdsToInsert.push(id)
    }
  })
  const housesToInsert = houseIdsToInsert.map(id => {
    return houseMap[id]
  })
  console.log(houseIdsToInsert.length)
  return housesToInsert
}

// getHousesToInsert(`${yesterday}houseDatacleansed`, `${today}houseDatacleansed`)

async function getHouseIdsToDelete(cleansedDataOld, cleansedDataNew) {
  const oldHouses = await getMongo("591_cleansed", cleansedDataOld)
  console.log('fetch old data')
  const newHouses = await getMongo("591_cleansed", cleansedDataNew)
  console.log('fetch new data')
  const oldHouseIdMap = {}
  const newHouseIdMap = {}
  const houseMap = {}
  const houseIdsToDelete = []
  const houseIdsToInsert = []

  oldHouses.forEach(({id}) => {
    oldHouseIdMap[id] = true
  })
  newHouses.forEach((house) => {
    newHouseIdMap[house.id] = true
    houseMap[house.id] = house
  })
  // console.log(oldHouseIdMap)
  // console.log(newHouseIdMap)
  oldHouses.forEach(({id}) => {
    if (!newHouseIdMap[id]) {
      houseIdsToDelete.push(id)
    }
  })
  // console.log(houseIdsToDelete)
  // console.log(houseIdsToDelete.length)
  return houseIdsToDelete
}
// const date = new Date()
// const day = date.getDate()
// const month = date.getMonth()
// const year = date.getFullYear()
// const todayDate = `${year}-${month + 1}-${day}`

// const yesterday =date.setDate(date.getDate()+1);
// dateTime=new Date(yesterday)
// console.log(yesterday)
// console.log(today)

// getHouseIdsToDelete(`${yesterday}houseDatacleansed`, `${today}houseDatacleansed`)

async function deleteHouse(cleansedDataOld, cleansedDataNew) {
  const houseIdsToDelete = await getHouseIdsToDelete(cleansedDataOld, cleansedDataNew)
  console.log(idsToDelete.length)
  const q = `DELETE FROM house
    WHERE id in (`+ pool.escape(houseIdsToDelete)+ `)
    ORDER BY id
    LIMIT 100`
  let affectedRows = 1
  let counter = 0
  while (affectedRows) {
    const [result] = await pool.query(q)
    affectedRows = result.affectedRows
    counter += affectedRows
    console.log(`finish delete ${counter} house`)
  }
  console.log('finish delete all houses needed')
}

// deleteHouse(`${yesterday}houseDatacleansed`, `${today}houseDatacleansed`)

async function test() {
  // const q = `DELETE FROM station_house_distance limit 2`
  // const [result] = await pool.query(q)
  // console.log(result.affectedRows)
  // if (!0) {
  //   console.log(go)
  // }
}
test()

// deleteHouse(`${yesterday}houseDatacleansed`, `${today}houseDatacleansed`)

async function updateHouse(cleansedData) {
  const q = 'SELECT id FROM house'
  const [oldHouses] = await pool.query(q)
  console.log('finish fetch sql data')
  // console.log(cleansedData)
  const newHouses = await getMongo("591_data", cleansedData)
  console.log('finish fetch mongo data')

  const oldHouseIdMap = {}
  const newHouseIdMap = {}
  const houseMap = {}
  const houseIdsToDelete = []
  const houseIdsToInsert = []

  oldHouses.forEach(({id}) => {
    oldHouseIdMap[id] = true
  })
  newHouses.forEach((house) => {
    newHouseIdMap[house.id] = true
    houseMap[house.id] = house
  })
  // console.log(oldHouseIdMap)
  // console.log(newHouseIdMap)
  oldHouses.forEach(({id}) => {
    if (!newHouseIdMap[id]) {
      houseIdsToDelete.push(id)
    }
  })
  newHouses.forEach(({id}) => {
    if (!oldHouseIdMap[id]) {
      houseIdsToInsert.push(id)
    }
  })

  // console.log(housesToInsert)
  // console.log(houseIdsToInsert.length)
  
  // console.log(houseIdsToDelete.length)
  // let whereIn = '(';
  // for ( let  i in houseIdsToDelete ) {
  //   console.log(i)
  //     if ( i != houseIdsToDelete.length - 1 ) {
  //         whereIn += "'" + houseIdsToDelete[i] + "',";
  //     }else{
  //         whereIn += "'" + houseIdsToDelete[i] + "'"; 
  //     }
  //  }
  // whereIn += ')';

  // console.log(houseIdsToDelete)
  // console.log(houseIdsToInsert.length)

  // DELETE
  // await pool.query( "DELETE from `house` where `id` IN ("+ pool.escape(houseIdsToDelete)+")");
 
  // INSERT
  const housesToInsert = houseIdsToInsert.map(id => {
    return houseMap[id]
  })
  await insertHouse(housesToInsert)
  
  // console.log(whereIn)
  // await pool.query("DELETE from hosue where id in ?", [houseIdsToDelete])
  console.log('finish')






































}

// updateHouse("cleansedHouseDataAutomated")

async function updateHouseTag(cleansedDataOld, cleansedDataNew) {
  const houseMap = {}
  const map = {}
  const tagMap = await makeTagMap()
  // const categoryMap = await makeCategoryToIdMap()
  // const houses = await getMongo('591_data', 'cleansedHouseDataNew')
  // console.log(houses.length)
  const houses = await getHousesToInsert(cleansedDataOld, cleansedDataNew)

  const houseData = []
  houses.forEach(({id, tags}) => {
    tags.forEach(tag => {
      // console.log(tag)
      houseData.push([id, tagMap[tag]])
    })
    // return [id, title, categoryMap[category], area, price, layout, floor, shape, link, image, address, latitude, longitude, region, section]
  })
  console.log(houseData.length)

  const q = 'INSERT INTO house_tag (house_id, tag_id) VALUES ?'
  // const values = Object.values(houseMap).map(house => [house])
  // console.log(values)
  let values = []
  const bulkNum = 1000
  const insertTimes = Math.floor(houseData.length / bulkNum) + 1
  for (let i = 0; i < insertTimes; i++) {
    if (i === insertTimes - 1) {
      console.log(insertTimes)
      // console.log(houseData.slice(i * bulkNum, houseData.length - 1))
      await pool.query(q, [houseData.slice(i * bulkNum, houseData.length - 1)])
      console.log(`finish inserting house tag ${i * bulkNum} to ${houseData.length - 1}`)
      break
    }
    try {
      await pool.query(q, [houseData.slice(i * bulkNum, (i + 1) * bulkNum)])
    console.log(`finish inserting house tag ${i * bulkNum} to ${(i + 1) * bulkNum}`)
    } catch(e) {
      console.log(`finish inserting house tag ${i * bulkNum} to ${(i + 1) * bulkNum} fail~~~~~~~`)
    }
  }
  console.log('finish inserting all houses tags')
}

// updateHouseTag("cleansedHouseDataNew", "cleansedHouseDataAutomated")

async function addLifeFunction() {
  const q = 'SELECT name, latitude, longitude FROM life_function'
  const [oldLifeFunction] = await pool.query(q)
  console.log('finish fetch old')
  const newHouses = await getMongo("591_data", "cleansedHouseDataAutomated")
  console.log('finish fetch new')
  const subtypeToIdMap = await makeSubypeToIdMap()
  const oldLifeFunctionMap = {}
  const lifeFuntionToInsertMap = {}
  // const lifeFuntionsToInsert = []
  oldLifeFunction.forEach(oldLifeFunction => {
    const {name, latitude, longitude} = oldLifeFunction
    if (name === '老蔡水煎包 民權店') {
      console.log(oldLifeFunction)
    }
    oldLifeFunctionMap[`${name}-${latitude}-${longitude}`] = oldLifeFunction
  })
  newHouses.forEach(house => {
    house.lifeFunction.forEach(type => {
      // const type = type.name
      type.children.forEach(subtype => {
        // const subtype = subtype.name
        subtype.children.forEach(({name, lat, lng, distance}) => {
          // console.log(lifeFunctionMap[`${name}-${lat}-${lng}`])
          // if (!lifeFunctionMap[`${name}-${Number(lat)}-${Number(lng)}`]) {
          //   console.log(name)
          //   console.log(Number(lat))
          //   console.log(Number(lng))
          //   if (name === '三重社區大學') console.log(`${name}-${Number(lat)}-${Number(lng)}`)
          // }
          if (!oldLifeFunctionMap[`${name}-${Number(lat)}-${Number(lng)}`]) {
            lifeFuntionToInsertMap[`${name}-${Number(lat)}-${Number(lng)}`] = [name, lat, lng, subtypeToIdMap[subtype.name]]
            
            // lifeFuntionsToInsert.push([name, lat, lng, subtypeToIdMap[subtype.name]])
            // if (name === "老蔡水煎包 民權店") {
            //   console.log('老菜')
            //   console.log(oldLifeFunctionMap[`${name}-${Number(lat)}-${Number(lng)}`])
            //   console.log(name)
            //   console.log(lat)
            //   console.log(lng)
            // }
          }
          // values.push([house.id, lifeFunctionMap[`${name}-${Number(lat)}-${Number(lng)}`], distance])
          // console.log(distance)
          // if 
          // lifeFunctionMap[`${name}-${lat}-${lng}`] = [name, lat, lng, subtypeToIdMap[subtype.name]]
        })
      })
    })
  })
  // console.log(lifeFuntionsToInsert)
  const lifeFuntionsToInsert = Object.values(lifeFuntionToInsertMap)
  console.log(lifeFuntionsToInsert.length)
  const q2 = 'INSERT INTO life_function (name, latitude, longitude, subtype_id) VALUES ?'
  await pool.query(q2, [lifeFuntionsToInsert])
  console.log('finish insert life_function')
}

// addLifeFunction()

async function insertHouseLifeFunction() {
  
  const [oldIds] = await pool.query('SELECT house_id from house_life_function')
  console.log(oldIds)
  console.log('fetch old id')
  const oldIdMap = {}
  const newIdMap = {}
  oldIds.forEach(({house_id}) => {
    oldIdMap[house_id] = true
  })
  // console.log(oldIdMap)
  // const oldLifeFunctionMap = {}
  // oldLifeFunctions.forEach(lifeFunction => {
  //   const {name, latitude, longitude} = lifeFunction
  //   oldLifeFunctionMap[`${name}-${latitude}-${longitude}`] = lifeFunction
  // })
  const lifeFunctionMap = await makeLifeFunctionMap()
  // const tagMap = await makeTagMap()
  // const categoryMap = await makeCategoryToIdMap()
  // const facilityMap = await makeFacilityMap()
  const newHouses = await getMongo('591_data', 'cleansedHouseDataAutomated')
  console.log('fetch new cleansed data')
  const houseMap = {}
  // newHouses.forEach(house => {
  //   const {title, latitude, longitude, id} = house
  //     houseMap[`${title}-${latitude}-${longitude}`] = house
  // })

  // const values = []
  const values = []
  const newHouseLifeFunctionMap = {}
  newHouses.forEach(house => {
    house.lifeFunction.forEach(type => {
      // const type = type.name
      type.children.forEach(subtype => {
        // const subtype = subtype.name
        subtype.children.forEach(({name, lat, lng, distance}) => {
          // console.log(lifeFunctionMap[`${name}-${lat}-${lng}`])
          // if (!lifeFunctionMap[`${name}-${Number(lat)}-${Number(lng)}`]) {
          //   console.log(name)
          //   console.log(Number(lat))
          //   console.log(Number(lng))
          //   if (name === '三重社區大學') console.log(`${name}-${Number(lat)}-${Number(lng)}`)
          // } 
          if (!oldIdMap[house.id]) {
            newIdMap[house.id] = house.id
            values.push([house.id, lifeFunctionMap[`${name}-${Number(lat)}-${Number(lng)}`], distance])
            // newHouseLifeFunctionMap[`${name}-${Number(lat)}-${Number(lng)}`] = [house.id, lifeFunctionMap[`${name}-${Number(lat)}-${Number(lng)}`], distance]
          }
          // values.push([house.id, lifeFunctionMap[`${name}-${Number(lat)}-${Number(lng)}`], distance])
          // console.log(distance)
          // if 
          // lifeFunctionMap[`${name}-${lat}-${lng}`] = [name, lat, lng, subtypeToIdMap[subtype.name]]
        })
      })
    })

  })
  // const values = Object.values(newHouseLifeFunctionMap)

  const newIds = Object.values(newIdMap)
  // console.log(newIds.length)
  // console.log(newHouseLifeFunctions)
  console.log(newIds.length)
  console.log(values.length)
  // return
  const q = 'INSERT INTO house_life_function (house_id, life_function_id, distance) VALUES ?'
  // const values = Object.values(lifeFunctionMap)
  // console.log(values)
  // console.log(values.length)
  const bulkNum = 10000
  const insertTimes = Math.floor(values.length / bulkNum) + 1
  for (let i = 0; i < insertTimes; i++) {
    // if (i!== insertTimes - 1) continue
    if (i === insertTimes - 1) {
      // console.log(values.slice(i * bulkNum, values.length - 1))
      values.slice(i * bulkNum, values.length - 1).forEach((value) => {
        if (!value[0]) console.log(value)
      })
      await pool.query(q, [values.slice(i * bulkNum, values.length - 1)])
      console.log(`finish inserting house life function ${i * bulkNum} to ${values.length - 1}`)
      break
    }
    await pool.query(q, [values.slice(i * bulkNum, (i + 1) * bulkNum)])
    console.log(`finish inserting house life function ${i * bulkNum} to ${(i + 1) * bulkNum}`)
  }
  // await pool.query(q, [values])
  console.log('finish inserting house life functions')
}

// insertHouseLifeFunction()

async function dumpMysqlToMongo() {
  const q = `SELECT * from house 
    JOIN house_tag
      ON house_tag.house_id = house.id
    JOIN house_life_function
      ON house_life_function.house_id = house.id
    LIMIT 1`
  const [result] = await pool.query(q)
  console.log(result[0])
}

// dumpMysqlToMongo()

// module.exports = {
//   insertHouseFirstTime,
//   insertHouseTag,
//   insertHouseLifeFunction
// }