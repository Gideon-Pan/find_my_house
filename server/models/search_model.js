const pool = require('../models/db/mysql')

async function getHouseInConstraint(budget, validTags, houseTypeId) {
  const q = `SELECT house.id, title, price, area, link, image, house.address, house.latitude, house.longitude, category.name AS category, tag.id AS tag FROM house 
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
  const [houses] = await pool.query(q)
  return houses
}

module.exports = {
  getHouseInConstraint
}