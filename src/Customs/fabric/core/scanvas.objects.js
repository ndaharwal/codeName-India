
fabric.Object.prototype.defaultIdPrefix = "Layer ";
fabric.Object.prototype.createID = function(){
  let regexp = new RegExp("^" + this.defaultIdPrefix + "([0-9]+)$");

  var largestNumber = 0;
  for(var i in this.canvas._objects){
    var result = regexp.exec(this.canvas._objects[i].id);
    if(result){
      var number = + result[1];
      if(number > largestNumber){
        largestNumber = number;
      }
    }
  }
  this.id =  (this.defaultIdPrefix || this.type + "-") + (largestNumber + 1);
}


fabric.util.object.extend(fabric.util, {
  idCounter : 1,
  createObject: function (type, options, callback) {
    if(typeof type !== "string"){
      callback = options;
      options = fabric.util.object.clone(type);
      type = null;
    }else{
      options = fabric.util.object.clone(options);
      options.type = type;
    }
    let app = options.application;
    if(app){
      app.fire("entity:load",{options: options});
    }

    let _klassName = fabric.util.string.camelize(fabric.util.string.capitalize(type || options.type || app.prototypes.Object.type,true));
    let _klass = (app && app.klasses["S" + _klassName]) || fabric["S" + _klassName] || (app && app.klasses[_klassName]) || fabric[_klassName] ;

    if(!_klass){
      console.warn(_klassName + " is undefined");

      let _text = options.text && options.text.constructor === String ? options.text : _klassName;
      delete options.text;
      return new fabric.Text(_text,options,callback);
    }

    return new _klass(options,asynq_el => {
      callback && callback(asynq_el);
    });
  }
});



fabric.StoredObject = {
  _doNotRemoveValues: ["fontFamily"],
  _removeDefaultStoredValues: function(object) {
    let app = this.type === "editor" ? this : this.application;
    let prototype = this.__proto__, editorPrototypes = {};
    if(app){
      editorPrototypes = app.getDefaultProperties(prototype) || {};
    }

    for (let prop in object){
      if(this._doNotRemoveValues.indexOf(prop)!== -1)continue;

      if(typeof object[prop]  === "undefined"){
        delete object[prop];
        continue;
      }

      if(["type","width","height","left","top"].includes(prop))continue;
      let _protoValue = editorPrototypes[prop] !== undefined ? editorPrototypes[prop] : prototype[prop];

      if (object[prop] === _protoValue) {
        delete object[prop];
      }
      let isArray = Object.prototype.toString.call(object[prop]) === '[object Array]' &&
        Object.prototype.toString.call(_protoValue) === '[object Array]';

      if (isArray && object[prop].length === 0 && _protoValue.length === 0) {
        delete object[prop];
      }
    }
    return object;
  },
  get: fabric.Object.prototype.get,
  storeDefaultValues: false,
  getProperties(properties) {
    let object = {};
    for (let prop of properties){

      let store_foo = "store_" + prop;
      let getFoo = "get" + fabric.util.string.capitalize(prop);

      if(this[store_foo]){
        object[prop] = this[store_foo]();
      }
      else if(this[getFoo]){
        object[prop] = this[getFoo]();
      }
      else{
        object[prop] = this[prop];
      }
    }
    return object;
  },
  storeObject (propertiesToInclude) {
    let properties = (propertiesToInclude || []).concat(this.storeProperties).concat(this.stateProperties || []);
    let object = this.getProperties(properties);

    if (!this.storeDefaultValues) {
      this._removeDefaultStoredValues(object);
    }
    this.fire("before:object", {object: object});
    return object;
  },
};
fabric.util.object.extend(fabric.StaticCanvas.prototype, fabric.StoredObject);
fabric.util.object.extend(fabric.Canvas.prototype, fabric.StoredObject);
fabric.util.object.extend(fabric.Object.prototype, fabric.StoredObject);

fabric.util.object.extend(fabric.Object.prototype, {
  storeProperties: ["type","clipPath"],
  stored: true,
  cloneSync: function () {
    let object = this.storeObject();
    return fabric.util.createObject(this.type, object);
  },
});

