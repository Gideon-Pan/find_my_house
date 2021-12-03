const RENDER_LIMIT = 1000
let map
let markers = []
const markerMap = {}
let latestMarker
let markerCluster
let houseInfowindow
const polygons = []
let walkVelocity = 1.25
let lifeFunctions = []
let currentHouse
let currentLifeFunctionType
let lifeFunctionInfowindow
let selectedHouseId
let likeMap = {}
let houseDataMap = {}
let latestHouseIdMap = {}
let idsToAddMap = {}
let idsToRemoveMap = {}
let houseInfoStatus = false
let lastOpenedInfoWindow
let totalHouse
let searchOnce = true
let clearClusterAll = true
let officeLat
let officeLng
let height
let width
let latestLatitudeNW
let latestLongitudeNW
