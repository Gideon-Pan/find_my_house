map.addListener('click', (mapsMouseEvent) => {
  //   hideMarkers()

  //   const icon = {
  //     url: './assets/office-place.png', // url
  //     scaledSize: new google.maps.Size(30, 30), // scaled size
  //     origin: new google.maps.Point(0, 0), // origin
  //     anchor: new google.maps.Point(15, 20) // anchor
  //   }
  //   const marker = new google.maps.Marker({
  //     position: mapsMouseEvent.latLng.toJSON(),
  //     map: map,
  //     icon: icon
  //   })

  //   markers = []
  //   markers.push(marker)
  console.log(mapsMouseEvent.latLng.toJSON())
  //   officeLat = mapsMouseEvent.latLng.toJSON().lat
  //   officeLng = mapsMouseEvent.latLng.toJSON().lng

  //   // circles = []
  //   // for (const station in stationMap) {
  //   //   // Add the circle for this city to the map.
  //   //   const stationCircle = new google.maps.Circle({
  //   //     strokeColor: '#FF0000',
  //   //     strokeOpacity: 0.8,
  //   //     strokeWeight: 2,
  //   //     fillColor: '#FF0000',
  //   //     fillOpacity: 0.35,
  //   //     map,
  //   //     center: stationMap[station].center,
  //   //     radius: stationMap[station].distanceLeft
  //   //   })
  //   //   circles.push(stationCircle)
  //   // }
  // console.log(google)
  // showReachableArea(map)
})