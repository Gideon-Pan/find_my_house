const { MongoClient } = require('mongodb')
// const getPtxData = require('../../../ptx_testing/metro-ptx');
const { MONGO_PASSWORD, MONGO_DATABASE } = process.env

const uri = MONGO_PASSWORD
  ? `mongodb+srv://Gideon:${MONGO_PASSWORD}@cluster0.0fwjx.mongodb.net/${MONGO_DATABASE}?retryWrites=true&w=majority`
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

async function insertMany(collection, data) {
  await client.connect()
  const db = client.db('ptx')
  await db.collection(collection).insertMany(data)
  console.log(`finishing insert data into ${collection} Collection`)
  await client.close()
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

// async function getCollectionSize(collectionName) {
//   await client.connect()
//   const db = client.db("ptx")
//   const size = await db.collection(collectionName).total
//   // console.log('Collection created')
//   console.log(size)
//   await client.close()
// }

module.exports = {
  createCollection,
  insertMany,
  getMongoData,
  get591MongoData,
  insertMany591
}
