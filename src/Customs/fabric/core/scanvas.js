
var SCanvasMixin = {
   initialize: function(options, callback) {
    this.processing = true;
    this.processingProperties = [];
    this.renderAndResetBound = this.renderAndReset.bind(this);
    this.requestRenderAllBound = this.requestRenderAll.bind(this);

    this._initEntity(options);
    this._objects = [];
    this.fire("before:created",{options: options});
    if(options.width){
      options.originalWidth = options.width;
      options.originalHeight = options.height;
    }
    if(options.allowTouchScrolling)this.allowTouchScrolling = true;
    this.setElement(options.element);
    delete options.element;

    this.loaded = false;

    // if(!options.backgroundColor){
    //   let bgColor;
    //   if(this.application){
    //     bgColor = this.application.getDefaultProperties("Canvas").backgroundColor;
    //   }else{
    //     bgColor = this.__proto__.backgroundColor
    //   }
    //   if(bgColor){
    //     options.backgroundColor = bgColor;
    //   }
    // }
    this.fire("loading:begin",{type: "slide", options: options});
    this.application && this.application.fire("slide:loading:begin",{target: this,type: "slide", options: options});

    // console.log("loading:begin",options.id);
    this.set(options,() => {
      this.loaded = true;
      // delete this.processingProperties;
      //  if(this.loader){delete this._loader;}
      //  console.log("loading:end",this.id);
      this.renderAll();
      setTimeout(() => {
        this.fire("loading:end",{type: "slide", target: this});
        this.application && this.application.fire("slide:loading:end",{target: this,type: "slide"});
        callback && callback();
      })
    });

    this.calcOffset();
    this.renderAll();

    this.processing = false;
    // this.updateFonts();
  },
  _initEntity: function (options) {
    this.application = options.application;
    fabric.fire("entity:created", {target: this, options: options});
  },
  createObjects(objects, callback) {
    objects = objects && fabric.util.object.clone(objects, true)|| [];
    if (this.application) {
      for (let i in objects) {
        if (objects[i].constructor === String) {
          objects[i] = this.application.objects[objects[i]];
        }
      }
    }

    if (!objects || !objects.length) {
      callback && callback();
    }

    if (objects[0] && objects[0].constructor.name === "klass") {
      callback && callback();
      return;
    }

    if (fabric.util.loaderDebug) {
      let debugInfo = objects.map((o) => {
        if(!o.id)o.id = o.type + "-" + fabric.util.idCounter++;
        return o.id;
      });
      console.log(`${this.id}: 0/${debugInfo.length} . ${debugInfo.join(",")}`,)
    }

    // let _objects = [];
    let queueLoadCallback = fabric.util.loader(objects, () => {
      callback && callback();
    }, (l, t, el) => {
      this.fire("progress", {loaded: l, total: t});
      if (fabric.util.loaderDebug) {
        console.log(`${this.id}: ${l}/${t} . ${el.id} loaded`);
      }
    });

    queueLoadCallback.data = (this.title || "") + "objects";

    for (let object of objects) {
      if (this.type === "static-canvas") {
        object.interactive = false;
      }
      object.application = this.application;

      let synqEl = fabric.util.createObject(object, el => {
        if(!synqEl){
          this.add(el);
        }
        el.setCoords();
        queueLoadCallback.shift(el);
      });
      if(synqEl){
        this.add(synqEl);
        synqEl.setCoords();
      }
      // _objects.push(el);
    }
  },
  createObject: function (type, options, callback) {
    if (typeof type !== "string") {
      callback = options;
      options = type;
      type = options.type;
    }
    if (!options) {
      options = {};
    }
    options.application = this.application;

    let synqEl = fabric.util.createObject(type, options, el=> {
      if(!synqEl){
        this.add(el);
      }
      //only needed if using async objects without .ext classes
      callback && callback(el);
    });
    if(synqEl){
      this.add(synqEl);
    }
    return synqEl;
  },
  setObjects: function (objects, callback) {
    this._objects.length = 0;
    if (this._hasITextHandlers) {
      this.off('mouse:up', this._mouseUpITextHandler);
      this._iTextInstances = null;
      this._hasITextHandlers = false;
    }
    if (this.interactive) {
      this.discardActiveObject();
      if(this.contextTop){
        this.clearContext(this.contextTop);
      }
    }
    this.createObjects(objects, callback);
    this.renderAll();
  },
  setWidth: function (value) {
    if(this.lowerCanvasEl){
      return this.setDimensions({ width: value }, {});
    }else{
      this.width = value;
    }
  },
  setHeight: function (value) {
    if(this.lowerCanvasEl){
      return this.setDimensions({ height: value }, {});
    }else{
      this.height = value;
    }
  },
  /** Creates a bottom canvas
   * @private
   * @param {HTMLElement} [canvasEl]
   */
  _createLowerCanvas: function (canvasEl) {
    if (typeof canvasEl === "string") {
      this.lowerCanvasEl = fabric.util.getById(canvasEl);
    } else if (canvasEl) {
      this.lowerCanvasEl =  this._createCanvasElement(canvasEl);
    } else {
      //edited allow virtul canvas
      // this.virtual = true;
      this.lowerCanvasEl = fabric.util.createCanvasElement();
    }
    fabric.util.addClass(this.lowerCanvasEl, 'lower-canvas');

    if (this.interactive) {
      this._applyCanvasStyle(this.lowerCanvasEl);
    }

    this.contextContainer = this.lowerCanvasEl.getContext('2d');
  },
  _initSize: function () {
    this.width = this.width || parseInt(this.lowerCanvasEl.width, 10) || 0;
    this.height = this.height || parseInt(this.lowerCanvasEl.height, 10) || 0;
    if (!this.lowerCanvasEl.style) {
      return;
    }
    this.lowerCanvasEl.width = this.width;
    this.lowerCanvasEl.height = this.height;

    this.lowerCanvasEl.style.width = this.width + 'px';
    this.lowerCanvasEl.style.height = this.height + 'px';

    this.viewportTransform = this.viewportTransform.slice();
  },
  renderAll: function () {
    if(this.contextTop){
      this.clearContext(this.contextTop);
      this.renderTopLayer(this.contextTop);
    }
    if(this.contextContainer){
      if(this.layers){
        this.renderCanvasLayers();
      }
      else{
        this.renderCanvas(this.contextContainer, this._chooseObjectsToRender());
      }
    }
    return this;
  },
  setDimensions: function (dimensions, options) {
    fabric.Canvas.prototype.setDimensions.call(this, dimensions, options);

    if(this.backgroundImage && this.backgroundImage.constructor !== String){
      this._update_background_overlay_image("background");
    }
    if(this.overlayImage && this.overlayImage.constructor !== String){
      this._update_background_overlay_image("overlay");
    }
    //this._update_clip_rect();
    this.fire("dimensions:modified");
    this.renderAll();
  },

  store_backgroundImage: function () {
    if (!this.backgroundImage || this.backgroundImage.excludeFromExport) return;
    return this._clean_overlay_background_stored_object(this.backgroundImage);
  },
  store_overlayImage: function () {
    if (!this.overlayImage || this.overlayImage.excludeFromExport)  return;
    return this._clean_overlay_background_stored_object(this.overlayImage);
  },
  store_backgroundColor: function () {
    let val = this.backgroundColor;
    if(val.toObject){
      val = this.backgroundColor.toObject();
      val.source = this.backgroundColor._src;
    }
    return val;
  },
  store_overlayColor: function () {
    let val = this.overlayColor;
    if(val.toObject){
      val = val.toObject();
      val.source = this.overlayColor._src;
    }
    return val;
  },
  store_objects: function () {
    let _objs = this.getObjects().filter(el=>(el.stored !== false));
    if (!_objs.length) return null;
    return _objs.map(instance => {
      return instance.storeObject();
    });
  },
  /*
   Add Custom Object Tranformations
   */
  getPointer: function (e, ignoreZoom, upperCanvasEl) {
    let pointer = fabric.Canvas.prototype.getPointer.call(this, e, ignoreZoom, upperCanvasEl);
    if (e._group) {
      return this._normalizePointer(e._group, pointer);
    }
    return pointer;
  }
};

