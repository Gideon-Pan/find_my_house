// const { default: axios } = require("axios")

// const { getLikes } = require("../../server/controllers/user_controller")

let map
let markers = []
let houseMarkers = []
let houseInfowindow
let houseInfowindows = []
let circles = []
let markerCluster
const polygons = []
let walkVelocity = 1.25
let currentId
let houseLat
let houseLng
let lines = []
let lifeFunctions = []
let currentHouse
let currentLifeFunctionType
let lifeFunctionInfowindow
let selectedHouseId
let likeMap = {}

// const Justin = {
//   lat: 25.00921512991647,
//   lng: 121.52107052708763
// }
// const Justin = {
//   lat: 25.00252559374069,
//   lng: 121.52802281285423
// }

// 板橋
// const Justin = {
//   lat: 25.035230849112928,
//   lng: 121.47554807568687
// }

// 學校
const Justin = {
  lat: 25.04222965263713,
  lng: 121.5648119917025
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
  // console.log('fuc')
  const myLatlng = { lat: 25.03746, lng: 121.532558 }
  // console.log(google)
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: myLatlng,
    disableDefaultUI: true,
    scaleControl: true
  })

  const icon = {
    url: './assets/office-place.png', // url
    scaledSize: new google.maps.Size(45, 45), // scaled size
    origin: new google.maps.Point(0, 0), // origin
    anchor: new google.maps.Point(20, 25) // anchor
  }
  const officeMarker = new google.maps.Marker({
    // position: { lat: 25.042482379737326, lng: 121.5647583475222 },
    position: Justin,
    map: map,
    icon: icon,
    draggable: true,
    zIndex: 99999999
  })

  officeMarker.addListener('dragend', (mapsMouseEvent) => {
    officeLat = mapsMouseEvent.latLng.toJSON().lat
    officeLng = mapsMouseEvent.latLng.toJSON().lng
    search()
  })

  houseInfowindow = new google.maps.InfoWindow()
  lifeFunctionInfowindow = new google.maps.InfoWindow()
  // console.log(houseInfowindow)
  // console.log(lifeFunctionInfowindow)
  // choose office by click
  // click.js
}

