/**
* InteractiveMode mixin. Allow to switch between pan/edit/drawing canvas modes.
*/
let _mouse_down_overwritten = fabric.Canvas.prototype._onMouseDown;
let _mouse_up_overwritten = fabric.Canvas.prototype._onMouseUp;

fabric._.extend(fabric.Canvas.prototype, {
  _initEventListeners_overwritten: fabric.Canvas.prototype._initEventListeners,
  _initEventListeners: function () {
    this._initEventListeners_overwritten();
    this.___onKeyDown = this._onKeyDown.bind(this);
    fabric.util.addListener(fabric.window, 'keydown', this.___onKeyDown);
  },
  _removeListeners_overwritten: fabric.Canvas.prototype.removeListeners,
  removeListeners: function () {
    this._removeListeners_overwritten();
    fabric.util.removeListener(fabric.window, 'keydown', this.___onKeyDown);
  },
  _onKeyDown: function (e) {
    return this.updateInteractiveMode(e);
  },
  getInteractiveMode: function () {
    return this.interactiveMode;
  },
  setInteractiveMode: function (tool) {
    //todo checkthis out
    // if (tool === 'hand') {
    //   this.setCursor('pointer');
    // }
    this.isDrawingMode = (tool === 'draw');
    this.isHandMode = (tool === 'hand');
    this.interactive = (tool !== 'disabled');
    this.isMixedMode = (tool === 'mixed');


    if(tool === "draw"){
      this.setCursor(this.freeDrawingCursor);
    }
    if(tool === "hand") {
      this.setCursor('pointer');
    }

    if (!this.interactive) {
      this.upperCanvasEl.style.cursor = 'default';
    }
    this.interactiveMode = tool;
  },

  /**
   *  current mode
   *  @values default | hand | selection
   *  @comment
   *      hand      - moving canvas
   *      draw - drawing reactangles
   *      selection - default behavior
   */
  interactiveMode: 'default',
  handScrollContainer: false,
  scrollTarget: "viewport", // "container
  _handModeCursorMove: false,
  _handModeCursorDown: false,
  _handModeMouseMove: function (e) {
    if (this._handModeCursorDown === true) {


      this._handModeCursorMove = true;

      if (e.pageY === this.application.dragCursorPosition.y && e.pageX === this.application.dragCursorPosition.x) {
        return;
      }

      if(this.scrollTarget === "container"){
        this.application.dragScrollContainer(e);
      }

      if(this.scrollTarget === "viewport") {
        let scroll = {x: this.viewportTransform[4], y: this.viewportTransform[5]};

        let newScroll = {
          x: scroll.x - (this.application.dragCursorPosition.x - e.pageX),
          y: scroll.y - (this.application.dragCursorPosition.y - e.pageY)
        };
        //
        // let dims = {
        //   width: this.size.width * this.zoom - this.lowerCanvasEl.width,
        //   height: this.size.height * this.zoom - this.lowerCanvasEl.height
        // };
        /*  todo need to add some restrictions later
         //Math.max(Math.min(0,newScroll.x),-dims.width);
         //Math.max(Math.min(0,newScroll.y),-dims.height);
         */
        this.viewportTransform[4] = newScroll.x;
        this.viewportTransform[5] = newScroll.y;

        this.fire('viewport:translate');

        this.renderAll();
        for (let i = 0, len = this._objects.length; i < len; i++) {
          this._objects[i].setCoords();
        }

        this.application.dragCursorPosition.y = e.pageY;
        this.application.dragCursorPosition.x = e.pageX;
      }
    }
  },
  _handModeMouseUp: function () {
    this._handModeCursorDown = false;
    if (!this._handModeCursorMove) {

    }
  },
  _handModeMouseDown: function (e) {

    this._handModeCursorMove = false;
    this._handModeCursorDown = true;
    this.application.dragCursorPosition = {
      y: e.pageY,
      x: e.pageX
    };
    if(this.scrollTarget === "container"){
      this.application.initScrollContainerDragging();
    }
  },
  handModeEnabled: true,
  handModeKey: "Alt",
  _onMouseMove: function (e) {
    if (!this.interactive) {
      return;
    }

    if(this._activeObject || !this.allowTouchScrolling) {
      e.preventDefault && e.preventDefault();
    }

    // this._applyMixedMode(e);

    if (this.isHandMode) {

      if (this._current_target && this._current_target.selectable_overwritten) {
        this._current_target.selectable = true;
      }

      if (this._handModeActive) {
        return this._handModeMouseMove(e);
      }
      this.fire('mouse:move', {target: this._current_target, e: e});
      this._current_target && this._current_target.fire('mousemove', {e: e});
      return true;
    } else {

      this.__onMouseMove(e);
    }
  }, /**
   * @private
   */
  // _onScale: function (e, transform, x, y) {
  //   let useUniScale = this.getActiveObject().type == 'i-text' ? e.shiftKey : e.shiftKey ^ this.shiftInverted;
  //   // rotate object only if shift key is not pressed
  //   // and if it is not a group we are transforming
  //   if ((useUniScale || this.uniScaleTransform) && !transform.target.get('lockUniScaling')) {
  //     transform.currentAction = 'scale';
  //     return this._scaleObject(x, y);
  //   }
  //   else {
  //     // Switch from a normal resize to proportional
  //     if (!transform.reset && transform.currentAction === 'scale') {
  //       this._resetCurrentTransform(e);
  //     }

  //     transform.currentAction = 'scaleEqually';
  //     return this._scaleObject(x, y, 'equally');
  //   }
  // },
  shiftInverted: true,
  _setCursorFromEvent_overwritten: fabric.Canvas.prototype._setCursorFromEvent,
  _setCursorFromEvent: function (e, target) {
    if (this.isHandMode) {
      this.setCursor('pointer');
    } else {
      this._setCursorFromEvent_overwritten(e, target);
    }
  },
  updateInteractiveMode(e){
    switch(this.interactiveMode){
      case "hand":
        this.isHandMode = true;
        this.isDrawingMode = false;
        return;
      case "default":
        this.isHandMode = false;
        this.isDrawingMode = false;
        return;
      case "draw":
        this.isHandMode = false;
        this.isDrawingMode = true;
        return;
      case "mixed":
        if (this.handModeEnabled && e.altKey || e.key === this.handModeKey) {
          //if shift use hand mode
          // if (!this.isHandMode) {
          //   this.isHandMode = true;
          //   this.isDrawingMode = false;
          //   this.setCursor('pointer');
          // }
        }
        else if (this.drawingModeEnabled && !this._isCurrentlyDrawing && !this._currentTransform) {

          this.isHandMode = false;

          this._current_target = this.findTarget(e);
          if (this._current_target) {
            if (this.freeDrawingBrush && this._current_target.allowDrawing) {
              let corner = this._current_target._findTargetCorner(this.getPointer(e, true));
              if (!corner) {
                this.isDrawingMode = true;
              } else {
                this.isDrawingMode = false;
              }
            } else if (this.isDrawingMode) {
              this.isDrawingMode = false;
            }
          } else {
            if (this.freeDrawingBrush && !this.isDrawingMode) {
              this.setCursor(this.freeDrawingCursor);
              this.isDrawingMode = true;
            }
          }
        } else {
          this.isHandMode = false;
          this.isDrawingMode = false;
        }
    }
  },
  drawingModeEnabled: false,
  _onMouseDown: function (e) {
    if (!this.interactive) {
      return;
    }
    // e.preventDefault();
    e.stopPropagation();

    this.updateInteractiveMode(e);


    if (this.isHandMode && this._current_target) {
      this._current_target.selectable_overwritten = this._current_target.selectable;
      this._current_target.selectable = false;
    }

    _mouse_down_overwritten.call(this, e);

    if (this.isHandMode) {

      if (this._current_target && this._current_target.selectable_overwritten) {
        this._current_target.selectable = true;
      }
      this._handModeActive = true;
      this._handModeMouseDown(e);
    }
  },

  _onMouseUp: function (e) {
    if (!this.interactive) {
      return;
    }
    // e.preventDefault();
    e.stopPropagation();
    _mouse_up_overwritten.call(this, e);

    if (this.isHandMode) {
      this._handModeActive = false;
    }
  }
});
