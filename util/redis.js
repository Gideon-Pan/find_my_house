const redis = require('redis')
const { promisify } = require('util')

const REDIS_PORT = 6379
const client = redis.createClient(REDIS_PORT, process.env.REDIS_HOST)

client.on('connect', () => {
  client.flushall()
  console.log('redis connected...')
})

client.on('error', (e) => {
  console.log('redis disconnected')
})

async function get(key) {
  const getPromisified = promisify(client.get).bind(client)
  return await getPromisified(key)
}

async function set(key, value) {
  const setPromisified = promisify(client.set).bind(client)
  return await setPromisified(key, value)
}

async function del(key) {
  const delPromisified = promisify(client.del).bind(client)
  return await delPromisified(key)
}

async function incr(key) {
  const incrPromisified = promisify(client.incr).bind(client)
  return await incrPromisified(key)
}

async function decr(key) {
  const decrPromisified = promisify(client.decr).bind(client)
  return await decrPromisified(key)
}

async function exec(key) {
  const execPromisified = promisify(client.exec).bind(client)
  return await execPromisified(key)
}

module.exports = {
  client,
  get,
  set,
  del,
  incr,
  decr
}
