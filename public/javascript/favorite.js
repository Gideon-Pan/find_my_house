// const { HostAddress } = require("mongodb")

const officePosition = {
  lat: 25.04222965263713,
  lng: 121.5648119917025
}
const houseMap = {}
const houses = []
let houseInfowindow
let lifeFunctionInfowindow
let currentHouseMarker
let houseDataList
let lifeFunctions = []
let currentHouse
let currentLifeFunctionType
let map
let switchState = 0
let activeIndex = 0

async function getFavorite() {
  const access_token = window.localStorage.getItem('access_token')
  // console.log('here')
  // console.log(access_token)
  // console.log(selectedHouseId)
  try {
    const { data } = await axios.get(
      '/api/1.0/user/favorite',
      {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      }
    )
    // console.log('....')
    console.log(data)
    if (data.favoriteHouses.length === 0) {
      $('main').css('display', 'none')
      return $('.no-like').css('display', 'flex')
    }
    data.favoriteHouses.forEach(favoriteHouse => {
      houseMap[favoriteHouse.id] = favoriteHouse
      houses.push(favoriteHouse)
    })
    console.log(houseMap)
    // console.log(likeMap)
    // console.log('successfully like')
  } catch (e) {
    console.log(e)
    console.log('fail')

    // location.href= '/'
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

  houseInfowindow = new google.maps.InfoWindow()
  lifeFunctionInfowindow = new google.maps.InfoWindow()
}

function renderListGroup() {
  // currentIndex = currentIndex ? currentIndex : 0
  // console.log(activeIndex)
  let htmls = ''
  houses.forEach((house, index) => {
    const html = `<li class="list-group-item ${index === activeIndex ? 'item-selected' : 'item-not-selected'}" id="${house.id}" onclick="selectHouse(${house.id})">
    <div class="house-item">
      <img
        src="${house.image}"
        onerror="this.src='./assets/no-img.png'"
        width="125"
        height="100"
      />
      <div class="info">
        <p>房型：${house.category}, ${house.area}坪</p>
        <p>價格：${house.price}元/月</p>
        <p>地址：${house.address}</p>
        <div class="option">
          
          <a href="${house.link}" target="_blank" class="go-rent">查看更多</a>
          <img
            src="./assets/delete.png"
            class="dislike heart"
            id="${house.id}-dislike"
            "
          />
        </div>
      </div>
    </div>
  </li>`
  // <div onclick="selectHouse(${house.id})" target="_blank">查看位置</div>
    htmls += html
    // console.log($(`#${house.id}`))
  })
  // console.log('rerender')
  // console.log(htmls)
  $('.list-group').html(htmls)
  houses.forEach(house => {
    $(`#${house.id}-dislike`).click(dislike)
  })
}

function selectHouse(id) {
  // console.log('fuck')
  renderHouse(id)
  $('.item-selected').addClass('item-not-selected')
  $('.item-selected').removeClass('item-selected')
  $(`#${id}`).addClass('item-selected')
  $(`#${id}`).removeClass('item-not-selected')
  houses.forEach((house, index) => {
    if (house.id === id) {
      activeIndex = index
    }
  })
}

function renderHouse(id) {
  // console.log(id)
  if (currentHouseMarker) {
    currentHouseMarker.setMap(null)
  }
  const house = houseMap[id]
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
  } = house
  // currentId = id
  if (area % 1 !== 0) {
    area = area.toFixed(1)
  }
  // houseDataMap[id] = house
  const houseIcon = {
    url: './assets/house.png',
    scaledSize: new google.maps.Size(40, 40),
    // scaledSize: likeMap[id] ? new google.maps.Size(35, 35) : new google.maps.Size(30, 30), // scaled size
    origin: new google.maps.Point(0, 0), // origin
    // anchor: likeMap[id] ? new google.maps.Point(17, 22) :  new google.maps.Point(15, 20) // anchor
    anchor: new google.maps.Point(22, 30), // anchor
    // anchor: new google.maps.Point(0, 0),
    zIndex: 200
  }
  const marker = new google.maps.Marker({
    // position: { lat: 25.042482379737326, lng: 121.5647583475222 },
    position: {
      lat: latitude,
      lng: longitude
    },
    map: map,
    icon: houseIcon,
    zIndex: 2000
    // label: `${i}`
  })
  // const zIndex = marker.getZIndex()
  // console.log('house', zIndex)
  currentHouseMarker = marker
  currentHouse = house
  clearLifeFunction()
  if (switchState) {
    renderRadio()
    renderLifeFunction()
  }
  // renderRadio()
  // renderLifeFunction()
  map.panTo({
    lat: latitude,
    lng: longitude
  })
}

function changeSwitchState() {
  switchState = switchState ? 0 : 1
  if (switchState) {
    renderRadio()
    renderLifeFunction()
  } else {
    removeRadio()
    clearLifeFunction()
  }
}

async function dislike(event) {
  console.log(event)
  event.stopPropagation()
  const id = Number(event.target.id.split('-')[0])
  // console.log(id)
  // console.log('213123213')
  const access_token = window.localStorage.getItem('access_token')
  // console.log('here')
  // console.log(access_token)
  // console.log(selectedHouseId)
  try {
    const { data } = await axios.delete('/api/1.0/user/like', {
      data: {
        houseId: id
      },
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    })
    // likeMap[selectedHouseId] = false
    // setDislike(selectedHouseId)
    console.log('successfully dislike')
    // let currentIndex
    houses.forEach((house, index) => {
      // console.log(id)
      // console.log(house.id)
      if (house.id === id) {
        // Index = index
        
        if (index < activeIndex) {
          houses.splice(index, 1)
          return activeIndex--
        }
        if (index === activeIndex && index === houses.length - 1) {
          activeIndex--
        }
        houses.splice(index, 1)
        // console.log('###')
      }
    })
    if (houses.length === 0) {
      location.href = ''
    }
    // console.log(currentIndex)
    // return
    delete houseMap[id]
    console.log(houses.length)
    renderListGroup()
    selectHouse(houses[activeIndex].id)
    // alert('wqeq')
    console.log('finsih dislike function')
    // event.stopPropagation()
  } catch (e) {
    console.log(e)
    console.log('fail')
  }
}

async function main() {
  await getFavorite()
  renderListGroup()
  renderHouse(Object.keys(houseMap)[0])
  $('main').css('visibility', 'inherit')
  // $('main').css('dispaly', 'inline')
}

main()