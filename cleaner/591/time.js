// get formatted today date
const todayDate = new Date()
let day = todayDate.getDate()
day = day < 10 ? '0' + day : day
const month = todayDate.getMonth()
const year = todayDate.getFullYear()
const today = `${year}-${month + 1}-${day}`
// get formatted yesterday date
const yesterdayData = todayDate.setDate(todayDate.getDate() - 1)
const yesterdayDate = new Date(yesterdayData)
let yesterdayDay = yesterdayDate.getDate()
yesterdayDay = yesterdayDay < 10 ? '0' + yesterdayDay : yesterdayDay
const yesterdayMonth = yesterdayDate.getMonth()
const yesterdayYear = yesterdayDate.getFullYear()
const yesterday = `${yesterdayYear}-${yesterdayMonth + 1}-${yesterdayDay}`

// get formatted date for three days ago
const deleteData = todayDate.setDate(todayDate.getDate() - 2)
const deleteDate = new Date(deleteData)
let deleteDay = deleteDate.getDate()
deleteDay = deleteDay < 10 ? '0' + deleteDay : deleteDay
const deleteMonth = deleteDate.getMonth()
const deleteYear = deleteDate.getFullYear()
const deleteDateComplete = `${deleteYear}-${deleteMonth + 1}-${deleteDay}`

module.exports = {
  today,
  yesterday,
  deleteDateComplete
}

