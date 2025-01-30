fabric.Photo = fabric.util.createClass(fabric.SImage, {
  minWidth: 1,
  minHeight: 1,
  tools: ["cropZoomIn","cropZoom", "cropZoomOut", "cropEnd"],
  stateProperties: [],
  storeProperties: ["top","left","skewX","skewY","scaleX","scaleY","angle","filters","src","type"],
  originX: "center",
  originY: "center",
  movementLimitMode: "content",
  snappable: false,
  stored: false, // do not save Crop objects
  left: 0,
  top: 0,
  actions: {
    cropZoom: {
      type: "range",
      className: "fa fa-search-plus ",
      title: "@image.cropZoom",
      observe: "parent.crop:modified",
      get: function (target) {
        if(!target.parent)return target.scaleX * target.scaleY;
        let zoomValue = Math.sqrt(target.scaleX * target.scaleY);
        return Math.sqrt((zoomValue - target.parent.minCropZoom)/(target.parent.maxCropZoom -target.parent.minCropZoom));
      },
      set: function (val) {
        if(this.parent.__modifiedBy){
          return;
        }
        this.parent.__modifiedBy = "range";
        let zoomValue = (this.parent.maxCropZoom -this.parent.minCropZoom) * Math.pow(val,2) + this.parent.minCropZoom;
        this.parent.scaleContentElement(zoomValue,zoomValue);
        this.parent.canvas.renderAll();
        delete this.parent.__modifiedBy;
      },
      min: 0,
      max: 1,
      step: 0.01
    },
    cropZoomIn: {
      className: "fa fa-search-plus ",
      title: "@image.cropZoomIn",
      action () {
        this.parent.cropZoomIn();
      }
    },
    cropZoomOut: {
      className: "fa fa-search-minus",
      title: "@image.cropZoomOut",
      action () {
        this.parent.cropZoomOut();
      }
    },
    cropEnd: {
      className: "fa fa-crop-end", //this class specified om fiera.toolbar.less
      title: "@image.cropEnd",
      action () {
        this.parent.cropPhotoEnd();
      }
    }
  },
  eventListeners: fabric.util.extendArraysObject(fabric.Image.prototype.eventListeners, {
    "mousewheel"(e){
      this.parent.__modifiedBy = "wheel";
      if (e.e.deltaY < 0) {
        this.parent.cropZoomIn();
      } else {
        this.parent.cropZoomOut();
      }
      e.e.stopPropagation();
      e.e.preventDefault();
      delete this.parent.__modifiedBy;
    },
    "rotating moving scaling skewing" () {
      this.parent.__modifiedBy = "controls";
      this.fire('crop:modified');
      delete this.parent.__modifiedBy;
    }
  })
});

