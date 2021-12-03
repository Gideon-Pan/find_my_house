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
  const accessToken = window.localStorage.getItem('accessToken')
  try {
    const { data } = await axios.get('/api/1.0/user/like/details', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    if (data.favoriteHouses.length === 0) {
      $('main').css('display', 'none')
      return $('.no-like').css('display', 'flex')
    }
    data.favoriteHouses.forEach((favoriteHouse) => {
      houseMap[favoriteHouse.id] = favoriteHouse
      houses.push(favoriteHouse)
    })
  } catch (e) {
    location.href = '/'
  }
}

async function signout() {
  window.localStorage.removeItem('accessToken')
  await Swal.fire({
    title: '登出成功',
    heightAuto: false
  })
  location.href = '/'
}

function initMap() {
  const myLatlng = { lat: 25.03746, lng: 121.532558 }
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
  let htmls = ''
  houses.forEach((house, index) => {
    const html = `<li class="list-group-item ${index === activeIndex ? 'item-selected' : 'item-not-selected'}" id="${
      house.id
    }" onclick="selectHouse(${house.id})">
    <div class="house-item">
      <img
        src="${house.image}"
        onerror="this.src='./assets/no-img.png'"
        width="125"
        height="100"
      />
      <div class="info">
        <div class="text">
        <p>房型：${house.category}, ${house.area}坪</p>
        <p>價格：${house.price}元/月</p>
        <p class="address">地址：${house.address}</p>
        </div>
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
    htmls += html
  })

  $('.list-group').html(htmls)
  houses.forEach((house) => {
    $(`#${house.id}-dislike`).click(dislike)
  })
}

function selectHouse(id) {
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
  if (currentHouseMarker) {
    currentHouseMarker.setMap(null)
  }
  const house = houseMap[id]
  if (!house) return
  let { title, area, link, category, image, price, address, latitude, longitude } = house
  if (area % 1 !== 0) {
    area = area.toFixed(1)
  }
  const houseIcon = {
    url: './assets/house-like.png',
    scaledSize: new google.maps.Size(40, 40),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(22, 30),
    zIndex: 200
  }
  const marker = new google.maps.Marker({
    position: {
      lat: latitude,
      lng: longitude
    },
    map: map,
    icon: houseIcon,
    zIndex: 2000
  })
  currentHouseMarker = marker
  currentHouse = house
  clearLifeFunction()
  if (switchState) {
    renderRadio()
    renderLifeFunction()
  }
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
  event.stopPropagation()
  const id = Number(event.target.id.split('-')[0])
  const accessToken = window.localStorage.getItem('accessToken')
  try {
    const { data } = await axios.delete('/api/1.0/user/like', {
      data: {
        houseId: id
      },
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    houses.forEach((house, index) => {
      if (house.id === id) {
        if (index < activeIndex) {
          houses.splice(index, 1)
          return activeIndex--
        }
        if (index === activeIndex && index === houses.length - 1) {
          activeIndex--
        }
        houses.splice(index, 1)
      }
    })
    if (houses.length === 0) {
      location.href = ''
    }
    delete houseMap[id]
    console.log(houses.length)
    renderListGroup()
    selectHouse(houses[activeIndex].id)
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
}

main()
