require('dotenv').config()
const bcrypt = require('bcrypt')
const pool = require('./db/mysql')
const salt = parseInt(process.env.BCRYPT_SALT)
const { TOKEN_SECRET } = process.env // 30 days by seconds
const jwt = require('jsonwebtoken')
const { ErrorData } = require('../../util/error')

async function signUp(email, password, name) {
  const conn = await pool.getConnection()
  try {
    await conn.query('START TRANSACTION')
    const [emails] = await conn.query(
      'SELECT email FROM user WHERE email = ? FOR UPDATE',
      [email]
    )
    if (emails.length > 0) {
      await conn.query('COMMIT')
      return {error: new ErrorData(403, 'Email Already Exists')}
    }
    const user = {
      provider: 'native',
      email,
      password: bcrypt.hashSync(password, salt),
      name,
    }
    const accessToken = jwt.sign(
      {
        provider: user.provider,
        name: user.name,
        email: user.email
      },
      TOKEN_SECRET
    )

    user['access_token'] = accessToken
    await conn.query('INSERT INTO user set ?', user)
    await conn.query('COMMIT')
    return {accessToken}
  } catch (error) {
    console.log(error)
    await conn.query('ROLLBACK')
    return {error: new ErrorData(500, error)} 
  } finally {
    await conn.release()
  }
}

async function nativeSignIn(email, password) {
  const conn = await pool.getConnection()
  try {
    await conn.query('START TRANSACTION')
    const [users] = await conn.query(
      'SELECT * FROM user WHERE email = ?',
      [email]
    )
    const user = users[0]
    // console.log(user)
    if (!user) {
      await conn.query('COMMIT')
      return { error: new ErrorData(400, 'Sign In Fail') }
    }

    if (!bcrypt.compareSync(password, user.password)) {
      await conn.query('COMMIT')
      return { error: new ErrorData(400, 'Sign In Fail') }
    }

    const accessToken = jwt.sign(
      {
        provider: user.provider,
        name: user.name,
        email: user.email
      },
      TOKEN_SECRET
    )

    return { accessToken }
  } catch (error) {
    console.log(error)
    return { error: new ErrorData(500, error) }
  } finally {
    await conn.release()
  }
}

const getUserDetail = async (email) => {
  try {
    const [users] = await pool.query('SELECT * FROM user WHERE email = ?', [
      email
    ])
    return users[0]
  } catch (e) {
    return null
  }
}

async function like(userId, houseId) {
  const values = [[userId, houseId, 1, new Date()]]
  const q = `INSERT INTO like_table (user_id, house_id, status, update_at) VALUES ?
		ON DUPLICATE KEY UPDATE status = VALUES(status)`
  await pool.query(q, [values])
}

async function dislike(userId, houseId) {
  const values = [userId, houseId]
  const q = `DELETE FROM like_table WHERE user_id = ? AND house_id = ?`
  await pool.query(q, values)
}

async function getLikes(userId) {
  const q = `SELECT house_id FROM like_table 
		WHERE user_id = ?
			AND status = 1`
  const values = [userId]
  const [result] = await pool.query(q, values)
  const houseIds = result.map(({ house_id }) => house_id)
  return houseIds
}

async function getLikeDetails(userId) {
  const q = `SELECT house.id AS house_id, house.latitude AS house_lat, house.longitude AS house_lng, 
    category.name AS category, area, price, link, image, house.address,
    life_function.id AS life_function_id, life_function.name AS life_function_name, 
    life_function.latitude AS life_function_lat, life_function.longitude AS life_function_lng, distance, 
    life_function_type.name AS type_name, life_function_subtype.name AS subtype_name, like_table.status AS like_status FROM life_function
  JOIN house_life_function
    ON house_life_function.life_function_id = life_function.id
  JOIN life_function_subtype
    ON life_function_subtype.id = life_function.subtype_id
  JOIN life_function_type
    ON life_function_type.id = life_function_subtype.type_id
  JOIN house
    ON house.id = house_life_function.house_id
  JOIN like_table
    ON like_table.house_id = house.id
  JOIN category
    ON category.id = house.category_id
  WHERE like_table.user_id = ?
  `
  const values = [userId]
  const [result] = await pool.query(q, values)
  const houseMap = {}
  result.forEach(
    ({
      house_id,
      house_lat,
      house_lng,
      category,
      area,
      price,
      link,
      image,
      address,
      life_function_id,
      life_function_name,
      life_function_lat,
      life_function_lng,
      distance,
      type_name,
      subtype_name
    }) => {
      if (!houseMap[house_id]) {
        houseMap[house_id] = {
          id: house_id,
          latitude: house_lat,
          longitude: house_lng,
          category,
          area,
          price,
          link,
          image,
          address,
          lifeFunction: {}
        }
      }

      if (!houseMap[house_id].lifeFunction[type_name]) {
        houseMap[house_id].lifeFunction[type_name] = {}
      }

      if (!houseMap[house_id].lifeFunction[type_name][subtype_name]) {
        houseMap[house_id].lifeFunction[type_name][subtype_name] = []
      }

      houseMap[house_id].lifeFunction[type_name][subtype_name].push({
        id: life_function_id,
        name: life_function_name,
        latitude: life_function_lat,
        longitude: life_function_lng,
        distance,
        type: type_name,
        subtype: subtype_name
      })
    }
  )
  return Object.values(houseMap)
}

module.exports = {
  signUp,
  nativeSignIn,
  getUserDetail,
  like,
  dislike,
  getLikes,
  getLikeDetails
}
