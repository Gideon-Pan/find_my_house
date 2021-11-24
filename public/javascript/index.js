// const { default: axios } = require("axios")

// const { sleep } = require("../../591/js/sleep")

// const { getLikes } = require("../../server/controllers/user_controller")

let map
let markers = []
const markerMap = {}
// let houseMarkers = []
let houseInfowindow
let houseInfowindows = []
let circles = []
let markerCluster
const polygons = []
let walkVelocity = 1.25
// let currentId
let houseLat
let houseLng
// let lines = []
let lifeFunctions = []
let currentHouse
let currentLifeFunctionType
let lifeFunctionInfowindow
let selectedHouseId
let likeMap = {}
let userId
let latestMarker
// let latestId
let houseDataMap = {}
let latestHouseIdMap = {}
let idsToAddMap = {}
let idsToRemoveMap = {}
// const renderHouseDataMap = {}
let houseInfoStatus = false
let lastOpenedInfoWindow
const renderLimit = 1000
// let  = true
let totalTime = 0
let counter = 0
let totalHouse
let searchOnce = true
let clearClusterAll = true

// 學校
// const Justin = {
//   lat:,
//   lng:
// }
let officeLat
let officeLng

// console.log($('#commuter_time option[value="40"]'))
// $('#commute-time option:selected').removeAttr('selected');
// $('#commute-time option:nth-child(2)').attr('selected','true')
// const commuteTime = localStorage.getItem('commuteTime')
// commuteTime = window.localStorage.getItem('commuteTime')
// if (commuteTime) {
//   const commuteTimeSelect = document.getElementById('commute-time')
//   for (let i = 0; i < commuteTimeSelect.options.length; i++) {
//     const option = commuteTimeSelect.options[i]
//     console.log(option.value)
//     console.log(commuteTime)
//     console.log(option.value === commuteTime)
//     if (option.value === commuteTime) {
//       // console.log('21312')
//       console.log(i)
//       commuteTimeSelect.selectedIndex = i
//       break
//     }
//   }
// }

// setInitialOption('commute-time', 'commuteTime')

function setInitialOption(selectId, localStorageKey) {
  const value = window.localStorage.getItem(localStorageKey)
  if (!value) return
  const select = document.getElementById(selectId)
  for (let i = 0; i < select.options.length; i++) {
    const option = select.options[i]
    if (option.value === value) {
      // console.log('21312')
      // console.log(i)
      select.selectedIndex = i
      break
    }
  }
}

function setInitialCheck(checkId, localStorageKey) {
  const value = window.localStorage.getItem(localStorageKey)
  // console.log(values)
  // console.log(document.getElementById(checkId).checked)
  // console.log(value)
  // if (value) {
  document.getElementById(checkId).checked = value === 'true'
  // }
  //  = value
  // console.log(document.getElementById(checkId).checked)
}

function setInitialOptions() {
  // console.log(1)
  if (!window.localStorage.getItem('commuteTime')) {
    return
  }
  // console.log(2)
  setInitialOption('period', 'period')
  setInitialOption('commute-time', 'commuteTime')
  setInitialOption('commute-way', 'commuteWay')
  setInitialOption('walk-distance', 'maxWalkDistance')
  setInitialOption('house-type', 'houseType')
  setInitialOption('budget', 'budget')
  setInitialCheck('fire', 'fire')
  setInitialCheck('short-rent', 'shortRent')
  setInitialCheck('direct-rent', 'directRent')
  setInitialCheck('pet', 'pet')
  setInitialCheck('new-item', 'newItem')
}

setInitialOptions()

// document.getElementById('commute-time').selectedIndex = 2
// console.log($('#commuter_time option:nth-child(5)'))
// $('#commuter_time').val("40")
// console.log($('#commuter_time'))

// const Appworks = { lat: 25.042482379737326, lng: 121.5647583475222 }

function setMapOnAll(map) {
  // for (let i = 0; i < markers.length; i++) {
  //   markers[i].setMap(map)
  // }
  Object.values(markerMap).forEach((marker) => {
    // console.log('hi')
    marker.setMap(map)
  })
}

// Removes the markers from the map, but keeps them in the array.
// function hideMarkers() {
//   setMapOnAll(null)
// }

// function setMapOnAllCircle(map) {
//   for (let i = 0; i < circles.length; i++) {
//     circles[i].setMap(map)
//   }
// }

// Removes the markers from the map, but keeps them in the array.
// function hideCircles() {
//   setMapOnAllCircle(null)
// }

