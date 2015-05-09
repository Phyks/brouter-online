var L = require('leaflet');
var Control = require('./Control');
var Waypoints = require('../utils/Waypoints');
var Waypoint = require('../utils/Waypoint');
var Routes = require('../utils/Routes');
var Route = require('../utils/Route');
var geocoder = require('../geocoder');
var routing = require('../routing');

require('../components/TypeAheadMenu');


var ToolboxControl = Control.extend({
  position: 'topleft',
  template: require('./templates/toolbox.html'),

  config(data) {
    data.waypoints = window.waypoints = new Waypoints();
    data.routes = new Routes();
  },

  addTo(map) {
    this.supr(map);

    this.data.waypoints.push(new Waypoint(map));
    this.data.waypoints.push(new Waypoint(map));

    this.$update();
  },

  typeahead(waypoint) {
    return {
      getTypeahead: function() { return this.$refs.typeahead; }.bind(this),
      minlength: 2,

      getItems: function(text, callback) {
        geocoder.autocomplete(text, callback);
      },
      onselect: function(input, autocompleteItem) {
        function callback(result) {
          if (result) {
            waypoint.setPosition(result);
            this.calculateRoute();
          } else {
            waypoint.clear();
          }
        }
        if (autocompleteItem) {
          geocoder.resolve(autocompleteItem.place_id, callback.bind(this));
        } else {
          if (input.value) {
            geocoder.query(input.value, callback.bind(this));
          } else {
            waypoint.clear();
          }
        }
      }.bind(this)
    };
  },

  calculateRoute() {
    var waypoints = this.data.waypoints.getWithMarkers();
    if (waypoints.length < 2)
      return;

    this.data.routes.clear();
    routing.route(waypoints, function(geojson) {
      if (geojson) {
        var route = new Route(geojson, waypoints).addTo(this.map);
        this.data.routes.push(route);

        this.map.fitBounds(route.layer.getBounds());
      }
    }.bind(this));
  }
});


module.exports = ToolboxControl;
