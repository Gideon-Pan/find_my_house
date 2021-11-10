// async function get()

const todayDate = new Date()
const day = todayDate.getDate()
const month = todayDate.getMonth()
const year = todayDate.getFullYear()
const today = `${year}-${month + 1}-${day}`

const yesterdayData = todayDate.setDate(todayDate.getDate() - 1)
const yesterdayDate = new Date(yesterdayData)
const yesterdayDay = yesterdayDate.getDate()
const yesterdayMonth = yesterdayDate.getMonth()
const yesterdayYear = yesterdayDate.getFullYear()
const yesterday = `${yesterdayYear}-${yesterdayMonth + 1}-${yesterdayDay}`

// console.log(today)
// console.log(yesterday)

module.exports = {
  today,
  yesterday
}