function initMap() {
  // console.log('fuc')
  // const myLatlng = { lat: 25.03746, lng: 121.532558 }
  // console.log(google)
  officeLat = window.localStorage.getItem('officeLat')
    ? Number(window.localStorage.getItem('officeLat'))
    : 25.04222965263713
  officeLng = window.localStorage.getItem('officeLng')
    ? Number(window.localStorage.getItem('officeLng'))
    : 121.5648119917025
  const office = {
    lat: officeLat,
    lng: officeLng
  }
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    // center: myLatlng,
    center: office,
    disableDefaultUI: true,
    scaleControl: true
  })

  const icon = {
    url: './assets/office_2.png', // url
    scaledSize: new google.maps.Size(60, 60), // scaled size
    origin: new google.maps.Point(0, 0) // origin
    // anchor: new google.maps.Point(20, 25) // anchor
  }

  console.log(office)
  const officeMarker = new google.maps.Marker({
    // position: { lat: 25.042482379737326, lng: 121.5647583475222 },
    position: office,
    map: map,
    icon: icon,
    draggable: true,
    zIndex: 99999999
  })

  officeMarker.addListener('dragstart', () => {
    clearHouseDataMap()
    removeRadio()
    clearLifeFunction()
    removeReachableArea()
    removeHouses()
    if (markerCluster) {
      markerCluster.clearMarkers()
    }
    // google.maps.event.clearListeners(map, 'zoom_changed', handleZoomChange)
    // google.maps.event.clearListeners(map, 'dragend', handleDrag)
  })

  officeMarker.addListener('dragend', (mapsMouseEvent) => {
    officeLat = mapsMouseEvent.latLng.toJSON().lat
    officeLng = mapsMouseEvent.latLng.toJSON().lng
    search(false)
  })

  houseInfowindow = new google.maps.InfoWindow()
  lifeFunctionInfowindow = new google.maps.InfoWindow()
  google.maps.event.addListener(map, 'click', function () {
    closeLastOpenedInfoWindow()
  })
  // console.log(houseInfowindow)
  // console.log(lifeFunctionInfowindow)
  // choose office by click
  // click.js
  // google.maps.event.clearListener(map, 'idle', reRenderHouses);
}

function clearHouseDataMap() {
  Object.keys(houseDataMap).forEach((key) => {
    delete houseDataMap[key]
  })
}

