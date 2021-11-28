async function search(isOldSearch) {
  if (
    officeLat < 24.82779066186457 ||
    officeLat > 25.286790197826466 ||
    officeLng < 121.26674450569816 ||
    officeLng > 121.93818339149594
  ) {
    Swal.fire({
      title: '請搜尋雙北地區',
      icon: 'info',
      confirmButtonText: '我知道了'
    })
    return
  }

  houseInfoStatus = isOldSearch ? houseInfoStatus : false
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

  if (period === null) {
    Swal.fire({
      title: '請選擇通勤時段',
      heightAuto: false
    })
    return
  }
  if (!commuteTime) {
    Swal.fire({
      title: '請選擇通勤時間',
      heightAuto: false
    })
    return
  }
  if (commuteWay === null) {
    Swal.fire({
      title: '請選擇交通方式',
      heightAuto: false
    })
    return
  }
  if (maxWalkDistance === null) {
    Swal.fire({
      title: '請選擇步行距離',
      heightAuto: false
    })
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

  console.log(url)
  clearHouseDataMap()
  removeRadio()
  clearLifeFunction()
  if (!isOldSearch) {
    removeReachableArea()
  }
  removeHouses()
  showBlock()
  $('.spinner').css('display', 'inline')
  // }
  const { data } = await axios.get(url)

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
  console.log(data)
  const { positionData, houseData } = data
  totalHouse = data.totalHouse
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
  if (isOldSearch && !clearClusterAll) {
    clearClusterPartly(idsToRemoveMap)
  } else {
    clearCluster()
  }

  selectedHouseId = isOldSearch ? selectedHouseId : null
  if (houseData.length === 0) {
    houseInfoStatus = false
    Swal.fire({
      title: '沒有符合的房屋',
      text: `放寬搜尋條件以找到房屋`,
      icon: 'info',
      confirmButtonText: '我知道了'
    })
    return
  }
  if (totalHouse > RENDER_LIMIT) {
    houseInfoStatus = false
    if (markerCluster) {
      markerCluster.clearMarkers()
    }
    Swal.fire({
      title: '請新增房屋條件',
      text: `搜尋結果高達${totalHouse}筆，新增房屋條件以找到最適合的房屋
      `,
      icon: 'info',
      confirmButtonText: '我知道了'
    })
    return
  }
  renderHouses(houseData)

  return showReachableArea(positionData, time1)
}

function clearHouseDataMap() {
  Object.keys(houseDataMap).forEach((key) => {
    delete houseDataMap[key]
  })
}

function clearCluster() {
  if (markerCluster) {
    markerCluster.clearMarkers()
  }
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

function renderHouse(house) {
  const timer0 = Date.now()
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
  const timer1 = Date.now()

  // if (
  //   !isInBound &&
  //   Object.keys(houseDataMap).length > RENDER_LIMIT
  // ) {
  //   return
  // }
  if (house.area % 1 !== 0) {
    house.area = house.area.toFixed(0)
  }
  if (id == 11603378) {
    console.log(area)
  }

  const houseIcon = makeHouseIcon(id)
  const marker = new google.maps.Marker({
    position: {
      lat: latitude,
      lng: longitude
    },
    map: map,
    icon: houseIcon,
    zIndex: likeMap[id] ? 100 : 2
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
          const icon = makeHouseIcon(latestHouseId)
          latestMarker.setIcon(icon)
        }

        latestMarker = marker
      }
    })(id, marker)
  )
  google.maps.event.addListener(
    marker,
    'click',
    (function (marker, id, infowindow) {
      return function () {
        const content = makeContentString(houseDataMap[id])
        closeLastOpenedInfoWindow()
        infowindow.setContent(content)
        infowindow.open(map, marker)
        lastOpenedInfoWindow = infowindow
        infowindow.addListener('closeclick', () => (houseInfoStatus = false))
        houseInfoStatus = true
      }
    })(marker, id, houseInfowindow)
  )
  // for selected house
  if (selectedHouseId === id && houseInfoStatus) {
    closeLastOpenedInfoWindow()
    const content = makeContentString(houseDataMap[id])
    houseInfowindow.setContent(content)
    houseInfowindow.open(map, marker)
    lastOpenedInfoWindow = houseInfowindow
    houseInfoStatus = true
  }

  markerMap[id] = marker
  if (markerCluster & !clearClusterAll) {
    markerCluster.addMarker(marker)
  }
  markers.push(marker)
}

