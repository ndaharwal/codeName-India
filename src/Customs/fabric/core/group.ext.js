
fabric.util.toGroupCoords = function(object,group){

  let mB = object.calcOwnMatrix();
  let mX = group.calcTransformMatrix();

  let M = mB[0], N = mB[1], O = mB[2], P = mB[3], R = mB[4], S = mB[5],
    A = mX[0], B = mX[1], C = mX[2], D = mX[3], E = mX[4], F = mX[5],
    AD = A*D,
    BC = B*C,
    G = ( C*N - M*D ) / ( BC - AD ),
    H = ( A*N - M*B ) / ( AD - BC ),
    I = ( C*P - O*D ) / ( BC - AD ),
    J = ( A*P - O*B ) / ( AD - BC ),
    K = (C * ( S - F ) + D * ( E - R ) )/ (BC - AD),
    L = (A * ( S - F ) + B * ( E - R ) )/ (AD - BC);

  let matrix = [G,H,I,J,K,L],
    options = fabric.util.qrDecompose(matrix),
    center = new fabric.Point(options.translateX, options.translateY);

  object.flipX = false;
  object.flipY = false;
  object.set('scaleX', options.scaleX);
  object.set('scaleY', options.scaleY);
  object.skewX = options.skewX;
  object.skewY = options.skewY;
  object.angle = options.angle;
  object.setPositionByOrigin(center, 'center', 'center');
};

fabric.util.object.extend(fabric.Group.prototype, {

  /* _TO_SVG_START_ */
  /**
   * Returns svg representation of an instance
   * @param {Function} [reviver] Method for further parsing of svg representation.
   * @return {String} svg representation of an instance
   */
  toSVG: function(reviver) {
    var svgString = [];
    if(this.fill && this.fill !== "transparent"){
      var x = -this.width / 2, y = -this.height / 2;
      svgString.push('<rect ', 'COMMON_PARTS', 'x="', x, '" y="', y, '" width="', this.width, '" height="', this.height, '" />\n');
    }

    for (var i = 0, len = this._objects.length; i < len; i++) {
      svgString.push('\t', this._objects[i].toSVG(reviver));
    }

    return this._createBaseSVGMarkup(svgString, { reviver: reviver,/* noStyle: true,*/ withShadow: true });
  },
  fill: "transparent",
  /**
   * allow groups to uuse fill and stroke parameters
   *
   */
  //todo do not work with fabricJS 2.X
  // drawObject(ctx,forClipping) {
  //   if(!forClipping){
  //     this._renderBackground(ctx);
  //     this._setStrokeStyles(ctx, this);
  //     this._setFillStyles(ctx, this);
  //     this._render(ctx);
  //   }
  //   for (let i = 0, len = this._objects.length; i < len; i++) {
  //     this._objects[i].render(ctx,forClipping);
  //   }
  //   this._drawClipPath(ctx);
  // },
  /**
   * @private
   * @param {CanvasRenderingContext2D} ctx Context to render on
   */
  _render(ctx) {
    fabric.Rect.prototype._render.call(this,ctx);
  },
  ungroup () {
    let _canvas = this.canvas;
    _canvas.discardActiveObject();
    this._restoreObjectsState();
    for(let i in this._objects){
      _canvas.add(this._objects[i]);
      this._objects[i].setCoords();
      this._objects[i].clipTo = this.clipTo;
    }
    _canvas.remove(this);
    _canvas.renderAll();
  },
  addWithoutUpdate(object,toBack){
    if(!object)return;
    fabric.util.toGroupCoords(object,this);
    if(object.canvas){
      object.canvas.remove(object);
    }
    if(toBack){
      this._objects.unshift(object);
    }
    else{
      this._objects.push(object);
    }
    object.group = this;
    this.dirty = true;
    this.canvas && this.canvas.renderAll();
    return this;
  },
  toActiveSelection() {
    if (!this.canvas) {
        return;
    }
    var objects = this._objects, canvas = this.canvas;
    this._objects = [];
    var options = this.toObject();
    delete options.objects;
    var activeSelection = new fabric.ActiveSelection([]);
    activeSelection.set(options);
    activeSelection.type = 'activeSelection';
    canvas.remove(this);

    if (objects.length) {
        objects[0].createID();
    }            

    objects.forEach(function (object) {
        object.id = objects[0].id;
        object.group = activeSelection;
        object.dirty = true;
        canvas.add(object);
    });
    activeSelection.canvas = canvas;
    activeSelection._objects = objects;
    canvas._activeObject = activeSelection;
    activeSelection.setCoords();
    return activeSelection;
},
});

fabric.ActiveSelection.prototype.groupElements = function(){
  this._restoreObjectsState();
  let objects = this._objects;
  delete this._objects;
  let object = this.storeObject();
  delete object.type;
  object.canvas = this.canvas;
  let group = new fabric.SGroup(object);

  this.canvas.discardActiveObject();

  for(let i in objects){
    this.canvas.remove(objects[i]);
    group.addWithoutUpdate(objects[i]);
  }
  return group;
};