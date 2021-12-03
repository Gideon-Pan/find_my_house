function clearLifeFunction() {
  for (let lifeFunction of lifeFunctions) {
    lifeFunction.setMap(null)
  }
  lifeFunctions = []
}

function removeRadio() {
  document.querySelector('.radio').setAttribute('style', 'display: none;')
}

function renderRadio() {
  document.querySelector('.radio').setAttribute('style', 'display: inline;')
}

function showLifeFunction(type, subtype) {
  console.log(currentHouse)
  const houseCoordinate = {
    lat: currentHouse.latitude,
    lng: currentHouse.longitude
  }
  map.panTo(houseCoordinate)
  const stations = currentHouse.lifeFunction[type][subtype]
  stations.forEach((station) => {
    const { id, name, latitude, longitude, distance, subtype, type } = station
    // make line
    const spotCoordinate = { lat: latitude, lng: longitude }

    // make marker
    const lifeFunction = new google.maps.Marker({
      position: spotCoordinate,
      map: map
    })
    lifeFunction.addListener(
      'mouseover',
      (function (marker, content, infowindow) {
        return function () {
          infowindow.setContent(content)
          infowindow.open(map, marker)
        }
      })(lifeFunction, `<p>${name}</p>`, lifeFunctionInfowindow)
    )
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

function renderLifeFunction() {
  if (!currentLifeFunctionType) {
    currentLifeFunctionType = 'traffic'
  }

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