fabric.util.object.extend(fabric.Image.prototype, {
  storeProperties: fabric.Object.prototype.storeProperties.concat(["filters", "resizeFilters", "originalSrc", "src", "contentOffsets"]),
  cloneSync: function () {
    let object = this.storeObject();
    object.application = this.application;
    object.type = this.type;
    object.element = this._element;
    return new fabric.SImage(object)
  }
});

fabric.util.object.extend(fabric.Group.prototype, {
  storeProperties: fabric.Object.prototype.storeProperties.concat(['objects', 'clipPath']),
  store_clipPath: function () {
    if(!this.clipPath)return;
    return this.clipPath.storeObject();
  },
  store_objects: function () {
    let _objs = this.getObjects().filter(el=>(el.stored !== false));
    if (!_objs.length)return;
    return _objs.map(instance => {
      return instance.storeObject();
    });
  },
  cloneSync: function () {
    let object = this.storeObject();
    object.objects = this._objects.map(object => {
      return object.cloneSync();
    });
    delete object.type;
    return new fabric.SGroup(object);
  }
});

//todo
fabric.util.object.extend(fabric.Circle.prototype, {
  storeProperties: fabric.Object.prototype.storeProperties.concat(['radius', 'startAngle', 'endAngle'])
});

fabric.SObject = fabric.util.createClass(fabric.Object,fabric.SyncObjectMixin,{});

fabric.SPath = fabric.util.createClass(fabric.Path,fabric.SyncObjectMixin,{
  initialize: function (options,callback) {
    fabric.SyncObjectMixin.initialize.call(this, options, callback);
    fabric.Polyline.prototype._setPositionDimensions.call(this, options);
  },
  setPath (path){
    if (!path) {
      path = [];
    }
    var fromArray = Object.prototype.toString.call(path) === '[object Array]';
    this.path = fromArray ? path
      // one of commands (m,M,l,L,q,Q,c,C,etc.) followed by non-command characters (i.e. command values)
      : path.match && path.match(/[mzlhvcsqta][^mzlhvcsqta]*/gi);

    if (!this.path) {
      return;
    }

    if (!fromArray) {
      this.path = this._parsePath();
    }
    fabric.Polyline.prototype._setPositionDimensions.call(this, this);
  }
});
fabric.SPath.fromObject = function (object,callback) {
  return new fabric.SPath(object,callback);
};

fabric.SEllipse = fabric.util.createClass(fabric.Ellipse,fabric.SyncObjectMixin,{});

fabric.SCircle = fabric.util.createClass(fabric.Circle,fabric.SyncObjectMixin,{});

fabric.SRect = fabric.util.createClass(fabric.Rect,fabric.SyncObjectMixin,{
  initialize ( options, callback) {
    fabric.SyncObjectMixin.initialize.call(this, options, callback);
    this._initRxRy();
  }
});

fabric.STriangle = fabric.util.createClass(fabric.Triangle,fabric.SyncObjectMixin,{});

fabric.SLine = fabric.util.createClass(fabric.Line,fabric.SyncObjectMixin,{
  storeProperties: fabric.Object.prototype.storeProperties.concat(["x1","x2","y1","y2"]),
  initialize: function(options, callback) {
    if (!options.points) {
      options.points = [options.x1 || 0, options.y1 || 0, options.x2 || 0, options.y2 || 0];
    }

    fabric.SyncObjectMixin.initialize.call(this, options, callback);
    // this.callSuper('initialize', options);

    this.set('x1', options.points[0]);
    this.set('y1', options.points[1]);
    this.set('x2', options.points[2]);
    this.set('y2', options.points[3]);

    this._setWidthHeight(options);
  }
});

