async function init() {
  const access_token = window.localStorage.getItem('access_token')
  try {
    const {data} = await axios.get('/api/1.0/user/checkAuth', {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    })
    console.log('authenticated')
    $('.signout').html('<div onclick="signout()">登出</div>')

  } catch {
    console.log('not authenticated')
    $('.signout').html('<a href="/signin.html">登入</div>')
    $('.avator').css('display', 'none')
    alert('請先登入')
    location.href = '/signin.html'
  }
}

init()