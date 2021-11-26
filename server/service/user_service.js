const UserModel = require('../models/user_model')

async function signUp(email, password, name) {
  const result = await UserModel.signUp(email, password, name)
  return result
}

async function nativeSignIn(email, password) {
  const result = await UserModel.nativeSignIn(email, password)
  return result
}

module.exports = {
  signUp,
  nativeSignIn,
}
