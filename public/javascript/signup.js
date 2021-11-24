// native signin

async function signUp(email, password, name) {
  // try {
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
  // console.log('success')
  return response
  // } catch {
  //   console.log('email has been used')
  // }
}

$('button').on('click', async (e) => {
  e.preventDefault()
  // console.log('what')
  try {
    const name = $('#username').val()
    // console.log('name: ', name);
    // if (!name) return alert('請填寫名字')
    const email = $('#email').val()
    // console.log('emai: ', emai);
    // if (!email) return alert('請填寫信箱')
    const password = $('#password').val()
    // const email = $('#email').val()
    if (!email) {
      await Swal.fire({
        title: '請輸入信箱',
        heightAuto: false
      })
      return
    }
    // const password = $('#password').val()
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
    
    // console.log('password: ', password);
    // if (!password) return alert('請填寫密碼')

    // if (!name || !email || !password) return
    // console.log(password)
    const { data } = await signUp(email, password, name)
    console.log(data)
    // console.log(data.data.accessToken)
    window.localStorage.setItem('accessToken', data.data.accessToken)
    console.log(data)
    location.href = '/'
  } catch(e) {
    console.log(e)
    // await Swal.fire({
    //   title: '請輸入信箱',
    //   heightAuto: false
    // })
    console.log('signup fail')
    // alert('註冊失敗')
    // console.log('email has been used')
    // alert('信箱已被使用或信箱錯誤')
  }
})

// async function main() {
//   try {
//     const { data } = await signUp(email, password, name)
//     console.log(data)
//   } catch {}
// }

// main()
