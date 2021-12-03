const meterPerLat = 111319.5
const meterPerLng = 100848.6

function getDistance(position1, position2) {
  return Math.sqrt(getDistanceSquare(position1, position2))
}

// longitude 0.01 => 1008.486m
// latitude 0.01 => 1113.195m
const position1 = {
  latitude: 24.82779066186457,
  longitude: 121.26674450569816
}

const position2 = {
  latitude: 25.286790197826466,
  longitude: 121.93818339149594
}

function getDistanceSquare(position1, position2) {
  return (
    (position1.latitude - position2.latitude) * (position1.latitude - position2.latitude) * meterPerLat * meterPerLat +
    (position1.longitude - position2.longitude) *
      (position1.longitude - position2.longitude) *
      meterPerLng *
      meterPerLng
  )
}

module.exports = {
  getDistance,
  getDistanceSquare
}
