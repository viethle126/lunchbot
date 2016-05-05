function uptime(current) {
  var unit = 'second';
  if (current > 60) {
    current = current / 60;
    unit = 'minute';
  }
  if (current > 60) {
    current = current / 60;
    unit = 'hour';
  }
  if (current !== 1) {
    unit = unit + 's';
  }
  current = Math.floor(current) + ' ' + unit;
  return current;
}

module.exports = uptime;
