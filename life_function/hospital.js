const fs = require('fs')
const { insertMongo } = require('../server/models/db/mongo')
const getJson = function (jsonFilePath) {
  return new Promise((resolve, reject) => {
    // console.log(4)
    fs.readFile(jsonFilePath, 'utf8', (err, jsonString) => {
      if (err) {
        console.log(err)
        reject('File read failed:', err)
      }
      resolve(jsonString)
    })
  })
}

const getData = async function (path) {
  const json = await getJson(path)
  
  const data = JSON.parse(json)
  return data
  // id & name
}

async function main() {
  const data = await getData('./hospital.json')
  // console.log(Object.keys(data))
  // console.log(data.data)
  data.data[0]
  let counter1 = 0
  let counter2 = 0
  let counter3 = 0
  let counter4 = 0
  // console.log('data.data[0]: ', data.data[0]);
  // const map = {}
  const insertData = data.data.map(hospital => {
    // if (!hospital[2])
    if (!hospital[2].includes('台北市') && !hospital[2].includes('新北市')) {
      return
    }
    let type
    if (hospital[1].includes('醫院')) {
      // counter1++
      type = 'hospital'
    } else if (hospital[1].includes('診所')) {
      // counter2++
      type = 'clinic'
    } else if (hospital[1].includes('藥局')) {
      counter3++
      type = 'pharmacy'
      // console.log(hospital[1])
    } else if (hospital[1].includes('衛生所')) {
      counter4++
      type = 'healthCenter'
      // console.log(hospital[1])
    } else {
      // console.log(hospital[1])
      type = 'other'
    }
    return {
      type,
      name: hospital[1],
      address: hospital[2]
    }
    
  })
  // console.log(counter1)
  // console.log(counter2)
  // console.log(counter3)
  // console.log(counter4)
  console.log(insertData[0])
  await insertMongo('life_function', 'health', insertData)
}

main()