async function search(isOldSearch) {
  // houseDataMap = {}
  if (
    officeLat < 24.82779066186457 ||
    officeLat > 25.286790197826466 ||
    officeLng < 121.26674450569816 ||
    officeLng > 121.93818339149594
  ) {
    Swal.fire({
      title: '請搜尋雙北地區',
      // text: `放寬搜尋條件以找到房屋`,
      icon: 'info',
      confirmButtonText: '我知道了'
    })
    // alert('請選擇步行距離')
    return
  }

  houseInfoStatus = isOldSearch ? houseInfoStatus : false
  // return
  // const test = $('#test').val()
  // console.log(test)
  const time1 = Date.now()
  const period = $('#period').val()
  const commuteTime = $('#commute-time').val()
  // console.log(commuteTime)
  const commuteWay = $('#commute-way').val()
  const maxWalkDistance = $('#walk-distance').val()
  const budget = $('#budget').val()
  // console.log(budget)
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
      title: '請選擇步行距離',
      heightAuto: false
      // text: 'Something went wrong!',
      // footer: '<a href="">Why do I have this issue?</a>'
    })
    // alert('請選擇步行距離')
    return
  }
  const latitudeNW = map.getBounds().getNorthEast().lat()
  const longitudeNW = map.getBounds().getNorthEast().lng()
  const latitudeSE = map.getBounds().getSouthWest().lat()
  const longitudeSE = map.getBounds().getSouthWest().lng()
  latestLatitudeNW = latitudeNW
  latestLongitudeNW = longitudeNW
  height = Math.abs(latitudeNW - latitudeSE)
  width = Math.abs(longitudeNW - longitudeSE)
  const url = `/api/1.0/search?period=${period}&commuteTime=${
    commuteTime * 60
  }&commuteWay=${commuteWay}&maxWalkDistance=${maxWalkDistance}&budget=${budget}&officeLat=${officeLat}&officeLng=${officeLng}&houseType=${houseType}&fire=${fire}&shortRent=${shortRent}&directRent=${directRent}&pet=${pet}&newItem=${newItem}&latitudeNW=${latitudeNW}&longitudeNW=${longitudeNW}&latitudeSE=${latitudeSE}&longitudeSE=${longitudeSE}`
  // const walk-distance = $("walk-distance").val()

  console.log(url)
  clearHouseDataMap()
  removeRadio()
  clearLifeFunction()
  if (!isOldSearch) {
    removeReachableArea()
  }
  removeHouses()
  // await sleep(1)
  // return
  // if (!isOldSearch) {
  showBlock()
  $('.spinner').css('display', 'inline')
  // }
  // console.time('api')
  const { data } = await axios.get(url)
  // console.timeEnd('api')
  // console.time('remove block')

  // 更新公司資料於local storage
  window.localStorage.setItem('officeLat', officeLat)
  window.localStorage.setItem('officeLng', officeLng)
  window.localStorage.setItem('period', period)
  window.localStorage.setItem('commuteTime', commuteTime)
  window.localStorage.setItem('commuteWay', commuteWay)
  window.localStorage.setItem('maxWalkDistance', maxWalkDistance)
  window.localStorage.setItem('houseType', houseType)
  window.localStorage.setItem('budget', budget)
  window.localStorage.setItem('fire', fire)
  window.localStorage.setItem('shortRent', shortRent)
  window.localStorage.setItem('directRent', directRent)
  window.localStorage.setItem('pet', pet)
  window.localStorage.setItem('newItem', newItem)
  console.log(newItem)

  removeReachableArea()
  removeBlock()
  $('.spinner').css('display', 'none')
  // console.timeEnd('remove block')
  console.log(data)
  // if (data.length)
  const { positionData, houseData } = data
  totalHouse = data.totalHouse
  // hideCircles()
  // circles = []
  // removeLines()
  // removeRadio()
  const currentHouseIdMap = {}
  houseData.forEach((house) => {
    currentHouseIdMap[house.id] = true
    if (!latestHouseIdMap[house.id]) {
      idsToAddMap[house.id] = true
    }
  })

  if (latestHouseIdMap) {
    Object.keys(latestHouseIdMap).forEach((latestId) => {
      if (!currentHouseIdMap[latestId]) {
        idsToRemoveMap[latestId] = true
      }
    })
  }
  // 條件判斷是否要重新render整個cluster
  // if (Object.keys(idsToRemoveMap).length < 100 && Object.keys(idsToAddMap).length < 100) {
  //   clearClusterAll = false
  // }
  latestHouseIdMap = currentHouseIdMap
  // console.log(123)
  // clearHouseDataMap()
  if (isOldSearch && !clearClusterAll) {
    console.log('!!!!!')
    clearClusterPartly(idsToRemoveMap)
  } else {
    clearCluster()
  }
  // console.log(456)

  selectedHouseId = isOldSearch ? selectedHouseId : null
  // if (latestMarker) {
  //   latestMarker.setZIndex(2)
  //   // selectedHouseId = null
  //   // latestHouseId = selectedHouseId
  //   // selectedHouseId = null
  // const icon = makeHouseIcon(latestHouseId)
  //   latestMarker.setIcon(icon)
  // }
  // console.log()
  if (houseData.length === 0) {
    houseInfoStatus = false
    // if (markerCluster) {
    //   markerCluster.clearMarkers()
    // }
    Swal.fire({
      title: '沒有符合的房屋',
      text: `放寬搜尋條件以找到房屋`,
      icon: 'info',
      confirmButtonText: '我知道了'
    })
    // alert('請選擇步行距離')
    return
  }
  if (totalHouse > 1000) {
    houseInfoStatus = false
    if (markerCluster) {
      markerCluster.clearMarkers()
    }
    // Swal.fire({
    //   title: `符合搜尋條件的房子過多(${houseData.length}間)，為了您的使用體驗，請更改搜尋條件`,
    //   heightAuto: false
    //   // text: 'Something went wrong!',
    //   // footer: '<a href="">Why do I have this issue?</a>'
    // })
    // Swal.fire({
    //   title: '請限縮搜尋條件',
    //   text: `目前共找到${houseData.length}間，限縮搜尋條件以找到最適合您的房屋`,
    //   icon: 'info',
    //   confirmButtonText: '我知道了'
    // })
    Swal.fire({
      title: '請新增房屋條件',
      text: `搜尋結果高達${totalHouse}筆，新增房屋條件以找到最適合的房屋
      `,
      icon: 'info',
      confirmButtonText: '我知道了'
    })
    // alert('請選擇步行距離')
    return
  }
  renderHouses(houseData)
  // console.log(houseDataMap)

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

function clearCluster() {
  if (markerCluster) {
    markerCluster.clearMarkers()
  }
}

