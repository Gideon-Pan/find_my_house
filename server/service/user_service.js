const UserModel = require('../models/user_model')

// async function signUp(email, password, name) {
//   const result = await UserModel.signUp(email, password, name)
//   return result
// }

// async function nativeSignIn(email, password) {
//   const result = await UserModel.nativeSignIn(email, password)
//   return result
// }

async function getLikeDetails(userId) {
  const houses = await UserModel.getLikeDetails(userId)
  // console.log(houses)
  const houseMap = {}
  houses.forEach(
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
  getLikeDetails
}
