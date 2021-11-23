// const {getDistance} = require('geolib')

function getDistanceManuel(position1, position2) {
  return Math.sqrt(
    (position1.latitude - position2.latitude) * (position1.latitude - position2.latitude) * 111319.5 * 111319.5 +
      (position1.longitude - position2.longitude) * (position1.longitude - position2.longitude) * 100848.6 * 100848.6
  )
}

// 25.05
// 121.50

const position1 = {
  latitude: 24.82779066186457,
  longitude: 121.26674450569816
}

const position2 = {
  latitude: 25.286790197826466,
  longitude: 121.93818339149594
}

// const position1 = {
//   latitude: 25.05,
//   longitude: 121.53
// }

// const position2 = {
//   latitude: 25.05,
//   longitude: 121.54
// }

// longitude 0.01 => 1008.486m
// latitude 0.01 => 1113.195m
function getDistance(position1, position2) {
  return Math.sqrt(
    (position1.latitude - position2.latitude) *
      (position1.latitude - position2.latitude) *
      111319.5 *
      111319.5 +
      (position1.longitude - position2.longitude) *
        (position1.longitude - position2.longitude) *
        100848.6 *
        100848.6
  )
}

function getDistanceSquare(position1, position2) {
  return (
    (position1.latitude - position2.latitude) *
      (position1.latitude - position2.latitude) *
      111319.5 *
      111319.5 +
    (position1.longitude - position2.longitude) *
      (position1.longitude - position2.longitude) *
      100848.6 *
      100848.6
  )
}

// console.log(getDistance(position1, position2, 0.001))
// console.log(getDistanceManuel(position1, position2))

module.exports = {
  getDistance,
  getDistanceSquare
}