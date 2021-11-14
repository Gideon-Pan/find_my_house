function clearLifeFunction() {
  // if (lifeFunctions.length === 0) {
  //   return
  // }
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
  // clearLifeFunction()
  // removeLines()
  // removeRadio()
  console.log(currentHouse)
  // const { coordinate } = currentHouse

  const houseCoordinate = {
    lat: currentHouse.latitude,
    lng: currentHouse.longitude
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
