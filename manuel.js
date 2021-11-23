const axios = require('axios')

async function search() {
  // console.log('h1')
  const q = '127.0.0.1:3000/api/1.0/search?period=weekend&commuteTime=2400&commuteWay=mix&maxWalkDistance=1000&budget=100000000&officeLat=25.045060880370922&officeLng=121.51682166943355&houseType=&fire=false&shortRent=false&directRent=false&pet=false&newItem=false&latitudeNW=25.08361995794381&longitudeNW=121.62256507763668&latitudeSE=25.022356770632978&longitudeSE=121.44678382763668'
  const data = await axios.get(q, {
    'Content-Type': 'application/json'
  })
  console.log(data)
  console.log(data.positionData.length)
}

// search()



// 127.0.0.1:3000/api/1.0/search?period=weekend&commuteTime=2400&commuteWay=mix&maxWalkDistance=1000&budget=100000000&officeLat=25.045060880370922&officeLng=121.51682166943355&houseType=&fire=false&shortRent=false&directRent=false&pet=false&newItem=false&latitudeNW=25.08361995794381&longitudeNW=121.62256507763668&latitudeSE=25.022356770632978&longitudeSE=121.44678382763668

// print in frontend console

// mix
// await axios.get('/api/1.0/search?period=weekend&commuteTime=2400&commuteWay=mix&maxWalkDistance=1000&budget=100000000&officeLat=25.045060880370922&officeLng=121.51682166943355&houseType=&fire=false&shortRent=false&directRent=false&pet=false&newItem=false&latitudeNW=25.08361995794381&longitudeNW=121.62256507763668&latitudeSE=25.022356770632978&longitudeSE=121.44678382763668')
// position data 2488 (11/23 before reconstruct)
// house data 7262

// metro
// await axios.get('/api/1.0/search?period=weekend&commuteTime=2400&commuteWay=metro&maxWalkDistance=1000&budget=100000000&officeLat=25.045060880370922&officeLng=121.51682166943355&houseType=&fire=false&shortRent=false&directRent=false&pet=false&newItem=false&latitudeNW=25.08361995794381&longitudeNW=121.62256507763668&latitudeSE=25.022356770632978&longitudeSE=121.44678382763668')
// position data 225
// house data 6108 / 8163(不過濾同經緯度)