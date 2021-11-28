function drawCircle(point, radius, dir) {
  var d2r = Math.PI / 180 // degrees to radians
  var r2d = 180 / Math.PI // radians to degrees
  var earthsradius = 3963 // 3963 is the radius of the earth in miles
  var points = 32

  // find the raidus in lat/lon
  var rlat = (radius / earthsradius) * r2d
  var rlng = rlat / Math.cos(point.lat() * d2r)

  var extp = new Array()
  if (dir == 1) {
    var start = 0
    var end = points + 1
  } // one extra here makes sure we connect the
  else {
    var start = points + 1
    var end = 0
  }
  for (var i = start; dir == 1 ? i < end : i > end; i = i + dir) {
    var theta = Math.PI * (i / (points / 2))
    ey = point.lng() + rlng * Math.cos(theta) // center a + radius x * cos(theta)
    ex = point.lat() + rlat * Math.sin(theta) // center b + radius y * sin(theta)
    extp.push(new google.maps.LatLng(ex, ey))
  }
  return extp
}

function removeReachableArea() {
  for (let polygon of polygons) {
    polygon.setMap(null)
  }
}

async function showReachableArea(stations, time1) {
  const time0 = Date.now()
  var mycity = new google.maps.LatLng(25, 121.52)
  var bigOne = new google.maps.LatLng(25, 121.53)
  var smallOne = new google.maps.LatLng(25, 121.52)
  // console.log('he')
  const paths = stations.map((station) => {
    const { lat, lng, distanceLeft } = station
    return drawCircle(
      new google.maps.LatLng(lat, lng),
      distanceLeft / 1609.366,
      1
    )
  })
  var joined = new google.maps.Polygon({
    paths,
    strokeColor: '#D8A08A',
    strokeOpacity: 0.1,
    strokeWeight: 0,
    fillColor: '#D8A08A',
    fillOpacity: 0.6
  })
  joined.setMap(map)
  joined.addListener('click', () => {
    closeLastOpenedInfoWindow()
  })
  polygons.push(joined)
}