const db = require('../../server/models/db/mysql')

async function insertTimePeriodOld() {
  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 60; j = j + 5) {
      await db.query(`INSERT INTO time_period (time_period_hour, time_period_minute) 
        VALUES (${i}, ${j})`)
    }
  }
  console.log('finish insert time period data')
}

async function insertLine() {
  const routes = await getMongoData('busRoutes')
  const routeMap = {}
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i]
    const name = route.RouteName.Zh_tw
    const ptx_line_id = route.RouteID

    if (routeMap[name]) {
      continue
    }
    routeMap[name] = route
    await db.query(`INSERT INTO line (name, ptx_line_id)
      VALUES ('${name}', '${ptx_line_id}')`)
  }
}