async function search() {
  // const test = $('#test').val()
  // console.log(test)
  const time1 = Date.now()
  const period = $('#period').val()
  const commuteTime = $('#commute_time').val() * 60
  const commuteWay = $('#commute_way').val()
  const maxWalkDistance = $('#walk_distance').val()
  const budget = $('#budget').val()
  const houseType = $('#house-type').val()
  // const fire = $('#fire').val()
  const fire = document.querySelector('#fire').checked
  // console.log(fire)
  const shortRent = document.querySelector('#short-rent').checked
  // console.log(shortRent)
  const directRent = document.querySelector('#direct-rent').checked
  // console.log(directRent)
  const pet = document.querySelector('#pet').checked
  // console.log(pet)
  const newItem = document.querySelector('#new-item').checked
  // console.log(newItem)
  // const tags =

  if (period === null) {
    Swal.fire({
      title: '請選擇通勤時段',
      heightAuto: false
      // text: 'Something went wrong!',
      // footer: '<a href="">Why do I have this issue?</a>'
    })
    // alert('請選擇通勤時段')
    return
  }
  // console.log(commuteTime)
  if (!commuteTime) {
    
    // alert('請選擇通勤時間')
    Swal.fire({
      title: '請選擇通勤時間',
      heightAuto: false
      // text: 'Something went wrong!',
      // footer: '<a href="">Why do I have this issue?</a>'
    })
    return
  }
  if (commuteWay === null) {
    Swal.fire({
      title: '請選擇交通方式',
      heightAuto: false
      // text: 'Something went wrong!',
      // footer: '<a href="">Why do I have this issue?</a>'
    })
    // alert('請選擇交通方式')
    return
  }
  if (maxWalkDistance === null) {
    Swal.fire({
      title: '步行距離',
      heightAuto: false
      // text: 'Something went wrong!',
      // footer: '<a href="">Why do I have this issue?</a>'
    })
    // alert('請選擇步行距離')
    return
  }
  const url = `/search?period=${period}&commuteTime=${commuteTime}&commuteWay=${commuteWay}&maxWalkDistance=${maxWalkDistance}&budget=${budget}&officeLat=${officeLat}&officeLng=${officeLng}&houseType=${houseType}&fire=${fire}&shortRent=${shortRent}&directRent=${directRent}&pet=${pet}&newItem=${newItem}`
  // const walk_distance = $("walk_distance").val()

  console.log(url)
  const { data } = await axios.get(url)
  console.log(data)
  const { positionData, houseData } = data

  hideCircles()
  circles = []
  removeLines()
  removeRadio()
  clearLifeFunction()
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

function clearLifeFunction() {
  for (let lifeFunction of lifeFunctions) {
    lifeFunction.setMap(null)
  }
  lifeFunctions = []
}

// here
function renderHouses(houses) {
  while (markers.length !== 0) {
    markers.pop()
  }
  // markerClusterer.clearMarkers();
  houses.forEach((house, i) => {
    // console.log('a')
    let {
      title,
      area,
      link,
      category,
      image,
      price,
      address,
      latitude,
      longitude,
      id
    } = house
    // currentId = id
    if (area % 1 !== 0) {
      area = area.toFixed(1)
    }

    const houseIcon = {
      // url: './assets/renting.png', // url
      // url: './assets/renting-house.jpg',
      // url: './assets/icon.jfif',
      // 2, 4 works
      url: './assets/4.png',
      scaledSize: new google.maps.Size(30, 30), // scaled size
      origin: new google.maps.Point(0, 0), // origin
      anchor: new google.maps.Point(15, 20) // anchor
      // anchor: new google.maps.Point(15, 20) // anchor
    }
    const marker = new google.maps.Marker({
      // position: { lat: 25.042482379737326, lng: 121.5647583475222 },
      position: {
        lat: latitude,
        lng: longitude
      },
      map: map,
      icon: houseIcon,
      zIndex: 2
      // label: `${i}`
    })
    const contentString = `  
  <div class="house-info">
      <img src="${image}" onerror="this.src='./assets/no-img.png'" width="125" height="100" />
      <p>房型：${category}, ${area}坪</p>
      <p>價格：${price}元/月</p>
      <p>地址：${address}</p>
      <a href="${link}" target="_blank">查看更多</a>
      <button class="like" onclick="like()">加入收藏</button>
      <button class="dislike" onclick="dislike()">取消收藏</button>
    </div>
  `
    // <a href="flat-share.html" target="_blank">徵室友</a>
    // const houseInfowindow = new google.maps.InfoWindow({
    //   content: contentString
    // })
    houseInfowindow.addListener('domready', () => {
      var test = $('.test')
      // test.html('test')
    })
    marker.addListener('click', () => {
      houseInfowindow.open({
        anchor: marker,
        map,
        shouldFocus: false
      })
    })
    marker.addListener(
      'click',
      (function (id) {
        return function () {
          selectedHouseId = id
        }
      })(id)
    )
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
      marker,
      'click',
      (function (marker, content, infowindow) {
        lastOpenedInfoWindow = false
        return function () {
          closeLastOpenedInfoWindow()
          // console.log(infowindow)
          infowindow.setContent(content)
          infowindow.open(map, marker)
          lastOpenedInfoWindow = infowindow
          // console.log('hi')
          // console.log(id)
          // currentId = id
        }
      })(marker, contentString, houseInfowindow)
    )

    google.maps.event.addListener(
      marker,
      'click',
      (function (id) {
        return async function () {
          clearLifeFunction()
          removeLines()
          console.log(id)
          const { data } = await axios.get(
            `/api/1.0/house/details?id=${id}`
          )
          console.log(data)
          document
            .querySelector('.radio')
            .setAttribute('style', 'display: inline;')
          // console.log($('.radio').attr("display"))

          if (!currentLifeFunctionType) {
            currentLifeFunctionType = 'traffic'
          }

          currentHouse = data
          switch (currentLifeFunctionType) {
            case 'traffic':
              getTraffic()
              break
            case 'life':
              getLife()
              break
            case 'food':
              getFood()
              break
            default:
              console.log('what')
          }
        }
      })(id)
    )

    // google.maps.event.addListener(marker, 'click', async () => {
    //   // console.log(currentId)
    //   const {data} = await axios.get(`/api/1.0/house/life-function?id=${currentId}`)
    //   console.log(data)
    //   const  {coordinate} = data
    //   const houseCoordinate = {lat: coordinate.latitude, lng: coordinate.longitude}
    //   const stations = data['交通']['捷運']
    //   // const currentId
    //   stations.forEach(station => {
    //     const {id, name, latitude, longitude, distance, subtype, type} = station
    //     // coordinates.push({lat: latitude, lng: longitude})
    //     const spotCoordinate = {lat: latitude, lng: longitude}
    //     const flightPath = new google.maps.Polyline({
    //       path: [houseCoordinate, spotCoordinate],
    //       geodesic: true,
    //       strokeColor: "#FF0000",
    //       strokeOpacity: 1.0,
    //       strokeWeight: 2,
    //     });

    //     flightPath.setMap(map);
    //     console.log('here')
    //   })
    //   // const flightPlanCoordinates = [
    //   //   { lat: 37.772, lng: -122.214 },
    //   //   { lat: 21.291, lng: -157.821 },
    //   //   { lat: -18.142, lng: 178.431 },
    //   //   { lat: -27.467, lng: 153.027 },
    //   // ];

    // })

    function closeLastOpenedInfoWindow() {
      if (lastOpenedInfoWindow) {
        lastOpenedInfoWindow.close()
      }
    }

    markers.push(marker)
    // houseInfowindows.push(houseInfowindow)
  })
  // Add a marker clusterer to manage the markers.
  // console.log(markers)
  // new markerClusterer.MarkerClusterer({ houseMarkers, map })
  // new markerClusterer.MarkerClusterer(map, markers)
  mcOptions = {
    styles: [
      {
        height: 53,
        // url: "http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/images/m1.png",
        width: 53
      },
      {
        height: 56,
        // url: "https://github.com/googlemaps/js-marker-clusterer/tree/gh-pages/images/m2.png",
        width: 56
      },
      {
        height: 66,
        // url: "https://github.com/googlemaps/js-marker-clusterer/tree/gh-pages/images/m3.png",
        width: 66
      },
      {
        height: 78,
        // url: "https://github.com/googlemaps/js-marker-clusterer/tree/gh-pages/images/m4.png",
        width: 78
      },
      {
        height: 90,
        // url: "https://github.com/googlemaps/js-marker-clusterer/tree/gh-pages/images/m5.png",
        width: 90
      }
    ]
  }
  if (markerCluster) {
    markerCluster.clearMarkers()
  }
  markerCluster = new markerClusterer.MarkerClusterer({ markers, map })
}

