// This example displays a map with the language and region set
// to Japan. These settings are specified in the HTML script element
// when loading the Google Maps JavaScript API.
// Setting the language shows the map in the language of your choice.
// Setting the region biases the geocoding results to that region.

// const { default: axios } = require("axios")

let map
let markers = []
let circles = []
let walkVelocity = 1.25
// const Appworks = {
//   lat: 25.042482379737326,
//   lng: 121.5647583475222
// }
// let officeLat = Appworks.lat
// let officeLng = Appworks.lng

const Justin = {
  lat: 25.00921512991647,
  lng: 121.52107052708763
}
let officeLat = Justin.lat
let officeLng = Justin.lng

const stationMap = {
  Appworks: {
    center: { lat: 25.042482379737326, lng: 121.5647583475222 },
    distanceLeft: 400
  },
  Appwork: {
    center: { lat: 25.042482379737326, lng: 121.5547583475222 },
    distanceLeft: 200
  }
}

function setMapOnAll(map) {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(map)
  }
}

// Removes the markers from the map, but keeps them in the array.
function hideMarkers() {
  setMapOnAll(null)
}

function setMapOnAllCircle(map) {
  for (let i = 0; i < circles.length; i++) {
    circles[i].setMap(map)
  }
}

// Removes the markers from the map, but keeps them in the array.
function hideCircles() {
  setMapOnAllCircle(null)
}

function initMap() {
  const myLatlng = { lat: 25.03746, lng: 121.532558 }
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: myLatlng
  })

  // let infoWindow = new google.maps.InfoWindow({
  //   content: "Click the map to get Lat/Lng!",
  //   position: myLatlng,
  // });

  // infoWindow.open(map);
  // Configure the click listener.

  const icon = {
    url: './assets/office-place.png', // url
    scaledSize: new google.maps.Size(30, 30), // scaled size
    origin: new google.maps.Point(0, 0), // origin
    anchor: new google.maps.Point(15, 20) // anchor
  }
  const marker = new google.maps.Marker({
    // position: { lat: 25.042482379737326, lng: 121.5647583475222 },
    position: Justin,
    map: map,
    icon: icon,
    draggable: true
  })
  marker.addListener('dragend', (mapsMouseEvent) => {
    officeLat = mapsMouseEvent.latLng.toJSON().lat
    officeLng = mapsMouseEvent.latLng.toJSON().lng
    search()
  })

  // choose office by click
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
  })
}

async function search() {
  const startWork = $('#start_work').val()
  const commuteTime = $('#commute_time').val() * 60
  const commuteWay = $('#commute_way').val()
  const maxWalkDistance = $('#walk_distance').val()
  const budget = $('#budget').val()
  const url = `/search?startWork=${startWork}&commuteTime=${commuteTime}&commuteWay=${commuteWay}&maxWalkDistance=${maxWalkDistance}&budget=${budget}&officeLat=${officeLat}&officeLng=${officeLng}`
  // const walk_distance = $("walk_distance").val()

  console.log(url)
  const { data } = await axios.get(url)
  console.log(data)

  hideCircles()
  circles = []
  data.forEach((station) => {
    // Add the circle for this city to the map.
    const center = { lat: station.lat, lng: station.lng }
    const stationCircle = new google.maps.Circle({
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.6,
      map,
      center,
      radius: station.distanceLeft
    })
    circles.push(stationCircle)
  })
}
