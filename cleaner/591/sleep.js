async function sleep(n) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, n * 1000)
  })
}

module.exports = {
  sleep
}
