let map
let markers = []
let houseMarkers = []
let houseInfowindow
let houseInfowindows = []
let circles = []
const polygons = []
let walkVelocity = 1.25

// const Justin = {
//   lat: 25.00921512991647,
//   lng: 121.52107052708763
// }
const Justin = {
  lat: 25.00252559374069,
  lng: 121.52802281285423
}
let officeLat = Justin.lat
let officeLng = Justin.lng

const Appworks = { lat: 25.042482379737326, lng: 121.5647583475222 }

function setMapOnAll(map) {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(map)
  }
}

// Removes the markers from the map, but keeps them in the array.
function hideMarkers() {
  setMapOnAll(null)
}

function setMapOnAllCircle(map) {
  for (let i = 0; i < circles.length; i++) {
    circles[i].setMap(map)
  }
}

// Removes the markers from the map, but keeps them in the array.
function hideCircles() {
  setMapOnAllCircle(null)
}

function initMap() {
  const myLatlng = { lat: 25.03746, lng: 121.532558 }
  // console.log(google)
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: myLatlng
  })

  const icon = {
    url: './assets/office-place.png', // url
    scaledSize: new google.maps.Size(30, 30), // scaled size
    origin: new google.maps.Point(0, 0), // origin
    anchor: new google.maps.Point(15, 20) // anchor
  }
  const marker = new google.maps.Marker({
    // position: { lat: 25.042482379737326, lng: 121.5647583475222 },
    position: Justin,
    map: map,
    icon: icon,
    draggable: true,
    zIndex: 99999999
  })

  marker.addListener('dragend', (mapsMouseEvent) => {
    officeLat = mapsMouseEvent.latLng.toJSON().lat
    officeLng = mapsMouseEvent.latLng.toJSON().lng
    search()
  })

  houseInfowindow = new google.maps.InfoWindow()

  // choose office by click
  // click.js
}

async function search() {
  const time1 = Date.now()
  const startWork = $('#start_work').val()
  const commuteTime = $('#commute_time').val() * 60
  const commuteWay = $('#commute_way').val()
  const maxWalkDistance = $('#walk_distance').val()
  const budget = $('#budget').val()
  const url = `/search?startWork=${startWork}&commuteTime=${commuteTime}&commuteWay=${commuteWay}&maxWalkDistance=${maxWalkDistance}&budget=${budget}&officeLat=${officeLat}&officeLng=${officeLng}`
  // const walk_distance = $("walk_distance").val()

  console.log(url)
  const { data } = await axios.get(url)
  console.log(data)
  const { positionData, houseData } = data

  hideCircles()
  circles = []
  removeReachableArea()
  clearHouses()
  renderHouses(houseData)

  return showReachableArea(positionData, time1)
  data.forEach((station) => {
    // Add the circle for this city to the map.
    const center = { lat: station.lat, lng: station.lng }
    const stationCircle = new google.maps.Circle({
      strokeColor: '#ff7500',
      strokeOpacity: 0.2,
      strokeWeight: 2,
      fillColor: '#ff7500',
      fillOpacity: 0.6,
      map,
      center,
      radius: station.distanceLeft
    })
    circles.push(stationCircle)
  })
  const time2 = Date.now()
  console.log('It takes total :', (time2 - time1) / 1000, 'seconds')
}

function clearHouses() {
  for (let houseMarker of houseMarkers) {
    houseMarker.setMap(null)
  }
  houseMarkers = []
}

// here
function renderHouses(houses) {
  houses.forEach((house, i) => {
    // console.log('a')
    const {
      title,
      link,
      category,
      image,
      price,
      address,
      latitude,
      longitude
    } = house
    const houseIcon = {
      // url: './assets/renting.png', // url
      // url: './assets/renting-house.jpg',
      // url: './assets/icon.jfif',
      // 2, 4 works
      url: './assets/2.png',
      scaledSize: new google.maps.Size(30, 30), // scaled size
      origin: new google.maps.Point(0, 0), // origin
      anchor: new google.maps.Point(15, 20) // anchor
      // anchor: new google.maps.Point(15, 20) // anchor
    }
    const houseMarker = new google.maps.Marker({
      // position: { lat: 25.042482379737326, lng: 121.5647583475222 },
      position: {
        lat: latitude,
        lng: longitude
      },
      map: map,
      icon: houseIcon,
      // label: `${i}`
    })
    const contentString = `  
  <div class="house-info">
      <img src=${image} width="125" height="100" />
      <p>房型：${category}</p>
      <p>價格：${price}元/月</p>
      <p>地址：${address}</p>
      <a href="${link}" target="_blank">查看更多</a>
    </div>
  `
    // const houseInfowindow = new google.maps.InfoWindow({
    //   content: contentString
    // })
    houseInfowindow.addListener('domready', () => {
      var test = $('.test')
      // test.html('test')
    })
    houseMarker.addListener('click', () => {
      houseInfowindow.open({
        anchor: houseMarker,
        map,
        shouldFocus: false
      })
    })
    // console.log(houseInfowindow)

    google.maps.event.addListener(map, 'click', function () {
      houseInfowindow.close()
    })
    // console.log(houseInfowindows)
    // if (houseMarkers.length !== 0) {
    // houseInfowindows.forEach((houseInfowindowOld) => {
    //   // console.log(houseInfowindowOld)
    //   houseInfowindowOld.close()
    //   houseInfowindowOld.setMap(null)
    // })
    // }
    google.maps.event.addListener(
      houseMarker,
      'click',
      (function (marker, content, infowindow) {
        lastOpenedInfoWindow = false
        return function () {
          closeLastOpenedInfoWindow()
          infowindow.setContent(content)
          infowindow.open(map, marker)
          lastOpenedInfoWindow = infowindow
        }
      })(houseMarker, contentString, houseInfowindow)
    )

    function closeLastOpenedInfoWindow() {
      if (lastOpenedInfoWindow) {
        lastOpenedInfoWindow.close()
      }
    }

    houseMarkers.push(houseMarker)
    // houseInfowindows.push(houseInfowindow)
  })
  // Add a marker clusterer to manage the markers.
  console.log(houseMarkers)
  // new markerClusterer.MarkerClusterer({ houseMarkers, map })
  new markerClusterer.MarkerClusterer(map, houseMarkers)
}

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

// console.log(google)
// var map = new google.maps.Map($('#map')[0], options);

// var options = {
//     zoom: 14,
//     center: mycity,
//     mapTypeId: google.maps.MapTypeId.ROADMAP
// };
function removeReachableArea() {
  for (let polygon of polygons) {
    polygon.setMap(null)
  }
}

async function showReachableArea(stations, time1) {
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
    // paths: [
    //   drawCircle(smallOne, 600 / 1609.344, 1),
    //   drawCircle(bigOne, 600 / 1609.344, 1)
    // ],

    // #ffa600
    // #9acd32 0.7
    // #90ee90 0.7
    // #065279 0.3
    // #ff7500 0.6
    paths,
    strokeColor: '#ff7500',
    strokeOpacity: 0.1,
    strokeWeight: 0,
    fillColor: '#ff7500',
    fillOpacity: 0.6
  })
  // console.log('jel')
  // console.log(joined)
  // console.log(map)
  joined.setMap(map)
  polygons.push(joined)
  const time2 = Date.now()
  console.log('It takes total :', (time2 - time1) / 1000, 'seconds')
}

async function testHouse() {
  const { houses } = await axios.get('/test')
  console.log(houses)
}

// testHouse()
