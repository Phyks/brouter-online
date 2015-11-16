import {toObject} from './util';


class Profile {
  constructor(id, name, source, options=null) {
    this.id = id;
    this.name = name;
    this.source = source;
    this.options = options;
  }

  getSource(options) {
    var source = this.source;
    if (!Array.isArray(this.options))
      return source;

    this.options.forEach(function(key) {
      source = source.replace(new RegExp('{' + key + '[^}]*}'), options[key] ? '1' : '0');
    });
    return source;
  }
}

export const profileOptions = [
  ['consider_elevation', 'Consider elevation', true],
  ['allow_steps', 'Allow steps', true],
  ['allow_ferries', 'Allow ferries', true],
  ['ignore_cycleroutes', 'Ignore cycleroutes', false],
  ['stick_to_cycleroutes', 'Stick to cycleroutes', false],
  ['avoid_unsafe', 'Avoid unsafe', false],
].map((item) => Object({'id': item[0], 'desc': item[1], 'defaultValue': item[2]}));

export const profileOptionValues = toObject(profileOptions.map(option => ([option.id, option.defaultValue])));


export default [
  new Profile('trekking', 'Trekking', require('./profiles/trekking.brfc'),
    ['consider_elevation', 'allow_steps', 'allow_ferries', 'ignore_cycleroutes', 'stick_to_cycleroutes', 'avoid_unsafe']
  ),
  new Profile('fastbike', 'Fastbike', require('./profiles/fastbike.brfc'),
    ['consider_elevation']
  ),
  new Profile('shortest', 'Shortest', require('./profiles/shortest.brfc')),
  new Profile('custom', 'Custom', require('./profiles/custom.brf')),
];
