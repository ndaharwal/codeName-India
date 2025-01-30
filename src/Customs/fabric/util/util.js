
/**
 * @private
 * @param {String} eventName
 * @param {Function} handler
 */
var ObservableMixin = {

  on: function (eventName, handler,priority) {

    if (!this.__eventListeners) {
      this.__eventListeners = { };
    }

    if (eventName.constructor === Object) {
      for (var i in eventName) {
        this.on(i, eventName[i],priority)
      }
      return this;
    }

    var events = eventName.split(" ");
    for (var eventName of events) {
      if (!this.__eventListeners[eventName]) {
        this.__eventListeners[eventName] = [];
      }
      if(priority){
        if(handler.constructor === Array){
          this.__eventListeners[eventName].unshift(...handler);
        }else{
          this.__eventListeners[eventName].unshift(handler);
        }
      }else{
        if(handler.constructor === Array){
          this.__eventListeners[eventName].push(...handler);
        }else{
          this.__eventListeners[eventName].push(handler);
        }
      }
    }
    return this;
  },
  off: function (eventName, handler) {
    if (!this.__eventListeners) {
      return;
    }
    // remove all key/value pairs (event name -> event handler)
    if (arguments.length === 0) {
      for (eventName in this.__eventListeners) {
        this.__eventListeners[eventName].length = 0;
      }
      return this;
    }

    // one object with key/value pairs was passed
    if (eventName.constructor === Object) {
      for (var i in eventName) {
        this.off(i, eventName[i])
      }
      return this;
    }

    var events = eventName.split(" ");
    for (var eventName of events) {
      var eventListener = this.__eventListeners[eventName];
      eventListener.splice(eventListener.indexOf(handler), 1)
    }
    return this;
  },
  fire: function fire(eventName, options) {
    if (!this.__eventListeners) {
      return;
    }

    var listenersForEvent = this.__eventListeners[eventName];
    if (listenersForEvent) {
      for (var i = 0, len = listenersForEvent.length; i < len; i++) {
        listenersForEvent[i].call(this, options || {});
      }
    }

    var listenersForEventAll = this.__eventListeners['*'];
    if (listenersForEventAll) {
      options = options || {};
      options.eventName = eventName;
      options.listeners = listenersForEvent;
      for (i = 0, len = listenersForEventAll.length; i < len; i++) {
        listenersForEventAll[i].call(this, options);
      }
    }
    return this;
  }
}


function Loader (options) {
  this.completeCB = options.complete;
  this.progressCB = options.progress;
  this.addedCB = options.added;
  this.evented = !!options.complete;
  if(options.elements){
    if(options.elements.constructor === Array){
      this.togo = options.elements.slice();
      this.done = [];
    }
    else{
      this.total = options.elements;
    }
  }else{
    this.togo = [];
    this.done = [];
  }

  this.active = options.active !== undefined ? options.active : !!this.getTotal();
  this.loaded = 0;
}

Loader.prototype.getTotal = function(){
  return this.total || (this.togo.length + this.done.length);
};

Loader.prototype.activate = function(){
  this.active = true;
  if (this.done.length === this.getTotal() ) {
    this.completeCB && this.completeCB();
    this.evented && this.fire("loaded");
  }
};

Loader.prototype.shift = function(el){
  if(this.togo){
    this.togo.splice(this.togo.indexOf(el),1);
    this.done.push(el);
  }
  if(!this.active)return;
  this.progressCB && this.progressCB(this.done.length, this.getTotal(), el, this.done, this.togo);
  this.evented && this.fire("progress",{current: el});
  if (this.done.length === this.getTotal() ) {
    this.completeCB && this.completeCB();
    this.evented && this.fire("loaded");
  }
};

Loader.prototype.push = function(el){
  if(el){
    this.togo.push(el);
  }else{
    this.total ++;
  }
  if(!this.active)return;
  this.evented && this.fire("added",{current: el});
  this.addedCB && this.addedCB(this.loaded.length, this.getTotal(), el, this.loaded);
}

