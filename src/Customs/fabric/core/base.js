


fabric.util.observable(fabric.Observable);
fabric.util.observable(fabric.Object.prototype);
fabric.util.observable(fabric.IText.prototype);
fabric.util.observable(fabric.Textbox.prototype);
fabric.util.observable(fabric.Image.prototype);
fabric.util.observable(fabric.StaticCanvas.prototype);
fabric.util.observable(fabric.Canvas.prototype);
fabric.util.observable(fabric);

fabric.on({
  "entity:created": function (e) {
    if (e.target.application) {
      e.target.application._populateWithDefaultProperties(e.target, e.options);
      delete e.options.application;
    }
  }
});

fabric.on({
  "entity:created": function (e) {
    // e.target.id = e.options.id || `${e.target.type}-${fabric.util.idCounter++}`;
    // delete e.options.id;

    if (e.target.eventListeners) {
      for (let eventName in e.target.eventListeners) {
        let _listeners = e.target.eventListeners[eventName];
        if (_listeners.constructor === Array) {
          for (let j in _listeners) {
            e.target.on(eventName, _listeners[j]);
          }
        } else {
          e.target.on(eventName, _listeners);
        }
      }
    }
    if (e.options.eventListeners) {
      for (let eventName in e.options.eventListeners) {
        e.target.on(eventName, e.options.eventListeners[eventName]);
      }
    }
    delete e.options.eventListeners;
    // if (e.target._default_event_listeners) {
    //   for (let eventName in e.target._default_event_listeners) {
    //     e.target.on(eventName, e.target._default_event_listeners[eventName]);
    //   }
    // }
  }
});
