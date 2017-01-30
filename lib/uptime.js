const uptime = current => {
  let unit = 'second'
  if (current > 60) {
    current = current / 60
    unit = 'minute'
  }
  if (current > 60) {
    current = current / 60
    unit = 'hour'
  }
  if (Math.floor(current) !== 1) unit = `${unit}s`

  return `${Math.floor(current)} ${unit}`
}

module.exports = uptime