function clearClusterPartly(houseIdMap) {
  console.time('clear cluster partly')
  Object.keys(houseIdMap).forEach((id) => {
    // console.log(id)
    console.log(id)
    markerCluster.removeMarker(markerMap[id])
  })
  console.timeEnd('clear cluster partly')
  // console.log('h1')
}

function removeHouses() {
  for (let houseMarker of markers) {
    houseMarker.setMap(null)
  }
  // Object.keys(markerMap).forEach(id => {
  //   houseMarkerMap[id].setMap(null)
  //   delete houseMarkerMap[id]
  // })
  // if ()
  while (markers.length !== 0) {
    markers.pop()
  }
  // houseMarkers = []
}

function clearLifeFunction() {
  for (let lifeFunction of lifeFunctions) {
    lifeFunction.setMap(null)
  }
  lifeFunctions = []
}

function makeContentString(house) {
  const { image, category, area, price, address, link, id } = house
  return `  
  <div class="house-info">
      <img src="${image}" onerror="this.src='./assets/no-img.png'" width="125" height="100" />
      <p>房型：${category}, ${area}坪</p>
      <p>價格：${price}元/月</p>
      <p>地址：${address}</p>
      <div class="option">
        <a href="${link}" target="_blank">查看更多</a>
        <img src="./assets/heart.png" class="like heart" id ="${id}-like" style="display: ${
    likeMap[id] ? 'none' : 'ineline'
  };" onclick="like()">
        <img src="./assets/heart_red.png" class="dislike heart" id ="${id}-dislike" style="display: ${
    likeMap[id] ? 'ineline' : 'none'
  };" onclick="dislike()">
      </div>
      
    </div>
  `
}

let inBoundTime = 0
let otherTime = 0

