const pool = require('../models/db/mysql')

async function getHouseInConstraint(budget, validTags, houseTypeId) {
  const q = `SELECT house.id, title, price, area, link, image, house.address, house.latitude, house.longitude, category.name AS category, category.id AS categoryId, tag.id AS tagId FROM house 
  JOIN category
    ON house.category_id = category.id
  JOIN house_tag
    ON house.id = house_tag.house_id
  JOIN tag
    ON tag.id = house_tag.tag_id
  WHERE price <= ${budget}
    ${validTags.length !== 0 ? 'AND tag.id IN  (?)' : ''}
    ${houseTypeId ? `AND category.id = '${houseTypeId}'` : ''}
`

  let [houses] = await pool.query(q, [validTags])
  const housesFiltered = []
  const houseMap = {}
  houses.forEach((house) => {
    if (!houseMap[house.id]) {
      houseMap[house.id] = house
      houseMap[house.id].validTagCounter = 0
    }
    if (validTags.includes(house.tagId)) {
      houseMap[house.id].validTagCounter++
      if (houseMap[house.id].validTagCounter === validTags.length) {
        housesFiltered.push(house)
      }
    }
  })
  return housesFiltered
}

module.exports = {
  getHouseInConstraint
}
