async function handleDrag() {
  if (searchOnce && totalHouse < RENDER_LIMIT) {
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
  console.log('much')
  await search(true)
  return
}

async function handleZoomChange() {
  if (searchOnce && totalHouse < RENDER_LIMIT) {
    return
  }
  console.log('enter zoom')
  removeRadio()
  clearLifeFunction()
  removeHouses()
  if (markerCluster) {
    markerCluster.clearMarkers()
  }
  const latitudeNW = map.getBounds().getNorthEast().lat()
  const longitudeNW = map.getBounds().getNorthEast().lng()
  const latitudeSE = map.getBounds().getSouthWest().lat()
  const longitudeSE = map.getBounds().getSouthWest().lng()
  latestLatitudeNW = latitudeNW
  latestLongitudeNW = longitudeNW
  height = Math.abs(latitudeNW - latitudeSE)
  width = Math.abs(longitudeNW - longitudeSE)
  await search(true)
  return
}