// here
function renderHouse(house) {
  const timer0 = Date.now()
  // (house) => {
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
  const latlng = new google.maps.LatLng(latitude, longitude)
  // console.time('in bound')

  // const isInBound = map.getBounds().contains(latlng)
  // console.timeEnd('in bound')
  const timer1 = Date.now()
  inBoundTime += timer1 - timer0
  // if (
  //   !isInBound &&
  //   Object.keys(houseDataMap).length > renderLimit
  // ) {
  //   return
  // }

  // console.log('render a house')
  // currentId = id
  if (house.area % 1 !== 0) {
    house.area = house.area.toFixed(0)
  }
  if (id == 11603378) {
    console.log(area)
  }

  const houseIcon = makeHouseIcon(id)
  // const houseIcon = {
  //   // url: './assets/renting.png', // url
  //   // url: './assets/renting-house.jpg',
  //   // url: './assets/icon.jfif',
  //   // 2, 4 works
  //   url: likeMap[id] ? './assets/house_liked.png' : './assets/house.png',
  //   scaledSize: likeMap[id] ? new google.maps.Size(35, 35) : new google.maps.Size(30, 30), // scaled size
  //   origin: new google.maps.Point(0, 0), // origin
  //   anchor: new google.maps.Point(15, 20) // anchor
  //   // anchor: new google.maps.Point(15, 20) // anchor
  // }
  // const timer1 = Date.now()
  const marker = new google.maps.Marker({
    // position: { lat: 25.042482379737326, lng: 121.5647583475222 },
    position: {
      lat: latitude,
      lng: longitude
    },
    map: map,
    icon: houseIcon,
    zIndex: likeMap[id] ? 100 : 2
    // label: `${i}`
  })

  houseInfowindow.addListener('domready', () => {
    var test = $('.test')
    // test.html('test')
  })
  marker.addListener('click', () => {
    houseInfowindow.open({
      anchor: marker,
      map,
      shouldFocus: false,
      disableAutoPan: true
    })
  })
  marker.addListener(
    'click',
    (function (id, marker) {
      return function () {
        renderLifeFunction(id)

        // console.log(houseDataMap[id])
        const latestHouseId = selectedHouseId

        // 更新房屋圖像
        marker.setZIndex(1000)
        selectedHouseId = id
        const icon = makeHouseIcon(id)
        marker.setIcon(icon)

        // 更新上一個選擇房屋的圖像
        if (latestMarker) {
          const index = likeMap[latestHouseId] ? 200 : 2
          latestMarker.setZIndex(index)
          // selectedHouseId = null
          // latestHouseId = selectedHouseId
          // selectedHouseId = null
          const icon = makeHouseIcon(latestHouseId)
          latestMarker.setIcon(icon)
        }

        latestMarker = marker
        const { latitude, longitude } = houseDataMap[id]
        // console.log(houseDataMap[id])
        // map.panTo({
        //   lat: latitude,
        //   lng: longitude
        // })

        // test
        // markerCluster.addMarker(marker);
      }
    })(id, marker)
  )
  // console.log(houseInfowindow)

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
    (function (marker, id, infowindow) {
      // lastOpenedInfoWindow = false
      return function () {
        // console.log('jww')
        const content = makeContentString(houseDataMap[id])
        closeLastOpenedInfoWindow()
        // console.log(infowindow)
        infowindow.setContent(content)
        infowindow.open(map, marker)
        lastOpenedInfoWindow = infowindow
        infowindow.addListener('closeclick', () => (houseInfoStatus = false))
        houseInfoStatus = true
        // console.log('hi')
        // console.log(id)
        // currentId = id
      }
    })(marker, id, houseInfowindow)
  )
  // console.log(lastOpenedInfoWindow)
  // for selected house
  if (selectedHouseId === id && houseInfoStatus) {
    closeLastOpenedInfoWindow()
    const content = makeContentString(houseDataMap[id])
    // console.log(infowindow)
    houseInfowindow.setContent(content)
    houseInfowindow.open(map, marker)
    // console.log(lastOpenedInfoWindow)
    lastOpenedInfoWindow = houseInfowindow
    // console.log(lastOpenedInfoWindow)
    houseInfoStatus = true
  }
  // console.log(lastOpenedInfoWindow)
  google.maps.event.addListener(
    marker,
    'click',
    (function (id) {
      return async function () {
        // if (id === selectedHouseId) {
        //   return
        // }
        // clearLifeFunction()
        // // removeLines()
        // // console.log(id)
        // const { data } = await axios.get(`/api/1.0/house/details?id=${id}`)
        // console.log(data)
        // document
        //   .querySelector('.radio')
        //   .setAttribute('style', 'display: inline;')
        // // console.log($('.radio').attr("display"))
        // if (!currentLifeFunctionType) {
        //   currentLifeFunctionType = 'traffic'
        // }
        // currentHouse = data
        // switch (currentLifeFunctionType) {
        //   case 'traffic':
        //     getTraffic()
        //     break
        //   case 'life':
        //     getLife()
        //     break
        //   case 'food':
        //     getFood()
        //     break
        //   default:
        //     console.log('what')
        // }
      }
    })(id)
  )

  markerMap[id] = marker
  // console.log(marker.getPosition())
  if (markerCluster & !clearClusterAll) {
    markerCluster.addMarker(marker)
  }
  markers.push(marker)
  // houseInfowindows.push(houseInfowindow)

  // google.maps.event.clearListeners(map, 'zoom_changed', () => {console.log('h1')})
  // google.maps.event.addListener(map, 'zoom_changed', () => {console.log('h1')})
  // const time2 = Date.now()
  // console.log('rennder a marker', (time2 - time1), 'ms')
  counter++
  // totalTime += time2 - time1
  // console.log(lastOpenedInfoWindow)
  const timer2 = Date.now()
  otherTime += timer2 - timer1
  // console.log(timer2 - timer1, 'this time')
  // console.log(inBoundTime, 'total')
}