fabric.util.object.extend(fabric.Image.prototype, {
  optionsOrder: ["*"],
});
fabric.util.object.extend(fabric.Pattern.prototype,{

  /* _TO_SVG_START_ */
  /**
   * Returns SVG representation of a pattern
   * @param {fabric.Object} object
   * @return {String} SVG representation of a pattern
   */
  toSVG: function(object) {
    let patternSource = typeof this.source === 'function' ? this.source() : this.source,
      patternWidth = patternSource.width / object.width,
      patternHeight = patternSource.height / object.height,
      patternOffsetX = this.offsetX / object.width,
      patternOffsetY = this.offsetY / object.height,
      patternImgSrc = '';
    if (this.repeat === 'repeat-x' || this.repeat === 'no-repeat') {
      patternHeight = 1;
      if (patternOffsetY) {
        patternHeight += Math.abs(patternOffsetY);
      }
    }
    if (this.repeat === 'repeat-y' || this.repeat === 'no-repeat') {
      patternWidth = 1;
      if (patternOffsetX) {
        patternWidth += Math.abs(patternOffsetX);
      }

    }

    patternImgSrc = _getElementSvgSrc(patternSource);

    return '<pattern id="SVGID_' + this.id +
      '" x="' + patternOffsetX +
      '" y="' + patternOffsetY +
      '" width="' + patternWidth +
      '" height="' + patternHeight + '">\n' +
      '<image x="0" y="0"' +
      ' width="' + patternSource.width +
      '" height="' + patternSource.height +
      '" xlink:href="' + patternImgSrc +
      '"></image>\n' +
      '</pattern>\n';
  }
});

/** Mixin to extend the String type with a method to escape unsafe characters
 *  for use in HTML.  Uses OWASP guidelines for safe strings in HTML.
 *
 *  Credit: http://benv.ca/2012/10/4/you-are-probably-misusing-DOM-text-methods/
 *          https://github.com/janl/mustache.js/blob/16ffa430a111dc293cd9ed899ecf9da3729f58bd/mustache.js#L62
 *
 *  Maintained by stevejansen_github@icloud.com
 *
 *  @license http://opensource.org/licenses/MIT
 *
 *  @version 1.0
 *
 *  @mixin
 */
(function(){
  "use strict";

  function escapeHtml() {
    return this.replace(/[&<>"'\/]/g, function (s) {
      var entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
      };

      return entityMap[s];
    });
  }

  if (typeof(String.prototype.escapeHtml) !== 'function') {
    String.prototype.escapeHtml = escapeHtml;
  }
})();


function _getElementSvgSrc(element){

  if (!element) {
    return '';//fallback
  }
  let _src = element._src || element.src;

  if(!_src && element.toDataURL){
    return element.toDataURL();
  }
  if(!_src){
    console.error("SRC IS UNDEFINED!");
    return '';
  }

  if(_src.startsWith("data:image")){
    return _src;
  }
  if(fabric.inlineSVG){
    let canvas = fabric.util.createCanvasElement();
    canvas.width = element.width;
    canvas.height = element.height;
    let ctx = canvas.getContext('2d');
    ctx.drawImage(element,0,0);
    return canvas.toDataURL();
  }
  if(_src.startsWith(fabric.util.svgMediaRoot)){
    _src = _src.replace(fabric.util.svgMediaRoot,"");
  }
  return _src.escapeHtml();
};
/**
 * @param filtered {true | element }
 * @returns {*}
 */
fabric.Image.prototype.getSvgSrc = function(filtered){
  let element;
  if(filtered){
    if(filtered.constructor === Boolean){
      element = this._element;
    } else {
      element = filtered;
    }
  } else {
    element = this._originalElement;
  }
  return _getElementSvgSrc(element);
};


fabric.SImage = fabric.util.createClass(fabric.Image,fabric.SyncObjectMixin,{

  /**
   * @private
   * @param {Object} [options] Options object
   */
  _initConfig: function(options) {
    // options || (options = { });
    // this.setOptions(options);
    // this._setWidthHeight(options);
    if (this._element && this.crossOrigin) {
      this._element.crossOrigin = this.crossOrigin;
    }
  },
  /**
   *
   * @param element   fabric.Group | Image
   */
  setElement: function (element) {
    /**
     * if lement is a SVG group then add _objects and represent SVg as an Image
     */
    if(element.type === "svg+xml"){
      // let xml = jQuery.parseXML(atob(element.src.substr(26)));
      // fabric.parseSVGDocument(xml.documentElement, results => {
      //   this._objects = results;
      //   for(let el of this._objects){
      //     el.group = this;
      //   }
      // });
    }
    fabric.Image.prototype.setElement.call(this,element,{width: this.width, height: this.height});
    this.fire("element:modified");
    this.canvas && this.canvas.renderAll();
  },
  initialize: function (options, callback) {
    this.cacheKey = 'texture' + fabric.Object.__uid++;
    this.filters = [];
    this.resizeFilters = [];
    fabric.SyncObjectMixin.initialize.call(this, options, callback);
  },
});

