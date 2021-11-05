function signout() {
  window.localStorage.removeItem('access_token')
  location.href = '/'
}