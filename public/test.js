const image = 'assets/renting-house.jpg'
const category = '雅房'
const price = 12000
const address = '新北市新莊區新北大道七段700號'
const link = 'https://rent.591.com.tw/rent-detail-11558114.html'

const content = `  
  <div class="house-info">
      <img src=${image} width="125" height="100" />
      <p>房型：${category}</p>
      <p>價格：${price}/月</p>
      <p>地址：${address}</p>
      <a href="${link}" target="_blank">查看更多</a>
    </div>
  `
// $('body').html(content)
document.querySelector('.wrapper').innerHTML = content
// console.log($('.wrapper').html())