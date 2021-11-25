const validator = require('validator')
const { ErrorData } = require('./error')

function validateEmail(email) {
  if (!email) {
    return new ErrorData(400, 'Request Error: email is required')
  }
  if (!validator.isEmail(email)) {
    return new ErrorData(400, 'Request Error: Invalid email format')
  }
}

function validatePassword(password) {
  if (!password) {
    return new ErrorData(400, 'Request Error: password is required')
  }
}

function validateName(name) {
  if (!name) {
    return new ErrorData(400, 'Request Error: name is required')
  }
}

function validateSignUpRequest(email, password, name) {
  const emailError = validateEmail(email)
  if (emailError) return emailError

  const passwordError = validatePassword(password)
  if (passwordError) return passwordError

  const nameError = validateName(name)
  if (nameError) return nameError
}

function validateSignInRequest(email, password) {
  const emailError = validateEmail(email)
  if (emailError) return emailError

  const passwordError = validatePassword(password)
  if (passwordError) return passwordError
}

module.exports = {
  validateSignUpRequest,
  validateSignInRequest
}
