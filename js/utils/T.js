function calculateDistance(latlngs) {
  var distance = 0, i;
  for (i = 1; i < latlngs.length; ++i) {
    distance += latlngs[i - 1].distanceTo(latlngs[i]);
  }
  return distance;
}


function format(string, params) {
  Object.keys(params).forEach(function(key) {
    string = string.replace('{' + key + '}', params[key]);
  });
  return string;
}


export {calculateDistance, format};