fabric.util.object.extend(fabric.Group.prototype, {
  optionsOrder: ["objects","*"],
});

let SyncGroupMixin = {
  setObjects (objects,callback){


    if(!objects || !objects.length ){
      this._objects = [];
      callback();
      return this;
    }

    if(this.application){
      for(let i in objects){
        if(objects[i].constructor === String){
          objects[i] = this.application.objects[objects[i]];
        }
      }
    }


    if (fabric.util.loaderDebug) {
      let debugInfo = objects.map((o) => {
        if(!o.id)o.id = o.type + "-" + fabric.util.idCounter++;
        return o.id;
      });
      console.log(`${this.id}: 0/${debugInfo.length} . ${debugInfo.join(",")}`);
    }

    this._objects = [];
    let queueLoadCallback = new fabric.util.Loader({
      elements: objects,
      active: false,
      complete: () => {
        this.dirty = true;
        if (this.canvas) this.canvas.renderAll();
        callback && callback();
      },
      progress: ( l, t, el, done, togo) => {
        this.fire("progress", { loaded : l, total : t });
        if (fabric.util.loaderDebug) {
          console.log(`${this.id}: ${l}/${t} . ${el.id} loaded`);
        }
      }
    });

    for (let object of objects) {
      let el = object;
      if(object.constructor === Object){
        object.application = this.application;
        el = fabric.util.createObject(object, (el)=>{queueLoadCallback.shift(object)});
      }else{
        queueLoadCallback.shift(object);
      }
      this._objects.push(el);
      this._onObjectAdded(el);
    }

    this.on("added",()=> {
      this._objects.forEach(object => {
        object._set('canvas', this.canvas);
        object.fire('added');
      })
    });

    if (!this._isAlreadyGrouped) {
      let center = this._centerPoint;
      center || this._calcBounds();
      this._updateObjectsCoords(center);
    }
    else {
      this._updateObjectsACoords();
    }
    this.setCoords();
    queueLoadCallback.activate();
    return this;
  },
  initialize: function(options, callback) {
    this._objects = [];
    this._isAlreadyGrouped = !!options.width;
    this._centerPoint = options.centerPoint;

    fabric.SyncObjectMixin.initialize.call(this, options, callback);

    this.on("removed",() => {
      for (let i = this._objects.length; i--; ) {
        this._onObjectRemoved(this._objects[i]);
      }
    });
    delete this._centerPoint;
    delete this._isAlreadyGrouped;
  }
};

fabric.SGroup = fabric.util.createClass(
  fabric.Group,
  fabric.SyncObjectMixin,
  SyncGroupMixin
);
fabric.SActiveSelection = fabric.util.createClass(fabric.ActiveSelection,fabric.SyncObjectMixin,SyncGroupMixin);


fabric.util.object.extend(fabric.Text.prototype, {
  storeProperties: fabric.Object.prototype.storeProperties.concat(['textLines']),
  eventListeners: {
    changed: function(e) {
      this.fire("modified", {});
      if (this.canvas) {
        this.canvas.fire("object:modified", {target: this});
        this.canvas.renderAll();
      }
    },
  }
});

fabric.SText = fabric.util.createClass(fabric.Text,fabric.SyncObjectMixin,{
  initialize: function (options,callback) {
    this.styles = options ? (options.styles || { }) : { };
    this.text = options.text || "";
    this.__skipDimension = true;
    fabric.SyncObjectMixin.initialize.call(this, options, callback);
    this.__skipDimension = false;

    this.ready = true;
    // this._clearCache();
    // this._splitText();
    // this.cleanStyle(styleName);

    this.initDimensions();

    this.setCoords();
    this.setupState({ propertySet: '_dimensionAffectingProps' });

    if(fabric.isLikelyNode){
      this.checkIncompatibleSymbols();
    }
  }
});

fabric.STextbox = fabric.util.createClass(fabric.Textbox,fabric.SyncObjectMixin,{
  initialize: function(options,callback) {
    fabric.SText.prototype.initialize.call(this, options,callback);
    this.initBehavior();
  }
});

fabric.SIText = fabric.util.createClass(fabric.IText,fabric.SyncObjectMixin,{
  initialize: function(options,callback) {
    fabric.SText.prototype.initialize.call(this, options,callback);
    this.initBehavior();
  },
});

