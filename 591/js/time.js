// async function get()

const todayDate = new Date()
const day = todayDate.getDate()
const month = todayDate.getMonth()
const year = todayDate.getFullYear()
const today = `${year}-${month + 1}-${day}`

const yesterdayData = todayDate.setDate(todayDate.getDate() - 1)
// console.log(yesterdayData)
const yesterdayDate = new Date(yesterdayData)
console.log('yesterdayDate: ', yesterdayDate);
const yesterdayDay = yesterdayDate.getDate()
const yesterdayMonth = yesterdayDate.getMonth()
const yesterdayYear = yesterdayDate.getFullYear()
const yesterday = `${yesterdayYear}-${yesterdayMonth + 1}-${yesterdayDay}`

const deleteData = todayDate.setDate(todayDate.getDate() - 2)
// console.log(deleteData)
const deleteDate = new Date(deleteData)
console.log('deleteDate: ', deleteDate);
const deleteDay = deleteDate.getDate()
const deleteMonth = deleteDate.getMonth()
const deleteYear = deleteDate.getFullYear()
const deleteDateComplete = `${deleteYear}-${deleteMonth + 1}-${deleteDay}`

// console.log(today)
// console.log(yesterday)
// console.log(deleteDateComplete)

module.exports = {
  today,
  yesterday,
  deleteDateComplete
}
