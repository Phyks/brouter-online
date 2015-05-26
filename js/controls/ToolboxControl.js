var L = require('leaflet');
var Control = require('./Control');
var Waypoints = require('../utils/Waypoints');
var Routes = require('../utils/Routes');
var Route = require('../utils/Route');
var T = require('../utils/T');
var geocoder = require('../geocoder');
var routing = require('../routing');
var profiles = require('../profiles');
var filters = require('../components/filters');
var config = require('../../config');

require('../components/TypeAheadMenu');


var ToolboxControl = Control.extend({
  position: 'topleft',
  template: require('./templates/toolbox.html'),
  data: {
    loading: false,
    info: null,
    profiles: profiles,
    profile: profiles[0],
    alternativeidx: 0,
    showProfileDropdown: false,
    showProfileOptions: false,
    profileOptions: {
      consider_elevation: true,
      allow_steps: true,
      allow_ferries: true,
      ignore_cycleroutes: false,
      stick_to_cycleroutes: false,
      avoid_unsafe: false,
    }
  },

  config(data) {
    data.waypoints = new Waypoints();
    data.routes = new Routes();

    data.waypoints.on('waypointdrag', (e) => {
      this.onWaypointDrag(e.waypoint);
    });
  },

  addTo(map) {
    this.supr(map);

    this.data.waypoints.map = map;
    this.data.waypoints.add();
    this.data.waypoints.add();

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
            if (!this.calculateRoute()) {
              this.map.setView(result.latlng, 14);
            }
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

  calculateRoute(force = false, fit = true) {
    var waypoints = this.data.waypoints.getWithMarkers();
    if (waypoints.length < 2)
      return false;

    this.data.routes.clear();

    var latlngs = waypoints.map(waypoint => waypoint.marker.getLatLng());
    var distance = T.calculateDistance(latlngs);
    if (distance > config.maxBrouterCalculationDistance) {
      this.data.info = T.format('Can\'t calculate distances longer than {km} as the crow flies.',
        {km: filters.km(config.maxBrouterCalculationDistance)}
      );
      this.$update();
      return false;
    }
    if (distance > config.maxBrouterAutoCalculationDistance && !force) {
      this.data.info = T.format('Press <em>Find route</em> button to calculate route.',
        filters.km(config.maxBrouterCalculationDistance)
      );
      this.$update();
      return false;
    }

    var simuline = new L.Polyline(latlngs, {color: '#555', weight: 1, className: 'loading-indicator-line'});
    simuline.addTo(this.map);
    if (fit)
      this.map.fitBounds(latlngs, {paddingTopLeft: [this.getToolboxWidth(), 0]});

    routing.route(waypoints, this.data.profile.getSource(this.data.profileOptions), this.data.alternativeidx, (geojson) => {
      if (geojson) {
        var route = new Route(geojson, waypoints).addTo(this.map);
        this.data.routes.push(route);

        if (fit)
          this.map.fitBounds(route.layer.getBounds(), {paddingTopLeft: [this.getToolboxWidth(), 0]});
      }
      this.map.removeLayer(simuline);
      this.data.loading = false;
      this.$update();
    });

    this.data.loading = true;
    this.data.info = null;
    this.$update();
    return true;
  },

  setProfile(profile) {
    this.data.profile = profile;
    this.data.showProfileDropdown = false;
    this.calculateRoute();
  },

  setAlternativeIndex(idx) {
    this.data.alternativeidx = idx;
    this.calculateRoute();
  },

  toggleProfileDropdown() {
    this.data.showProfileDropdown = !this.data.showProfileDropdown;
  },

  toggleProfileOptions() {
    this.data.showProfileOptions = !this.data.showProfileOptions;
  },

  toggleProfileOption(key, event) {
    var options = this.data.profileOptions;
    options[key] = event.target.checked;
    if (key === 'ignore_cycleroutes' && event.target.checked)
      options.stick_to_cycleroutes = false;
    else if (key === 'stick_to_cycleroutes' && event.target.checked)
      options.ignore_cycleroutes = false;

    this.calculateRoute();
  },

  swap: function() {
    this.data.waypoints.swap();
    this.calculateRoute();
  },

  getToolboxWidth() {
    var rect = this.$refs.el.getBoundingClientRect();
    return rect.width + 5;
  },

  waypointLetter(index) {
    return String.fromCharCode(65 + index);
  },

  onWaypointDrag(waypoint) {
    var latlng = waypoint.marker.getLatLng();
    waypoint.text = T.format('{lat}, {lng}', {lat: latlng.lat.toFixed(4), lng: latlng.lng.toFixed(4)});
    this.calculateRoute(false, false);
  }
});


export default ToolboxControl;
