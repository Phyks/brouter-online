import React from 'react';
import store from '../store';
import util from '../util';
import {SVGImport, ElevationChart} from '.';


export default class RouteCard extends React.Component {
  render() {
    const route = this.props.route;
    return (
      <section className="card">
        <div className="inner">
          <div className="flex s-b">
            <div>
              <strong>{route.from.text}</strong> - <strong>{route.to.text}</strong><br/>
              <small className="text-muted nowrap">
                <strong>{util.km(route.trackLength)}</strong>
                <span className="separation-dot">·</span>
                {route.profile.name} <span className="badge muted">{route.routeIndex + 1}</span>
              </small>
            </div>
            <div className="actions">
             <a onClick={()=>{ store.fitRoute(route); }}><SVGImport src={require('expand.svg')}/></a>
             <a onClick={()=>{ store.toggleRouteLock(route); }} className={route.locked && 'active'}><SVGImport src={require('thumb-tack.svg')}/></a>
             <a onClick={()=>{ store.removeRoute(route); }}><SVGImport src={require('x.svg')}/></a>
            </div>
          </div>
        </div>
        <ElevationChart route={route}/>
      </section>
    );
  }
}
