const axios = require('axios')
const { makeWaitingTimeMap } = require('../../controller/make_graph')
require('dotenv').config()
const { get591MongoData } = require('../../model/db/mongodb/mongo_helper')
const db = require('../../model/db/mysql/mysql')

const { GOOGLE_MAP_KEY } = process.env

async function main() {
  const houses = await get591MongoData('houseData')
  let housesFilteredMap = {}
  const houseTypesAccepted = ['獨立套房', '分租套房', '雅房']
  // console.log(houses.length)
  houses.forEach((house) => {
    const { title, link, houseType, address, image, price } = house
    if (!title || !link || !houseType || !address || !image || !price) return
    // console.log(Number(price))
    priceNumber = Number(price)
    if (!priceNumber) {
      // console.log('gotit')
      // console.log(price)
      return
    }
    const includeNumber = /[0-9]/
    if (!includeNumber.test(address)) {
      // console.log(address)
      return
    }
    // if ()
    if (houseTypesAccepted.includes(houseType)) {
      housesFilteredMap[title] = house
      // houseMap[title] = house
    }
    
  })
  while(houses.length !== 0) {
    houses.pop()
  }
  // console.log(Object.keys(houseMap).length)
  // console.log(houses.length)
  let housesFiltered = Object.values(housesFilteredMap)
  console.log(housesFiltered.length)
  housesFiltered = housesFiltered.slice(50 * 22)
// tmp
// const values = []
//   console.log('start insert data')
//   const q = 'INSERT INTO house (title, link, category, image, price, address) VALUES ?'
//   housesFiltered.forEach(house => {
//     const {title, link, houseType, image, price, address} = house
//     values.push([title, link, houseType, image, price, address])
//   })
//   // console.log(values)
//   const print = values.slice(0, 50)
//   // console.log(print)
//   await db.query(q, [values])
//   console.log(`finish inserting ${housesInserting.length} houses into mysql`)

  // return
  const insertTimes = Math.floor(housesFiltered.length / 50) + 1
  for (let i = 0; i < insertTimes; i++) {
    let housesInserting
    if (i === insertTimes - 1) {
      housesInserting = housesFiltered.slice(i * 50, housesFiltered.length)
    } else {
      housesInserting = housesFiltered.slice(i * 50, (i + 1) * 50)
    }
    // const housesInserting = housesFiltered.splice(i, i + 50)
    // console.log(housesInserting)
    await addGeoInfo(housesInserting)
    console.log("finish add geo info first", i + 1 ,"times")
    await insertHouse(housesInserting)
    console.log("finish inserting", i + 1, "times (each time 50 items)")
  }
  console.log('finish inserting all data')

  // console.log(testHouses)
  // const insertData = []
  // let counter  = 0
  
  // console.log(housesInserting)
  
  
  // const {data} = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAP_KEY}`)
  // console.log(data.results[0])
}

async function addGeoInfo(housesInserting) {
  for (let house of housesInserting) {
    const data = await getGeoPostition(house.address)
    // counter++
    // console.log(counter)
    const geometry = data.results[0].geometry
    // console.log(geometry.location_type)
    const {location, location_type} = geometry
    const {lat, lng} = location
    // console.log(lat)
    // console.log(lng)
    if (location_type == 'ROOFTOP') {
      house.latitude = lat
      house.longitude = lng
    }
    // console.log(geometry.location_type === 'ROOFTOP')
    // console.log(location_type)
    // console.log(location_type === 'ROOFTOP')
    // console.log(lat)
    // console.log(lng)
  }
}

async function insertHouse(housesInserting) {
  const values = []
  console.log('start insert data')
  const q = 'INSERT INTO house (title, link, category, image, price, address, latitude, longitude) VALUES ?'
  housesInserting.forEach(house => {
    const {title, link, houseType, image, price, address, latitude, longitude} = house
    values.push([title, link, houseType, image, price, address, latitude, longitude])
  })
  // console.log(values)
  await db.query(q, [values])
  console.log(`finish inserting ${housesInserting.length} houses into mysql`)
}

async function getGeoPostition(address) {
  // address = '新北市新莊區新北大道七段748號'
  const { data } = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${GOOGLE_MAP_KEY}`
  )
  // console.log(data)
  // console.log(data.results[0])
  return data
  console.log(data.results[0].geometry)
}

// getGeoPostition()


// data.results[0].geometry
const data = {
  location: { lat: 25.0253117, lng: 121.4125682 },
  location_type: 'ROOFTOP',
  viewport: {
    northeast: { lat: 25.02666068029151, lng: 121.4139171802915 },
    southwest: { lat: 25.0239627197085, lng: 121.4112192197085 }
  }
}


const datas = {
  address_components: [
    { long_name: '748', short_name: '748', types: [Array] },
    {
      long_name: 'Section 7, New Taipei Boulevard',
      short_name: 'Section 7, New Taipei Blvd',
      types: [Array]
    },
    {
      long_name: 'Xinzhuang District',
      short_name: 'Xinzhuang District',
      types: [Array]
    },
    {
      long_name: 'New Taipei City',
      short_name: 'New Taipei City',
      types: [Array]
    },
    { long_name: '242', short_name: '242', types: [Array] }
  ],
  formatted_address:
    'No. 748, Section 7, New Taipei Blvd, Xinzhuang District, New Taipei City, Taiwan 242',
  geometry: {
    location: { lat: 25.0253117, lng: 121.4125682 },
    location_type: 'ROOFTOP',
    viewport: { northeast: [Object], southwest: [Object] }
  },
  place_id: 'ChIJeWWySY-nQjQR0H-_9biGa-0',
  plus_code: {
    compound_code: '2CG7+42 Xinzhuang District, New Taipei City, Taiwan',
    global_code: '7QQ32CG7+42'
  },
  types: ['street_address']
}