async function renderLifeFunction(id) {
  if (id === selectedHouseId) {
    return
  }
  clearLifeFunction()
  // removeLines()
  // console.log(id)
  const { data } = await axios.get(`/api/1.0/house/details?id=${id}`)
  console.log(data)
  document.querySelector('.radio').setAttribute('style', 'display: inline;')
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

function closeLastOpenedInfoWindow() {
  // console.log('h1')
  // console.log(lastOpenedInfoWindow)
  if (lastOpenedInfoWindow) {
    lastOpenedInfoWindow.close()
    houseInfoStatus = false
    // console.log(houseInfoStatus)
  }
}

function renderHouses(houses) {
  inBoundTime = 0
  otherTime = 0
  counter = 0
  const timer1 = Date.now()
  console.time('inside render houses function')
  while (markers.length !== 0) {
    markers.pop()
  }
  // markerClusterer.clearMarkers();
  // latestHouseIdMap = {}
  houses.forEach((house, i) => {
    // if (i % 1000 === 0) console.log(Date.now())
    // console.log(house)
    houseDataMap[house.id] = house
    // latestHouseIdMap[house.id] = true
    if (idsToAddMap[house.id]) {
      renderHouse(house)
    }
  })
  // google.maps.event.clearListeners(map, 'zoom_changed', handleZoomChange)
  // google.maps.event.clearListeners(map, 'dragend', handleDrag)
  // google.maps.event.addListener(map, 'zoom_changed', handleZoomChange)
  // google.maps.event.addListener(map, 'dragend', handleDrag)
  console.timeEnd('inside render houses function')
  // console.log(otherTime, 'ms for rendering house markers')
  // console.log(inBoundTime, 'ms for checking in bound')
  // console.log('total render house time', totalTime / 1000,  'seconds')
  // console.log(counter, 'render marker')
  // Add a marker clusterer to manage the markers.
  // console.log(markers)
  // new markerClusterer.MarkerClusterer({ houseMarkers, map })
  // new markerClusterer.MarkerClusterer(map, markers)
  const timeBeforeCluster = Date.now()
  // removeHouses()

  // console.time('render houses with cluster')
  // console.log(markers.length, 'markers are rendered')
  // if (Object.keys(houseDataMap).length < 100) {
  //   return
  // }
  // clearCluster()
  if (!markerCluster || clearClusterAll) {
    markerCluster = new markerClusterer.MarkerClusterer({ markers, map })
    // markerCluster = MarkerClusterer(map, markers, {})
  }

  const timeAfterCluster = Date.now()
  // console.timeEnd('render houses with cluster')

  // console.log('cluster time', timeAfterCluster - timeBeforeCluster)
  // markerCluster = new markerClusterer.MarkerClusterer({map})
  // markerCluster.addMarkers(markers.filter(marker => {
  //   map.getBounds().contains(marker.getPosition())
  //   console.log(map.getBounds)
  //   console.log(marker.getPosition())
  //   console.log(map.getBounds().contains(marker.getPosition()))
  // }))
}

let height
let width
let latestLatitudeNW
let latestLongitudeNW

async function handleDrag() {
  // return
  if (searchOnce && totalHouse < renderLimit) {
    // console.log('not too many houses, no action')
    return
  }
  const latitudeNW = map.getBounds().getNorthEast().lat()
  const longitudeNW = map.getBounds().getNorthEast().lng()
  const latitudeSE = map.getBounds().getSouthWest().lat()
  const longitudeSE = map.getBounds().getSouthWest().lng()
  if (
    Math.abs(latitudeNW - latestLatitudeNW) / height < 0.1 &&
    Math.abs(longitudeNW - latestLongitudeNW) / width < 0.1
  ) {
    latestLatitudeNW = latitudeNW
    latestLongitudeNW = longitudeNW
    height = Math.abs(latitudeNW - latitudeSE)
    width = Math.abs(longitudeNW - longitudeSE)
    console.log('less')
    return
  }
  latestLatitudeNW = latitudeNW
  latestLongitudeNW = longitudeNW
  height = Math.abs(latitudeNW - latitudeSE)
  width = Math.abs(longitudeNW - longitudeSE)
  // console.log(latitudeNew)
  console.log('much')
  await search(true)
  return
  console.log('enter drag')
  const startTime = Date.now()

  // const latitudeNW = map.getBounds().getNorthEast().lat()
  // const longitudeNW = map.getBounds().getNorthEast().lng()
  // const latitudeSE = map.getBounds().getSouthWest().lat()
  // const longitudeSE = map.getBounds().getSouthWest().lng()
  // console.log(Math.abs(latitudeNW - latestLatitudeNW))
  // console.log(height)
  // console.log(longitudeNW)
  // console.log(latestLongitudeNW)
  // console.log(Math.abs(longitudeNW - latestLongitudeNW))
  // console.log(width)
  if (
    Math.abs(latitudeNW - latestLatitudeNW) / height < 0.1 &&
    Math.abs(longitudeNW - latestLongitudeNW) / width < 0.1
  ) {
    console.log('less')
    return
  }
  // console.log(latitudeNew)
  console.log('much')
  latestLatitudeNW = latitudeNW
  latestLongitudeNW = longitudeNW
  height = Math.abs(latitudeNW - latitudeSE)
  width = Math.abs(longitudeNW - longitudeSE)
  const startRenderTime = Date.now()
  // console.log((startRenderTime - startTime) / 1000)
  renderHouses(Object.values(houseDataMap))
  // console.log(lastOpenedInfoWindow)
  console.log('finish')
  const finishTime = Date.now()
  console.log((finishTime - startTime) / 1000, 'seconds')
}

async function handleZoomChange() {
  if (searchOnce && totalHouse < renderLimit) {
    // console.log('not too many houses, no action')
    return
  }
  await search(true)
  return
  console.log('enter zoom')
  // console.timeEnd('159')
  // return
  removeRadio()
  clearLifeFunction()
  // removeReachableArea()
  removeHouses()
  if (markerCluster) {
    markerCluster.clearMarkers()
  }
  // clearHouseDataMap()
  // await sleep(0)
  // alert('h1')
  // return
  // return
  // alert('j1')
  // return

  const startTime = Date.now()
  // if (Object.keys(houseDataMap).length < renderLimit) return
  const latitudeNW = map.getBounds().getNorthEast().lat()
  const longitudeNW = map.getBounds().getNorthEast().lng()
  const latitudeSE = map.getBounds().getSouthWest().lat()
  const longitudeSE = map.getBounds().getSouthWest().lng()
  latestLatitudeNW = latitudeNW
  latestLongitudeNW = longitudeNW
  height = Math.abs(latitudeNW - latitudeSE)
  width = Math.abs(longitudeNW - longitudeSE)
  // console.log(123)

  const houses = Object.values(houseDataMap)
  console.time('render houses function')
  renderHouses(houses)
  console.timeEnd('render houses function')
  // console.log('render houses function')
  const finishTime = Date.now()
  console.log((finishTime - startTime) / 1000, 'seconds')
  // console.timeEnd('159')
}

// function reRenderHouses() {
//   renderHouses(Object.values(houseDataMap))
// }

// function removeLines() {
//   lines.forEach((line) => {
//     line.setMap(null)
//   })
//   lines = []
// }

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
    // strokeColor: '#ff7500',
    strokeColor: '#D8A08A',
    strokeOpacity: 0.1,
    strokeWeight: 0,
    // fillColor: '#ff7500',
    fillColor: '#D8A08A',
    fillOpacity: 0.6
  })
  // console.log('jel')
  // console.log(joined)
  // console.log(map)
  joined.setMap(map)
  joined.addListener('click', () => {
    // console.log('here')
    closeLastOpenedInfoWindow()
  })
  polygons.push(joined)
  const time2 = Date.now()
  // console.log('It takes total :', (time2 - time0) / 1000, 'seconds to render')
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
    // console.log('authenticated')
    // console.log(data.data)
    $('.sign').html('<div onclick="signout()">登出</div>')
  } catch {
    console.log('not authenticated')
    $('.sign').html('<a href="/signin.html">登入</div>')
    $('.like').css('display', 'none')
    $('.avator').css('display', 'none')
  }
}

