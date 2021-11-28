function initMap() {
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
}

function setMapOnAll(map) {
  Object.values(markerMap).forEach((marker) => {
    marker.setMap(map)
  })
}

function clearClusterPartly(houseIdMap) {
  console.time('clear cluster partly')
  Object.keys(houseIdMap).forEach((id) => {
    markerCluster.removeMarker(markerMap[id])
  })
  console.timeEnd('clear cluster partly')
}

function removeHouses() {
  for (let houseMarker of markers) {
    houseMarker.setMap(null)
  }
  while (markers.length !== 0) {
    markers.pop()
  }
}

function clearLifeFunction() {
  for (let lifeFunction of lifeFunctions) {
    lifeFunction.setMap(null)
  }
  lifeFunctions = []
}