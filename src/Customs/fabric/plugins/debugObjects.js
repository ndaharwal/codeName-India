(function(window){

  window.stringifyObject = function(object) {
    function stringify(data, prefix) {
      function unicode_escape(c) {
        var s = c.charCodeAt(0).toString(16);
        while (s.length < 4) s = "0" + s;
        return "\\u" + s;
      }
      if (!prefix) prefix = "";
      switch (typeof data) {
        case "object":  // object, array or null
          if (data == null) return "null";
          var i, pieces = [], before, after;
          var indent = prefix + "    ";
          if (data instanceof Array) {
            for (i = 0; i < data.length; i++)
              pieces.push(stringify(data[i], indent));
            before = "[\n";
            after = "]";
          }
          else {
            for (i in data)
              pieces.push(i + ": " + stringify(data[i], indent));
            before = "{\n";
            after = "}";
          }
          return before + indent
            + pieces.join(",\n" + indent)
            + "\n" + prefix + after;
        case "string":
          data = data.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
            .replace(/\n/g, "\\n").replace(/\r/g, "\\r")
            .replace(/\t/g, "\\t")
            .replace(/[\x00-\x19]/g, unicode_escape);
          return '"' + data + '"';
        default:
          return String(data).replace(/\n/g, "\n" + prefix);
      }
    }
    return stringify(object);
  };

  window.toObject = function(object) {
    let instances = [];
    let paths = [];
    function objectify(data,path) {
      switch (typeof data) {
        case "function":
          return String(data);
        case "object":
          if (data == null) {
            return null;
          }
          if(instances.includes(data)){
            return "object " + paths[instances.indexOf(data)]
          }
          instances.push(data);
          paths.push(path);
          if (data instanceof Array) {
            var result = []
            for (var i = 0; i < data.length; i++){
              result.push(objectify(data[i],path + "." + i));
            }
            return result;
          }
          else {
            var result = {};
            for (i in data){
              result[i] = objectify(data[i],path + "." + i);
            }
            return result;
          }
        default:
          return data
      }
    }
    return objectify(object,"");
  };

  window.collectConsoleLogs = function (){
    console.stdlog = console.log.bind(console);
    console.logs = [];
    console.log = function(){
      console.logs.push(Array.from(arguments));
      console.stdlog.apply(console, arguments);
    }
  };

  window.debugColor = function(string){
    var canvas = document.createElement("canvas");
    canvas.width = 100;
    canvas.height = 100;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle= string;
    ctx.fillRect(0,0,100,100);
    window.debugImage(canvas);
  };

  window.debugText = function (text) {
    var blob = new Blob([text], {
      type: 'application/json'
    });
    var objectURL = URL.createObjectURL(blob);
    console.log(objectURL );
  };

  window.debugImage = function(element,noBorders){
    var canvas = document.createElement("canvas");
    canvas.width = noBorders ?element.width: element.width + 2;
    canvas.height = noBorders ?element.height : element.height + 2;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(element, noBorders ? 0 : 1, noBorders ? 0 : 1);
    if(!noBorders){
      ctx.lineWidth=1;
      ctx.strokeStyle="yellow";
      ctx.strokeRect(0,0,this.width + 2,this.height+ 2);
      ctx.setLineDash([4,4]);
      ctx.strokeStyle="#000000";
      ctx.strokeRect(0,0,this.width + 2,this.height+ 2);
    }
    canvas.toBlob(function(blob){
      var objectURL = URL.createObjectURL(blob);
      // window.open(objectURL,"_blank");
      console.log(objectURL);
      // window.open(canvas.toDataURL(),"_blank");
    })
  };

  window.getTextDataUrl = function(text) {
    var blob = new Blob([text], {
      type: 'text/plain'
    });
    return URL.createObjectURL(blob);
  }


  window.debugImageData = function(imgData){
    var canvas = document.createElement("canvas");
    canvas.width = imgData.width;
    canvas.height = imgData.height;
    var ctx = canvas.getContext('2d');
    ctx.putImageData(imgData,0,0);
    debugImage(canvas);
  };

  if(typeof HTMLImageElement !== "undefined"){
    HTMLImageElement.prototype.debug = function(){
      debugImage(this);
    };
  }

  if(typeof HTMLCanvasElement !== "undefined") {
    HTMLCanvasElement.prototype.debug = function () {
      debugImage(this);
    };
  }

  if(typeof ImageData !== "undefined") {
    ImageData.prototype.debug = function () {

      var canvas = document.createElement("canvas");
      canvas.width = this.width;
      canvas.height = this.height;
      var ctx = canvas.getContext('2d');
      ctx.putImageData(this, 0, 0)
      canvas.debug();
    };
  }

  if(typeof CanvasRenderingContext2D !== "undefined") {
    CanvasRenderingContext2D.prototype.debug = function () {
      this.canvas.debug();
    };
  }

  String.prototype.debug = function(){
    window.open(URL.createObjectURL(new Blob([JSON.stringify(this)],{type : 'text/html'})), '_blank');
  };

  Object.defineProperty( Object.prototype, 'debugProperty', {
    writable: false,
    configurable: false,
    enumerable: false,
    value: function(property,callback) {
      let _local_variablename = "_debugged_property_" + property;
      this[_local_variablename] = this[property];
      Object.defineProperty(this,property,{
        set: function(val){
          callback && callback(val);
          if(typeof val !== "object" && typeof this[_local_variablename] !== "object"){
            console.trace(`${property}:: ${val} < ${this[_local_variablename]}`);
          }
          else{
            console.trace(`${property}:: `,val,this[_local_variablename]);
          }


          this[_local_variablename] = val;
        },
        get: function(){
          return this[_local_variablename];
        }
      });
      return this[_local_variablename];
    }
  });


  function getObservableArrayProto(){
    var _array = [],
      _handlers = {
        itemadded: [],
        itemremoved: [],
        itemset: []
      };

    function defineIndexProperty(index) {
      if (!(index in this)) {
        Object.defineProperty(this, index, {
          configurable: true,
          enumerable: true,
          get: function() {
            return _array[index];
          },
          set: function(v) {
            _array[index] = v;
            raiseEvent({
              type: "itemset",
              index: index,
              item: v
            });
          }
        });
      }
    }

    function raiseEvent(event) {
      _handlers[event.type].forEach(function(h) {
        h.call(this, event);
      });
    }


    return {
      attributes: {
        length: {
          get: function () {
            return _array.length;
          },
          set: function (value) {
            var n = Number(value);
            var length = _array.length;
            if (n % 1 === 0 && n >= 0) {
              if (n < length) {
                this.splice(n);
              } else if (n > length) {
                this.push.apply(this, new Array(n - length));
              }
            } else {
              throw new RangeError("Invalid array length");
            }
            _array.length = n;
            return value;
          }
        }
      },
      methods: {
        addEventListener: function (eventName, handler) {
          eventName = ("" + eventName).toLowerCase();
          if (!(eventName in _handlers)) throw new Error("Invalid event name.");
          if (typeof handler !== "function") throw new Error("Invalid handler.");
          _handlers[eventName].push(handler);
        },
        removeEventListener: function (eventName, handler) {
          eventName = ("" + eventName).toLowerCase();
          if (!(eventName in _handlers)) throw new Error("Invalid event name.");
          if (typeof handler !== "function") throw new Error("Invalid handler.");
          var h = _handlers[eventName];
          var ln = h.length;
          while (--ln >= 0) {
            if (h[ln] === handler) {
              h.splice(ln, 1);
            }
          }
        },
        push: function () {
          var index;
          for (var i = 0, ln = arguments.length; i < ln; i++) {
            index = _array.length;
            _array.push(arguments[i]);
            defineIndexProperty.call(this,index);
            raiseEvent({
              type: "itemadded",
              index: index,
              item: arguments[i]
            });
          }
          return _array.length;
        },
        pop: function () {
          if (_array.length > -1) {
            var index = _array.length - 1,
              item = _array.pop();
            delete this[index];
            raiseEvent({
              type: "itemremoved",
              index: index,
              item: item
            });
            return item;
          }
        },
        unshift: function () {
          for (var i = 0, ln = arguments.length; i < ln; i++) {
            _array.splice(i, 0, arguments[i]);
            defineIndexProperty.call(this,_array.length - 1);
            raiseEvent({
              type: "itemadded",
              index: i,
              item: arguments[i]
            });
          }
          for (; i < _array.length; i++) {
            raiseEvent({
              type: "itemset",
              index: i,
              item: _array[i]
            });
          }
          return _array.length;
        },
        shift: function () {
          if (_array.length > -1) {
            var item = _array.shift();
            delete this[_array.length];
            raiseEvent({
              type: "itemremoved",
              index: 0,
              item: item
            });
            return item;
          }
        },
        splice: function (index, howMany /*, element1, element2, ... */) {
          var removed = [],
            item,
            pos;

          index = index == null ? 0 : index < 0 ? _array.length + index : index;

          howMany = howMany == null ? _array.length - index : howMany > 0 ? howMany : 0;

          while (howMany--) {
            item = _array.splice(index, 1)[0];
            removed.push(item);
            delete this[_array.length];
            raiseEvent({
              type: "itemremoved",
              index: index + removed.length - 1,
              item: item
            });
          }

          for (var i = 2, ln = arguments.length; i < ln; i++) {
            _array.splice(index, 0, arguments[i]);
            defineIndexProperty.call(this,_array.length - 1);
            raiseEvent({
              type: "itemadded",
              index: index,
              item: arguments[i]
            });
            index++;
          }

          return removed;
        },

      }
    }
  }

  function ObservableArray(items) {

    let proto = getObservableArrayProto();

    for(let name in proto.methods){
      Object.defineProperty(this,name, {
        configurable: false,
        enumerable: false,
        writable: false,
        value: proto.methods[name]
      });
    }
    for(let name in proto.attributes){
      Object.defineProperty(this,name, {
        configurable: false,
        enumerable: false,
        get: proto.attributes[name].get,
        set: proto.attributes[name].set
      });
    }



    Object.getOwnPropertyNames(Array.prototype).forEach((name)=> {
      if (!(name in this)) {
        Object.defineProperty(this, name, {
          configurable: false,
          enumerable: false,
          value: Array.prototype[name]
        });
      }
    });

    if (items instanceof Array) {
      this.push.apply(this, items);
    }
  }


  Object.defineProperty( Object.prototype, 'debugArray', {
    writable: false,
    configurable: false,
    enumerable: false,
    value: function(property,callback) {

      var observableArray =  new ObservableArray(this[property]);
      // console.log(property + ":=" , this[property]);

      observableArray.addEventListener("itemadded", callback || function(e) {
        let item = typeof e.item !== "object" ? e.item: e.item.constructor.name;
        console.log("Added %o at index %d.", item, e.index);
        // console.trace(property + "::" ,this);
      });
      observableArray.addEventListener("itemset", callback || function(e) {
        let item = typeof e.item !== "object" ? e.item: e.item.constructor.name;
        console.log("Set index %d to %o.", e.index, item);
        // console.trace(property + "::" ,this);
      });
      observableArray.addEventListener("itemremoved", callback || function(e) {
        let item = typeof e.item !== "object" ? e.item: e.item.constructor.name;
        console.log("Removed %o at index %d.", item, e.index);
        // console.trace(property + "::" ,this);
      });
      this[property] = observableArray;

      // this.debugProperty(property);
    }
  });




  Object.defineProperty( Array.prototype, 'debug', {
    writable: false,
    configurable: false,
    enumerable: false,
    value: function(callback) {
      let proto = getObservableArrayProto();

      for(let name in proto.methods){
        this[name] = proto.methods[name];
      }

      this.addEventListener("itemadded", callback || function(e) {
        let item = typeof e.item !== "object" ? e.item: e.item.constructor.name;
        console.log("Added %o at index %d.", item, e.index);
        console.trace("array::" ,this);
      });
      this.addEventListener("itemset", callback || function(e) {
        let item = typeof e.item !== "object" ? e.item: e.item.constructor.name;
        console.log("Set index %d to %o.", e.index, item);
        console.trace("array::" ,this);
      });
      this.addEventListener("itemremoved", callback || function(e) {
        let item = typeof e.item !== "object" ? e.item: e.item.constructor.name;
        console.log("Removed %o at index %d.", item, e.index);
        console.trace("array::" ,this);
      });
    }
  });




})(typeof window !== "undefined" ? window : global);
