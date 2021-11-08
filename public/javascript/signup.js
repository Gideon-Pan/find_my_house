// native signin

async function signUp(email, password, name) {
  // try {
  const requestBody = {
    email,
    password,
    name
  }
  console.log(requestBody)
  const response = await axios.post('/api/1.0/user/signup', requestBody)
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
    // console.log('password: ', password);
    // if (!password) return alert('請填寫密碼')
    
    // if (!name || !email || !password) return
    // console.log(password)
    const { data } = await signUp(email, password, name)
    // console.log(data.data.access_token)
    window.localStorage.setItem('access_token', data.data.access_token)
    console.log(data)
    location.href = '/'
  } catch {
    console.log('signup fail')
    alert('註冊失敗')
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
