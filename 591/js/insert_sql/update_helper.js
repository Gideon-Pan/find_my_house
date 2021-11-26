const { getMongo, getMongoOne, getHouseIds } = require('../../../server/models/db/mongo')
const pool = require('../../../server/models/db/mysql')
const Redis = require('../../../util/redis')
const {
  makeCategoryToIdMap,
  makeTagMap,
  makeLifeFunctionMap,
  makeSubypeToIdMap
} = require('./map')
const { today, yesterday } = require('./time')
const { sleep } = require('./sleep')
const { makeHouseMap } = require('../../../server/models/house_model')

async function insertHouse(houses) {
  const houseMap = {}
  const categoryMap = await makeCategoryToIdMap()
  console.log(houses.length, 'houses')
  houses.forEach((house) => {
    houseMap[house.id] = house
  })
  const houseData = Object.values(houseMap).map(
    ({
      id,
      title,
      area,
      category,
      price,
      layout,
      floor,
      shape,
      link,
      image,
      address,
      latitude,
      longitude,
      region,
      section
    }) => {
      area = area.replace('坪', '')
      return [
        id,
        title,
        categoryMap[category],
        area,
        price,
        layout,
        floor,
        shape,
        link,
        image,
        address,
        latitude,
        longitude,
        region,
        section
      ]
    }
  )

  const q = `INSERT INTO house (id, title, category_id, area, price, layout, floor, shape, link, image, address, latitude, longitude, region, section) VALUES ?
    ON DUPLICATE KEY UPDATE title = VALUES(title), category_id = VALUES(category_id), area = VALUES(area), price = VALUES(price), link=VALUES(link), address= VALUES(address), latitude = VALUES(latitude), longitude=VALUES(longitude)`
  const bulkNum = 10000
  const insertTimes = Math.floor(houseData.length / bulkNum) + 1
  for (let i = 0; i < insertTimes; i++) {
    if (i === insertTimes - 1) {
      await pool.query(q, [houseData.slice(i * bulkNum, houseData.length)])
      console.log(
        `finish inserting house ${i * bulkNum} to ${houseData.length}`
      )
      break
    }
    await pool.query(q, [houseData.slice(i * bulkNum, (i + 1) * bulkNum)])
    console.log(`finish inserting house ${i * bulkNum} to ${(i + 1) * bulkNum}`)
  }

  console.log('finish inserting all houses')
}

async function getHouseIdsToDelete(cleansedDataOld, cleansedDataNew) {
  const oldIds = await getHouseIds('591_cleansed', cleansedDataOld)
  console.log('fetch old data')
  const newIds = await getHouseIds('591_cleansed', cleansedDataNew)
  console.log('fetch new data')
  const newHouseIdMap = {}
  const houseIdsToDelete = []

  newIds.forEach((house) => {
    newHouseIdMap[house.id] = true
  })
  oldIds.forEach(({ id }) => {
    if (!newHouseIdMap[id]) {
      houseIdsToDelete.push(id)
    }
  })
  return houseIdsToDelete
}

async function test() {
  const date = new Date()
  const day = date.getDate()
  const month = date.getMonth()
  const year = date.getFullYear()
  const todayDate = `${year}-${month + 1}-${day}`
  
  const yesterday =date.setDate(date.getDate()+1);
  dateTime=new Date(yesterday)
  console.log(yesterday)
  console.log(today)
  
  getHouseIdsToDelete(`${yesterday}houseDatacleansed`, `${today}houseDatacleansed`)
}


async function deleteHouse(cleansedDataOld, cleansedDataNew) {
	const houseIdsToDelete = await getHouseIdsToDelete(
    cleansedDataOld,
    cleansedDataNew
  )
  if (houseIdsToDelete.length === 0) {
    console.log('no house need to be deleted')
    return
  }
	console.log(houseIdsToDelete.length, "houses to be deleted")
  const q =
    `DELETE FROM house
    WHERE id in (` +
    pool.escape(houseIdsToDelete) +
    `)
    ORDER BY id
    LIMIT 100`
  let affectedRows = 1
  let counter = 0
  while (affectedRows) {
    const [result] = await pool.query(q)
    affectedRows = result.affectedRows
    counter += affectedRows
    console.log(`finish delete ${counter} house`)
    await sleep(2)
  }
  console.log('finish delete all houses needed')
}

//deleteHouse(`${yesterday}houseDatacleansed`, `${today}houseDatacleansed`)

async function insertHouseTag(cleansedDataNew) {
  const tagMap = await makeTagMap()
  const houses = await getMongo('591_cleansed', cleansedDataNew)
  const houseData = []
  houses.forEach((house) => {
    const { id, tags } = house
    if (id == 11680801) {
      console.log(house)
    }
    tags.forEach((tag) => {
      houseData.push([id, tagMap[tag]])
    })
     })
  console.log(houseData.length, 'house tags')

  const q = `INSERT INTO house_tag (house_id, tag_id) VALUES ?
    ON DUPLICATE KEY UPDATE house_id = VALUES(house_id), tag_id = VALUES(tag_id)`

  const bulkNum = 10000
  const insertTimes = Math.floor(houseData.length / bulkNum) + 1
  for (let i = 0; i < insertTimes; i++) {
    if (i === insertTimes - 1) {
      try {
        await pool.query(q, [houseData.slice(i * bulkNum, houseData.length)])
        console.log(
          `finish inserting house tag ${i * bulkNum} to ${houseData.length}`
        )
        break
      } catch (e) {
        console.log(
          `finish inserting house tag ${i * bulkNum} to ${
            houseData.length
          } fail~~~~~~~`
        )
        console.log(e)
        break
      }
    }
    try {
      await pool.query(q, [houseData.slice(i * bulkNum, (i + 1) * bulkNum)])

      console.log(
        `finish inserting house tag ${i * bulkNum} to ${(i + 1) * bulkNum}`
      )
    } catch (e) {
      console.log(
        `finish inserting house tag ${i * bulkNum} to ${
          (i + 1) * bulkNum
        } fail~~~~~~~`
      )
    }
  }
  console.log('finish inserting all houses tags')
}

