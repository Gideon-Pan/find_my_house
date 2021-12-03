function setInitialOption(selectId, localStorageKey) {
  const value = window.localStorage.getItem(localStorageKey)
  if (!value) return
  const select = document.getElementById(selectId)
  for (let i = 0; i < select.options.length; i++) {
    const option = select.options[i]
    if (option.value === value) {
      select.selectedIndex = i
      break
    }
  }
}

function setInitialCheck(checkId, localStorageKey) {
  const value = window.localStorage.getItem(localStorageKey)
  document.getElementById(checkId).checked = value === 'true'
}

function setInitialOptions() {
  if (!window.localStorage.getItem('commuteTime')) {
    return
  }
  setInitialOption('period', 'period')
  setInitialOption('commute-time', 'commuteTime')
  setInitialOption('commute-way', 'commuteWay')
  setInitialOption('walk-distance', 'maxWalkDistance')
  setInitialOption('house-type', 'houseType')
  setInitialOption('budget', 'budget')
  setInitialCheck('fire', 'fire')
  setInitialCheck('short-rent', 'shortRent')
  setInitialCheck('direct-rent', 'directRent')
  setInitialCheck('pet', 'pet')
  setInitialCheck('new-item', 'newItem')
}

setInitialOptions()
