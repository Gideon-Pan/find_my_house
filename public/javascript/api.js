async function like() {
  const accessToken = window.localStorage.getItem('accessToken')
  if (!accessToken) {
    Swal.fire({
      title: '加入收藏前請先登入',
      showCancelButton: true,
      confirmButtonText: '前往登入',
      cancelButtonText: '不了謝謝'
    }).then((result) => {
      if (result.isConfirmed) {
        location.href = '/signin.html'
      }
    })
    return
  }

  likeMap[selectedHouseId] = true
  setLike(selectedHouseId)
  try {
    const { data } = await axios.post(
      '/api/1.0/user/like',
      {
        houseId: selectedHouseId
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    )
  } catch (e) {
    Swal.fire({
      title: '加入收藏前請先登入',
      showCancelButton: true,
      confirmButtonText: '前往登入',
      cancelButtonText: '不了謝謝'
    }).then((result) => {
      if (result.isConfirmed) {
        location.href = '/signin.html'
      }
    })
    likeMap[selectedHouseId] = false
    setDislike(selectedHouseId)
  }
}

async function dislike() {
  const accessToken = window.localStorage.getItem('accessToken')
  if (!accessToken) {
    Swal.fire({
      title: '移除收藏前請先登入',
      showCancelButton: true,
      confirmButtonText: '前往登入',
      cancelButtonText: '不了謝謝'
    }).then((result) => {
      if (result.isConfirmed) {
        location.href = '/signin.html'
      }
    })
    return
  }
  likeMap[selectedHouseId] = false
  setDislike(selectedHouseId)
  try {
    const { data } = await axios.delete('/api/1.0/user/like', {
      data: {
        houseId: selectedHouseId
      },
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
  } catch (e) {
    console.log(e)
    Swal.fire({
      title: '移除收藏前請先登入',
      showCancelButton: true,
      confirmButtonText: '前往登入',
      cancelButtonText: '不了謝謝'
    }).then((result) => {
      if (result.isConfirmed) {
        location.href = '/signin.html'
      }
    })
    likeMap[selectedHouseId] = true
    setLike(selectedHouseId)
    console.log('successfully dislike')
  }
}

async function getLikes() {
  const accessToken = window.localStorage.getItem('accessToken')
  try {
    const { data } = await axios.get('/api/1.0/user/like', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    data.favoriteHouseIds.forEach((houseId) => {
      likeMap[houseId] = true
    })
    $('.sign').html('<div onclick="signout()">登出</div>')
  } catch (e) {
    $('.sign').html('<a href="/signin.html">登入</div>')
    $('.like').css('display', 'none')
    $('.avator').css('display', 'none')
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
