async function getFavorite() {
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
    data.favoriteHouseIds.forEach(houseId => {
      likeMap[houseId] = true
    })
    // console.log(likeMap)
    // console.log('successfully like')
  } catch (e) {

    console.log(e)
    console.log('fail')
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

async function main() {
  getFavorite()
}