async function signout() {
  window.localStorage.removeItem('access_token')
  await Swal.fire({
    title: '登出成功',
    heightAuto: false
  })
  location.href = '/'
}

function showLifeFunction(type, subtype) {
  // clearLifeFunction()
  // removeLines()
  // removeRadio()
  console.log(currentHouse)
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
    let url
    switch (subtype) {
      case '捷運':
        url = './assets/metro.png'
        break
      case '公車':
        url = './assets/bus.png'
        break
      case '購物':
        url = './assets/shop.png'
        break
      case '餐飲':
        url = './assets/food.png'
        break
      default:
        console.log('what the fuck')
    }
    // url = './assets/'
    const icon = {
      // url,
      scaledSize: new google.maps.Size(20, 20), // scaled size
      origin: new google.maps.Point(0, 0) // origin
      // anchor: new google.maps.Point(20, 25) // anchor
    }
    // make marker
    const lifeFunction = new google.maps.Marker({
      position: spotCoordinate,
      // label: name,
      map: map,
      disableAutoPan: true
      // icon
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
      })(
        lifeFunction,
        `<p class="life-function">${name}</p>`,
        lifeFunctionInfowindow
      )
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
  if (!access_token) {
    console.log(123)
    Swal.fire({
      title: '加入收藏前請先登入',
      // showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: '前往登入',
      // denyButtonText: `不了謝謝`,
      cancelButtonText: '不了謝謝'
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        location.href = '/signin.html'
      }
    })
    return
  }

  likeMap[selectedHouseId] = true
  setLike(selectedHouseId)
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
    // likeMap[selectedHouseId] = true
    // setLike(selectedHouseId)
    console.log('successfully like')
  } catch (e) {
    console.log(e)
    console.log(456)
    Swal.fire({
      title: '加入收藏前請先登入',
      // showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: '前往登入',
      // denyButtonText: `不了謝謝`,
      cancelButtonText: '不了謝謝'
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        location.href = '/signin.html'
      }
    })
    likeMap[selectedHouseId] = false
    setDislike(selectedHouseId)
    // console.log('fail')
  }
}

