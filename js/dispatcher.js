import {Dispatcher} from 'flux';


const dispatcher = new Dispatcher();

export function register(callback) {
  return dispatcher.register(callback);
}

export function registerListeners(listeners, context) {
  register(function({action, data}) {
    const handler = listeners[action];
    if (handler) {
      handler.call(context, data);
    }
  });
}

export function dispatch(action, data) {
  dispatcher.dispatch({action, data});
}