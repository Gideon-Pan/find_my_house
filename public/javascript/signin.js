// native signin

// async function signinNative(email, password) {
//   const response = await axios.post('/api/1.0/user/signin', {
//     provider: 'native',
//     email,
//     password
//   })
//   return response
// }

async function signinNative() {
  // console.log('here')
  // const name = $('#name').value
  const email = $('#email').val()
  if (!email) {
    await Swal.fire({
      title: '請輸入信箱',
      heightAuto: false
    })
    return
  }
  const password = $('#password').val()
  if (!password) {
    await Swal.fire({
      title: '請輸入密碼',
      heightAuto: false
    })
    return
  }
  const body = {
    provider: 'native',
    email,
    password
  }
  console.log(body)
  try {
    const { data } = await axios.post('/api/1.0/user/signin', body)
    console.log(data)

    window.localStorage.setItem('accessToken', data.data.accessToken)
    location.href = '/'
  } catch (e) {
    console.log(e)
    console.log('signin fail')
    await Swal.fire({
      title: '登入失敗',
      heightAuto: false
    })
    return
  }
}

$('button').on('click', signinNative)