var utils = {
  observable: function (obj) {

    obj.off = ObservableMixin.off;
    obj.stopObserving = ObservableMixin.off;
    obj.fire = ObservableMixin.fire;
    obj.on = ObservableMixin.on;
    obj.observe = ObservableMixin.on;
    obj.trigger = ObservableMixin.fire;

  },
  /**
   * Create new array and concat all values with value from second array
   * @param arr
   * @param arr2
   * @returns {{}}
   * @example
   *    x = {a: 1 ,b: 1, c: [1,2]}
   *    y = {a: 2 ,  c : 3 , d : 1}
   *
   *    extendArraysObject(x,y) = {a: [1,2] b : [1] c : [1,2,3], d [1] }
   *
   *
   * @example 2
   *
   * eventListeners: fabric.util.extendArraysObject(fabric.Canvas.prototype.eventListeners, {
   *  "modified" : function(e){...},
   *  "object:modified" : function(){...}
   *})
   *
   */
  extendArraysObject : function(arr,arr2){
    var newArray = {};

    for(var i in arr){
      if(arr[i].constructor === Array){
        newArray[i]  = [].concat(arr[i]);
      }else{
        newArray[i] = [arr[i]];
      }
    }

    for(var i in arr2){
      if(newArray[i]){
        newArray[i].push(arr2[i]);
      }else{
        newArray[i] = [arr2[i]];
      }
    }
    return newArray;
  },
  /**
   * возвращает объект с ключами строки url
   *
   * @example
   *
   *  queryString(http://192.168.56.1/?file=demo&subset=4&tag&tag2) =
   *    {file: "demo", subset: "4", tag: "", tag2: "", 0: "file", 1: "subset", 2: "tag", 3: "tag2", length: 4}
   *
   * @returns {{}}
   */
  queryString: function (query) {
    if(query) {
      query = query.substr(query.indexOf("?") + 1) ;
    }else{
      query = window.location.search.substring(1);
    }
    let obj = {};
    let _length = 0;
    if (!query)return obj;
    let lets = query.split("&");
    for (let i = 0; i < lets.length; i++) {
      let pair = lets[i].split("=");
      let _vname = pair[0], val = pair[1];
      if (typeof obj[_vname] === "undefined") {
        obj[_vname] = val || "";
        Object.defineProperty(obj, _length, {value: _vname, enumerable: false});
        _length++;
        // If second entry with this name
      } else if (typeof obj[_vname] === "string") {
        let arr = [obj[_vname], val];
        obj[_vname] = arr;
        Object.defineProperty(obj, _length, {value: _vname, enumerable: false});
        _length++;
        // If third or later entry with this name
      } else {
        obj[_vname].push(val);
        Object.defineProperty(obj, _length, {value: _vname, enumerable: false});
        _length++;
      }
    }
    Object.defineProperty(obj, "length", {value: _length, enumerable: false});
    return obj;
  },
  /**
   * call completeCallback when ll elements were loaded
   * @param elementsArray
   * @param completeCB
   * @param progressCB
   * @returns {loader}
   *
   * @example
   *
   * let files = [file1,file2,file3]
   *
   *    let loader = fabric.util.loader(files,onLoaded,(total, current, loadedFile) => console.log(`${loadedFile} is loaded. progress ${current}/${total}`);
   *    files.forEach((file) => {file.onload = function(){loader(file)} }
   *
   */
  loader: function (elementsArray, completeCB, progressCB, addedCB) {
    return new Loader({
      elements: elementsArray,
      complete: completeCB,
      progress: progressCB,
      added: addedCB
    });
  },
  Loader: Loader,
  deepExtend: function (/*obj_1, [obj_2], [obj_N]*/) {
    if (arguments.length < 1 || typeof arguments[0] !== 'object') {
      return false;
    }
    if (arguments.length < 2) return arguments[0];

    var target = arguments[0];

    // convert arguments to array and cut off target object
    var args = Array.prototype.slice.call(arguments, 1);

    var key, val, src, clone, tmpBuf;

    args.forEach(function (obj) {
      if (typeof obj !== 'object') return;

      for (key in obj) {
        if (!(key in obj)) continue;

        src = target[key];
        val = utils.deepClone(obj[key]);


        if (typeof src !== 'object' || src === null) {
          target[key] = val;
        }else if (Array.isArray(val)) {
          // clone = (Array.isArray(src)) ? src : [];
          //
          // val.forEach(function(item){
          //   clone.push(utils.deepClone(item));
          // });
          target[key] = utils.deepClone(val);
          //target[key] = utils.deepExtend(clone, val);
        } else {
          clone = (!Array.isArray(src)) ? src : {};
          target[key] = utils.deepExtend(clone, val);
        }

      }
    });

    return target;
  },
  deepClone: function (val) {
    if (typeof val === 'undefined') {
      return undefined;
    }

    if (val === null) {
      return null;
    } else if (val instanceof Date) {
      return new Date(val.getTime());
    } else if (val instanceof RegExp) {
      return new RegExp(val);
    }

    if(val.cloneSync){
      return val.cloneSync();
    }else if(val.constructor == Object){
      return utils.deepExtend({}, val);
    }else if(val.constructor == Array){
      var clone = [];
      for(var i =0 ;i < val.length; i++){
        clone.push(utils.deepClone(val[i]));
      }
      return clone;
    }else{
      return val;
    }
  },
};


utils.observable(Loader.prototype);
if(typeof fabric !== "undefined"){
  fabric.util.object.extend(fabric.util,utils);
}
if(typeof module !== "undefined"){
  module.exports = utils;
}