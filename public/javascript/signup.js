async function signUp(email, password, name) {
  const requestBody = {
    email,
    password,
    name
  }
  console.log(requestBody)
  const response = await axios.post('/api/1.0/user/signup', requestBody).catch(async (error) => {
    console.log(error.response.data)
    if (error.response.data.error === 'Request Error: Invalid email format') {
      await Swal.fire({
        title: '信箱格式錯誤',
        heightAuto: false
      })
      return
    }
    if (error.response.data.error === 'Email Already Exists') {
      await Swal.fire({
        title: '信箱已經被使用',
        heightAuto: false
      })
      return
    }
  })
  return response
}

$('button').on('click', async (e) => {
  e.preventDefault()
  try {
    const name = $('#username').val()
    const email = $('#email').val()
    const password = $('#password').val()
    if (!email) {
      await Swal.fire({
        title: '請輸入信箱',
        heightAuto: false
      })
      return
    }
    if (!name) {
      await Swal.fire({
        title: '請輸入暱稱',
        heightAuto: false
      })
      return
    }
    if (!password) {
      await Swal.fire({
        title: '請輸入密碼',
        heightAuto: false
      })
      return
    }
    const { data } = await signUp(email, password, name)
    window.localStorage.setItem('accessToken', data.data.accessToken)
    console.log(data)
    location.href = '/'
  } catch (e) {
    console.log(e)
  }
})