// insertHouseTag(`${today}houseDatacleansed`)

async function insertNewLifeFunction(cleansedDataNew) {
  const q = 'SELECT name, latitude, longitude FROM life_function'
  const [oldLifeFunction] = await pool.query(q)
  console.log('finish fetch old life function')
  // console.log(oldLifeFunction)
  const newHouses = await getMongo('591_cleansed', cleansedDataNew)
  console.log('finish fetch new life function')
  const subtypeToIdMap = await makeSubypeToIdMap()
  const oldLifeFunctionMap = {}
  const lifeFuntionToInsertMap = {}
  oldLifeFunction.forEach((oldLifeFunction) => {
    const { name, latitude, longitude } = oldLifeFunction
    oldLifeFunctionMap[`${name}-${latitude}-${longitude}`] = oldLifeFunction
  })
  newHouses.forEach((house) => {
    house.lifeFunction.forEach((type) => {
      // const type = type.name
      type.children.forEach((subtype) => {
        // const subtype = subtype.name
        subtype.children.forEach(({ name, lat, lng, distance }) => {
          // console.log(lifeFunctionMap[`${name}-${lat}-${lng}`])
          // if (!lifeFunctionMap[`${name}-${Number(lat)}-${Number(lng)}`]) {
          //   console.log(name)
          //   console.log(Number(lat))
          //   console.log(Number(lng))
          //   if (name === '三重社區大學') console.log(`${name}-${Number(lat)}-${Number(lng)}`)
          // }
          if (!oldLifeFunctionMap[`${name}-${Number(lat)}-${Number(lng)}`]) {
            lifeFuntionToInsertMap[`${name}-${Number(lat)}-${Number(lng)}`] = [
              name,
              lat,
              lng,
              subtypeToIdMap[subtype.name]
            ]

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
  const lifeFuntionsToInsert = Object.values(lifeFuntionToInsertMap)
  console.log(lifeFuntionsToInsert.length, 'new life functions')
  if (lifeFuntionsToInsert.length === 0) {
    return console.log('No update needed for life function')
  }
  const q2 =
    'INSERT INTO life_function (name, latitude, longitude, subtype_id) VALUES ?'
  await pool.query(q2, [lifeFuntionsToInsert])
  console.log('finish insert new life function')
}

// insertNewLifeFunction(`${today}houseDatacleansed`)

async function getLeakHouse(id) {
  const houses = await getMongo('591_cleansed', `${today}houseDatacleansed`)
  const leakHouse = houses.filter((house) => {
    return house.id == id
  })
  console.log('start insert')
  insertHouse(leakHouse)
  console.log('finish inserting leak house')
}

async function insertHouseLifeFunction(cleansedDataNew) {
  const houses = await getMongo('591_cleansed', cleansedDataNew)
  const lifeFunctionMap = await makeLifeFunctionMap()
  const houseLifeFunctionToInsertMap = {}
  houses.forEach((house) => {
    house.lifeFunction.forEach((type) => {
      type.children.forEach((subtype) => {
        subtype.children.forEach(({ name, lat, lng, distance }) => {
          const lifeFunctionId =
            lifeFunctionMap[`${name}-${Number(lat)}-${Number(lng)}`]
          houseLifeFunctionToInsertMap[`${house.id}-${lifeFunctionId}`] = [
            house.id,
            lifeFunctionMap[`${name}-${Number(lat)}-${Number(lng)}`],
            distance
          ]
        })
      })
    })
  })
  const houseLifeFunctionsToInsert = Object.values(houseLifeFunctionToInsertMap)
  console.log(houses.length, 'houses')
  console.log(houseLifeFunctionsToInsert.length, 'house life functions')
  const values = houseLifeFunctionsToInsert

  const q = `INSERT INTO house_life_function (house_id, life_function_id, distance) VALUES ?
    ON DUPLICATE KEY UPDATE distance = VALUES(distance)`
  const bulkNum = 10000
  const insertTimes = Math.floor(values.length / bulkNum) + 1
  for (let i = 0; i < insertTimes; i++) {
    if (i === insertTimes - 1) {
      values.slice(i * bulkNum, values.length - 1).forEach((value) => {
        if (!value[0]) console.log(value)
      })
      await pool.query(q, [values.slice(i * bulkNum, values.length)])
      console.log(
        `finish inserting house life function ${i * bulkNum} to ${
          values.length
        }`
      )
      break
    }
    await pool.query(q, [values.slice(i * bulkNum, (i + 1) * bulkNum)])
    console.log(
      `finish inserting house life function ${i * bulkNum} to ${
        (i + 1) * bulkNum
      }`
    )
    sleep(2)
  }
  console.log('finish inserting house life functions')
}

// insertHouseLifeFunction(`${today}houseDatacleansed`)

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

async function deleteHouseMapCache() {
  await sleep(3)
  Redis.del('houseMap')
  console.log('delete house map cache')
}

// deleteHouseMapCache()

async function setHouseMapCache() {
  await sleep(3)
  if (Redis.client.connected) {
    return await makeHouseMap()
  }
  console.log('not update cache')
}

module.exports = {
  deleteHouse,
  insertHouse,
  insertHouseTag,
  insertNewLifeFunction,
  insertHouseLifeFunction,
  deleteHouseMapCache,
  setHouseMapCache
}