fabric.SStaticCanvas = fabric.util.createClass(fabric.StaticCanvas,fabric.SyncObjectMixin,SCanvasMixin,{
  setElement(element){
    if(element === false)return;
    if(this.canvasType === "canvas"){
      this._createLowerCanvas(element);
      this._initSize();
      this._setImageSmoothing();
      // only initialize retina scaling once
      if (!this.interactive) {
        this._initRetinaScaling();
      }
    }
  }
});

fabric.SCanvas = fabric.util.createClass(fabric.Canvas, fabric.SyncObjectMixin,SCanvasMixin, {
  setElement(element){
    if(element === false)return;
    this._createLowerCanvas(element);
    this._currentTransform = null;
    this._groupSelector = null;
    this._initWrapperElement();
    this._createUpperCanvas();
    this._initEventListeners();
    this.calcOffset();
    this.wrapperEl.appendChild(this.upperCanvasEl);
    this._createCacheCanvas();
    this._setImageSmoothing();
    this._initRetinaScaling();
    this._initSize();
  },


  /**
   * @private
   * @param {Object} target
   */
  _createGroup: function(target) {
    var objects = this._objects,
      isActiveLower = objects.indexOf(this._activeObject) < objects.indexOf(target),
      groupObjects = isActiveLower
        ? [this._activeObject, target]
        : [target, this._activeObject];
    this._activeObject.isEditing && this._activeObject.exitEditing();

    return new fabric.SActiveSelection({
      application: this.application,
      objects: groupObjects,
      canvas: this
    });
  },

  /**
   * @private
   * @param {Event} e mouse event
   */
  _groupSelectedObjects: function (e) {

    var group = this._collectObjects(e),
      aGroup;

    // do not create group for 1 element only
    if (group.length === 1) {
      this.setActiveObject(group[0], e);
    }
    else if (group.length > 1) {
      aGroup = new fabric.SActiveSelection( {
        application: this.application,
        objects: group.reverse(),
        canvas: this
      });
      this.setActiveObject(aGroup, e);
    }
  }
});



fabric.util.object.extend(fabric.StaticCanvas.prototype, {
  storeProperties: ['objects', 'backgroundColor', 'overlayColor', 'backgroundImage', 'overlayImage', 'width', 'height'],
  type: "static-canvas",
});
fabric.util.object.extend(fabric.Canvas.prototype, {
  type: "canvas",

  renderAll: function () {
    if(this.contextTop){
      this.clearContext(this.contextTop);
      this.renderTopLayer(this.contextTop);
    }
    if(this.contextContainer){
      if(this.layers){
        this.renderCanvasLayers();
      }
      else{
        this.renderCanvas(this.contextContainer, this._chooseObjectsToRender());
      }
    }
    return this;
  }
});