fabric.SyncObjectMixin = {
  setClipPath (clipPath,callback){
    if(clipPath.constructor === Object){
      this.clipPath =  fabric.util.createObject(clipPath,function(){
        this.dirty = true;
        callback && callback();
      });
    } else {
      this.clipPath = clipPath;
      this.dirty = true;
      callback && callback();
    }
  },
  setCrossOrigin: function(value) {
    this.crossOrigin = value;
    if(this._element){
      this._element.crossOrigin = value;
    }
    return this;
  },

  set (key, value,callback) {
    if (typeof key === 'object') {
      this.setOptions(key, value);
    }
    else {
      if (key[0] === "&") {
        key = key.substr(1);
        this._set(key, value(this.get(key)),callback);
      }
      else {
        this._set(key, value,callback);
      }
    }
    return this;
  },
  setGradient: function(property, options) {
    options || (options = { });

    var gradient = { colorStops: [] };

    gradient.type = options.type || (options.r1 || options.r2 ? 'radial' : 'linear');

    gradient.coords = options.coords || {
      x1: options.x1,
      y1: options.y1,
      x2: options.x2,
      y2: options.y2
    };

    if (options.r1 || options.r2) {
      gradient.coords.r1 = options.r1;
      gradient.coords.r2 = options.r2;
    }

    gradient.gradientTransform = options.gradientTransform;

    if(options.colorStops.constructor === Array){
      gradient.colorStops = options.colorStops;
    }else{
      fabric.Gradient.prototype.addColorStop.call(gradient, options.colorStops);
    }


    return this.set(property, fabric.Gradient.forObject(this, gradient));
  },

  setShadow(options) {
    return this.shadow = options ? new fabric.Shadow(options) : null;
  },
  setFill(value){
    if(value.constructor === Object){
      this.setGradient('fill',value);
      this.dirty = true;
    }else{
      this.fill = value;
      this.dirty = true;
    }
    this.fire("modified", {});
    if (this.canvas) {
      this.canvas.fire("object:modified", {target: this});
      this.canvas.renderAll();
    }
  },
  _getPropertiesOrder(options){
    let keys = Object.keys(options);
    if(this.optionsOrder && this.optionsOrder.length){
      let middleIndex = this.optionsOrder.indexOf("*") || -1;
      let i = middleIndex, key , keyIndex;
      while((key = this.optionsOrder[--i])){
        if((keyIndex = keys.indexOf(key)) !== -1){
          keys.splice(keyIndex, 1);
          if(options[key] !== undefined ){
            keys.unshift(key);
          }
        }
      }
      i = middleIndex;
      while(key = this.optionsOrder[++i]){
        if((keyIndex = keys.indexOf(key)) !== -1){
          keys.splice(keyIndex, 1);
          if(options[key] !== undefined ) {
            keys.push(key);
          }
        }
      }
    }
    return keys;
  },
  setOptions(options,callback) {
    options = options && fabric.util.object.clone(options)|| {};

    let keys = this._getPropertiesOrder(options);
    let queue;
    for (let _key of keys) {
      let _fooName = "set" + fabric.util.string.capitalize(_key, true);
      if(this[_fooName] && this[_fooName].name && this[_fooName].name !== "anonymous"){
        if(this[_fooName].length >= 2){
          if(!queue){
            queue = new fabric.util.Loader({
              complete: callback
              // progress: (loaded, total, el) => console.log(`${this.id}: ${loaded}/${total} . ${el} loaded`),
              // added: (loaded, total, el) => console.log(`${this.id}: ${loaded}/${total} . ${el} loaded`)
            })
          }
          queue.push(_key);
          this[_fooName](options[_key],() => {
            queue.shift(_key);
          });
        }else{
          this[_fooName](options[_key])
        }
      } else {
        this[_key] = options[_key];
      }
    }

    if(queue){
      queue.activate();
    }else if(callback ){
      callback();
    }
  },
  _set (key, value ,callback) {
    let _fooName = "set" + fabric.util.string.capitalize(key, true);
    if(this[_fooName]  && this[_fooName].name && this[_fooName].name !== "anonymous"){
      this[_fooName](value,callback);
    }else{
      this[key] = value;
    }
    return this;
  },
  initialize(options, callback) {
    if(options.canvas && !options.application){
      options.application = options.canvas.application;
    }
    this.application = options.application;
    if (options.type) {
      this.type = options.type;
    }
    if(options.id){
      this.id = options.id;
    }
    fabric.fire("entity:created", {target: this, options: options});
    delete options.id;
    delete options.application;
    delete options.type;

    this.setOptions(options, () => {
      this.loaded = true;
      this.fire("loaded");
      if(callback){
        setTimeout(() => {
          callback(this);
        })
      }
    });
  }
};

