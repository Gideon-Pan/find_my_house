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
  const password = $('#password').val()
  const body = {
    provider: 'native',
    email,
    password
  }
  console.log(body)
  try {
    const { data } = await axios.post('/api/1.0/user/signin', body)
    console.log(data)
    window.localStorage.setItem('access_token', data.data.access_token)
    location.href = '/'
    
  } catch (e) {
    console.log(e)
    console.log('signin fail')
    alert('登入失敗')
  }
}

$('button').on('click', signinNative)

// FB login below

window.fbAsyncInit = function () {
  console.log(1)
  FB.init({
    appId: '372429521012300',
    cookie: true, // Enable cookies to allow the server to access the session.
    xfbml: true, // Parse social plugins on this webpage.
    version: 'v11.0' // Use this Graph API version for this call.
  })(
    (function (d, s, id) {
      console.log(2)
      var js,
        fjs = d.getElementsByTagName(s)[0]
      if (d.getElementById(id)) {
        return
      }
      js = d.createElement(s)
      js.id = id
      js.src = 'https://connect.facebook.net/en_US/sdk.js'
      fjs.parentNode.insertBefore(js, fjs)
    })(document, 'script', 'facebook-jssdk')
  )

  // FB.getLoginStatus(function(response) {   // Called after the JS SDK has been initialized.
  //   statusChangeCallback(response);        // Returns the login status.
  // });
}

window.fbAsyncInit()

function checkLoginState() {
  // Called when a person is finished with the Login Button.
  FB.getLoginStatus(function (response) {
    // See the onlogin handler
    statusChangeCallback(response)
  })
}

async function statusChangeCallback(response) {
  // Called with the results from FB.getLoginStatus().
  console.log('statusChangeCallback')
  console.log(response) // The current login status of the person.
  if (response.status === 'connected') {
    // Logged into your webpage and Facebook.
    // testAPI();
    const { authResponse } = response
    const { accessToken } = authResponse
    // console.log(accessToken)
    try {
      const { data } = await axios.post('/api/1.0/user/signin', {
        provider: 'facebook',
        access_token: accessToken
      })
      console.log(data)
      window.localStorage.setItem('access_token', data.data.access_token)
      // location.href = '/profile.html'
      alert('sss')
    } catch (e) {
      console.log(e)
    }
  } else {
    // alert('登入失敗')
  }
}





// function testAPI() {                      // Testing Graph API after login.  See statusChangeCallback() for when this call is made.
//   console.log('Welcome!  Fetching your information.... ');
//   FB.api('/me', function(response) {
//     console.log('Successful login for: ' + response.name);
//     document.getElementById('status').innerHTML =
//       'Thanks for logging in, ' + response.name + '!';
//   });
// }
