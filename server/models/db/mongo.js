const { MongoClient } = require('mongodb')
require('dotenv').config()
const { MONGO_PASSWORD, MONGO_HOST, MONGO_DATABASE } = process.env
const uri = MONGO_PASSWORD
  ? `mongodb://mongouser:${MONGO_PASSWORD}@${MONGO_HOST}:27017/?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false`
  : 'mongodb://127.0.0.1:27017'
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

async function createCollection(collectionName) {
  await client.connect()
  const db = client.db('ptx')
  await db.createCollection(collectionName)
  console.log('Collection created')
  await client.close()
}

async function getHouseIds(database, collection) {
  await client.connect()
  const db = client.db(database)
  console.log
  const data = await db.collection(collection).find({}, { projection: { _id: 0 ,id:1 }}).toArray()
  await client.close()
  return data
}

async function insertMongo(database, collection, data) {
  await client.connect()
  const db = client.db(database)
  await db.collection(collection).insertMany(data)
  console.log(`finishing insert data into ${collection} Collection`)
  await client.close()
}

async function insertMany(collection, data) {
  await client.connect()
  const db = client.db('ptx')
  await db.collection(collection).insertMany(data)
  console.log(`finishing insert data into ${collection} Collection`)
  await client.close()
}

async function getMongo(database, collection) {
  await client.connect()
  const db = client.db(database)
  const data = await db.collection(collection).find({}).toArray()
  return data
}

async function getMongoOne(database, collection) {
  await client.connect()
  const db = client.db(database)
  const data = await db.collection(collection).findOne({})
  await client.close()
  return [data]
}

async function getMongoData(collection) {
  await client.connect()
  const db = client.db('ptx')
  const data = await db.collection(collection).find({}).toArray()
  await client.close()
  return data
}

async function insertMany591(collection, data) {
  await client.connect()
  const db = client.db('591_data')
  await db.collection(collection).insertMany(data)
  console.log(`finishing insert data into ${collection} Collection`)
  await client.close()
}

async function get591MongoData(collection) {
  await client.connect()
  const db = client.db('591_data')
  const data = await db.collection(collection).find({}).toArray()
  await client.close()
  return data
}

async function dropMongoCollection(database, collection) {
  await client.connect()
  const db = client.db(database)
  await db.collection(collection).drop()
  await client.close()
}

module.exports = {
  createCollection,
  insertMany,
  getMongoData,
  get591MongoData,
  insertMany591,
  insertMongo,
  getMongo,
  getMongoOne,
  getHouseIds,
  dropMongoCollection
}