async function dislike() {
  const access_token = window.localStorage.getItem('access_token')
  if (!access_token) {
    Swal.fire({
      title: '移除收藏前請先登入',
      // showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: '前往登入',
      // denyButtonText: `不了謝謝`,
      cancelButtonText: '不了謝謝'
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        location.href = '/signin.html'
      }
    })
    return
  }
  likeMap[selectedHouseId] = false
  setDislike(selectedHouseId)
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
    // likeMap[selectedHouseId] = false
    // setDislike(selectedHouseId)
    console.log('successfully dislike')
  } catch (e) {
    console.log(e)
    // console.log('fail')
    Swal.fire({
      title: '移除收藏前請先登入',
      // showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: '前往登入',
      // denyButtonText: `不了謝謝`,
      cancelButtonText: '不了謝謝'
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        location.href = '/signin.html'
      }
    })
    likeMap[selectedHouseId] = true
    setLike(selectedHouseId)
    console.log('successfully dislike')
  }
}

async function getLikes() {
  const access_token = window.localStorage.getItem('access_token')
  // console.log('here')
  // console.log(access_token)
  // console.log(selectedHouseId)
  try {
    const { data } = await axios.get('/api/1.0/user/like', {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    })
    // console.log('....')
    // console.log(data)
    data.favoriteHouseIds.forEach((houseId) => {
      likeMap[houseId] = true
    })
    // console.log(likeMap)
    // console.log('successfully like')
    $('.sign').html('<div onclick="signout()">登出</div>')
  } catch (e) {
    console.log(e)
    console.log('not authenticated')
    $('.sign').html('<a href="/signin.html">登入</div>')
    $('.like').css('display', 'none')
    $('.avator').css('display', 'none')
    console.log('fail')
  }
}

function setLike(id) {
  // hide like button
  $(`#${id}-like`).attr('style', 'display: none;')
  $(`#${id}-dislike`).attr('style', 'display: inline;')
  // show unlike button

  // change pic
  const newIcon = makeHouseIcon(id)
  markerMap[id].setIcon(newIcon)
  // console.log('ww')
}

function setDislike(id) {
  $(`#${id}-dislike`).attr('style', 'display: none;')
  $(`#${id}-like`).attr('style', 'display: inline;')
  // show unlike button

  // change pic
  const newIcon = makeHouseIcon(id)
  markerMap[id].setIcon(newIcon)
}

function hideButton() {}

function showButton() {}

function makeHouseIcon(id) {
  let url
  // console.log(likeMap[id])
  if (likeMap[id] && id === selectedHouseId) {
    url = './assets/house-like-active.png'
  } else if (likeMap[id]) {
    url = './assets/house-like.png'
  } else if (id === selectedHouseId) {
    url = './assets/house-active.png'
  } else {
    url = './assets/house.png'
  }
  return {
    // url: likeMap[id] ? './assets/house-like.png' : './assets/house.png',
    url,
    scaledSize: new google.maps.Size(35, 35),
    // scaledSize: likeMap[id] ? new google.maps.Size(35, 35) : new google.maps.Size(30, 30), // scaled size
    origin: new google.maps.Point(0, 0), // origin
    // anchor: likeMap[id] ? new google.maps.Point(17, 22) :  new google.maps.Point(15, 20) // anchor
    anchor: new google.maps.Point(15, 20) // anchor
  }
}

async function main() {
  // $('.loading').css('visibility', 'hidden')
  // $('.loading').css('visibility', 'inherit')
  // $('.loading').css('display', 'absolute')
  // await init()
  await getLikes()
  $('body').css('display', 'inline')
}

main()

function showBlock() {
  let blockUI = document.querySelector('.blockUI')
  let block = document.querySelector('.block')
  let load = document.querySelector('.loading')
  let scrollH = document.documentElement.scrollHeight //計算整個頁面的高度(含scrollbar)
  let wh = window.innerHeight //計算可見視窗的高度，用來處理loading圖示的垂直居中
  blockUI.setAttribute('style', `height:${scrollH}px`)
  block.setAttribute('style', `height:${scrollH}px`)
  load.setAttribute(
    'style',
    `height:${wh}px;text-align: center; line-height:${wh}px`
  )
  blockUI.setAttribute('style', 'display:inline')
  $('.loading').css('display', 'fixed')
  // return
  // setTimeout(() => {
  //     blockUI.setAttribute('style', 'display:none');
  // }, 3000);
}

function removeBlock() {
  let blockUI = document.querySelector('.blockUI')
  blockUI.setAttribute('style', 'display:none')
  $('.loading').css('display', 'none')
}

async function sleep(n) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, n * 1000)
  })
}

// showBlock()
