'use strict';


var _bindEvents = fabric.Canvas.prototype._bindEvents;
var _onMouseDown_overwritten = fabric.Canvas.prototype._onMouseDown;
var _onMouseUp_overwritten = fabric.Canvas.prototype._onMouseUp;
var _initEventListeners_overwritten = fabric.Canvas.prototype._initEventListeners;
var removeListeners_overwritten = fabric.Canvas.prototype.removeListeners;

fabric.util.object.extend(fabric.Canvas.prototype, {
  tapholdThreshold: 2000,
  _bindEvents: function () {
    _bindEvents.call(this);
    this._onClick = this._onClick.bind(this);
    this._onDoubleClick = this._onDoubleClick.bind(this);
    this._onTapHold = this._onTapHold.bind(this);
  },

  _onDoubleClick: function (e) {
    var self = this;

    var target = self.findTarget(e);
    self.fire('mouse:dblclick', {
      target: target,
      e: e
    });

    if (target && !self.isDrawingMode) {
      // To unify the behavior, the object's double click event does not fire on drawing mode.
      target.fire('dblclick', {
        e: e
      });
    }
  },

  _onDrop: function (e) {
    var _zoom = this.getZoom();
    e.x /= _zoom;
    e.y /= _zoom;
    e.offsetX /= _zoom;
    e.offsetY /= _zoom;
    e.width = e.helper.width() / _zoom;
    e.height = e.helper.height() / _zoom;
    var self = this;

    this.fire('mouse:drop', e);

  },

  _onDragMove: function (e) {
    var self = this;

    var target = self.findTarget(e.originalEvent);
    self.fire('mouse:dragmove', {
      target: target,
      e: e,
      data: e.data
    });
    if (target && !self.isDrawingMode) {
      // To unify the behavior, the object's double click event does not fire on drawing mode.
      target.fire('object:dragmove', {
        e: e,
        data: e.data
      });
    }
    if (this._last_target == target)return;
    if (this._last_target) {
      self.fire('mouse:dragleave', {
        target: this._last_target,
        e: e,
        data: e.data
      });
      this._last_target.fire('object:dragleave', {
        e: e,
        data: e.data
      });
      this._last_target = false;
    }
    if (target) {

      self.fire('mouse:dragenter', {
        target: target,
        e: e,
        data: e.data
      });
      target.fire('object:dragenter', {
        e: e,
        data: e.data
      });

      this._last_target = target;
    }

  },

  _onClick: function (e) {
    var self = this;

    var target = self.findTarget(e);
    self.fire('mouse:click', {
      target: target,
      e: e
    });

    var e1 = this._mouseDownCoordinatesEvent;
    delete this._mouseDownCoordinatesEvent;

    if (target && !self.isDrawingMode) {
      //fabric2.1.0 || fabric 1.6.4
      // var states = target._stateProperties || target.originalState;

      if(e1 && e1.x === e.x && e1.y === e.y){
        // // target._stateProperties.angle == target.angle
        // states.left == target.left &&
        // states.top == target.top &&
        // states.scaleX == target.scaleX &&
        // states.scaleY == target.scaleY &&
        // states.angle == target.angle
      // ) {
        // To unify the behavior, the object's double click event does not fire on drawing mode.
        target.fire('object:click', {
          e: e
        });
      }
    }
  },

  _onTapHold: function (e) {
    var self = this;

    var target = self.findTarget(e);
    self.fire('touch:taphold', {
      target: target,
      e: e
    });

    if (target && !self.isDrawingMode) {
      // To unify the behavior, the object's tap hold event does not fire on drawing mode.
      target.fire('taphold', {
        e: e
      });
    }

    if (e.type === 'touchend' && self.touchStartTimer != null) {
      clearTimeout(self.touchStartTimer);
    }
  },

  _onMouseDown: function (e) {
    _onMouseDown_overwritten.call(this, e);

    this._mouseDownCoordinatesEvent = e;



    var self = this;
    if (e.type === 'touchstart') {
      var touchStartTimer = setTimeout(function () {
        self._onTapHold(e);
        self.isLongTap = true;
      }, self.tapholdThreshold);
      self.touchStartTimer = touchStartTimer;
      return;
    }

    // Add right click support
    if (e.which === 3) {
      var target = this.findTarget(e);
      self.fire('mouse:down', {target: target, e: e});
      if (target && !self.isDrawingMode) {
        // To unify the behavior, the object's mouse down event does not fire on drawing mode.
        target.fire('mousedown', {
          e: e
        });
      }
    }
  },

  _onMouseUp: function (e) {

    _onMouseUp_overwritten.call(this, e);


    if (e.type === 'touchend') {
      // Process tap hold.
      if (this.touchStartTimer != null) {
        clearTimeout(this.touchStartTimer);
      }
      // Process long tap.
      if (this.isLongTap) {
        this._onLongTapEnd(e);
        this.isLongTap = false;
      }
      // Process double click
      var now = new Date().getTime();
      var lastTouch = this.lastTouch || now + 1;
      var delta = now - lastTouch;
      if (delta < 300 && delta > 0) {
        // After we detct a doubletap, start over
        this.lastTouch = null;

        this._onDoubleTap(e);
      } else {
        this.lastTouch = now;
      }
    }
  },

  _onDoubleTap: function (e) {
    var self = this;

    var target = self.findTarget(e);
    self.fire('touch:doubletap', {
      target: target,
      e: e
    });

    if (target && !self.isDrawingMode) {
      // To unify the behavior, the object's double tap event does not fire on drawing mode.
      target.fire('object:doubletap', {
        e: e
      });
    }
  },

  _onLongTapEnd: function (e) {
    var self = this;

    var target = self.findTarget(e);
    self.fire('touch:longtapend', {
      target: target,
      e: e
    });

    if (target && !self.isDrawingMode) {
      // To unify the behavior, the object's long tap end event does not fire on drawing mode.
      target.fire('object:longtapend', {
        e: e
      });
    }
  },

  _initEventListeners: function () {
    var self = this;
    _initEventListeners_overwritten.call(self);

    fabric.util.addListener(self.upperCanvasEl, 'click', self._onClick);
    fabric.util.addListener(self.upperCanvasEl, 'dblclick', self._onDoubleClick);

    self.on('object:scaling', function (e) {
      if (e.target && e.target._scaling_events_enabled) {
        e.target.fire("scaling", e.e);
      }
    });
    self.on('object:selected', function (e) {
      if (e.target) {
        e.target.fire("object:selected", e.e);
      }
    });
    self.on('mouse:over', function (e) {
      if (e.target) {
        e.target.fire("mouse:over", e.e);
      }
    });

    self.on('mouse:out', function (e) {
      if (e.target) {
        e.target.fire("mouse:out", e.e);
      }
    });

  },

  removeListeners: function () {
    var self = this;
    removeListeners_overwritten.call(self);


    fabric.util.removeListener(self.upperCanvasEl, 'click', self._onClick);
    fabric.util.removeListener(self.upperCanvasEl, 'dblclick', self._onDoubleClick);
  }
});
