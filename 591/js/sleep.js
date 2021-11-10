async function sleep(n) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, n * 1000)
  })
}

// async function main() {
//   // console.log(0)
//   await sleep(3)
//   console.log(3)
// }

// main()
module.exports = {
  sleep
}