function removeLines() {
  lines.forEach((line) => {
    line.setMap(null)
  })
  lines = []
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

function removeRadio() {
  document.querySelector('.radio').setAttribute('style', 'display: none;')
}

async function init() {
  const access_token = window.localStorage.getItem('access_token')
  try {
    const { data } = await axios.get('/api/1.0/user/checkAuth', {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    })
    console.log('authenticated')
    $('.signout').html('<div onclick="signout()">登出</div>')
  } catch {
    console.log('not authenticated')
    $('.signout').html('<a href="/signin.html">登入</div>')
    $('.avator').css('display', 'none')
  }
}

function signout() {
  window.localStorage.removeItem('access_token')
  location.href = '/'
}

function showLifeFunction(type, subtype) {
  // clearLifeFunction()
  removeLines()
  // removeRadio()
  const { coordinate } = currentHouse

  const houseCoordinate = {
    lat: coordinate.latitude,
    lng: coordinate.longitude
  }
  const stations = currentHouse.lifeFunction[type][subtype]
  // const currentId
  stations.forEach((station) => {
    const { id, name, latitude, longitude, distance, subtype, type } = station
    // coordinates.push({lat: latitude, lng: longitude})

    // make line
    const spotCoordinate = { lat: latitude, lng: longitude }
    // const line = new google.maps.Polyline({
    //   path: [houseCoordinate, spotCoordinate],
    //   geodesic: true,
    //   strokeColor: '#000000',
    //   strokeOpacity: 1.0,
    //   strokeWeight: 5,
    //   'z-index': 2
    // })
    // line.setMap(map)
    // lines.push(line)

    // make marker
    const lifeFunction = new google.maps.Marker({
      position: spotCoordinate,
      // label: name,
      map: map
    })
    // console.log(lifeFunctionInfowindow)
    lifeFunction.addListener(
      'mouseover',
      (function (marker, content, infowindow) {
        return function () {
          // console.log('hover life function')
          // console.log(infowindow)
          infowindow.setContent(content)
          infowindow.open(map, marker)
        }
      })(lifeFunction, `<p>${name}</p>`, lifeFunctionInfowindow)
    )
    // assuming you also want to hide the infowindow when user mouses-out
    lifeFunction.addListener('mouseout', function () {
      lifeFunctionInfowindow.close()
    })
    lifeFunctions.push(lifeFunction)
    // console.log('here')
  })
}

function getTraffic() {
  clearLifeFunction()
  currentLifeFunctionType = 'traffic'
  showLifeFunction('交通', '捷運')
  showLifeFunction('交通', '公車')
}

function getLife() {
  clearLifeFunction()
  currentLifeFunctionType = 'life'
  showLifeFunction('生活', '購物')
}

function getFood() {
  clearLifeFunction()
  currentLifeFunctionType = 'food'
  showLifeFunction('生活', '餐飲')
}

async function like() {
  const access_token = window.localStorage.getItem('access_token')
  // console.log('here')
  // console.log(access_token)
  console.log(selectedHouseId)
  try {
    const { data } = await axios.post(
      '/api/1.0/user/like',
      {
        houseId: selectedHouseId
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      }
    )
    console.log('successfully like')
  } catch (e) {
    console.log(e)
    console.log('fail')
  }
}

async function dislike() {
  const access_token = window.localStorage.getItem('access_token')
  // console.log('here')
  // console.log(access_token)
  console.log(selectedHouseId)
  try {
    const { data } = await axios.delete('/api/1.0/user/like', {
      data: {
        houseId: selectedHouseId
      },
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    })
    console.log('successfully dislike')
  } catch (e) {
    console.log(e)
    console.log('fail')
  }
}

async function getLikes() {
  const access_token = window.localStorage.getItem('access_token')
  // console.log('here')
  // console.log(access_token)
  // console.log(selectedHouseId)
  try {
    const { data } = await axios.get(
      '/api/1.0/user/like',
      {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      }
    )
    // console.log('....')
    console.log(data)
    data.forEach(houseId => {
      likeMap[houseId] = true
    })
    console.log(likeMap)
    // console.log('successfully like')
  } catch (e) {
    console.log(e)
    console.log('fail')
  }
}

init()
getLikes()