async function renderLifeFunction(id) {
  if (id === selectedHouseId) {
    return
  }
  clearLifeFunction()
  const { data } = await axios.get(`/api/1.0/house/details?id=${id}`)
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
  if (lastOpenedInfoWindow) {
    lastOpenedInfoWindow.close()
    houseInfoStatus = false
  }
}

function renderHouses(houses) {
  const timer1 = Date.now()
  console.time('inside render houses function')
  while (markers.length !== 0) {
    markers.pop()
  }
  houses.forEach((house, i) => {
    houseDataMap[house.id] = house
    if (idsToAddMap[house.id]) {
      renderHouse(house)
    }
  })
  console.timeEnd('inside render houses function')
  const timeBeforeCluster = Date.now()

  if (!markerCluster || clearClusterAll) {
    // var mcOptions = {gridSize: 40, maxZoom: 16, zoomOnClick: false, minimumClusterSize: 2};
    markerCluster = new markerClusterer.MarkerClusterer({ markers, map })
  }
}

function removeRadio() {
  document.querySelector('.radio').setAttribute('style', 'display: none;')
}

function showLifeFunction(type, subtype) {
  // console.log(currentHouse)
  const { coordinate } = currentHouse

  const houseCoordinate = {
    lat: coordinate.latitude,
    lng: coordinate.longitude
  }
  const stations = currentHouse.lifeFunction[type][subtype]
  stations.forEach((station) => {
    const { id, name, latitude, longitude, distance, subtype, type } = station

    // make line
    const spotCoordinate = { lat: latitude, lng: longitude }
    // make marker
    const lifeFunction = new google.maps.Marker({
      position: spotCoordinate,
      // label: name,
      map: map,
      disableAutoPan: true
      // icon
    })
    lifeFunction.addListener(
      'mouseover',
      (function (marker, content, infowindow) {
        return function () {
          infowindow.setContent(content)
          infowindow.open(map, marker)
        }
      })(
        lifeFunction,
        `<p class="life-function">${name}</p>`,
        lifeFunctionInfowindow
      )
    )
    // hide the infowindow when user mouses-out
    lifeFunction.addListener('mouseout', function () {
      lifeFunctionInfowindow.close()
    })
    lifeFunctions.push(lifeFunction)
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

function setLike(id) {
  // hide like button
  $(`#${id}-like`).attr('style', 'display: none;')
  // show unlike button
  $(`#${id}-dislike`).attr('style', 'display: inline;')
  // change house icon
  const newIcon = makeHouseIcon(id)
  markerMap[id].setIcon(newIcon)
}

function setDislike(id) {
  // hide unlike button
  $(`#${id}-dislike`).attr('style', 'display: none;')
  // show like button
  $(`#${id}-like`).attr('style', 'display: inline;')
  // change house icon
  const newIcon = makeHouseIcon(id)
  markerMap[id].setIcon(newIcon)
}

function makeHouseIcon(id) {
  let url
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
    url,
    scaledSize: new google.maps.Size(35, 35),
    // scaledSize: likeMap[id] ? new google.maps.Size(35, 35) : new google.maps.Size(30, 30), // scaled size
    origin: new google.maps.Point(0, 0), // origin
    // anchor: likeMap[id] ? new google.maps.Point(17, 22) :  new google.maps.Point(15, 20) // anchor
    anchor: new google.maps.Point(15, 20) // anchor
  }
}

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

async function main() {
  // $('.loading').css('visibility', 'hidden')
  // $('.loading').css('visibility', 'inherit')
  // $('.loading').css('display', 'absolute')
  // await init()
  await getLikes()
  $('body').css('display', 'inline')
}

main()
