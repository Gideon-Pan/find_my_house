const date = new Date()
// console.log(data.getDay())
const day = date.getDate()
console.log('day: ', day);
const month = date.getMonth()
console.log('month: ', month);
const year = date.getFullYear()
console.log('year: ', year);
// console.log(date)
const finalDate = `${year}-${month + 1}-${day}`
console.log(finalDate)