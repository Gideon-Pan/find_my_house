map.addListener('click', (mapsMouseEvent) => {
  console.log(mapsMouseEvent.latLng.toJSON())
})