fabric.Frame = fabric.util.createClass(fabric.SGroup, {
  type: "frame",
  optionsOrder: ["units","fitting","width", "height", "*"],
  stateProperties: fabric.Image.prototype.stateProperties.concat(["frame"]),
  storeProperties: ["type","photo","deco","shape"],
  resizable: true,
  units: "mixed",
  minWidth: 1,
  minHeight: 1,
  maxCropZoom: 10,
  minCropZoom: 0.5,
  cropOpacity:  0.5,
  availableFrames: false, // ["ClipPath", "PointsPath"],
  fitting: "cover",
  initialize: function(options, callback) {
    fabric.SGroup.prototype.initialize.call(this, options, callback);

    if(!this._shapeEl){
      this.setShape(false);
    }
    if(!this._photo){
      this._photo = fabric.util.createObject({
        application: this.application,
        type: "photo",
        movementLimits: this,
        width: this.width,
        height: this.height
      });
      this._photo.parent = this;
    }
  },
  store_shape(){
    if (this.frame || !this.shape)return;
    let shape = fabric.util.object.clone(this.shape);
    delete shape.width;
    delete shape.height;
    return shape;
  },
  store_photo(){
    if(!this._photo)return;
    let image = this._photo.storeObject();
    delete image.type;
    if(Object.keys(image).length === 1)return image.src;
    return image;
  },
  store_deco(){
    if (this.frame || !this._deco)return;
    let image = this._deco.storeObject();
    delete image.type;
    delete image.left;
    delete image.top;
    delete image.width;
    delete image.height;
    if(Object.keys(image).length === 1)return image.src;
    return image;
  },
  store_frame: function () {
    if (!this.frame) return;
    if (this.frame.id) {
      return this.frame.id;
    }
    return this.frame;
  },
  setFrame: function (value,callback) {
    if(this.canvas){
      this.saveState(["frame"]);
      this.canvas.stateful = false;
    }
    let shapeReady, decoReady;

    function _callback(){
      if(shapeReady && decoReady){
        this.fire('frame:modified');
        callback && callback();
      }
    }
    if (value) {
      this.frame = this.application.getFrame(value);
      this.setShape(this.frame.shape,path => {
        shapeReady = true;
      _callback.call(this);
    });
      this.setDeco(this.frame.deco, () => {
        decoReady = true;
      _callback.call(this);
    });
    } else {
      this.frame = false;
      this.setShape(false);
      this.setDeco(false);
      this.fire('frame:removed');
      callback && callback();
    }
    this.dirty = true;
    if(this.canvas){
      this.canvas.stateful = true;
      this.canvas.fire('object:modified', {target: this});
      this.canvas.renderAll();
    }
    this.fire('modified');
  },
  setCrop(options){
    this._photo.set(options);
    this.dirty = true;
    this.canvas && this.canvas.renderAll();
  },
  useClipPath: true,
  setPhoto(options,callback){
    if(!options){
      options = false;
    }
    else if(options.constructor === Object){}
    else if(options.constructor === String){
      options = {src: options};
    }else{
      options = {element: options};
    }
    if(this._photo) {
      this._objects.splice(this._objects.indexOf(this._photo), 1)[0];
    }
    if(!options){
      delete this._photo;
      return;
    }
    this._photo = fabric.util.createObject(fabric.util.object.extend({
      application: this.application,
      type: "photo",
      movementLimits: this,
      width: this.width,
      height: this.height
    },options), ()=> {
      this._element = this._photo._element;
    this._updatePhoto();
    this.dirty = true;
    this.canvas && this.canvas.renderAll();
    callback && callback();
  });
    this._photo.canvas = this.canvas;
    this._photo.parent = this;
    this._photo.on("modified",()=>{
      if(!this.canvas.stateful)return;

    this.dirty = true;
    let states = this._photo.getModifiedStates();

    this.originalState = {photoState: states.original};
    this.__photoModifiedState = states.modified;

    if(this.canvas){
      this.canvas.fire('object:modified', {target: this, states: states});
      this.canvas.renderAll();
    }
    this.fire('modified');
  });
    this._photo.on("scaling moving rotating",()=>{
      this.dirty = true;
  });
    if(!this.useClipPath) {//do not useClipPath
      if(this._shapeEl){
        this._photo.clipPath = this._shapeEl
      }
    }
    this._objects.unshift(this._photo);
  },
  getPhotoState(){
    return this.__photoModifiedState;
  },
  setPhotoState(val){
    this._photo.set(val)
  },
  setShape(shape,callback){
    if (!shape) {
      shape = {};
    }
    if(!shape.offsets)delete shape.offsets;
    shape.units = this.units;

    if(shape.src){
      fabric.util.shapes.loadShape(shape,() =>{
        this.shape = shape;
      this._updateShape();
      callback && callback();
    });
    }else{
      this.shape = shape;
      this._updateShape();
      callback && callback();
    }
  },
  _updateShape(){
    let sh = this.shape;
    if (!sh)return;

    sh.width = this.width +2 ;
    sh.height = this.height +2;

    if(sh.objects){
      this._shapeEl = new fabric.SGroup({objects: sh.objects, absolutePositioned: true});
      this._shapeEl.scaleX = this.width / this._shapeEl.width;
      this._shapeEl.scaleY = this.height / this._shapeEl.height;
      this._shapeEl.left  = -this.width /2 -1;
      this._shapeEl.top  = -this.height /2 - 1;
    }
    else{
      if(!Object.keys(sh).length){
        let path = `M ${0} ${0} h ${sh.width} v ${sh.height} h ${-sh.width} z`;
        this._shapeEl = new fabric.SPath({path: path, absolutePositioned: true});
      }
      else{
        let path = fabric.util.shapes.makePath(sh);
        this._shapeEl = new fabric.SPath({path: path, absolutePositioned: true});
      }
      this._shapeEl.left -= (this.width/2 + 1);
      this._shapeEl.top -= (this.height/2 + 1);
    }

    // this._shapeEl.group = this;

    if(this.useClipPath){//useClipPath
      this.clipPath = this._shapeEl;
      this.clipPath.absolutePositioned = false;
    }
    else{
      if(this._photo){
        this._photo.clipPath = this._shapeEl;
      }
    }
    this.dirty = true;
    this.canvas && this.canvas.renderAll();
  },
  setDeco(options,callback){
    if(!options){
      options = false;
    }
    else if(options.constructor === Object){}
    else if(options.constructor === String){
      options = {src: options};
    }else{
      options = {element: options};
    }
    if(this._deco) {
      this._objects.splice(this._objects.indexOf(this._deco), 1);
    }
    if(!options){
      delete this._deco;
      return;
    }
    this._deco = fabric.util.createObject(fabric.util.object.extend({
      application: this.application,
      type: "image-border",
      width: this.width,
      height: this.height,
      left: - this.width/2,
      top: - this.height/2
    },options), (image)=> {
      this._updateDeco();
    this.dirty = true;
    this.canvas && this.canvas.renderAll();
    callback && callback();
  });
    this._objects.push(this._deco);
  },
  setData: function(data){
    if(data.type === "frame"){
      this.setPhoto(data.photo);
    }
    if(data.type === "image"){
      this.setPhoto(data.src);
    }
  },
  render: function(ctx) {
    fabric.Group.prototype.render.call(this,ctx);
    if(this.inCropMode){
      ctx.save();
      this._photo._setupCompositeOperation(ctx);
      let m = this._photo.calcOwnMatrix();
      ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
      ctx.globalAlpha *= this.cropOpacity;
      if (this._photo.transformMatrix) {
        ctx.transform.apply(ctx, this._photo.transformMatrix);
      }
      this._photo._renderBackground(ctx);
      this._photo._setStrokeStyles(ctx, this._photo);
      this._photo._setFillStyles(ctx, this._photo);
      this._photo._render(ctx);
      ctx.restore();
    }
  },
  _render(ctx) {
    fabric.Rect.prototype._render.call(this, ctx);
  },
  _getPhotoSize(size,el){
    let scaleX = size.width / el.width;
    let scaleY = size.height / el.height;

    if(this.fitting === "manual"){
      return;
    }
    if (this.fitting === 'fill') {
      //scale = Math.max(scaleX, scaleY);
    }
    if (this.fitting === 'cover') {
      scaleX = scaleY = Math.max(scaleX, scaleY);
    }
    if (this.fitting === 'contain') {
      scaleX = scaleY = Math.min(scaleX, scaleY);
    }
    if (this.fitting === 'center') {
      scaleX = scaleY = 1;
    }
    return {
      width: Math.round(el.width * scaleX),
      height: Math.round(el.height * scaleY)
    }
  },
  _updatePhoto(){
    if(this._photo && this._photo._element){
      let photo = this._photo;

      let size = this._getPhotoSize(this, photo._element);
      photo.width = size.width;
      photo.height = size.height;
    }
  },
  _updateDeco(){
    if(this._deco){
      this._deco.width = this.width;
      this._deco.height = this.height;
      this._deco.left = - this.width / 2;
      this._deco.top = - this.height / 2;
    }
  },
  //некорректно работает с ClipPath
  shouldCache: function() {
    if(!this.useClipPath){
      if(this.canvas && this.canvas._currentTransform && this.canvas._currentTransform.action.startsWith("scale")){
        return false;
      }
    }
    let ownCache = fabric.Object.prototype.shouldCache.call(this);
    if (ownCache) {
      for (let i = 0, len = this._objects.length; i < len; i++) {
        if (this._objects[i].willDrawShadow()) {
          this.ownCaching = false;
          return false;
        }
      }
    }
    return ownCache;
  },
  setWidth (val){
    this.width = val;
    this._updateShape();
    this._updateDeco();
    this._updatePhoto();
    this.dirty = true;
  },
  setHeight (val){
    this.height = val;
    this._updateShape();
    this._updateDeco();
    this._updatePhoto();
    this.dirty = true;
  },
  eventListeners: fabric.util.extendArraysObject(fabric.SGroup.prototype.eventListeners, {
    "scaling": function () {
      this._updateShape();
      this._updateDeco();
      this._updatePhoto();
    },
    "dblclick": function () {
      this.cropPhotoStart();
    }
  })
});
fabric.Frame.fromObject = function(object,callback){
  return new fabric.Frame(object,callback);
}