const UserModel = require('../models/user_model')

async function signUp(email, password, name) {
  const result = await UserModel.signUp(email, password, name)
  return result
}

async function nativeSignIn(email, password) {
  const result = await UserModel.nativeSignIn(email, password)
  // if (result) {
  //   return result
  // }
  return result
  // await UserModel.
}

async function facebookSignIn(token) {
  try {
    const profile = await UserModel.getFacebookProfile(accessToken)
    const { id, name, email } = profile

    if (!id || !name || !email) {
      return {
        error:
          'Permissions Error: facebook access token can not get user user information'
      }
    }
    return await UserModel.facebookSignIn(id, User.USER_ROLE.USER, name, email)
  } catch {}
}

module.exports = {
  signUp,
  nativeSignIn,
  facebookSignIn
}
